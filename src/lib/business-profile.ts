/**
 * Google Business Profile links. Client-safe (only NEXT_PUBLIC_ values).
 *
 *   NEXT_PUBLIC_GBP_PLACE_ID   — your Place ID (find it at
 *                                developers.google.com/maps/documentation/places/web-service/place-id)
 *   NEXT_PUBLIC_GBP_URL        — the "Share" link of your profile on Google Maps (optional)
 */
export const GBP_PLACE_ID = process.env.NEXT_PUBLIC_GBP_PLACE_ID || "";
const GBP_URL_ENV = process.env.NEXT_PUBLIC_GBP_URL || "";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://weeecentre.com").replace(/\/$/, "");

/** Link that opens the profile on Google Maps. */
export function businessProfileUrl(): string | null {
  if (GBP_URL_ENV) return GBP_URL_ENV;
  if (GBP_PLACE_ID)
    return `https://www.google.com/maps/search/?api=1&query=WEEE%20Centre&query_place_id=${GBP_PLACE_ID}`;
  return null;
}

/** Link that opens Google's "write a review" box directly. */
export function reviewUrl(): string | null {
  return GBP_PLACE_ID ? `https://search.google.com/local/writereview?placeid=${GBP_PLACE_ID}` : null;
}
