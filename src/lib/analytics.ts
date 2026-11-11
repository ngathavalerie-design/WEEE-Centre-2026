/**
 * Small, safe wrapper around gtag for custom GA4 events.
 * Every call is a no-op on the server, when GA isn't loaded, or when blocked by an ad-blocker.
 *
 * In GA4 → Admin → Events, mark `generate_lead` and `pickup_scheduled` as Key events
 * so they show up as conversions.
 */

type GtagValue = string | number | boolean | undefined;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: string, params: Record<string, GtagValue> = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", name, params);
  } catch {
    // never let analytics break the page
  }
}

/** Any enquiry form submitted successfully (pickup, quote, project, event, contact…). */
export function trackLead(enquiryType: string, extra: Record<string, GtagValue> = {}): void {
  trackEvent("generate_lead", { enquiry_type: enquiryType, ...extra });
}

/** A pickup request was booked. Send only non-personal details. */
export function trackPickupScheduled(details: {
  timeWindow?: string;
  itemCount?: number;
  dataDestruction?: boolean;
  usedMyLocation?: boolean;
}): void {
  trackEvent("pickup_scheduled", {
    time_window: details.timeWindow,
    item_category_count: details.itemCount,
    data_destruction: details.dataDestruction,
    used_my_location: details.usedMyLocation,
  });
}

/** Someone opened an enquiry modal (useful for drop-off analysis: opened vs submitted). */
export function trackFormOpen(enquiryType: string): void {
  trackEvent("form_open", { enquiry_type: enquiryType });
}

/** Someone clicked "Get directions" on the map. */
export function trackDirectionsClick(): void {
  trackEvent("directions_click");
}
