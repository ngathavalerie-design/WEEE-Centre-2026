import { randomBytes, timingSafeEqual, createHash } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * CSRF protection (double-submit cookie):
 *  - GET /api/csrf sets an httpOnly, SameSite=Strict cookie and returns the same token.
 *  - Forms send it back in the `x-csrf-token` header; the API checks header === cookie.
 * Another site can neither read the cookie nor the token, so it can't forge a valid request.
 * The request's Origin must also match this site.
 */

export const CSRF_COOKIE = "weee_csrf";
export const CSRF_MAX_AGE = 60 * 60 * 4; // 4 hours

export function newCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

const digest = (v: string) => createHash("sha256").update(v).digest();

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin fetches from older browsers may omit it; the cookie check still applies
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export function verifyCsrf(request: NextRequest): boolean {
  const header = request.headers.get("x-csrf-token") ?? "";
  const cookie = request.cookies.get(CSRF_COOKIE)?.value ?? "";
  if (!/^[0-9a-f]{64}$/.test(header) || !/^[0-9a-f]{64}$/.test(cookie)) return false;
  if (!sameOrigin(request)) return false;
  return timingSafeEqual(digest(header), digest(cookie));
}
