"use client";

import Script from "next/script";
import { useConsent } from "@/lib/consent";

/**
 * Google Analytics 4 (gtag.js) loader — only loads AFTER the visitor accepts
 * analytics cookies in the cookie banner. Nothing is sent to Google before that.
 *
 * - Measurement ID comes from NEXT_PUBLIC_GA_MEASUREMENT_ID (e.g. "G-XXXXXXXXXX").
 * - Off in development unless NEXT_PUBLIC_GA_ENABLE_IN_DEV=true.
 * - Page views on client-side navigation are tracked by GA4 Enhanced Measurement
 *   ("Page changes based on browser history events", on by default).
 * - Pass `nonce` if your Content Security Policy uses nonces for inline scripts.
 */
export default function GoogleAnalytics({ nonce }: { nonce?: string }) {
  const consent = useConsent();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const enabledInDev = process.env.NEXT_PUBLIC_GA_ENABLE_IN_DEV === "true";

  if (!measurementId) return null;
  if (process.env.NODE_ENV !== "production" && !enabledInDev) return null;
  if (consent !== "granted") return null;

  return (
    <>
      <Script id="ga4-init" strategy="afterInteractive" nonce={nonce}>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'granted'
          });
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
      <Script
        id="ga4-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        nonce={nonce}
      />
    </>
  );
}
