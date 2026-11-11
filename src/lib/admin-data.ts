import { pool } from "./db";
import type { PickupStatus } from "./pickup-status";

// ---------------------------------------------------------------------------
// Dashboard summary
// ---------------------------------------------------------------------------

export interface DashboardStats {
  newPickups: number;
  pickupsNext7Days: number;
  completedThisMonth: number;
  enquiries30Days: number;
  subscribers: number;
  failedEmails: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { rows } = await pool.query<Record<keyof DashboardStats, string>>(`
    SELECT
      (SELECT count(*) FROM pickup_requests WHERE status = 'requested')::text AS "newPickups",
      (SELECT count(*) FROM pickup_requests
        WHERE status IN ('requested','confirmed')
          AND preferred_date BETWEEN (now() AT TIME ZONE 'Africa/Nairobi')::date
                                 AND (now() AT TIME ZONE 'Africa/Nairobi')::date + 7)::text AS "pickupsNext7Days",
      (SELECT count(*) FROM pickup_requests
        WHERE status = 'completed'
          AND updated_at >= date_trunc('month', now() AT TIME ZONE 'Africa/Nairobi') AT TIME ZONE 'Africa/Nairobi')::text
        AS "completedThisMonth",
      (SELECT count(*) FROM enquiries WHERE created_at > now() - interval '30 days')::text AS "enquiries30Days",
      (SELECT count(*) FROM subscribers WHERE unsubscribed_at IS NULL)::text AS "subscribers",
      (SELECT count(*) FROM enquiries WHERE email_status = 'failed')::text AS "failedEmails"
  `);
  const r = rows[0];
  return {
    newPickups: Number(r.newPickups),
    pickupsNext7Days: Number(r.pickupsNext7Days),
    completedThisMonth: Number(r.completedThisMonth),
    enquiries30Days: Number(r.enquiries30Days),
    subscribers: Number(r.subscribers),
    failedEmails: Number(r.failedEmails),
  };
}

// ---------------------------------------------------------------------------
// Pickups
// ---------------------------------------------------------------------------

export interface AdminPickup {
  id: string;
  reference: string;
  status: PickupStatus;
  preferredDate: string;
  timeWindow: string;
  scheduledFor: Date | null;
  address: string;
  area: string | null;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  itemCategories: string[];
  estimatedQuantity: string | null;
  needsDataDestruction: boolean;
  customerMessage: string | null;
  staffNotes: string | null;
  createdAt: Date;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  message: string | null;
}

export type PickupFilter = PickupStatus | "open" | "all";

export async function listPickups(filter: PickupFilter, search = ""): Promise<AdminPickup[]> {
  const where: string[] = [];
  const params: unknown[] = [];

  if (filter === "open") where.push(`p.status IN ('requested','confirmed','collected')`);
  else if (filter !== "all") {
    params.push(filter);
    where.push(`p.status = $${params.length}`);
  }

  const q = search.trim();
  if (q) {
    params.push(`%${q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`);
    const i = params.length;
    where.push(
      `(p.reference ILIKE $${i} OR e.name ILIKE $${i} OR e.email ILIKE $${i} OR e.phone ILIKE $${i}
        OR e.organization ILIKE $${i} OR p.area ILIKE $${i} OR p.address ILIKE $${i})`,
    );
  }

  const { rows } = await pool.query(
    `SELECT p.id, p.reference, p.status, to_char(p.preferred_date, 'YYYY-MM-DD') AS "preferredDate",
            p.time_window AS "timeWindow", p.scheduled_for AS "scheduledFor", p.address, p.area, p.landmark,
            p.latitude, p.longitude, p.item_categories AS "itemCategories",
            p.estimated_quantity AS "estimatedQuantity", p.needs_data_destruction AS "needsDataDestruction",
            p.customer_message AS "customerMessage", p.staff_notes AS "staffNotes", p.created_at AS "createdAt",
            e.name, e.email, e.phone, e.organization, e.message
       FROM pickup_requests p
       JOIN enquiries e ON e.id = p.enquiry_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY
        CASE p.status WHEN 'requested' THEN 0 WHEN 'confirmed' THEN 1 WHEN 'collected' THEN 2 ELSE 3 END,
        p.preferred_date, p.time_window, p.created_at
      LIMIT 200`,
    params,
  );
  return rows as AdminPickup[];
}

export interface PickupUpdate {
  id: string;
  status: PickupStatus;
  scheduledFor: string | null; // ISO with offset, or null
  customerMessage: string | null;
  staffNotes: string | null;
}

export interface PickupUpdateResult {
  statusChanged: boolean;
  reference: string;
  name: string;
  email: string;
  status: PickupStatus;
  scheduledFor: Date | null;
  customerMessage: string | null;
}

/** Updates a pickup and records a history entry when the status changes. */
export async function updatePickup(u: PickupUpdate): Promise<PickupUpdateResult | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const current = await client.query<{ status: PickupStatus }>(
      "SELECT status FROM pickup_requests WHERE id = $1 FOR UPDATE",
      [u.id],
    );
    if (!current.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }
    const statusChanged = current.rows[0].status !== u.status;

    const updated = await client.query<{
      reference: string;
      scheduled_for: Date | null;
      customer_message: string | null;
      name: string;
      email: string;
    }>(
      `UPDATE pickup_requests p
          SET status = $2, scheduled_for = $3, customer_message = $4, staff_notes = $5
         FROM enquiries e
        WHERE p.id = $1 AND e.id = p.enquiry_id
        RETURNING p.reference, p.scheduled_for, p.customer_message, e.name, e.email`,
      [u.id, u.status, u.scheduledFor, u.customerMessage, u.staffNotes],
    );

    if (statusChanged) {
      await client.query("INSERT INTO pickup_status_history (pickup_id, status) VALUES ($1, $2)", [u.id, u.status]);
    }
    await client.query("COMMIT");

    const r = updated.rows[0];
    return {
      statusChanged,
      reference: r.reference,
      name: r.name,
      email: r.email,
      status: u.status,
      scheduledFor: r.scheduled_for,
      customerMessage: r.customer_message,
    };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Enquiries & subscribers
// ---------------------------------------------------------------------------

export interface AdminEnquiry {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  subject: string | null;
  message: string | null;
  additionalData: Record<string, unknown>;
  emailStatus: string;
  createdAt: Date;
}

export async function listEnquiries(type: string, search = ""): Promise<AdminEnquiry[]> {
  const where: string[] = [`e.type <> 'pickup'`];
  const params: unknown[] = [];
  if (type && type !== "all") {
    params.push(type);
    where.push(`e.type = $${params.length}`);
  }
  const q = search.trim();
  if (q) {
    params.push(`%${q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`);
    const i = params.length;
    where.push(`(e.name ILIKE $${i} OR e.email ILIKE $${i} OR e.organization ILIKE $${i} OR e.subject ILIKE $${i} OR e.message ILIKE $${i})`);
  }
  const { rows } = await pool.query(
    `SELECT e.id, e.type, e.name, e.email, e.phone, e.organization, e.subject, e.message,
            e.additional_data AS "additionalData", e.email_status AS "emailStatus", e.created_at AS "createdAt"
       FROM enquiries e
      WHERE ${where.join(" AND ")}
      ORDER BY e.created_at DESC
      LIMIT 200`,
    params,
  );
  return rows as AdminEnquiry[];
}

export interface AdminSubscriber {
  email: string;
  name: string | null;
  sourcePage: string | null;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
}

export async function listSubscribers(): Promise<AdminSubscriber[]> {
  const { rows } = await pool.query(
    `SELECT email, name, source_page AS "sourcePage", subscribed_at AS "subscribedAt",
            unsubscribed_at AS "unsubscribedAt"
       FROM subscribers ORDER BY subscribed_at DESC LIMIT 1000`,
  );
  return rows as AdminSubscriber[];
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

export type ExportKind = "pickups" | "enquiries" | "subscribers";

const EXPORT_SQL: Record<ExportKind, string> = {
  pickups: `
    SELECT p.reference, p.status, p.preferred_date, p.time_window, p.scheduled_for,
           e.name, e.email, e.phone, e.organization, p.address, p.area, p.landmark,
           p.latitude, p.longitude, array_to_string(p.item_categories, '; ') AS items,
           p.estimated_quantity, p.needs_data_destruction, p.customer_message, p.staff_notes, p.created_at
      FROM pickup_requests p JOIN enquiries e ON e.id = p.enquiry_id
     ORDER BY p.created_at DESC`,
  enquiries: `
    SELECT type, name, email, phone, organization, subject, message, additional_data::text AS additional_data,
           email_status, created_at
      FROM enquiries ORDER BY created_at DESC`,
  subscribers: `
    SELECT email, name, source_page, subscribed_at, unsubscribed_at
      FROM subscribers ORDER BY subscribed_at DESC`,
};

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  let s = v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function exportCsv(kind: ExportKind): Promise<string> {
  const result = await pool.query(EXPORT_SQL[kind]);
  const cols = result.fields.map((f) => f.name);
  const lines = [cols.join(",")];
  for (const row of result.rows) lines.push(cols.map((c) => csvCell(row[c])).join(","));
  return "﻿" + lines.join("\r\n"); // BOM so Excel opens UTF-8 correctly
}
