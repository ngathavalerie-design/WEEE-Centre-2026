import { NextResponse } from "next/server";
import { CSRF_COOKIE, CSRF_MAX_AGE, newCsrfToken } from "@/lib/csrf";

/** GET /api/csrf — issues a CSRF token (also set as an httpOnly cookie). */
export async function GET() {
  const token = newCsrfToken();
  const res = NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
  res.cookies.set(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: CSRF_MAX_AGE,
  });
  return res;
}
