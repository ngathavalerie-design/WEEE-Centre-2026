import { GBP_PLACE_ID, businessProfileUrl, reviewUrl } from "@/lib/business-profile";

/**
 * Shows your Google rating and recent reviews from your Google Business Profile.
 * Server component — the API key never reaches the browser.
 *
 * Needs:
 *   NEXT_PUBLIC_GBP_PLACE_ID  — your Place ID
 *   GOOGLE_PLACES_API_KEY     — server-side key with "Places API (New)" enabled.
 *                               Restrict it to that API. (Billing must be enabled on the
 *                               Google Cloud project; reviews are a paid field.)
 *
 * Without the key it still renders the "Review us on Google" call-to-action.
 * Reviews refresh hourly. Google's Places terms limit how long review content may be
 * stored, so check them before raising GOOGLE_REVIEWS_REVALIDATE.
 */

interface PlaceReview {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
  googleMapsUri?: string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
}

interface PlaceDetails {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlaceReview[];
}

async function fetchPlace(): Promise<PlaceDetails | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key || !GBP_PLACE_ID) return null;
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(GBP_PLACE_ID)}?languageCode=en`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
        },
        next: { revalidate: Number(process.env.GOOGLE_REVIEWS_REVALIDATE ?? 3600) },
      },
    );
    if (!res.ok) {
      if (process.env.NODE_ENV === "development") console.error("Places API error", res.status, await res.text());
      return null;
    }
    return (await res.json()) as PlaceDetails;
  } catch {
    return null;
  }
}

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className="g-reviews__stars" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} aria-hidden="true" className={i <= rounded ? "is-on" : i - 0.5 === rounded ? "is-half" : ""}>
          ★
        </span>
      ))}
    </span>
  );
}

export default async function GoogleReviews({
  max = 3,
  title = "What our customers say",
}: {
  max?: number;
  title?: string;
}) {
  const place = await fetchPlace();
  const writeReview = reviewUrl();
  const profile = place?.googleMapsUri || businessProfileUrl();
  // Shown in Google's own "most relevant" order, without filtering out lower ratings.
  const reviews = (place?.reviews ?? []).filter((r) => r.text?.text).slice(0, max);

  if (!place && !writeReview) return null;

  return (
    <section className="g-reviews" aria-labelledby="g-reviews-title">
      <div className="g-reviews__head">
        <div>
          <h2 id="g-reviews-title">{title}</h2>
          {place?.rating != null && (
            <p className="g-reviews__summary">
              <strong>{place.rating.toFixed(1)}</strong> <Stars value={place.rating} />{" "}
              {place.userRatingCount != null && (
                <span>
                  from {place.userRatingCount} Google review{place.userRatingCount === 1 ? "" : "s"}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="g-reviews__actions">
          {writeReview && (
            <a className="g-reviews__btn g-reviews__btn--primary" href={writeReview} target="_blank" rel="noopener noreferrer">
              Review us on Google
            </a>
          )}
          {profile && (
            <a className="g-reviews__btn" href={profile} target="_blank" rel="noopener noreferrer">
              See all reviews
            </a>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <ul className="g-reviews__list">
          {reviews.map((r, i) => (
            <li key={i} className="g-reviews__item">
              <div className="g-reviews__author">
                {r.authorAttribution?.photoUri && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.authorAttribution.photoUri} alt="" width={36} height={36} referrerPolicy="no-referrer" loading="lazy" />
                )}
                <div>
                  {r.authorAttribution?.uri ? (
                    <a href={r.authorAttribution.uri} target="_blank" rel="noopener noreferrer">
                      {r.authorAttribution.displayName ?? "Google user"}
                    </a>
                  ) : (
                    <span>{r.authorAttribution?.displayName ?? "Google user"}</span>
                  )}
                  <div className="g-reviews__meta">
                    {r.rating != null && <Stars value={r.rating} />} {r.relativePublishTimeDescription}
                  </div>
                </div>
              </div>
              <p className="g-reviews__text">{r.text?.text}</p>
            </li>
          ))}
        </ul>
      )}

      {place && <p className="g-reviews__attribution">Reviews from Google</p>}
    </section>
  );
}
