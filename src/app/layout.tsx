import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { SITE } from "@/content/site";
import GoogleAnalytics from "@/components/google-analytics";
import CookieConsent from "@/components/cookie-consent";
import "./globals.css";
import "./pickup.css";
import "./cookie-consent.css";
import "./google-reviews.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Responsible E-Waste Recycling in Kenya`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "e-waste recycling",
    "electronic waste management",
    "IT asset disposal",
    "data destruction",
    "electronics recycling Kenya",
    "e-waste collection Nairobi",
    "WEEE Centre",
    "circular economy",
    "responsible e-waste disposal",
    "electronics refurbishment",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — Responsible E-Waste Recycling in Kenya`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Responsible E-Waste Recycling in Kenya`,
    description: SITE.description,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
  },
  formatDetection: { telephone: true, email: true, address: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f7a3f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        {children}
        <CookieConsent />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
