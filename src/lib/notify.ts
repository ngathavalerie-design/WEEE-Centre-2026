import { Resend } from "resend";
import { STATUS_INFO, type PickupStatus } from "./pickup-status";
import { SITE_URL, reviewUrl } from "./business-profile";

/**
 * Emails the customer when staff change a pickup's status in the admin dashboard.
 * Uses the same RESEND_API_KEY and FROM_EMAIL as the contact forms.
 * Returns true when the email was accepted by Resend.
 */
export async function sendPickupStatusEmail(input: {
  to: string;
  name: string;
  reference: string;
  status: PickupStatus;
  scheduledFor: Date | null;
  customerMessage: string | null;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  if (!apiKey || !from) return false;

  const info = STATUS_INFO[input.status];
  const trackUrl = `${SITE_URL}/track?ref=${encodeURIComponent(input.reference)}`;
  const firstName = input.name.split(" ")[0] || "there";
  const when = input.scheduledFor
    ? new Intl.DateTimeFormat("en-KE", {
        timeZone: "Africa/Nairobi",
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "numeric",
        minute: "2-digit",
      }).format(input.scheduledFor)
    : null;
  const review = input.status === "completed" ? reviewUrl() : null;

  const text = [
    `Hi ${firstName},`,
    "",
    info.customerText,
    when && input.status === "confirmed" ? `\nScheduled for: ${when}` : null,
    input.customerMessage ? `\nMessage from our team: ${input.customerMessage}` : null,
    "",
    `Pickup reference: ${input.reference}`,
    `Track your pickup: ${trackUrl}`,
    review
      ? `\nHappy with our service? A quick Google review helps others find responsible e-waste recycling:\n${review}`
      : null,
    "",
    "WEEE Centre",
    "+254 701 819 559",
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: input.to,
      subject: `Your WEEE Centre pickup ${input.reference}: ${info.label}`,
      text,
      replyTo: process.env.TO_EMAIL || undefined,
    });
    return !error;
  } catch {
    return false;
  }
}
