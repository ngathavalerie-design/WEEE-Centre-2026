import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using the WEEE Centre website and e-waste services.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "11 November 2026";

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms & Conditions" />
      <section className="section">
        <div className="container legal">
          <p className="legal__updated">Last updated: {UPDATED}</p>
          <p>
            These terms apply to your use of the {SITE.name} website and to the services you book through it. By using
            the website or our services, you agree to them.
          </p>

          <h2>1. Our services</h2>
          <p>
            We provide e-waste collection, data destruction, IT asset disposal, refurbishment, recycling and related
            reporting. Specific terms, prices and service levels for organisations may be set out in a separate quote
            or agreement, which takes priority over these terms where they differ.
          </p>

          <h2>2. Booking a pickup</h2>
          <ul>
            <li>A pickup request is confirmed only when our team contacts you to agree the date and time.</li>
            <li>Please give accurate information about the address, access and items to be collected.</li>
            <li>We may decline or reschedule a collection, for example for safety reasons or items we can&apos;t accept.</li>
            <li>Some services, large volumes or remote locations may carry a charge, which we&apos;ll agree with you first.</li>
          </ul>

          <h2>3. Your responsibilities</h2>
          <ul>
            <li>You confirm that you own the items or are authorised to dispose of them.</li>
            <li>
              You are responsible for backing up anything you want to keep. Where possible, remove personal data and
              sign out of accounts before handing devices over.
            </li>
            <li>Tell us about damaged, leaking or hazardous items (such as swollen batteries) before collection.</li>
          </ul>

          <h2>4. Ownership and data</h2>
          <p>
            Ownership of items passes to {SITE.name} once collected, unless agreed otherwise in writing. Where you
            request data destruction, storage media are wiped or physically destroyed and, for organisations, a record
            is issued. Our handling of personal data is described in our <Link href="/privacy">Privacy Policy</Link>.
          </p>

          <h2>5. Payment</h2>
          <p>Where a service is charged, the price and payment terms will be set out in your quote or invoice.</p>

          <h2>6. Website use</h2>
          <p>
            Don&apos;t misuse the website — for example by sending spam through our forms or trying to access areas you&apos;re
            not authorised to use. Website content belongs to {SITE.name} unless stated otherwise.
          </p>

          <h2>7. Liability</h2>
          <p>
            We take reasonable care in providing our services. To the extent permitted by law, we are not liable for
            indirect or consequential losses, or for data left on devices where data destruction was not requested.
            Nothing in these terms limits liability that cannot be limited under Kenyan law.
          </p>

          <h2>8. Changes</h2>
          <p>We may update these terms. The date at the top shows when they last changed.</p>

          <h2>9. Governing law</h2>
          <p>These terms are governed by the laws of Kenya, and the courts of Kenya have jurisdiction.</p>

          <h2>10. Contact</h2>
          <p>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> · <a href={SITE.phoneHref}>{SITE.phone}</a> ·{" "}
            {SITE.address.street}, {SITE.address.locality}
          </p>
        </div>
      </section>
    </>
  );
}
