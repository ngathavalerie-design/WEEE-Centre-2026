# Wiring the new files into the existing site

Everything under `src/`, `db/` and `scripts/` in this bundle is complete — copy it into the
project root. Then a handful of **existing** files need small edits, listed below. If I have
access to your GitHub repo, these edits are already applied in the commit.

> **Next.js 16 note:** `middleware.ts` was renamed to `proxy.ts` in Next 16. If `npm run build`
> warns that middleware is deprecated, rename `src/middleware.ts` → `src/proxy.ts` and the exported
> function `middleware` → `proxy`.

## New pages & endpoints at a glance

| URL | What it is |
|---|---|
| `/track` | Customers check their pickup with reference + email/phone |
| `/admin/login`, `/admin` | Password-protected dashboard: pickups, enquiries, subscribers |
| `POST /api/pickup/track` | Tracking lookup (rate-limited) |
| `GET /api/admin/export?kind=…` | CSV export, admin only |

---

## 1. `package.json`

```bash
npm install pg
npm install -D @types/pg
```

Add to `"scripts"`:

```json
"db:migrate": "node --env-file=.env.local scripts/db-migrate.mjs",
"db:migrate:prod": "node scripts/db-migrate.mjs"
```

`resend` is already installed — the admin uses it to email customers.

---

## 2. `src/app/layout.tsx`

```tsx
import GoogleAnalytics from "@/components/google-analytics";
import CookieConsent from "@/components/cookie-consent";
import "./pickup.css";
import "./cookie-consent.css";
import "./google-reviews.css";

export const metadata: Metadata = {
  // ...everything you already have...
  verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }, // keep one copy
};

// inside <body>, after {children} and <LiveChat />:
<CookieConsent />
<GoogleAnalytics />
```

---

## 3. Footers (`page.tsx` of each page, or your shared footer)

Next to the Privacy Policy link:

```tsx
import { CookieSettingsButton } from "@/components/cookie-consent";
import ReviewUsButton from "@/components/review-us-button";
import Link from "next/link";

<Link href="/track">Track a pickup</Link>
<CookieSettingsButton />
<ReviewUsButton />
```

On the **home page** (and/or Services), add the reviews block where testimonials fit:

```tsx
import GoogleReviews from "@/components/google-reviews";

<GoogleReviews max={3} />
```

`GoogleReviews` is a server component. If the page file starts with `"use client"`, render it
from that page's `layout.tsx` instead, or pass it in as a child.

---

## 4. `src/middleware.ts` / `proxy.ts` — security headers

Add to the Content-Security-Policy:

| Directive     | Add |
|---------------|-----|
| `script-src`  | `https://www.googletagmanager.com` |
| `connect-src` | `https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com` |
| `img-src`     | `https://*.google-analytics.com https://www.googletagmanager.com https://lh3.googleusercontent.com` |
| `frame-src`   | `https://www.google.com https://maps.google.com` (add the directive if missing) |

The GA init snippet is an inline script — if `script-src` uses nonces instead of
`'unsafe-inline'`, pass it: `<GoogleAnalytics nonce={nonce} />`.

In **Permissions-Policy**, allow location for your own pages (for "Use my current location"):

```
geolocation=(self)
```

---

## 5. `src/app/sitemap.ts` and `public/robots.txt`

Sitemap — add:

```ts
{ url: `${baseUrl}/track`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
```

robots.txt — add under `User-agent: *`:

```
Disallow: /admin
Disallow: /api/
```

---

## 6. `src/components/structured-data.tsx` — link the Business Profile

```ts
import { businessProfileUrl } from "@/lib/business-profile";

const gbp = businessProfileUrl();

// Organization / LocalBusiness schema:
sameAs: [ ...existingLinks, ...(gbp ? [gbp] : []) ],
hasMap: gbp ?? undefined,
address: {
  "@type": "PostalAddress",
  streetAddress: "Mihango, off the Eastern Bypass",
  addressLocality: "Embakasi, Nairobi",
  addressCountry: "KE",
},
```

Keep the name, address and phone **exactly** the same as on your Google Business Profile.

---

## 7. `src/app/api/enquiry/route.ts` — save to PostgreSQL, validate pickups

Keep your rate limiting, CSRF, reCAPTCHA and sanitising. Add imports:

```ts
import { saveSubmission, markEmailStatus, type EnquiryType } from "@/lib/submissions";
import { parsePickupDetails, formatPickupForEmail, type PickupDetails } from "@/lib/pickup";
import { SITE_URL } from "@/lib/business-profile";
```

**After** validation and **before** the Resend email:

```ts
let pickup: PickupDetails | undefined;
if (type === "pickup") {
  const parsed = parsePickupDetails(additionalData);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  pickup = parsed.data;
}

let saved: { id: string; reference?: string } | null = null;
try {
  saved = await saveSubmission({
    type: type as EnquiryType,
    name, email, phone, organization, subject, message,
    additionalData,
    sourcePage: request.headers.get("referer") ?? undefined,
    pickup,
  });
} catch (err) {
  if (process.env.NODE_ENV === "development") console.error("DB save failed:", err);
}
```

In the staff notification email:

```ts
const emailSubject = pickup
  ? `Pickup Request ${saved?.reference ?? ""}: ${pickup.preferredDate} (${pickup.area || "see address"})`
  : existingSubject;

// append to the body:
pickup ? `\n\nPICKUP DETAILS\n${formatPickupForEmail(pickup, saved?.reference)}\nManage: ${SITE_URL}/admin` : ""
```

After the Resend call, and in the response:

```ts
if (saved) await markEmailStatus(saved.id, emailSentOk ? "sent" : "failed").catch(() => {});
return NextResponse.json({ success: true, message: successMessage, reference: saved?.reference });
```

## 8. `src/app/api/contact/route.ts`

```ts
import { saveSubmission, markEmailStatus } from "@/lib/submissions";

let saved = null;
try {
  saved = await saveSubmission({ type: "contact", name, email, phone, organization, subject, message,
    sourcePage: request.headers.get("referer") ?? undefined });
} catch (err) {
  if (process.env.NODE_ENV === "development") console.error("DB save failed:", err);
}
// ...send email...
if (saved) await markEmailStatus(saved.id, emailSentOk ? "sent" : "failed").catch(() => {});
```

---

## 9. `src/components/enquiry-modal.tsx` — map, pickup fields, tracking link

```tsx
import Link from "next/link";
import PickupFields, { validatePickupClient } from "@/components/pickup-fields";
import { EMPTY_PICKUP, type PickupDetails } from "@/lib/pickup";
import { trackLead, trackPickupScheduled, trackFormOpen } from "@/lib/analytics";

const [pickup, setPickup] = useState<PickupDetails>(EMPTY_PICKUP);
const [reference, setReference] = useState<string | null>(null);

useEffect(() => { if (isOpen) trackFormOpen(modalType); }, [isOpen, modalType]);
```

Above the message textarea:

```tsx
{modalType === "pickup" && <PickupFields value={pickup} onChange={setPickup} />}
```

In the submit handler, before `fetch`:

```ts
if (modalType === "pickup") {
  const err = validatePickupClient(pickup);
  if (err) { setError(err); return; }
}
// body:
additionalData: { ...additionalData, ...(modalType === "pickup" ? { pickup } : {}) },
```

On success:

```ts
const data = await res.json();
trackLead(modalType);
if (modalType === "pickup") {
  trackPickupScheduled({
    timeWindow: pickup.timeWindow,
    itemCount: pickup.itemCategories.length,
    dataDestruction: pickup.needsDataDestruction,
    usedMyLocation: pickup.latitude != null,
  });
  setReference(data.reference ?? null);
  setPickup(EMPTY_PICKUP);
}
```

Success message — and don't auto-close pickups that have a reference:

```tsx
{reference && (
  <p>
    Your pickup reference is <strong>{reference}</strong>. We&apos;ll call to confirm.{" "}
    <Link href={`/track?ref=${reference}`}>Track your pickup →</Link>
  </p>
)}
```
