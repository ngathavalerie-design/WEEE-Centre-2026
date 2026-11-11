/** Pickup statuses — shared by the tracking page, admin dashboard and emails. Client-safe. */

export const PICKUP_STATUSES = ["requested", "confirmed", "collected", "completed", "cancelled"] as const;
export type PickupStatus = (typeof PICKUP_STATUSES)[number];

/** The normal journey, in order (cancelled is shown separately). */
export const PICKUP_JOURNEY: PickupStatus[] = ["requested", "confirmed", "collected", "completed"];

export const STATUS_INFO: Record<PickupStatus, { label: string; customerText: string }> = {
  requested: {
    label: "Requested",
    customerText: "We've received your pickup request. Our team will call you to confirm the time.",
  },
  confirmed: {
    label: "Confirmed",
    customerText: "Your pickup is confirmed. Please have the items ready at the agreed time.",
  },
  collected: {
    label: "Collected",
    customerText: "We've collected your items and they're on their way to the WEEE Centre.",
  },
  completed: {
    label: "Completed",
    customerText: "Your items have been processed responsibly. Thank you for recycling with us!",
  },
  cancelled: {
    label: "Cancelled",
    customerText: "This pickup was cancelled. Contact us if you'd like to book a new one.",
  },
};

export function isPickupStatus(v: unknown): v is PickupStatus {
  return typeof v === "string" && (PICKUP_STATUSES as readonly string[]).includes(v);
}

/** Normalises what customers type: "wc 7k3p9q" → "WC-7K3P9Q". */
export function normaliseReference(input: string): string {
  const s = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = s.startsWith("WC") ? s.slice(2) : s;
  return `WC-${body.slice(0, 6)}`;
}

export const REFERENCE_PATTERN = /^WC-[2-9A-HJ-NP-Z]{6}$/;
