import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How WEEE Centre collects, uses and protects personal data, in line with Kenya's Data Protection Act, 2019.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "11 November 2026";

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" />
      <section className="section">
        <div className="container legal">
          <p className="legal__updated">Last updated: {UPDATED}</p>
          <p>
            This policy explains how {SITE.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects and uses personal data
            when you use {SITE.url.replace(/^https?:\/\//, "")} and our services. We process personal data in line
            with Kenya&apos;s Data Protection Act, 2019.
          </p>

          <h2>1. Information we collect</h2>
          <ul>
            <li>
              <strong>Details you give us</strong> through our forms: name, email, phone number, organisation, your
              message, and for pickups the address, landmark, area, preferred date and items to collect.
            </li>
            <li>
              <strong>Location</strong>, only if you choose &ldquo;Use my current location&rdquo; when booking a pickup.
              We store the map pin with your booking so our driver can find you.
            </li>
            <li>
              <strong>Usage information</strong> through Google Analytics — pages visited, device and browser type,
              approximate location — <em>only if you accept analytics cookies</em>.
            </li>
            <li>
              <strong>Live chat and WhatsApp messages</strong> you send us through those services.
            </li>
          </ul>

          <h2>2. How we use it</h2>
          <ul>
            <li>To respond to enquiries, give quotes and schedule, confirm and carry out pickups.</li>
            <li>To send you updates about your pickup, including by email, phone or WhatsApp.</li>
            <li>To send news and event updates if you subscribed — you can unsubscribe at any time.</li>
            <li>To issue disposal and data-destruction records for organisations.</li>
            <li>To understand how the website is used and improve it (analytics, with consent).</li>
            <li>To keep our website secure and prevent spam and abuse.</li>
          </ul>

          <h2>3. Legal basis</h2>
          <p>
            We process your data to take steps you request before or under a contract (e.g. a pickup), on the basis of
            your consent (analytics cookies, newsletter, location sharing), and for our legitimate interests in running
            and securing our services.
          </p>

          <h2>4. Who we share it with</h2>
          <p>We do not sell personal data. We share it only with service providers who help us run our services:</p>
          <ul>
            <li>our website hosting and database providers;</li>
            <li>Resend, to send emails;</li>
            <li>Google (Analytics, with consent; Maps; reCAPTCHA spam protection);</li>
            <li>Tawk.to, if you use live chat;</li>
            <li>authorities, where the law requires it.</li>
          </ul>
          <p>Some of these providers store data outside Kenya; we use providers with appropriate safeguards.</p>

          <h2>5. Data on devices you give us</h2>
          <p>
            Devices you hand over may contain personal data. Where you request data destruction, storage media are wiped
            or physically destroyed. We recommend removing personal files and signing out of accounts before handing
            devices over.
          </p>

          <h2>6. How long we keep it</h2>
          <p>
            We keep enquiry and pickup records for as long as needed to provide the service and meet legal, accounting
            and reporting obligations, then delete or anonymise them. Newsletter details are kept until you unsubscribe.
          </p>

          <h2>7. Cookies</h2>
          <p>
            We use essential cookies to keep the site and forms working securely. Google Analytics cookies are used
            only if you accept them in our cookie banner. You can change your choice at any time:{" "}
            <CookieSettingsButton className="link-btn" />.
          </p>

          <h2>8. Your rights</h2>
          <p>
            Under the Data Protection Act, 2019 you can ask to access, correct or delete your personal data, object to
            or restrict its processing, withdraw consent, and ask for a copy in a portable format. Email{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. You can also complain to the Office of the Data
            Protection Commissioner (ODPC).
          </p>

          <h2>9. Security</h2>
          <p>
            We use encrypted connections (HTTPS), access controls on our systems, and protections against spam and
            abuse. No system is perfectly secure, but we work to protect your information.
          </p>

          <h2>10. Contact</h2>
          <p>
            {SITE.name}, {SITE.address.street}, {SITE.address.locality}, {SITE.address.country} ·{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> · <a href={SITE.phoneHref}>{SITE.phone}</a>
          </p>
          <p>
            See also our <Link href="/terms">Terms &amp; Conditions</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
