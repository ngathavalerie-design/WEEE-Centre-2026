/**
 * Pickup booking: shared types, options and validation.
 * Safe to import from both client components and API routes (no server-only imports).
 */

export const PICKUP_TIME_WINDOWS = [
  { value: "morning", label: "Morning (8am – 12pm)" },
  { value: "afternoon", label: "Afternoon (12pm – 5pm)" },
] as const;

export const PICKUP_ITEM_CATEGORIES = [
  "Computers & laptops",
  "Phones & tablets",
  "Printers & copiers",
  "Servers & networking",
  "TVs & monitors",
  "Batteries & UPS",
  "Household appliances",
  "Cables & accessories",
] as const;

export const PICKUP_QUANTITIES = [
  "A few items (fits in a bag)",
  "Car boot load",
  "Small van / pickup truck",
  "Lorry / bulk (office or warehouse clear-out)",
] as const;

export type PickupTimeWindow = (typeof PICKUP_TIME_WINDOWS)[number]["value"];

export interface PickupDetails {
  address: string;
  landmark?: string;
  area?: string;
  latitude?: number | null;
  longitude?: number | null;
  preferredDate: string; // YYYY-MM-DD
  timeWindow: PickupTimeWindow | "";
  itemCategories: string[];
  estimatedQuantity?: string;
  needsDataDestruction: boolean;
}

export const EMPTY_PICKUP: PickupDetails = {
  address: "",
  landmark: "",
  area: "",
  latitude: null,
  longitude: null,
  preferredDate: "",
  timeWindow: "",
  itemCategories: [],
  estimatedQuantity: "",
  needsDataDestruction: false,
};

/** Days we collect on: 0 = Sunday … 6 = Saturday. Override with NEXT_PUBLIC_PICKUP_DAYS="1,2,3,4,5,6". */
export const PICKUP_DAYS: number[] = (process.env.NEXT_PUBLIC_PICKUP_DAYS ?? "1,2,3,4,5")
  .split(",")
  .map((d) => Number(d.trim()))
  .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);

const MAX_DAYS_AHEAD = 60;
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Today's date in Nairobi as YYYY-MM-DD, regardless of server/browser timezone. */
export function todayInNairobi(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(new Date());
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(isoDate: string): number {
  return new Date(`${isoDate}T12:00:00Z`).getUTCDay();
}

/** Earliest bookable date: tomorrow, rolled forward to the next collection day. */
export function earliestPickupDate(): string {
  let d = addDays(todayInNairobi(), 1);
  for (let i = 0; i < 7 && !PICKUP_DAYS.includes(weekdayOf(d)); i++) d = addDays(d, 1);
  return d;
}

export function latestPickupDate(): string {
  return addDays(todayInNairobi(), MAX_DAYS_AHEAD);
}

export function collectionDaysLabel(): string {
  return PICKUP_DAYS.map((d) => DAY_NAMES[d].slice(0, 3)).join(", ");
}

/** Returns an error message for a bad date, or null when the date is fine. */
export function pickupDateError(isoDate: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return "Please choose a pickup date.";
  if (isoDate < earliestPickupDate()) return "Please choose a date from tomorrow onwards.";
  if (isoDate > latestPickupDate()) return `Please choose a date within the next ${MAX_DAYS_AHEAD} days.`;
  if (!PICKUP_DAYS.includes(weekdayOf(isoDate)))
    return `We collect on ${collectionDaysLabel()}. Please pick another day.`;
  return null;
}

/** Straight-line distance in km between two points (haversine). */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ---------------------------------------------------------------------------
// Server-side validation of what the browser sent
// ---------------------------------------------------------------------------

const clean = (v: unknown, max = 300): string =>
  typeof v === "string" ? v.replace(/[<>]/g, "").trim().slice(0, max) : "";

const coord = (v: unknown, limit: number): number | null => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= limit ? n : null;
};

export type ParseResult = { ok: true; data: PickupDetails } | { ok: false; error: string };

/**
 * Validates pickup details from the request body.
 * Accepts either `additionalData.pickup` or the fields directly on `additionalData`.
 */
export function parsePickupDetails(additionalData: unknown): ParseResult {
  const src = (additionalData && typeof additionalData === "object" ? additionalData : {}) as Record<
    string,
    unknown
  >;
  const raw = (src.pickup && typeof src.pickup === "object" ? src.pickup : src) as Record<string, unknown>;

  const address = clean(raw.address, 500);
  if (address.length < 5) return { ok: false, error: "Please enter the pickup address." };

  const preferredDate = clean(raw.preferredDate, 10);
  const dateErr = pickupDateError(preferredDate);
  if (dateErr) return { ok: false, error: dateErr };

  const timeWindow = clean(raw.timeWindow, 20);
  if (!PICKUP_TIME_WINDOWS.some((w) => w.value === timeWindow))
    return { ok: false, error: "Please choose a morning or afternoon pickup." };

  const allowed = new Set<string>(PICKUP_ITEM_CATEGORIES);
  const itemCategories = Array.isArray(raw.itemCategories)
    ? raw.itemCategories.filter((c): c is string => typeof c === "string" && allowed.has(c))
    : [];
  if (itemCategories.length === 0) return { ok: false, error: "Please tell us what items we're collecting." };

  const quantity = clean(raw.estimatedQuantity, 100);
  const estimatedQuantity = (PICKUP_QUANTITIES as readonly string[]).includes(quantity) ? quantity : "";

  const latitude = coord(raw.latitude, 90);
  const longitude = coord(raw.longitude, 180);
  const hasCoords = latitude !== null && longitude !== null;

  return {
    ok: true,
    data: {
      address,
      landmark: clean(raw.landmark, 200),
      area: clean(raw.area, 100),
      latitude: hasCoords ? latitude : null,
      longitude: hasCoords ? longitude : null,
      preferredDate,
      timeWindow: timeWindow as PickupTimeWindow,
      itemCategories,
      estimatedQuantity,
      needsDataDestruction: raw.needsDataDestruction === true || raw.needsDataDestruction === "true",
    },
  };
}

/** Plain-text block for the notification email. */
export function formatPickupForEmail(p: PickupDetails, reference?: string): string {
  const window = PICKUP_TIME_WINDOWS.find((w) => w.value === p.timeWindow)?.label ?? p.timeWindow;
  const lines = [
    reference ? `Reference: ${reference}` : null,
    `Preferred date: ${p.preferredDate} — ${window}`,
    `Address: ${p.address}`,
    p.area ? `Area: ${p.area}` : null,
    p.landmark ? `Landmark: ${p.landmark}` : null,
    p.latitude != null && p.longitude != null
      ? `Map pin: https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`
      : null,
    `Items: ${p.itemCategories.join(", ")}`,
    p.estimatedQuantity ? `Quantity: ${p.estimatedQuantity}` : null,
    `Data destruction needed: ${p.needsDataDestruction ? "YES" : "No"}`,
  ];
  return lines.filter(Boolean).join("\n");
}
