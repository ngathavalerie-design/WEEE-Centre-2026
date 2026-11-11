import { NextResponse, type NextRequest } from "next/server";
import { guardFormRequest } from "@/lib/form-guard";
import { clean, cleanLine, isEmail } from "@/lib/sanitize";
import { saveSubmission, markEmailStatus } from "@/lib/submissions";
import { notifyTeam } from "@/lib/email";
import { SITE } from "@/content/site";

/** POST /api/contact — the form on the Contact page. */
export async function POST(request: NextRequest) {
  const guard = await guardFormRequest(request, "contact");
  if (!guard.ok) return guard.response;
  const body = guard.body;

  const name = cleanLine(body.name, 120);
  const email = cleanLine(body.email, 200).toLowerCase();
  const phone = cleanLine(body.phone, 30);
  const organization = cleanLine(body.organization, 150);
  const subject = cleanLine(body.subject, 200);
  const message = clean(body.message, 1000);

  if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (subject.length < 2) return NextResponse.json({ error: "Please add a subject." }, { status: 400 });
  if (message.length < 5) return NextResponse.json({ error: "Please write a short message." }, { status: 400 });

  let saved: { id: string } | null = null;
  try {
    saved = await saveSubmission({
      type: "contact",
      name,
      email,
      phone,
      organization,
      subject,
      message,
      sourcePage: cleanLine(request.headers.get("referer"), 300) || undefined,
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("DB save failed:", err);
  }

  const text = [
    "New Contact Form Submission",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    organization ? `Organisation: ${organization}` : null,
    "",
    "Message:",
    message,
    "",
    "---",
    `Submitted: ${new Date().toISOString()}`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const emailOk = await notifyTeam(`Contact Form: ${subject}`, text, email);
  if (saved) await markEmailStatus(saved.id, emailOk ? "sent" : "failed").catch(() => {});

  if (!saved && !emailOk) {
    return NextResponse.json(
      { error: `We couldn't send your message right now. Please call us on ${SITE.phone} or email ${SITE.email}.` },
      { status: 503 },
    );
  }

  return NextResponse.json({ success: true, message: "Thank you — we'll get back to you within one working day." });
}
