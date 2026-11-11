-- WEEE Centre — PostgreSQL schema
-- Safe to run more than once (everything is IF NOT EXISTS).
-- Run with:  npm run db:migrate

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid() on PostgreSQL < 13

-- ---------------------------------------------------------------------------
-- Every form submission on the site (contact, pickup, quote, project, event…)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enquiries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type             text NOT NULL CHECK (type IN
                     ('contact','pickup','quote','project','conference','event','service','subscribe')),
  name             text NOT NULL,
  email            text NOT NULL,
  phone            text,
  organization     text,
  subject          text,
  message          text,
  additional_data  jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_page      text,
  email_status     text NOT NULL DEFAULT 'pending'
                     CHECK (email_status IN ('pending','sent','failed')),
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS enquiries_type_created_idx ON enquiries (type, created_at DESC);
CREATE INDEX IF NOT EXISTS enquiries_email_idx        ON enquiries (lower(email));

-- ---------------------------------------------------------------------------
-- Pickup bookings (one per pickup enquiry)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pickup_requests (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference               text NOT NULL UNIQUE,              -- e.g. WC-7K3P9Q, shown to the customer
  enquiry_id              uuid NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  address                 text NOT NULL,
  landmark                text,
  area                    text,                              -- estate / town, e.g. "Westlands"
  latitude                double precision CHECK (latitude  BETWEEN -90  AND 90),
  longitude               double precision CHECK (longitude BETWEEN -180 AND 180),
  preferred_date          date NOT NULL,
  time_window             text NOT NULL CHECK (time_window IN ('morning','afternoon')),
  item_categories         text[] NOT NULL DEFAULT '{}',
  estimated_quantity      text,
  needs_data_destruction  boolean NOT NULL DEFAULT false,
  status                  text NOT NULL DEFAULT 'requested'
                            CHECK (status IN ('requested','confirmed','collected','completed','cancelled')),
  scheduled_for           timestamptz,                       -- set by staff when confirmed
  staff_notes             text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pickup_requests_date_status_idx ON pickup_requests (preferred_date, status);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pickup_requests_set_updated_at ON pickup_requests;
CREATE TRIGGER pickup_requests_set_updated_at
  BEFORE UPDATE ON pickup_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Newsletter subscribers (one row per email address)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscribers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email            text NOT NULL,
  name             text,
  source_page      text,
  subscribed_at    timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at  timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_unique ON subscribers (lower(email));

-- ---------------------------------------------------------------------------
-- v2: tracking page + admin dashboard
-- ---------------------------------------------------------------------------

-- Message staff want the customer to see on the tracking page (e.g. "Driver Peter, 0712 000 000").
ALTER TABLE pickup_requests ADD COLUMN IF NOT EXISTS customer_message text;

-- Every status change, shown as a timeline on the tracking page and in the admin.
CREATE TABLE IF NOT EXISTS pickup_status_history (
  id          bigserial PRIMARY KEY,
  pickup_id   uuid NOT NULL REFERENCES pickup_requests(id) ON DELETE CASCADE,
  status      text NOT NULL,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pickup_status_history_pickup_idx ON pickup_status_history (pickup_id, created_at);

-- Backfill a "requested" entry for pickups created before v2.
INSERT INTO pickup_status_history (pickup_id, status, created_at)
SELECT p.id, 'requested', p.created_at
FROM pickup_requests p
WHERE NOT EXISTS (SELECT 1 FROM pickup_status_history h WHERE h.pickup_id = p.id);

-- Failed admin logins, used to slow down password guessing (works across serverless instances).
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id            bigserial PRIMARY KEY,
  ip_hash       text NOT NULL,
  attempted_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_login_attempts_ip_idx ON admin_login_attempts (ip_hash, attempted_at);
