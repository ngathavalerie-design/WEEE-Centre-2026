import { NextResponse, type NextRequest } from "next/server";

/**
 * Security headers for every page and API response.
 *
 * Next.js 16 note: Next 16 renamed "middleware" to "proxy". This file still works there
 * (with a deprecation warning at build time). To silence the warning, rename this file
 * to src/proxy.ts and the function below from `middleware` to `proxy`.
 *
 * If you add a new third-party script or embed and it's blocked, add its domain to the
 * matching directive below and check the browser console for "Content Security Policy" errors.
 */

const isProd = process.env.NODE_ENV === "production";

const CSP = [
  "default-src 'self'",
  // 'unsafe-inline' is needed for Next.js inline bootstrap, the GA init snippet and Tawk.to.
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://www.googletagmanager.com https://www.google.com https://www.gstatic.com https://embed.tawk.to https://*.tawk.to https://cdn.jsdelivr.net`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://embed.tawk.to https://*.tawk.to",
  "img-src 'self' data: blob: https://*.google-analytics.com https://www.googletagmanager.com https://lh3.googleusercontent.com https://*.gstatic.com https://maps.googleapis.com https://maps.gstatic.com https://*.tawk.to https://tawk.link https://weeecentre.com",
  "font-src 'self' data: https://fonts.gstatic.com https://*.tawk.to",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.google.com https://*.tawk.to wss://*.tawk.to",
  "frame-src https://www.google.com https://maps.google.com https://recaptcha.google.com https://*.tawk.to",
  "media-src 'self' https://*.tawk.to",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  const h = response.headers;

  h.set("Content-Security-Policy", CSP);
  h.set("X-Frame-Options", "DENY");
  h.set("X-Content-Type-Options", "nosniff");
  h.set("Referrer-Policy", "strict-origin-when-cross-origin");
  h.set(
    "Permissions-Policy",
    "camera=(), microphone=(), payment=(), usb=(), interest-cohort=(), geolocation=(self)",
  );
  if (isProd) h.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  return response;
}

export const config = {
  // Skip static files and image optimisation.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$).*)"],
};
