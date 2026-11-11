"use client";

import { useState } from "react";
import { distanceKm } from "@/lib/pickup";
import { trackDirectionsClick } from "@/lib/analytics";
import { GBP_PLACE_ID } from "@/lib/business-profile";

/**
 * Map of where WEEE Centre is, with "Get directions" and an optional
 * "Use my current location" button that fills in the pickup point.
 *
 * Configure in .env.local:
 *   NEXT_PUBLIC_GBP_PLACE_ID=...                                    (best: pins your exact Google Business Profile)
 *   NEXT_PUBLIC_CENTRE_MAP_QUERY="WEEE Centre, Mihango, Embakasi"   (what Google Maps should search for)
 *   NEXT_PUBLIC_CENTRE_ADDRESS="..."                                (text shown under the map)
 *   NEXT_PUBLIC_CENTRE_LAT=-1.xxxx  NEXT_PUBLIC_CENTRE_LNG=36.xxxx   (optional, enables distance)
 *   NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY=...                           (optional, official Maps Embed API)
 */

const CENTRE_QUERY =
  process.env.NEXT_PUBLIC_CENTRE_MAP_QUERY || "WEEE Centre, Mihango, Embakasi, Nairobi, Kenya";
const CENTRE_ADDRESS =
  process.env.NEXT_PUBLIC_CENTRE_ADDRESS || "Mihango, Embakasi, off the Eastern Bypass, Nairobi";
const CENTRE_LAT = Number(process.env.NEXT_PUBLIC_CENTRE_LAT);
const CENTRE_LNG = Number(process.env.NEXT_PUBLIC_CENTRE_LNG);
const HAS_CENTRE_COORDS = Number.isFinite(CENTRE_LAT) && Number.isFinite(CENTRE_LNG) && CENTRE_LAT !== 0;
const EMBED_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;

const destination = HAS_CENTRE_COORDS ? `${CENTRE_LAT},${CENTRE_LNG}` : CENTRE_QUERY;

// With an Embed API key and a Place ID, the map shows your Business Profile card (name, rating, hours).
const embedSrc = EMBED_KEY
  ? `https://www.google.com/maps/embed/v1/place?key=${EMBED_KEY}&q=${
      GBP_PLACE_ID ? `place_id:${GBP_PLACE_ID}` : encodeURIComponent(CENTRE_QUERY)
    }&zoom=15`
  : `https://www.google.com/maps?q=${encodeURIComponent(destination)}&z=15&output=embed`;

const directionsUrl =
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}` +
  (GBP_PLACE_ID ? `&destination_place_id=${GBP_PLACE_ID}` : "");

export interface Coords {
  latitude: number;
  longitude: number;
}

type LocateState =
  | { kind: "idle" }
  | { kind: "locating" }
  | { kind: "done"; coords: Coords }
  | { kind: "error"; message: string };

export default function PickupMap({
  onLocate,
  showLocateButton = true,
}: {
  onLocate?: (coords: Coords) => void;
  showLocateButton?: boolean;
}) {
  const [state, setState] = useState<LocateState>({ kind: "idle" });

  function locate() {
    if (!("geolocation" in navigator)) {
      setState({ kind: "error", message: "Your browser can't share location. Please type your address instead." });
      return;
    }
    setState({ kind: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        };
        setState({ kind: "done", coords });
        onLocate?.(coords);
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? "Location permission was blocked. You can still type your address below."
            : "We couldn't get your location. Please type your address below.";
        setState({ kind: "error", message });
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  }

  const km =
    state.kind === "done" && HAS_CENTRE_COORDS
      ? distanceKm(CENTRE_LAT, CENTRE_LNG, state.coords.latitude, state.coords.longitude)
      : null;

  return (
    <section className="pickup-map" aria-labelledby="pickup-map-title">
      <div className="pickup-map__header">
        <h3 id="pickup-map-title">Where we are</h3>
        <a
          className="pickup-map__directions"
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackDirectionsClick}
        >
          Get directions ↗
        </a>
      </div>

      <div className="pickup-map__frame">
        <iframe
          title="Map showing the WEEE Centre location"
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <p className="pickup-map__address">{CENTRE_ADDRESS}</p>

      {showLocateButton && (
        <div className="pickup-map__locate">
          <button
            type="button"
            className="pickup-map__locate-btn"
            onClick={locate}
            disabled={state.kind === "locating"}
          >
            {state.kind === "locating" ? "Finding you…" : "📍 Use my current location for pickup"}
          </button>

          {state.kind === "done" && (
            <p className="pickup-map__status" role="status">
              Location added
              {km !== null && <> — about {km < 1 ? "<1" : Math.round(km)} km from us</>}.{" "}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${state.coords.latitude},${state.coords.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Check the pin
              </a>
            </p>
          )}
          {state.kind === "error" && (
            <p className="pickup-map__status pickup-map__status--error" role="alert">
              {state.message}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
