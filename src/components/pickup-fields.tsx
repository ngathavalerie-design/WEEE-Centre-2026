"use client";

import { useMemo } from "react";
import PickupMap from "./pickup-map";
import {
  PICKUP_ITEM_CATEGORIES,
  PICKUP_QUANTITIES,
  PICKUP_TIME_WINDOWS,
  collectionDaysLabel,
  earliestPickupDate,
  latestPickupDate,
  pickupDateError,
  type PickupDetails,
} from "@/lib/pickup";

/**
 * The pickup-specific part of the enquiry modal: map, address, date/time, items.
 * Controlled component — the modal owns the state and sends it as
 * `additionalData.pickup` to /api/enquiry.
 *
 *   const [pickup, setPickup] = useState<PickupDetails>(EMPTY_PICKUP);
 *   {modalType === "pickup" && <PickupFields value={pickup} onChange={setPickup} />}
 */
export default function PickupFields({
  value,
  onChange,
}: {
  value: PickupDetails;
  onChange: (next: PickupDetails) => void;
}) {
  const minDate = useMemo(earliestPickupDate, []);
  const maxDate = useMemo(latestPickupDate, []);
  const dateError = value.preferredDate ? pickupDateError(value.preferredDate) : null;

  const set = <K extends keyof PickupDetails>(key: K, v: PickupDetails[K]) => onChange({ ...value, [key]: v });

  const toggleCategory = (cat: string) =>
    set(
      "itemCategories",
      value.itemCategories.includes(cat)
        ? value.itemCategories.filter((c) => c !== cat)
        : [...value.itemCategories, cat],
    );

  return (
    <div className="pickup-fields">
      <PickupMap onLocate={({ latitude, longitude }) => onChange({ ...value, latitude, longitude })} />

      <fieldset className="pickup-fields__group">
        <legend>Pickup location</legend>

        <label className="pickup-fields__label">
          Address / building *
          <input
            type="text"
            required
            autoComplete="street-address"
            placeholder="e.g. Delta House, 3rd floor, Waiyaki Way"
            value={value.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </label>

        <div className="pickup-fields__row">
          <label className="pickup-fields__label">
            Area / estate
            <input
              type="text"
              placeholder="e.g. Westlands"
              value={value.area ?? ""}
              onChange={(e) => set("area", e.target.value)}
            />
          </label>
          <label className="pickup-fields__label">
            Nearby landmark
            <input
              type="text"
              placeholder="e.g. opposite Sarit Centre"
              value={value.landmark ?? ""}
              onChange={(e) => set("landmark", e.target.value)}
            />
          </label>
        </div>

        {value.latitude != null && value.longitude != null && (
          <p className="pickup-fields__hint">
            ✓ Map pin saved.{" "}
            <button
              type="button"
              className="pickup-fields__link"
              onClick={() => onChange({ ...value, latitude: null, longitude: null })}
            >
              Remove
            </button>
          </p>
        )}
      </fieldset>

      <fieldset className="pickup-fields__group">
        <legend>When should we come?</legend>
        <div className="pickup-fields__row">
          <label className="pickup-fields__label">
            Preferred date *
            <input
              type="date"
              required
              min={minDate}
              max={maxDate}
              value={value.preferredDate}
              onChange={(e) => set("preferredDate", e.target.value)}
              aria-invalid={dateError ? true : undefined}
              aria-describedby="pickup-date-help"
            />
          </label>
          <label className="pickup-fields__label">
            Time *
            <select required value={value.timeWindow} onChange={(e) => set("timeWindow", e.target.value as PickupDetails["timeWindow"])}>
              <option value="" disabled>
                Choose a time
              </option>
              {PICKUP_TIME_WINDOWS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p id="pickup-date-help" className={dateError ? "pickup-fields__error" : "pickup-fields__hint"}>
          {dateError ?? `We collect on ${collectionDaysLabel()}. Our team will call to confirm the exact time.`}
        </p>
      </fieldset>

      <fieldset className="pickup-fields__group">
        <legend>What are we collecting? *</legend>
        <div className="pickup-fields__chips">
          {PICKUP_ITEM_CATEGORIES.map((cat) => (
            <label key={cat} className="pickup-fields__chip">
              <input
                type="checkbox"
                checked={value.itemCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>

        <label className="pickup-fields__label">
          Roughly how much?
          <select value={value.estimatedQuantity ?? ""} onChange={(e) => set("estimatedQuantity", e.target.value)}>
            <option value="">Not sure</option>
            {PICKUP_QUANTITIES.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </label>

        <label className="pickup-fields__check">
          <input
            type="checkbox"
            checked={value.needsDataDestruction}
            onChange={(e) => set("needsDataDestruction", e.target.checked)}
          />
          <span>Some devices hold data — I need certified data destruction</span>
        </label>
      </fieldset>
    </div>
  );
}

/** Client-side check before submitting. Returns an error message or null. */
export function validatePickupClient(p: PickupDetails): string | null {
  if (p.address.trim().length < 5) return "Please enter the pickup address.";
  const dateErr = pickupDateError(p.preferredDate);
  if (dateErr) return dateErr;
  if (!p.timeWindow) return "Please choose a morning or afternoon pickup.";
  if (p.itemCategories.length === 0) return "Please tell us what items we're collecting.";
  return null;
}
