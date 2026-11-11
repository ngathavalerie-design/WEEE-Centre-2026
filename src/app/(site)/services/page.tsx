import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import EnquiryButton from "@/components/enquiry/enquiry-button";
import { ServiceSchema } from "@/components/structured-data";
import { CheckIcon, SERVICE_ICONS } from "@/components/icons";
import { ACCEPTED_ITEMS, SERVICES } from "@/content/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "E-waste collection and pickup, secure data destruction, IT asset disposal, refurbishment, recycling and compliance reporting in Kenya.",
  alternates: { canonical: "/services" },
  openGraph: { url: "/services", title: "E-waste services | WEEE Centre" },
};

export default function ServicesPage() {
  return (
    <>
      <ServiceSchema />
      <PageHero
        eyebrow="Services"
        title="Everything you need to dispose of electronics responsibly"
        lead="One partner for collection, data security, reuse and recycling — with the paperwork organisations need."
      >
        <EnquiryButton kind="quote" className="btn btn--light">
          Get a quote
        </EnquiryButton>
        <EnquiryButton kind="pickup" className="btn btn--ghost-light">
          Schedule a pickup
        </EnquiryButton>
      </PageHero>

      <section className="section">
        <div className="container grid grid--2">
          {SERVICES.map((s) => {
            const Icon = SERVICE_ICONS[s.icon];
            return (
              <article key={s.slug} id={s.slug} className="card card--feature" style={{ scrollMarginTop: 96 }}>
                <div className="card__icon">
                  <Icon />
                </div>
                <h2 style={{ fontSize: "1.35rem" }}>{s.title}</h2>
                <p>{s.summary}</p>
                <ul>
                  {s.points.map((p) => (
                    <li key={p}>
                      <CheckIcon size={16} /> {p}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {s.slug === "collection" ? (
                    <EnquiryButton kind="pickup" className="btn btn--sm">
                      Schedule a pickup
                    </EnquiryButton>
                  ) : (
                    <EnquiryButton kind="quote" options={{ service: s.title }} className="btn btn--sm">
                      Get a quote
                    </EnquiryButton>
                  )}
                  <EnquiryButton kind="service" options={{ service: s.title }} className="btn btn--outline btn--sm">
                    Ask a question
                  </EnquiryButton>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Accepted items</span>
            <h2>What we collect</h2>
            <p className="lead">
              We accept most electrical and electronic equipment. For large volumes, hazardous items or anything
              unusual, add a note when you book or ask us first.
            </p>
          </div>
          <div className="chips">
            {ACCEPTED_ITEMS.map((i) => (
              <span key={i} className="chip">
                {i}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head section__head--center">
            <span className="eyebrow">The process</span>
            <h2>How a collection works</h2>
          </div>
          <ol className="steps">
            <li>
              <h3>Book</h3>
              <p>Schedule online with your location and items, or request a quote for larger jobs.</p>
            </li>
            <li>
              <h3>Confirm</h3>
              <p>We call to confirm the time and anything we need to know about access.</p>
            </li>
            <li>
              <h3>Collect</h3>
              <p>Our team collects and records the items. Track progress with your reference.</p>
            </li>
            <li>
              <h3>Process</h3>
              <p>Data is destroyed, items are refurbished or recycled, and certificates issued where needed.</p>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
