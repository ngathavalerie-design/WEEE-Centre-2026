import { NextResponse, type NextRequest } from "next/server";
import { verifyCsrf } from "./csrf";
import { verifyRecaptcha } from "./recaptcha";
import { clientIp, rateLimit } from "./simple-rate-limit";

/**
 * Checks shared by every public form endpoint, in order:
 * rate limit (5/min per visitor) → CSRF → JSON body → honeypot → reCAPTCHA.
 * Returns the parsed body, or a ready-made error response.
 */
export async function guardFormRequest(
  request: NextRequest,
  bucket: string,
): Promise<{ ok: true; body: Record<string, unknown>; ip: string } | { ok: false; response: NextResponse }> {
  const ip = clientIp(request.headers);
  const ua = request.headers.get("user-agent")?.slice(0, 80) ?? "";
  const limit = rateLimit(`${bucket}:${ip}:${ua}`, 5, 60_000);
  if (!limit.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many submissions. Please wait a minute and try again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
      ),
    };
  }

  if (!verifyCsrf(request)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Your session expired. Please try again." }, { status: 403 }),
    };
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return { ok: false, response: NextResponse.json({ error: "Invalid request." }, { status: 400 }) };
  }

  // Honeypot: real people never see this field. Pretend success so bots don't retry.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return { ok: false, response: NextResponse.json({ success: true, message: "Thank you." }) };
  }

  if (!(await verifyRecaptcha(body.recaptchaToken, ip))) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Please complete the “I'm not a robot” check." }, { status: 400 }),
    };
  }

  return { ok: true, body, ip };
}
