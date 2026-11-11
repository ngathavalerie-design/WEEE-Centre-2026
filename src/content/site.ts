/**
 * Site content in one place — edit this file to change contact details,
 * services, social links, projects and events without touching page code.
 * Client-safe (no secrets).
 */

export const SITE = {
  name: "WEEE Centre",
  legalName: "Waste Electrical and Electronic Equipment Centre",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://weeecentre.com").replace(/\/$/, ""),
  tagline: "Responsible e-waste management for Kenya",
  description:
    "WEEE Centre collects, refurbishes and recycles electronic waste in Kenya — with secure data destruction, IT asset disposal and free pickup scheduling for homes, schools and organisations.",
  email: "info@weeecentre.com",
  phone: "+254 701 819 559",
  phoneHref: "tel:+254701819559",
  whatsapp: "254701819559",
  address: {
    street: "Mihango, off the Eastern Bypass",
    locality: "Embakasi, Nairobi",
    country: "Kenya",
    countryCode: "KE",
  },
  hours: "Monday – Friday, 8:00am – 5:00pm",
};

/**
 * Social profiles — leave a value empty ("") to hide that icon.
 * Add the real links once you have them.
 */
export const SOCIAL: Record<"facebook" | "twitter" | "linkedin" | "instagram" | "youtube", string> = {
  facebook: "",
  twitter: "",
  linkedin: "",
  instagram: "",
  youtube: "",
};

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/events", label: "Events" },
  { href: "/conferences", label: "Conferences" },
  { href: "/contact", label: "Contact" },
] as const;

export interface Service {
  slug: string;
  title: string;
  summary: string;
  points: string[];
  icon: "truck" | "shield" | "server" | "refresh" | "recycle" | "chart";
}

export const SERVICES: Service[] = [
  {
    slug: "collection",
    title: "E-waste collection & pickup",
    summary:
      "Book a pickup online and our team collects old electronics from your home, office, school or warehouse across Nairobi and beyond.",
    points: ["Free online scheduling", "Single items to full office clear-outs", "Reference number to track every pickup"],
    icon: "truck",
  },
  {
    slug: "data-destruction",
    title: "Secure data destruction",
    summary:
      "Hard drives, phones and storage media are wiped or physically destroyed so your data can never be recovered.",
    points: ["Wiping or physical destruction", "Chain-of-custody records", "Certificate issued after processing"],
    icon: "shield",
  },
  {
    slug: "itad",
    title: "IT asset disposal (ITAD)",
    summary:
      "End-of-life management for computers, servers and networking equipment — inventoried, data-cleared and responsibly processed.",
    points: ["Asset inventory reports", "Data clearing before reuse or recycling", "Suited to banks, NGOs, schools and corporates"],
    icon: "server",
  },
  {
    slug: "refurbishment",
    title: "Refurbishment & reuse",
    summary:
      "Working equipment is tested, repaired and given a second life, extending its use and keeping it out of landfill.",
    points: ["Testing and repair", "Extends device lifespan", "Supports affordable access to technology"],
    icon: "refresh",
  },
  {
    slug: "recycling",
    title: "Recycling & material recovery",
    summary:
      "Devices that can't be reused are dismantled and separated so valuable materials are recovered and hazardous parts are handled safely.",
    points: ["Manual dismantling and sorting", "Safe handling of batteries and hazardous parts", "Materials returned to the circular economy"],
    icon: "recycle",
  },
  {
    slug: "compliance",
    title: "Compliance & reporting",
    summary:
      "Documentation organisations need to show their e-waste was managed responsibly — useful for audits and producer-responsibility reporting.",
    points: ["Disposal and destruction certificates", "Collection records per pickup", "Support for environmental reporting"],
    icon: "chart",
  },
];

/** What we accept — shown on the home and services pages. */
export const ACCEPTED_ITEMS = [
  "Computers & laptops",
  "Phones & tablets",
  "Printers & copiers",
  "Servers & networking",
  "TVs & monitors",
  "Batteries & UPS",
  "Household appliances",
  "Cables & accessories",
];

/**
 * Projects to feature on /projects. Add real projects here, e.g.
 * { title: "…", partner: "…", year: "2026", summary: "…" }.
 * While this list is empty the page shows the kinds of projects you take on.
 */
export const PROJECTS: { title: string; partner?: string; year?: string; summary: string }[] = [];

/**
 * Upcoming events for /events. Add entries like
 * { title: "Westlands collection drive", date: "2026-12-06", location: "…", summary: "…" }.
 * Past dates are hidden automatically.
 */
export const EVENTS: { title: string; date: string; location: string; summary: string }[] = [];

/** Conferences / speaking engagements for /conferences. Same format as EVENTS. */
export const CONFERENCES: { title: string; date: string; location: string; summary: string }[] = [];

/** Options shown in the "event interest" dropdown of event / conference enquiries. */
export const EVENT_TYPES = [
  "Community collection drive",
  "School or university awareness session",
  "Corporate e-waste day",
  "Conference or panel speaking",
  "Exhibition or trade fair",
  "Other",
];
