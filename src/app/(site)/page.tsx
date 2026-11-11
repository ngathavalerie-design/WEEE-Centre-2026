import Link from "next/link";
import EnquiryButton from "@/components/enquiry/enquiry-button";
import GoogleReviews from "@/components/google-reviews";
import { ArrowIcon, CheckIcon, LeafIcon, SERVICE_ICONS, ShieldIcon, TruckIcon } from "@/components/icons";
import { ACCEPTED_ITEMS, SERVICES, SITE } from "@/content/site";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <span className="eyebrow">E-waste collection · Nairobi &amp; across Kenya</span>
            <h1>Give your old electronics a responsible next life</h1>
            <p className="lead">
              We collect, refurbish and recycle e-waste — with secure data destruction for organisations
              and simple pickup booking for everyone.
            </p>
            <div className="hero__actions">
              <EnquiryButton kind="pickup" className="btn btn--light">
                Schedule a pickup <ArrowIcon size={18} />
              </EnquiryButton>
              <EnquiryButton kind="quote" className="btn btn--ghost-light">
                Request a quote
              </EnquiryButton>
            </div>
            <div className="hero__badges">
              <span>
                <TruckIcon size={18} /> Pickup scheduling online
              </span>
              <span>
                <ShieldIcon size={18} /> Certified data destruction
              </span>
              <span>
                <LeafIcon size={18} /> Nothing goes to landfill that can be saved
              </span>
            </div>
          </div>

          <aside className="hero__card" aria-label="How pickup works">
            <h2>Pickup in three steps</h2>
            <ol className="hero__steps">
              <li>
                <b>1</b>
                <span>
                  <strong>Book online</strong>Choose a date, pin your location and tell us what you have.
                </span>
              </li>
              <li>
                <b>2</b>
                <span>
                  <strong>We confirm &amp; collect</strong>Our team calls to confirm and picks up from your door.
                </span>
              </li>
              <li>
                <b>3</b>
                <span>
                  <strong>Track it</strong>Follow your pickup with your reference number until it&apos;s processed.
                </span>
              </li>
            </ol>
            <EnquiryButton kind="pickup" className="btn btn--light btn--block">
              Book a pickup
            </EnquiryButton>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head section__head--center">
            <span className="eyebrow">What we do</span>
            <h2>End-to-end e-waste services</h2>
            <p className="lead">From a single old phone to a full office clear-out, handled safely and responsibly.</p>
          </div>
          <div className="grid grid--3">
            {SERVICES.map((s) => {
              const Icon = SERVICE_ICONS[s.icon];
              return (
                <article key={s.slug} className="card card--feature">
                  <div className="card__icon">
                    <Icon />
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.summary}</p>
                  <Link href={`/services#${s.slug}`} className="link-btn">
                    Learn more <ArrowIcon size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container split">
          <div>
            <span className="eyebrow">What we accept</span>
            <h2>If it has a plug or a battery, we can probably take it</h2>
            <p className="lead">
              Not sure about an item? Book anyway and add a note — or send us a WhatsApp message first.
            </p>
            <EnquiryButton kind="pickup" className="btn">
              Schedule a pickup
            </EnquiryButton>
          </div>
          <div className="chips">
            {ACCEPTED_ITEMS.map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div className="panel">
            <span className="eyebrow">For organisations</span>
            <h2>Secure IT asset disposal</h2>
            <ul className="checklist">
              {[
                "Data wiped or physically destroyed — never resold with your data on it",
                "Asset inventory and chain-of-custody records",
                "Certificates of destruction and responsible disposal for your audits",
                "Scheduled collections for large or recurring clear-outs",
              ].map((t) => (
                <li key={t}>
                  <CheckIcon size={18} /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Banks, NGOs, schools and corporates trust their retired IT to a clear process</h2>
            <p className="lead">
              Tell us what you&apos;re retiring and we&apos;ll put together a collection and disposal plan with the
              paperwork you need.
            </p>
            <div className="hero__actions" style={{ marginTop: 0 }}>
              <EnquiryButton kind="quote" className="btn">
                Request a quote
              </EnquiryButton>
              <EnquiryButton kind="service" className="btn btn--outline">
                Talk to our team
              </EnquiryButton>
            </div>
          </div>
        </div>
      </section>

      <GoogleReviews max={3} wrapClassName="section section--soft" />

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Ready to clear out your old electronics?</h2>
              <p>
                Book a pickup in two minutes, or call us on <a href={SITE.phoneHref} style={{ color: "#fff" }}>{SITE.phone}</a>.
              </p>
            </div>
            <div className="cta-band__actions">
              <EnquiryButton kind="pickup" className="btn btn--light">
                Schedule a pickup
              </EnquiryButton>
              <EnquiryButton kind="subscribe" className="btn btn--ghost-light">
                Subscribe to updates
              </EnquiryButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
