import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { pool, isDatabaseConfigured } from "./db";
import { rateLimit, clientIp } from "./simple-rate-limit";

/**
 * Single-password admin login.
 *
 *   ADMIN_PASSWORD        — the dashboard password. Set it ONLY in .env.local and your
 *                           hosting provider's environment variables, never in code or git.
 *   ADMIN_SESSION_SECRET  — 32+ random characters used to sign the session cookie
 *                           (generate with: openssl rand -base64 48).
 *
 * Sessions last 8 hours. Changing ADMIN_PASSWORD signs everyone out.
 * After 5 wrong passwords from one IP, login is blocked for 15 minutes.
 */

export const ADMIN_COOKIE = "weee_admin";
const SESSION_SECONDS = 8 * 60 * 60;
const MAX_FAILURES = 5;
const LOCKOUT_MINUTES = 15;

function sessionSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SESSION_SECRET must be set to at least 32 characters.");
  return s;
}

const sha256 = (v: string) => createHash("sha256").update(v).digest();

/** Constant-time string comparison (hashing first makes the lengths equal). */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}

const sign = (payload: string) => createHmac("sha256", sessionSecret()).update(payload).digest("base64url");

const passwordFingerprint = () =>
  createHmac("sha256", sessionSecret()).update(process.env.ADMIN_PASSWORD ?? "").digest("base64url").slice(0, 16);

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32);
}

export function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !input) return false;
  return safeEqual(input, expected);
}

function createSessionToken(): string {
  const expires = Date.now() + SESSION_SECONDS * 1000;
  const payload = `v1.${expires}.${passwordFingerprint()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !isAdminConfigured()) return false;
  const cut = token.lastIndexOf(".");
  if (cut < 0) return false;
  const payload = token.slice(0, cut);
  const signature = token.slice(cut + 1);
  if (!safeEqual(signature, sign(payload))) return false;

  const [version, expires, fingerprint] = payload.split(".");
  return version === "v1" && Number(expires) > Date.now() && fingerprint === passwordFingerprint();
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

/** Use at the top of every admin page and server action. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function startAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function endAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

// ---------------------------------------------------------------------------
// Login throttling — stored in PostgreSQL so it works across serverless instances,
// with an in-memory fallback when the database isn't connected.
// ---------------------------------------------------------------------------

async function ipHash(): Promise<string> {
  const h = await headers();
  return createHmac("sha256", sessionSecret()).update(clientIp(h)).digest("hex").slice(0, 32);
}

export async function loginAllowed(): Promise<boolean> {
  const key = await ipHash();
  if (isDatabaseConfigured()) {
    try {
      const { rows } = await pool.query<{ n: string }>(
        `SELECT count(*)::text AS n FROM admin_login_attempts
          WHERE ip_hash = $1 AND attempted_at > now() - make_interval(mins => $2)`,
        [key, LOCKOUT_MINUTES],
      );
      return Number(rows[0]?.n ?? 0) < MAX_FAILURES;
    } catch {
      // fall through to in-memory limiter
    }
  }
  return rateLimit(`admin-login:${key}`, MAX_FAILURES, LOCKOUT_MINUTES * 60 * 1000).ok;
}

export async function recordFailedLogin(): Promise<void> {
  if (!isDatabaseConfigured()) return;
  const key = await ipHash();
  try {
    await pool.query("INSERT INTO admin_login_attempts (ip_hash) VALUES ($1)", [key]);
    await pool.query("DELETE FROM admin_login_attempts WHERE attempted_at < now() - interval '1 day'");
  } catch {
    // never block login because of the audit table
  }
}

export async function clearFailedLogins(): Promise<void> {
  if (!isDatabaseConfigured()) return;
  const key = await ipHash();
  await pool.query("DELETE FROM admin_login_attempts WHERE ip_hash = $1", [key]).catch(() => {});
}
