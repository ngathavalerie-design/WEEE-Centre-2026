import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import EnquiryButton from "@/components/enquiry/enquiry-button";
import { LeafIcon, RecycleIcon, ShieldIcon, UsersIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "About us",
  description:
    "WEEE Centre is a Kenyan e-waste management organisation that collects, refurbishes and recycles electronic waste and provides secure data destruction.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", title: "About WEEE Centre" },
};

const VALUES = [
  {
    icon: LeafIcon,
    title: "Protect the environment",
    text: "Electronics contain hazardous materials that harm soil, water and health when dumped or burned. We keep them out of the environment.",
  },
  {
    icon: RecycleIcon,
    title: "Close the loop",
    text: "Reuse first, recycle second. Working devices get a second life; the rest is dismantled so materials return to the circular economy.",
  },
  {
    icon: ShieldIcon,
    title: "Protect your data",
    text: "Every storage device is wiped or destroyed. Your information never leaves our facility on a device someone else can use.",
  },
  {
    icon: UsersIcon,
    title: "Create opportunity",
    text: "Responsible e-waste work creates skilled jobs and helps make refurbished technology accessible to more people.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About WEEE Centre"
        title="Turning Kenya's e-waste into value — safely"
        lead="WEEE Centre — the Waste Electrical and Electronic Equipment Centre — helps households, schools and organisations dispose of electronics responsibly, from collection to final recovery."
      />

      <section className="section">
        <div className="container split">
          <div>
            <span className="eyebrow">Why it matters</span>
            <h2>Electronic waste is one of the fastest-growing waste streams</h2>
            <p className="lead">
              Phones, computers, batteries and appliances are part of everyday life — and when they reach the end
              of their use, they need specialised handling.
            </p>
            <p>
              Dumped or burned e-waste releases lead, mercury and other toxins. Handled properly, the same devices
              can be repaired for reuse, and their metals and plastics recovered. That&apos;s the work we do: making
              the responsible option the easy one.
            </p>
          </div>
          <div className="panel">
            <h3>How we work</h3>
            <ol className="steps" style={{ gridTemplateColumns: "1fr", gap: 18 }}>
              <li>
                <h3>Collect</h3>
                <p>Pickups from homes, offices and institutions, or drop-off at our facility.</p>
              </li>
              <li>
                <h3>Secure</h3>
                <p>Storage devices are wiped or destroyed, with records for organisations.</p>
              </li>
              <li>
                <h3>Refurbish</h3>
                <p>Working equipment is tested, repaired and returned to use.</p>
              </li>
              <li>
                <h3>Recover</h3>
                <p>Everything else is dismantled and separated for material recovery.</p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <div className="section__head section__head--center">
            <span className="eyebrow">What drives us</span>
            <h2>Our values</h2>
          </div>
          <div className="grid grid--4">
            {VALUES.map((v) => (
              <article key={v.title} className="card">
                <div className="card__icon">
                  <v.icon />
                </div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Work with us</h2>
              <p>Partnerships, collection drives, corporate programmes — let&apos;s talk.</p>
            </div>
            <div className="cta-band__actions">
              <EnquiryButton kind="project" className="btn btn--light">
                Discuss a project
              </EnquiryButton>
              <EnquiryButton kind="pickup" className="btn btn--ghost-light">
                Schedule a pickup
              </EnquiryButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
