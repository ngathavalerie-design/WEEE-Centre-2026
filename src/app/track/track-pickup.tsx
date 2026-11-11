"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { PICKUP_JOURNEY, STATUS_INFO, type PickupStatus } from "@/lib/pickup-status";
import { PICKUP_TIME_WINDOWS } from "@/lib/pickup";
import { trackEvent } from "@/lib/analytics";

interface PickupView {
  reference: string;
  status: PickupStatus;
  preferredDate: string;
  timeWindow: string;
  area: string | null;
  scheduledFor: string | null;
  customerMessage: string | null;
  itemCategories: string[];
  needsDataDestruction: boolean;
  history: { status: PickupStatus; at: string }[];
}

const nairobi = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-KE", { timeZone: "Africa/Nairobi", ...opts }).format(new Date(iso));

const formatDay = (ymd: string) => nairobi(`${ymd}T12:00:00Z`, { weekday: "long", day: "numeric", month: "long" });

export default function TrackPickup({ initialReference = "" }: { initialReference?: string }) {
  const [reference, setReference] = useState(initialReference);
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickup, setPickup] = useState<PickupView | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pickup/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, contact }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPickup(null);
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setPickup(data.pickup);
        trackEvent("pickup_tracked", { status: data.pickup.status });
      }
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="track-wrap">
      <form className="track-form" onSubmit={onSubmit}>
        <label>
          Pickup reference
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="WC-7K3P9Q"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            required
          />
        </label>
        <label>
          Email or phone you booked with
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="you@company.co.ke or 0712 345 678"
            autoComplete="email"
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Checking…" : "Track pickup"}
        </button>
        {error && (
          <p className="track-error" role="alert">
            {error}
          </p>
        )}
      </form>

      {pickup && <PickupResult pickup={pickup} />}
    </div>
  );
}

function PickupResult({ pickup }: { pickup: PickupView }) {
  const cancelled = pickup.status === "cancelled";
  const currentStep = PICKUP_JOURNEY.indexOf(pickup.status);
  const reachedAt = (s: PickupStatus) => pickup.history.filter((h) => h.status === s).at(-1)?.at;
  const windowLabel = PICKUP_TIME_WINDOWS.find((w) => w.value === pickup.timeWindow)?.label ?? pickup.timeWindow;

  return (
    <section className="track-result" aria-live="polite">
      <header className="track-result__head">
        <div>
          <p className="track-result__ref">{pickup.reference}</p>
          <h2>{STATUS_INFO[pickup.status].label}</h2>
        </div>
        <span className={`track-pill track-pill--${pickup.status}`}>{STATUS_INFO[pickup.status].label}</span>
      </header>

      <p className="track-result__lead">{STATUS_INFO[pickup.status].customerText}</p>

      {!cancelled && (
        <ol className="track-steps">
          {PICKUP_JOURNEY.map((step, i) => {
            const state = i < currentStep ? "done" : i === currentStep ? "current" : "todo";
            const at = reachedAt(step);
            return (
              <li key={step} className={`track-step track-step--${state}`}>
                <span className="track-step__dot" aria-hidden="true">
                  {state === "done" ? "✓" : i + 1}
                </span>
                <span className="track-step__label">{STATUS_INFO[step].label}</span>
                {at && <span className="track-step__time">{nairobi(at, { day: "numeric", month: "short" })}</span>}
              </li>
            );
          })}
        </ol>
      )}

      {pickup.customerMessage && (
        <div className="track-message">
          <strong>Message from our team</strong>
          <p>{pickup.customerMessage}</p>
        </div>
      )}

      <dl className="track-details">
        <div>
          <dt>{pickup.scheduledFor ? "Scheduled for" : "Requested date"}</dt>
          <dd>
            {pickup.scheduledFor
              ? nairobi(pickup.scheduledFor, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" })
              : `${formatDay(pickup.preferredDate)} · ${windowLabel}`}
          </dd>
        </div>
        {pickup.area && (
          <div>
            <dt>Area</dt>
            <dd>{pickup.area}</dd>
          </div>
        )}
        <div>
          <dt>Items</dt>
          <dd>{pickup.itemCategories.join(", ")}</dd>
        </div>
        {pickup.needsDataDestruction && (
          <div>
            <dt>Data destruction</dt>
            <dd>Requested — a certificate is issued after processing</dd>
          </div>
        )}
      </dl>

      <p className="track-help">
        Need to change something? Call <a href="tel:+254701819559">+254 701 819 559</a> or{" "}
        <Link href="/contact">contact us</Link> and quote <strong>{pickup.reference}</strong>.
      </p>
    </section>
  );
}
