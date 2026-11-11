import { Resend } from "resend";

/**
 * Email via Resend.
 *   RESEND_API_KEY  — from resend.com/api-keys
 *   FROM_EMAIL      — a sender on your verified domain, e.g. "WEEE Centre <noreply@weeecentre.com>"
 *   TO_EMAIL        — where staff notifications go, e.g. info@weeecentre.com
 */

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.FROM_EMAIL);
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  if (!apiKey || !from) return false;
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject.replace(/[\r\n]+/g, " ").slice(0, 200),
      text: input.text,
      replyTo: input.replyTo,
    });
    if (error && process.env.NODE_ENV === "development") console.error("Resend error:", error);
    return !error;
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("Resend failed:", err);
    return false;
  }
}

/** Sends a notification to the team inbox (TO_EMAIL). */
export function notifyTeam(subject: string, text: string, replyTo?: string): Promise<boolean> {
  const to = process.env.TO_EMAIL || "info@weeecentre.com";
  return sendEmail({ to, subject, text, replyTo });
}
