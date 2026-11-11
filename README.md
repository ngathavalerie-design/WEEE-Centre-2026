# WEEE Centre website

Next.js 16 website for WEEE Centre — e-waste collection, recycling and data destruction in Nairobi, Kenya.

## What's here

| Area | Where |
|---|---|
| Public pages: Home, About, Services, Projects, Events, Conferences, Contact, Terms, Privacy, Track | `src/app/(site)/` |
| **Editable content** — contact details, services, social links, projects, events | `src/content/site.ts` |
| Enquiry pop-up (pickup, quote, project, event, conference, service, subscribe) | `src/components/enquiry/` |
| Pickup scheduler with map + "use my location" | `src/components/pickup-fields.tsx`, `pickup-map.tsx` |
| Pickup tracking page `/track` | `src/app/(site)/track/` |
| Admin dashboard `/admin` (password-protected) | `src/app/admin/` |
| Form APIs with CSRF, rate limiting, honeypot, optional reCAPTCHA | `src/app/api/`, `src/lib/form-guard.ts` |
| PostgreSQL storage | `db/schema.sql`, `src/lib/db.ts`, `src/lib/submissions.ts` |
| Emails (Resend) | `src/lib/email.ts`, `src/lib/notify.ts` |
| Cookie consent + Google Analytics 4 | `src/components/cookie-consent.tsx`, `google-analytics.tsx` |
| Google Business Profile reviews & links | `src/components/google-reviews.tsx`, `src/lib/business-profile.ts` |
| SEO: metadata, sitemap, robots, structured data, manifest | `src/app/layout.tsx`, `sitemap.ts`, `robots.ts`, `src/components/structured-data.tsx` |
| Security headers (CSP, HSTS…) | `src/middleware.ts` |

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run db:migrate           # creates the database tables (needs DATABASE_URL)
npm run dev
```

Open http://localhost:3000. The site runs without a database or email keys, but forms only
work once at least one of `DATABASE_URL` or `RESEND_API_KEY` + `FROM_EMAIL` is set.

## Deploy on Vercel

1. vercel.com → **Add New → Project** → import this repository.
2. **Storage** tab → create a **Neon Postgres** database and connect it (sets `DATABASE_URL`).
3. **Settings → Environment Variables** — add everything from `.env.example` you have values for.
   At minimum: `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.
4. **Deployments** → redeploy so the new variables apply.
5. Create the tables once — on your computer, with `DATABASE_URL` from Vercel in `.env.local`:
   `npm run db:migrate`
6. Visit `/admin` and sign in with your `ADMIN_PASSWORD`.

Never commit real values. Passwords and keys belong only in `.env.local` and Vercel's settings.

Accounts and keys for each feature (Resend, Google Analytics, Search Console, Business Profile,
reCAPTCHA, Tawk.to): see [`ANALYTICS_DATABASE_SETUP.md`](ANALYTICS_DATABASE_SETUP.md).

## Before going live — please review

- **Wording** on every page was rewritten from the project notes. Check it says exactly what
  WEEE Centre does, and add real projects/events in `src/content/site.ts`.
- **Photos & logo**: the site uses a simple text logo and icons. Add your logo and photos to
  `public/` and swap them into `src/components/logo.tsx` and the pages.
- **Terms & Privacy** are sensible starting points, not legal advice — have them reviewed.
- **Social links** are hidden until you add them in `src/content/site.ts`.
