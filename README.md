# WEEE Centre website

Next.js 16 website for WEEE Centre (e-waste collection, recycling and data destruction, Nairobi).

## ⚠️ What's in this repository right now

This repository contains the **new features** below plus the project configuration.
The **original website pages are not in this repository yet** — the home, about, services,
projects, events, conferences, contact, terms and privacy pages, the root `layout.tsx`,
`globals.css`, the site header, the enquiry modal, the contact form, the `contact`/`enquiry`/`csrf`
API routes, `middleware.ts`, `sitemap.ts`, `structured-data.tsx` and the `public/` folder.

**The site will not build until those files are added.** To finish:

1. Copy your existing `src/` and `public/` folders into this repository (keep the new files here —
   none of them overwrite an existing file).
2. Apply the small edits in [`INTEGRATION_PATCHES.md`](INTEGRATION_PATCHES.md) to the existing files.
3. `npm install` (this also creates `package-lock.json` with the new `pg` package), then `npm run build`.

## New features

| Feature | Where |
|---|---|
| PostgreSQL storage for every form, pickup and subscriber | `db/schema.sql`, `src/lib/db.ts`, `src/lib/submissions.ts` |
| Pickup scheduler with "where we are" map + "use my location" | `src/components/pickup-fields.tsx`, `src/components/pickup-map.tsx` |
| Pickup tracking page (`/track`) | `src/app/track/`, `src/app/api/pickup/track/` |
| Password-protected admin dashboard (`/admin`) | `src/app/admin/`, `src/lib/admin-*.ts`, `src/app/api/admin/export/` |
| Customer status emails | `src/lib/notify.ts` |
| Cookie consent banner (GA loads only after consent) | `src/components/cookie-consent.tsx`, `src/lib/consent.ts` |
| Google Analytics 4 + custom events | `src/components/google-analytics.tsx`, `src/lib/analytics.ts` |
| Google Business Profile: reviews, review links, directions | `src/components/google-reviews.tsx`, `src/components/review-us-button.tsx`, `src/lib/business-profile.ts` |

## Setup

- Accounts, keys and environment variables: [`ANALYTICS_DATABASE_SETUP.md`](ANALYTICS_DATABASE_SETUP.md)
- Environment variable list: [`.env.example`](.env.example) — copy to `.env.local` and fill in.
  **Never commit real values** (the admin password, database URL and API keys go only in
  `.env.local` and your hosting provider's environment variables).
- Create the database tables: `npm run db:migrate` (local) or `npm run db:migrate:prod` (server).

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.
