"use client";

/**
 * Fetches (and caches for the page's lifetime) a CSRF token from /api/csrf.
 * The same token is set as an httpOnly cookie; the API checks they match.
 */
let cached: Promise<string> | null = null;

export function getCsrfToken(force = false): Promise<string> {
  if (!cached || force) {
    cached = fetch("/api/csrf", { credentials: "same-origin", cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("csrf");
        return r.json();
      })
      .then((d: { token: string }) => d.token)
      .catch((e) => {
        cached = null;
        throw e;
      });
  }
  return cached;
}

/** POST JSON with the CSRF header, retrying once with a fresh token if it expired. */
export async function postWithCsrf(url: string, body: unknown): Promise<Response> {
  const send = async (token: string) =>
    fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "x-csrf-token": token },
      body: JSON.stringify(body),
    });

  let res = await send(await getCsrfToken());
  if (res.status === 403) res = await send(await getCsrfToken(true));
  return res;
}
