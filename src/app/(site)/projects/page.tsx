import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import EnquiryButton from "@/components/enquiry/enquiry-button";
import { ServerIcon, UsersIcon, RefreshIcon, LeafIcon } from "@/components/icons";
import { PROJECTS } from "@/content/site";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Corporate IT disposal, community collection drives, refurbishment programmes and awareness projects by WEEE Centre.",
  alternates: { canonical: "/projects" },
  openGraph: { url: "/projects", title: "Projects | WEEE Centre" },
};

const PROJECT_TYPES = [
  {
    icon: ServerIcon,
    title: "Corporate IT disposal programmes",
    text: "Scheduled, documented retirement of IT equipment for banks, NGOs, government offices and companies.",
  },
  {
    icon: UsersIcon,
    title: "Community collection drives",
    text: "Neighbourhood and county drives that make it easy for households to drop off e-waste safely.",
  },
  {
    icon: RefreshIcon,
    title: "Refurbishment for access",
    text: "Giving tested, refurbished devices a second life where they're needed — for example in schools and community programmes.",
  },
  {
    icon: LeafIcon,
    title: "Awareness & education",
    text: "Sessions with schools, universities and workplaces on why e-waste matters and how to dispose of it responsibly.",
  },
];

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="Projects that keep electronics in use and out of landfill"
        lead="We partner with organisations, communities and institutions on programmes that make responsible e-waste management happen at scale."
      >
        <EnquiryButton kind="project" className="btn btn--light">
          Discuss a project
        </EnquiryButton>
      </PageHero>

      {PROJECTS.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section__head">
              <span className="eyebrow">Our work</span>
              <h2>Featured projects</h2>
            </div>
            <div className="grid grid--3">
              {PROJECTS.map((p) => (
                <article key={p.title} className="card">
                  <h3>{p.title}</h3>
                  {(p.partner || p.year) && (
                    <p style={{ fontWeight: 600, color: "var(--green)", marginBottom: 8 }}>
                      {[p.partner, p.year].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p>{p.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={PROJECTS.length > 0 ? "section section--soft" : "section"}>
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">What we take on</span>
            <h2>Types of projects</h2>
          </div>
          <div className="grid grid--2">
            {PROJECT_TYPES.map((t) => (
              <article key={t.title} className="card">
                <div className="card__icon">
                  <t.icon />
                </div>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Have a project in mind?</h2>
              <p>Tell us about your organisation, community or programme and we&apos;ll plan it together.</p>
            </div>
            <div className="cta-band__actions">
              <EnquiryButton kind="project" className="btn btn--light">
                Discuss a project
              </EnquiryButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
