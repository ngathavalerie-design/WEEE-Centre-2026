import EnquiryButton from "./enquiry/enquiry-button";
import type { EnquiryKind } from "@/lib/enquiry-types";

interface EventItem {
  title: string;
  date: string; // YYYY-MM-DD
  location: string;
  summary: string;
}

const todayNairobi = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(new Date());

/** Upcoming items only (past dates hidden), soonest first. */
export default function EventList({
  items,
  enquiryKind,
  emptyText,
}: {
  items: EventItem[];
  enquiryKind: EnquiryKind;
  emptyText: string;
}) {
  const today = todayNairobi();
  const upcoming = items.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));

  if (upcoming.length === 0) return <div className="empty-state">{emptyText}</div>;

  return (
    <div className="event-list">
      {upcoming.map((e) => {
        const d = new Date(`${e.date}T12:00:00Z`);
        return (
          <article key={`${e.date}-${e.title}`} className="event">
            <div className="event__date">
              <span>{d.toLocaleString("en-KE", { month: "short", timeZone: "UTC" })}</span>
              <strong>{d.getUTCDate()}</strong>
            </div>
            <div>
              <h3>{e.title}</h3>
              <p>
                {e.location} · {e.summary}
              </p>
            </div>
            <EnquiryButton kind={enquiryKind} options={{ eventInterest: e.title }} className="btn btn--outline btn--sm">
              Ask about this
            </EnquiryButton>
          </article>
        );
      })}
    </div>
  );
}
