import { SITE, SOCIAL, SERVICES } from "@/content/site";
import { businessProfileUrl } from "@/lib/business-profile";

/** JSON-LD helpers for rich results in Google. */

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here: all values come from our own config.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

function sameAs(): string[] {
  const gbp = businessProfileUrl();
  return [...Object.values(SOCIAL).filter(Boolean), ...(gbp ? [gbp] : [])];
}

const lat = Number(process.env.NEXT_PUBLIC_CENTRE_LAT);
const lng = Number(process.env.NEXT_PUBLIC_CENTRE_LNG);
const hasGeo = Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0;

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: SITE.address.street,
  addressLocality: SITE.address.locality,
  addressCountry: SITE.address.countryCode,
};

export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${SITE.url}/#organization`,
        name: SITE.name,
        legalName: SITE.legalName,
        url: SITE.url,
        logo: `${SITE.url}/icon.svg`,
        description: SITE.description,
        email: SITE.email,
        telephone: SITE.phone,
        address: postalAddress,
        sameAs: sameAs(),
      }}
    />
  );
}

export function LocalBusinessSchema() {
  const gbp = businessProfileUrl();
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `${SITE.url}/#business`,
        name: SITE.name,
        url: SITE.url,
        image: `${SITE.url}/icon.svg`,
        description: SITE.description,
        email: SITE.email,
        telephone: SITE.phone,
        address: postalAddress,
        ...(hasGeo ? { geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng } } : {}),
        ...(gbp ? { hasMap: gbp } : {}),
        areaServed: { "@type": "Country", name: "Kenya" },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "08:00",
            closes: "17:00",
          },
        ],
        sameAs: sameAs(),
      }}
    />
  );
}

export function ServiceSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        serviceType: "Electronic waste management",
        provider: { "@id": `${SITE.url}/#organization` },
        areaServed: { "@type": "Country", name: "Kenya" },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "E-waste services",
          itemListElement: SERVICES.map((s) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: s.title, description: s.summary },
          })),
        },
      }}
    />
  );
}
