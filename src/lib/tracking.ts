import { pool, isDatabaseConfigured } from "./db";
import { REFERENCE_PATTERN, type PickupStatus } from "./pickup-status";

export interface PublicPickupView {
  reference: string;
  status: PickupStatus;
  preferredDate: string;
  timeWindow: string;
  area: string | null;
  scheduledFor: string | null;
  customerMessage: string | null;
  itemCategories: string[];
  needsDataDestruction: boolean;
  history: { status: PickupStatus; at: string }[];
}

const digits = (s: string) => s.replace(/\D/g, "");

/**
 * Looks up a pickup for the public tracking page.
 * The customer must give the reference AND the email or phone used when booking,
 * so a guessed reference alone reveals nothing. The street address is never returned.
 */
export async function findPickupForTracking(
  reference: string,
  contact: string,
): Promise<PublicPickupView | null> {
  if (!isDatabaseConfigured() || !REFERENCE_PATTERN.test(reference)) return null;

  const { rows } = await pool.query<{
    id: string;
    reference: string;
    status: PickupStatus;
    preferred_date: string;
    time_window: string;
    area: string | null;
    scheduled_for: Date | null;
    customer_message: string | null;
    item_categories: string[];
    needs_data_destruction: boolean;
    email: string;
    phone: string | null;
  }>(
    `SELECT p.id, p.reference, p.status, to_char(p.preferred_date, 'YYYY-MM-DD') AS preferred_date,
            p.time_window, p.area, p.scheduled_for, p.customer_message, p.item_categories,
            p.needs_data_destruction, e.email, e.phone
       FROM pickup_requests p
       JOIN enquiries e ON e.id = p.enquiry_id
      WHERE p.reference = $1`,
    [reference],
  );
  const row = rows[0];
  if (!row) return null;

  const c = contact.trim().toLowerCase();
  const emailMatch = c.includes("@") && c === row.email.trim().toLowerCase();
  const phoneDigits = digits(c);
  const phoneMatch =
    !c.includes("@") &&
    phoneDigits.length >= 9 &&
    !!row.phone &&
    digits(row.phone).slice(-9) === phoneDigits.slice(-9); // 0712… and +254712… both match
  if (!emailMatch && !phoneMatch) return null;

  const history = await pool.query<{ status: PickupStatus; created_at: Date }>(
    `SELECT status, created_at FROM pickup_status_history WHERE pickup_id = $1 ORDER BY created_at`,
    [row.id],
  );

  return {
    reference: row.reference,
    status: row.status,
    preferredDate: row.preferred_date,
    timeWindow: row.time_window,
    area: row.area,
    scheduledFor: row.scheduled_for ? row.scheduled_for.toISOString() : null,
    customerMessage: row.customer_message,
    itemCategories: row.item_categories,
    needsDataDestruction: row.needs_data_destruction,
    history: history.rows.map((h) => ({ status: h.status, at: h.created_at.toISOString() })),
  };
}
