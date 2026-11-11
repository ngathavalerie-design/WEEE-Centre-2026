import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import PickupMap from "@/components/pickup-map";
import EnquiryButton from "@/components/enquiry/enquiry-button";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon, BrandIcon } from "@/components/icons";
import { SITE } from "@/content/site";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact us",
  description: `Contact WEEE Centre — call ${SITE.phone}, email ${SITE.email}, or visit us in Mihango, Embakasi, Nairobi.`,
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact", title: "Contact WEEE Centre" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to us"
        lead="Questions, quotes, partnerships or a pickup — we usually reply within one working day."
      >
        <EnquiryButton kind="pickup" className="btn btn--light">
          Schedule a pickup
        </EnquiryButton>
      </PageHero>

      <section className="section">
        <div className="container contact-grid">
          <div>
            <ul className="contact-list">
              <li>
                <span className="card__icon">
                  <PhoneIcon size={20} />
                </span>
                <span>
                  <strong>Phone</strong>
                  <a href={SITE.phoneHref}>{SITE.phone}</a>
                </span>
              </li>
              <li>
                <span className="card__icon">
                  <BrandIcon name="whatsapp" size={20} />
                </span>
                <span>
                  <strong>WhatsApp</strong>
                  <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    Chat with us
                  </a>
                </span>
              </li>
              <li>
                <span className="card__icon">
                  <MailIcon size={20} />
                </span>
                <span>
                  <strong>Email</strong>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </span>
              </li>
              <li>
                <span className="card__icon">
                  <PinIcon size={20} />
                </span>
                <span>
                  <strong>Visit</strong>
                  {SITE.address.street}, {SITE.address.locality}
                </span>
              </li>
              <li>
                <span className="card__icon">
                  <ClockIcon size={20} />
                </span>
                <span>
                  <strong>Hours</strong>
                  {SITE.hours}
                </span>
              </li>
            </ul>
            <PickupMap showLocateButton={false} />
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
