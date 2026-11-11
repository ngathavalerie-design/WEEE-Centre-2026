# Analytics, Search Console, PostgreSQL & Pickup Map — Setup

This guide covers the accounts, keys and settings each feature needs. Deployment steps are in `README.md`.

## 1. Google Analytics 4

1. Go to analytics.google.com → **Admin → Create → Property** (time zone: Nairobi, currency: KES).
2. **Data streams → Add stream → Web** → `https://weeecentre.com`. Leave *Enhanced measurement* on
   (it tracks page views on client-side navigation, scrolls, outbound clicks).
3. Copy the **Measurement ID** (`G-…`) → `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
4. Deploy. Open the site and check **Reports → Realtime** — you should appear within a minute.
5. After the first form submissions arrive: **Admin → Events** → mark `generate_lead` and
   `pickup_scheduled` as **Key events** (these are your conversions).
6. Optional: **Admin → Data settings → Data filters** → exclude internal traffic (your office IP).

Custom events sent by the site:

| Event | When | Parameters |
|---|---|---|
| `form_open` | an enquiry modal opens | `enquiry_type` |
| `generate_lead` | any form submits successfully | `enquiry_type` |
| `pickup_scheduled` | a pickup is booked | `time_window`, `item_category_count`, `data_destruction`, `used_my_location` |
| `directions_click` | "Get directions" on the map | — |

No names, emails or phone numbers are ever sent to Google.

## 2. Google Search Console

Follow `GOOGLE_SEARCH_CONSOLE_SETUP.md` (set `NEXT_PUBLIC_GSC_VERIFICATION`, deploy, Verify,
submit `sitemap.xml`). Two additions:

- **Prefer a Domain property** (DNS TXT record) if you can edit DNS — it covers `www.`, non-`www`,
  `http` and `https` in one property. The HTML tag keeps working as a backup.
- **Link it to GA4:** GA4 **Admin → Product links → Search Console links → Link**. You'll then see
  Google search queries and landing pages inside Analytics (Reports → Search Console).

## 3. PostgreSQL

Pick the option that matches where the site runs (the repo has both `railway.json` and `vercel.json`):

- **Railway:** in your project, **New → Database → PostgreSQL**. In the web service, add a variable
  `DATABASE_URL = ${{Postgres.DATABASE_URL}}`.
- **Vercel:** add **Neon** from the Vercel Marketplace (Storage tab). It sets `DATABASE_URL`
  automatically. Keep `PG_POOL_MAX` at 3–5.

Create the tables (safe to re-run any time):

```bash
npm run db:migrate          # local, uses .env.local
npm run db:migrate:prod     # on the server / in a release step
```

Tables: `enquiries` (every form), `pickup_requests` (address, map pin, date, time window, items,
status `requested → confirmed → collected → completed`), `subscribers`.

If `DATABASE_URL` is missing, forms still work and email is still sent — nothing is stored.

Useful queries until there's an admin dashboard:

```sql
-- Pickups to plan for the coming week
SELECT p.reference, p.preferred_date, p.time_window, p.area, p.address, e.name, e.phone,
       p.item_categories, p.needs_data_destruction
FROM pickup_requests p JOIN enquiries e ON e.id = p.enquiry_id
WHERE p.status IN ('requested','confirmed') AND p.preferred_date < current_date + 7
ORDER BY p.preferred_date, p.time_window;

-- Enquiries where the notification email failed
SELECT type, name, email, created_at FROM enquiries WHERE email_status = 'failed';
```

## 4. Pickup map

Set `NEXT_PUBLIC_CENTRE_MAP_QUERY` to exactly what finds you on Google Maps (ideally your
Google Business Profile name + street), and `NEXT_PUBLIC_CENTRE_ADDRESS` to the text shown under
the map. For the "about X km from us" hint, add `NEXT_PUBLIC_CENTRE_LAT` / `_LNG`
(right-click your pin in Google Maps → the first menu item copies the coordinates).

The map works without an API key. For the official, supported embed, create a free
**Maps Embed API** key in Google Cloud Console, restrict it to `weeecentre.com/*`, and set
`NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY`.

## 5. Pickup tracking page (`/track`)

Customers enter their `WC-` reference **and** the email or phone they booked with — a reference
alone shows nothing, and the street address is never displayed. Lookups are rate-limited
(10 per 10 minutes per visitor). The booking confirmation and every status email link straight
to `/track?ref=WC-…`.

## 6. Admin dashboard (`/admin`)

1. Set these in `.env.local` **and** in Vercel/Railway → Environment Variables:
   ```
   ADMIN_PASSWORD=<your chosen password>
   ADMIN_SESSION_SECRET=<output of: openssl rand -base64 48>
   ```
   The password lives only in environment variables — it is not in the code or on GitHub.
2. Run `npm run db:migrate` (adds the status-history and login-attempt tables).
3. Go to `https://weeecentre.com/admin` and sign in.

What staff can do:
- See counts at a glance (new requests, next 7 days, completed this month, failed emails).
- Filter pickups by status, search by name/phone/reference, open the customer's map pin, call or
  WhatsApp them.
- Set status (Requested → Confirmed → Collected → Completed, or Cancelled), the confirmed date and
  time, a message the customer sees, and internal notes. Ticking "Email the customer" sends them a
  status email with their tracking link (and, on Completed, a Google review link).
- Read all other enquiries and subscribers; export any list to CSV for Excel.

Security: 8-hour signed sessions, 5 wrong passwords locks that IP out for 15 minutes, changing
`ADMIN_PASSWORD` signs everyone out, pages are `noindex`. Use a long password — a 9-character one
can be guessed by someone determined, even with the lockout.

## 7. Cookie consent

The banner appears on the first visit with equal **Essential only** / **Accept analytics** buttons.
Google Analytics loads **only after** "Accept analytics"; choosing "Essential only" later also
deletes the GA cookies. The footer's **Cookie settings** button reopens the banner.
Update the cookie section of `/privacy` to say: Google Analytics (`_ga`, `_ga_*`), used only with
consent, kept up to 2 years; consent choice stored for 6 months; live chat cookies set by Tawk.to.

## 8. Google Business Profile

1. **Claim or create the profile** at business.google.com with the same name, address
   (Mihango, Embakasi, off the Eastern Bypass) and phone (+254 701 819 559) as the website. Pick the
   closest recycling / e-waste category, add service areas, opening hours, photos of the facility,
   and `https://weeecentre.com` as the website. Complete Google's verification.
2. **Find your Place ID** with Google's Place ID Finder
   (developers.google.com/maps/documentation/places/web-service/place-id) → `NEXT_PUBLIC_GBP_PLACE_ID`.
   Optionally paste the profile's "Share" link into `NEXT_PUBLIC_GBP_URL`.
3. **Reviews on the site (optional):** in Google Cloud Console enable *Places API (New)*, create an
   API key restricted to that API, set `GOOGLE_PLACES_API_KEY`. Billing must be on; review data is a
   paid field, cached for an hour to keep costs down.
4. **Better map (optional):** enable *Maps Embed API* (free), create a key restricted to
   `weeecentre.com/*` → `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY`. The pickup map then shows your profile
   card with rating and hours.

What it powers: "Review us on Google" buttons, the reviews block, directions that land on your
exact profile, a review request in the "Completed" pickup email, and `sameAs`/`hasMap` structured
data linking the website and profile for local search.
