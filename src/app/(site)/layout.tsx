import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import LiveChat from "@/components/live-chat";
import EnquiryProvider from "@/components/enquiry/enquiry-provider";
import { LocalBusinessSchema, OrganizationSchema } from "@/components/structured-data";
import { BrandIcon } from "@/components/icons";
import { SITE } from "@/content/site";

/** Layout for every public page (the admin area has its own). */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <EnquiryProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <OrganizationSchema />
      <LocalBusinessSchema />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <a
        className="whatsapp-fab"
        href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hello WEEE Centre, I'd like to ask about e-waste collection.")}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with WEEE Centre on WhatsApp"
      >
        <BrandIcon name="whatsapp" size={28} />
      </a>
      <LiveChat />
    </EnquiryProvider>
  );
}
