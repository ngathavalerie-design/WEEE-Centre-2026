import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import EnquiryButton from "@/components/enquiry/enquiry-button";
import EventList from "@/components/event-list";
import { MicIcon, UsersIcon, ChartIcon } from "@/components/icons";
import { CONFERENCES } from "@/content/site";

export const metadata: Metadata = {
  title: "Conferences",
  description:
    "Invite WEEE Centre to speak, exhibit or partner at conferences on e-waste, sustainability and the circular economy.",
  alternates: { canonical: "/conferences" },
  openGraph: { url: "/conferences", title: "Conferences | WEEE Centre" },
};

export const revalidate = 3600;

export default function ConferencesPage() {
  return (
    <>
      <PageHero
        eyebrow="Conferences"
        title="Sharing what we've learned about e-waste in Kenya"
        lead="We speak, exhibit and partner at conferences on sustainability, technology and the circular economy."
      >
        <EnquiryButton kind="conference" className="btn btn--light">
          Contact the team
        </EnquiryButton>
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Where to find us</span>
            <h2>Upcoming conferences</h2>
          </div>
          <EventList
            items={CONFERENCES}
            enquiryKind="conference"
            emptyText="No upcoming conferences are listed right now. Organising one? We'd love to hear from you."
          />
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Invite us</span>
            <h2>How we can take part</h2>
          </div>
          <div className="grid grid--3">
            <article className="card">
              <div className="card__icon">
                <MicIcon />
              </div>
              <h3>Keynotes &amp; panels</h3>
              <p>E-waste in Kenya, data security at end of life, and building circular-economy businesses.</p>
            </article>
            <article className="card">
              <div className="card__icon">
                <UsersIcon />
              </div>
              <h3>Exhibitions</h3>
              <p>A stand with on-site e-waste collection so attendees can drop off old devices.</p>
            </article>
            <article className="card">
              <div className="card__icon">
                <ChartIcon />
              </div>
              <h3>Partnerships</h3>
              <p>Research, policy dialogue and programme partnerships with organisers and sponsors.</p>
            </article>
          </div>
          <div style={{ marginTop: 28 }}>
            <EnquiryButton kind="conference" className="btn">
              Contact the team
            </EnquiryButton>
          </div>
        </div>
      </section>
    </>
  );
}
