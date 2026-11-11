import { randomInt } from "node:crypto";
import { pool, isDatabaseConfigured } from "./db";
import type { PickupDetails } from "./pickup";

export type EnquiryType =
  | "contact"
  | "pickup"
  | "quote"
  | "project"
  | "conference"
  | "event"
  | "service"
  | "subscribe";

export interface SubmissionInput {
  type: EnquiryType;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  subject?: string;
  message?: string;
  additionalData?: Record<string, unknown>;
  sourcePage?: string;
  pickup?: PickupDetails; // required when type === "pickup"
}

export interface SavedSubmission {
  id: string;
  reference?: string; // pickup reference, e.g. WC-7K3P9Q
}

// No 0/O/1/I to avoid confusion when read over the phone.
const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function newPickupReference(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return `WC-${s}`;
}

/**
 * Stores a form submission. Pickups are written to `enquiries` + `pickup_requests`
 * in one transaction; subscribers are also upserted into `subscribers`.
 *
 * Returns null (and stores nothing) when DATABASE_URL isn't set, so the site keeps
 * working with email-only delivery until the database is connected.
 */
export async function saveSubmission(input: SubmissionInput): Promise<SavedSubmission | null> {
  if (!isDatabaseConfigured()) return null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const additional = { ...(input.additionalData ?? {}) };
    delete additional.pickup; // stored in its own table

    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO enquiries
         (type, name, email, phone, organization, subject, message, additional_data, source_page)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
       RETURNING id`,
      [
        input.type,
        input.name,
        input.email,
        input.phone || null,
        input.organization || null,
        input.subject || null,
        input.message || null,
        JSON.stringify(additional),
        input.sourcePage || null,
      ],
    );
    const id = rows[0].id;
    let reference: string | undefined;

    if (input.type === "pickup") {
      if (!input.pickup) throw new Error("Pickup details missing");
      const p = input.pickup;

      // Retry on the (very unlikely) reference collision.
      for (let attempt = 0; attempt < 5 && !reference; attempt++) {
        const candidate = newPickupReference();
        await client.query("SAVEPOINT ref_try");
        try {
          const inserted = await client.query<{ id: string }>(
            `INSERT INTO pickup_requests
               (reference, enquiry_id, address, landmark, area, latitude, longitude,
                preferred_date, time_window, item_categories, estimated_quantity, needs_data_destruction)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id`,
            [
              candidate,
              id,
              p.address,
              p.landmark || null,
              p.area || null,
              p.latitude ?? null,
              p.longitude ?? null,
              p.preferredDate,
              p.timeWindow,
              p.itemCategories,
              p.estimatedQuantity || null,
              p.needsDataDestruction,
            ],
          );
          await client.query(
            `INSERT INTO pickup_status_history (pickup_id, status) VALUES ($1, 'requested')`,
            [inserted.rows[0].id],
          );
          reference = candidate;
        } catch (err) {
          await client.query("ROLLBACK TO SAVEPOINT ref_try");
          if ((err as { code?: string }).code !== "23505") throw err; // only retry unique violations
        }
      }
      if (!reference) throw new Error("Could not allocate a pickup reference");
    }

    if (input.type === "subscribe") {
      await client.query(
        `INSERT INTO subscribers (email, name, source_page)
         VALUES ($1, $2, $3)
         ON CONFLICT ((lower(email))) DO UPDATE SET unsubscribed_at = NULL`,
        [input.email, input.name || null, input.sourcePage || null],
      );
    }

    await client.query("COMMIT");
    return { id, reference };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** Records whether the notification email went out, so failed ones can be followed up. */
export async function markEmailStatus(id: string, status: "sent" | "failed"): Promise<void> {
  if (!isDatabaseConfigured()) return;
  await pool.query("UPDATE enquiries SET email_status = $1 WHERE id = $2", [status, id]);
}
