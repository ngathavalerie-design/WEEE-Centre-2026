import Link from "next/link";
import { NAV, SITE, SERVICES } from "@/content/site";
import { CookieSettingsButton } from "./cookie-consent";
import ReviewUsButton from "./review-us-button";
import SocialIcons from "./social-icons";
import EnquiryButton from "./enquiry/enquiry-button";
import Logo from "./logo";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo />
            <p>{SITE.description}</p>
            <SocialIcons />
          </div>

          <div>
            <h3>Explore</h3>
            <ul>
              {NAV.filter((n) => n.href !== "/").map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/track">Track a pickup</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3>Services</h3>
            <ul>
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services#${s.slug}`}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Contact</h3>
            <ul>
              <li>
                <a href={SITE.phoneHref}>{SITE.phone}</a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
              <li>
                {SITE.address.street}, {SITE.address.locality}
              </li>
              <li>{SITE.hours}</li>
              <li>
                <EnquiryButton kind="subscribe" className="btn btn--light btn--sm">
                  Subscribe to updates
                </EnquiryButton>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {year} {SITE.name}. All rights reserved.
          </span>
          <div className="footer-legal">
            <Link href="/terms">Terms &amp; Conditions</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <CookieSettingsButton />
            <ReviewUsButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
