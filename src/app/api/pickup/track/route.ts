import { NextResponse, type NextRequest } from "next/server";
import { findPickupForTracking } from "@/lib/tracking";
import { normaliseReference, REFERENCE_PATTERN } from "@/lib/pickup-status";
import { rateLimit, clientIp } from "@/lib/simple-rate-limit";

/**
 * POST /api/pickup/track   { reference: "WC-7K3P9Q", contact: "email or phone used when booking" }
 * Read-only lookup for the public tracking page. Rate-limited to slow down guessing.
 */
export async function POST(request: NextRequest) {
  const limit = rateLimit(`track:${clientIp(request.headers)}`, 10, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const body = (await request.json().catch(() => null)) as { reference?: unknown; contact?: unknown } | null;
  const reference = normaliseReference(String(body?.reference ?? ""));
  const contact = String(body?.contact ?? "").trim().slice(0, 200);

  if (!REFERENCE_PATTERN.test(reference) || contact.length < 5) {
    return NextResponse.json(
      { error: "Enter your pickup reference (e.g. WC-7K3P9Q) and the email or phone number you booked with." },
      { status: 400 },
    );
  }

  try {
    const pickup = await findPickupForTracking(reference, contact);
    if (!pickup) {
      return NextResponse.json(
        { error: "We couldn't find a pickup with that reference and contact. Please check both and try again." },
        { status: 404 },
      );
    }
    return NextResponse.json({ pickup }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("Tracking lookup failed:", err);
    return NextResponse.json(
      { error: "Tracking is temporarily unavailable. Please call us on +254 701 819 559." },
      { status: 500 },
    );
  }
}
