import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { isDatabaseConfigured } from "@/lib/db";
import {
  getDashboardStats,
  listEnquiries,
  listPickups,
  listSubscribers,
  type AdminPickup,
  type PickupFilter,
} from "@/lib/admin-data";
import { PICKUP_STATUSES, STATUS_INFO, isPickupStatus } from "@/lib/pickup-status";
import { PICKUP_TIME_WINDOWS } from "@/lib/pickup";
import { logoutAction, updatePickupAction } from "./actions";

type Tab = "pickups" | "enquiries" | "subscribers";
const ENQUIRY_TYPES = ["all", "contact", "quote", "project", "service", "event", "conference", "subscribe"];

const fmt = (d: Date | string, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" }) =>
  new Intl.DateTimeFormat("en-KE", { timeZone: "Africa/Nairobi", ...opts }).format(new Date(d));

const fmtDay = (ymd: string) => fmt(`${ymd}T12:00:00Z`, { weekday: "short", day: "numeric", month: "short" });

/** Date → value for <input type="datetime-local"> in Nairobi time. */
function toLocalInput(d: Date | null): string {
  if (!d) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(d));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const tab: Tab = (["pickups", "enquiries", "subscribers"] as const).includes(str(params.tab) as Tab)
    ? (str(params.tab) as Tab)
    : "pickups";
  const statusParam = str(params.status) || "open";
  const pickupFilter: PickupFilter =
    statusParam === "all" || statusParam === "open" || isPickupStatus(statusParam) ? statusParam : "open";
  const enquiryType = ENQUIRY_TYPES.includes(str(params.type)) ? str(params.type) : "all";
  const q = str(params.q).slice(0, 100);
  const saved = str(params.saved);
  const error = str(params.error);

  const currentPath = (() => {
    const sp = new URLSearchParams();
    sp.set("tab", tab);
    if (tab === "pickups") sp.set("status", pickupFilter);
    if (tab === "enquiries") sp.set("type", enquiryType);
    if (q) sp.set("q", q);
    return `/admin?${sp.toString()}`;
  })();

  if (!isDatabaseConfigured()) {
    return (
      <main className="admin-main">
        <AdminHeader />
        <p className="admin-alert admin-alert--error">
          The database isn&apos;t connected. Set DATABASE_URL and run <code>npm run db:migrate</code>.
        </p>
      </main>
    );
  }

  const stats = await getDashboardStats();

  return (
    <main className="admin-main">
      <AdminHeader />

      {saved && <p className="admin-alert admin-alert--ok">✓ {saved}</p>}
      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      <section className="admin-stats">
        <Stat label="New pickup requests" value={stats.newPickups} highlight={stats.newPickups > 0} />
        <Stat label="Pickups in next 7 days" value={stats.pickupsNext7Days} />
        <Stat label="Completed this month" value={stats.completedThisMonth} />
        <Stat label="Enquiries (30 days)" value={stats.enquiries30Days} />
        <Stat label="Subscribers" value={stats.subscribers} />
        <Stat label="Failed emails" value={stats.failedEmails} warn={stats.failedEmails > 0} />
      </section>

      <nav className="admin-tabs">
        <Link className={tab === "pickups" ? "is-active" : ""} href="/admin?tab=pickups">
          Pickups
        </Link>
        <Link className={tab === "enquiries" ? "is-active" : ""} href="/admin?tab=enquiries">
          Enquiries
        </Link>
        <Link className={tab === "subscribers" ? "is-active" : ""} href="/admin?tab=subscribers">
          Subscribers
        </Link>
        <a className="admin-tabs__export" href={`/api/admin/export?kind=${tab}`}>
          ⬇ Export CSV
        </a>
      </nav>

      {tab !== "subscribers" && (
        <form className="admin-filters" method="get" action="/admin">
          <input type="hidden" name="tab" value={tab} />
          {tab === "pickups" ? (
            <select name="status" defaultValue={pickupFilter}>
              <option value="open">Open (not completed)</option>
              <option value="all">All</option>
              {PICKUP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_INFO[s].label}
                </option>
              ))}
            </select>
          ) : (
            <select name="type" defaultValue={enquiryType}>
              {ENQUIRY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "All types" : t[0].toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          )}
          <input type="search" name="q" defaultValue={q} placeholder="Search name, email, phone, reference…" />
          <button className="admin-btn" type="submit">
            Filter
          </button>
        </form>
      )}

      {tab === "pickups" && <PickupsTab pickups={await listPickups(pickupFilter, q)} returnTo={currentPath} />}
      {tab === "enquiries" && <EnquiriesTab type={enquiryType} q={q} />}
      {tab === "subscribers" && <SubscribersTab />}
    </main>
  );
}

function AdminHeader() {
  return (
    <header className="admin-header">
      <div>
        <h1>WEEE Centre admin</h1>
        <p className="admin-muted">Pickups, enquiries and subscribers</p>
      </div>
      <form action={logoutAction}>
        <button className="admin-btn" type="submit">
          Sign out
        </button>
      </form>
    </header>
  );
}

function Stat({ label, value, highlight, warn }: { label: string; value: number; highlight?: boolean; warn?: boolean }) {
  return (
    <div className={`admin-stat${highlight ? " admin-stat--highlight" : ""}${warn ? " admin-stat--warn" : ""}`}>
      <span className="admin-stat__value">{value}</span>
      <span className="admin-stat__label">{label}</span>
    </div>
  );
}

function PickupsTab({ pickups, returnTo }: { pickups: AdminPickup[]; returnTo: string }) {
  if (pickups.length === 0) return <p className="admin-empty">No pickups match these filters.</p>;

  return (
    <div className="admin-list">
      {pickups.map((p) => {
        const slot = PICKUP_TIME_WINDOWS.find((w) => w.value === p.timeWindow)?.label ?? p.timeWindow;
        const mapUrl =
          p.latitude != null && p.longitude != null
            ? `https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.address} ${p.area ?? ""} Kenya`)}`;
        return (
          <details key={p.id} className="admin-card admin-pickup">
            <summary>
              <span className={`admin-pill admin-pill--${p.status}`}>{STATUS_INFO[p.status].label}</span>
              <span className="admin-pickup__ref">{p.reference}</span>
              <span className="admin-pickup__when">
                {p.scheduledFor ? `📅 ${fmt(p.scheduledFor)}` : `${fmtDay(p.preferredDate)} · ${slot.split(" (")[0]}`}
              </span>
              <span className="admin-pickup__who">
                {p.name}
                {p.organization ? ` · ${p.organization}` : ""}
              </span>
              <span className="admin-pickup__area">{p.area || p.address}</span>
              {p.needsDataDestruction && <span className="admin-pill admin-pill--data">Data destruction</span>}
            </summary>

            <div className="admin-pickup__body">
              <div className="admin-pickup__info">
                <dl>
                  <dt>Contact</dt>
                  <dd>
                    {p.name}
                    <br />
                    <a href={`mailto:${p.email}`}>{p.email}</a>
                    {p.phone && (
                      <>
                        <br />
                        <a href={`tel:${p.phone}`}>{p.phone}</a> ·{" "}
                        <a
                          href={`https://wa.me/${p.phone.replace(/\D/g, "").replace(/^0/, "254")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>
                      </>
                    )}
                  </dd>
                  <dt>Address</dt>
                  <dd>
                    {p.address}
                    {p.area && <>, {p.area}</>}
                    {p.landmark && (
                      <>
                        <br />
                        <span className="admin-muted">Landmark: {p.landmark}</span>
                      </>
                    )}
                    <br />
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                      {p.latitude != null ? "📍 Open customer's pin" : "Search on map"} ↗
                    </a>
                  </dd>
                  <dt>Requested</dt>
                  <dd>
                    {fmtDay(p.preferredDate)} · {slot}
                  </dd>
                  <dt>Items</dt>
                  <dd>
                    {p.itemCategories.join(", ")}
                    {p.estimatedQuantity && (
                      <>
                        <br />
                        <span className="admin-muted">{p.estimatedQuantity}</span>
                      </>
                    )}
                  </dd>
                  {p.message && (
                    <>
                      <dt>Customer note</dt>
                      <dd className="admin-pre">{p.message}</dd>
                    </>
                  )}
                  <dt>Booked</dt>
                  <dd>{fmt(p.createdAt)}</dd>
                </dl>
              </div>

              <form action={updatePickupAction} className="admin-pickup__form">
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="returnTo" value={returnTo} />

                <label className="admin-field">
                  Status
                  <select name="status" defaultValue={p.status}>
                    {PICKUP_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_INFO[s].label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">
                  Confirmed date &amp; time (Nairobi)
                  <input type="datetime-local" name="scheduledFor" defaultValue={toLocalInput(p.scheduledFor)} />
                </label>
                <label className="admin-field">
                  Message to customer <span className="admin-muted">(shown on tracking page &amp; email)</span>
                  <textarea
                    name="customerMessage"
                    rows={2}
                    maxLength={500}
                    defaultValue={p.customerMessage ?? ""}
                    placeholder="e.g. Our driver Peter (0712 000 000) will call 30 minutes before arriving."
                  />
                </label>
                <label className="admin-field">
                  Internal notes <span className="admin-muted">(staff only)</span>
                  <textarea name="staffNotes" rows={2} maxLength={2000} defaultValue={p.staffNotes ?? ""} />
                </label>
                <label className="admin-check">
                  <input type="checkbox" name="notify" defaultChecked />
                  Email the customer if the status changes
                </label>
                <button type="submit" className="admin-btn admin-btn--primary">
                  Save
                </button>
              </form>
            </div>
          </details>
        );
      })}
    </div>
  );
}

async function EnquiriesTab({ type, q }: { type: string; q: string }) {
  const enquiries = await listEnquiries(type, q);
  if (enquiries.length === 0) return <p className="admin-empty">No enquiries match these filters.</p>;

  return (
    <div className="admin-list">
      {enquiries.map((e) => {
        const extra = Object.entries(e.additionalData ?? {}).filter(([, v]) => v !== "" && v != null);
        return (
          <details key={e.id} className="admin-card admin-enquiry">
            <summary>
              <span className="admin-pill">{e.type}</span>
              <span className="admin-enquiry__who">
                {e.name}
                {e.organization ? ` · ${e.organization}` : ""}
              </span>
              <span className="admin-enquiry__subject">{e.subject || e.message?.slice(0, 80) || "—"}</span>
              <span className="admin-muted">{fmt(e.createdAt)}</span>
              {e.emailStatus === "failed" && <span className="admin-pill admin-pill--cancelled">Email failed</span>}
            </summary>
            <div className="admin-enquiry__body">
              <p>
                <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: ${e.subject ?? "Your enquiry"}`)}`}>
                  {e.email}
                </a>
                {e.phone && (
                  <>
                    {" · "}
                    <a href={`tel:${e.phone}`}>{e.phone}</a>
                  </>
                )}
              </p>
              {e.message && <p className="admin-pre">{e.message}</p>}
              {extra.length > 0 && (
                <dl className="admin-extra">
                  {extra.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{typeof v === "object" ? JSON.stringify(v) : String(v)}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}

async function SubscribersTab() {
  const subs = await listSubscribers();
  if (subs.length === 0) return <p className="admin-empty">No subscribers yet.</p>;
  return (
    <div className="admin-card admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Signed up on</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s) => (
            <tr key={s.email}>
              <td>{s.email}</td>
              <td>{s.name ?? "—"}</td>
              <td>{fmt(s.subscribedAt, { dateStyle: "medium" })}</td>
              <td>{s.unsubscribedAt ? "Unsubscribed" : "Active"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
