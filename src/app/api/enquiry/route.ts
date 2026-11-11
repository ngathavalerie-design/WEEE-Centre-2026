import { NextResponse, type NextRequest } from "next/server";
import { guardFormRequest } from "@/lib/form-guard";
import { clean, cleanLine, isEmail } from "@/lib/sanitize";
import { ENQUIRY_COPY, isEnquiryKind } from "@/lib/enquiry-types";
import { parsePickupDetails, formatPickupForEmail, PICKUP_TIME_WINDOWS, type PickupDetails } from "@/lib/pickup";
import { saveSubmission, markEmailStatus } from "@/lib/submissions";
import { notifyTeam, sendEmail } from "@/lib/email";
import { SITE } from "@/content/site";

/**
 * POST /api/enquiry — every modal form on the site
 * (pickup, quote, project, conference, event, service, subscribe).
 */
export async function POST(request: NextRequest) {
  const guard = await guardFormRequest(request, "enquiry");
  if (!guard.ok) return guard.response;
  const body = guard.body;

  const type = body.type;
  if (!isEnquiryKind(type)) return NextResponse.json({ error: "Unknown enquiry type." }, { status: 400 });
  const copy = ENQUIRY_COPY[type];

  const name = cleanLine(body.name, 120);
  const email = cleanLine(body.email, 200).toLowerCase();
  const phone = cleanLine(body.phone, 30);
  const organization = cleanLine(body.organization, 150);
  const subject = cleanLine(body.subject, 200) || copy.emailSubject;
  const message = clean(body.message, 1000);

  if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (copy.messageRequired && message.length < 2)
    return NextResponse.json({ error: "Please add a short message." }, { status: 400 });

  // Only keep the extra fields we expect.
  const raw = (body.additionalData && typeof body.additionalData === "object" ? body.additionalData : {}) as Record<
    string,
    unknown
  >;
  const additionalData: Record<string, unknown> = {};
  if (raw.service) additionalData.service = cleanLine(raw.service, 120);
  if (raw.eventInterest) additionalData.eventInterest = cleanLine(raw.eventInterest, 160);

  let pickup: PickupDetails | undefined;
  if (type === "pickup") {
    if (phone.replace(/\D/g, "").length < 9)
      return NextResponse.json({ error: "Please add a phone number so our driver can reach you." }, { status: 400 });
    const parsed = parsePickupDetails(raw);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    pickup = parsed.data;
  }

  // 1. Save (if the database is connected). A database problem never loses the enquiry —
  //    the email below still goes out.
  let saved: { id: string; reference?: string } | null = null;
  try {
    saved = await saveSubmission({
      type,
      name,
      email,
      phone,
      organization,
      subject,
      message,
      additionalData,
      sourcePage: cleanLine(request.headers.get("referer"), 300) || undefined,
      pickup,
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("DB save failed:", err);
  }

  // 2. Notify the team.
  const extras = Object.entries(additionalData)
    .map(([k, v]) => `${k === "eventInterest" ? "Event interest" : "Service"}: ${String(v)}`)
    .join("\n");
  const teamText = [
    `New ${copy.emailSubject.toLowerCase()}`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    organization ? `Organisation: ${organization}` : null,
    extras || null,
    pickup ? `\nPICKUP DETAILS\n${formatPickupForEmail(pickup, saved?.reference)}` : null,
    message ? `\nMessage:\n${message}` : null,
    "",
    "---",
    `Submitted: ${new Date().toISOString()}`,
    saved ? `Manage in admin: ${SITE.url}/admin` : "Not saved to the database (DATABASE_URL not set or unavailable).",
  ]
    .filter((l) => l !== null)
    .join("\n");

  const teamSubject = pickup
    ? `Pickup Request ${saved?.reference ?? ""}: ${pickup.preferredDate} (${pickup.area || "see address"})`
    : `${copy.emailSubject}: ${subject === copy.emailSubject ? name : subject}`;

  const teamEmailOk = await notifyTeam(teamSubject, teamText, email);
  if (saved) await markEmailStatus(saved.id, teamEmailOk ? "sent" : "failed").catch(() => {});

  // If nothing was stored AND no email went out, the enquiry would be lost — tell the visitor.
  if (!saved && !teamEmailOk) {
    return NextResponse.json(
      { error: `We couldn't send your request right now. Please call us on ${SITE.phone} or email ${SITE.email}.` },
      { status: 503 },
    );
  }

  // 3. Pickup confirmation to the customer.
  if (pickup && saved?.reference) {
    const slot = PICKUP_TIME_WINDOWS.find((w) => w.value === pickup.timeWindow)?.label ?? pickup.timeWindow;
    await sendEmail({
      to: email,
      replyTo: process.env.TO_EMAIL || SITE.email,
      subject: `Pickup request received — ${saved.reference}`,
      text: [
        `Hi ${name.split(" ")[0]},`,
        "",
        "Thank you for booking an e-waste pickup with WEEE Centre. We'll call you to confirm the exact time.",
        "",
        `Reference: ${saved.reference}`,
        `Requested: ${pickup.preferredDate}, ${slot}`,
        `Items: ${pickup.itemCategories.join(", ")}`,
        "",
        `Track your pickup: ${SITE.url}/track?ref=${saved.reference}`,
        "",
        "Please remove personal files from devices if you can — if you requested data destruction, we'll handle the rest.",
        "",
        "WEEE Centre",
        SITE.phone,
      ].join("\n"),
    });
  }

  return NextResponse.json({ success: true, message: copy.success, reference: saved?.reference });
}
