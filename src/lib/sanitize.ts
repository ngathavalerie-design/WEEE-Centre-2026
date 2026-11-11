/** Input cleaning shared by the form APIs. */

export function clean(value: unknown, max = 1000): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

/** Single-line value (no line breaks) — for names, subjects and anything used in email headers. */
export function cleanLine(value: unknown, max = 200): string {
  return clean(value, max).replace(/[\r\n]+/g, " ");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return value.length <= 200 && EMAIL_RE.test(value);
}
