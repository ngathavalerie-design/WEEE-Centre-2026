import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import EnquiryButton from "@/components/enquiry/enquiry-button";
import EventList from "@/components/event-list";
import { CalendarIcon, UsersIcon, LeafIcon } from "@/components/icons";
import { EVENTS } from "@/content/site";

export const metadata: Metadata = {
  title: "Events",
  description: "E-waste collection drives, awareness sessions and community events by WEEE Centre.",
  alternates: { canonical: "/events" },
  openGraph: { url: "/events", title: "Events | WEEE Centre" },
};

// Re-check hourly so past events drop off the list.
export const revalidate = 3600;

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Collection drives, workshops and community events"
        lead="Join an upcoming event — or plan an e-waste day for your school, estate or workplace."
      >
        <EnquiryButton kind="event" className="btn btn--light">
          Plan an event
        </EnquiryButton>
        <EnquiryButton kind="subscribe" className="btn btn--ghost-light">
          Get event updates
        </EnquiryButton>
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Upcoming</span>
            <h2>Upcoming events</h2>
          </div>
          <EventList
            items={EVENTS}
            enquiryKind="event"
            emptyText="No upcoming events are listed right now. Subscribe for updates, or ask us about planning one."
          />
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Host one with us</span>
            <h2>Events we can run with you</h2>
          </div>
          <div className="grid grid--3">
            <article className="card">
              <div className="card__icon">
                <CalendarIcon />
              </div>
              <h3>Collection drives</h3>
              <p>A set day and place where your community or staff drop off e-waste — we handle the rest.</p>
            </article>
            <article className="card">
              <div className="card__icon">
                <UsersIcon />
              </div>
              <h3>Awareness sessions</h3>
              <p>Talks for schools, universities and workplaces on e-waste, data safety and the circular economy.</p>
            </article>
            <article className="card">
              <div className="card__icon">
                <LeafIcon />
              </div>
              <h3>Corporate e-waste days</h3>
              <p>Clear out the office and give staff a safe way to dispose of personal devices too.</p>
            </article>
          </div>
          <div style={{ marginTop: 28 }}>
            <EnquiryButton kind="event" className="btn">
              Ask about events
            </EnquiryButton>
          </div>
        </div>
      </section>
    </>
  );
}
