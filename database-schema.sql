-- ═══════════════════════════════════════════════════════
-- SafeSphere · Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════

-- ── 1. institutions (no deps) ──────────────────────────
CREATE TABLE IF NOT EXISTS institutions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  type       TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. profiles (depends on institutions) ─────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name               TEXT,
  role               TEXT CHECK (role IN ('consumer','institution')) DEFAULT 'consumer',
  institution_id     UUID REFERENCES institutions(id),
  phone              TEXT,
  blood_type         TEXT,
  allergies          TEXT,
  medical_conditions TEXT,
  home_address       TEXT,
  work_safe_zone     TEXT,
  onboarded          BOOLEAN DEFAULT false,
  created_at         TIMESTAMPTZ DEFAULT now()
);

-- In case profiles table already exists, ensure new columns are added safely:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blood_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_safe_zone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT false;

-- ── 3. trusted_contacts ────────────────────────────────
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  relationship TEXT,
  contact      TEXT,
  phone        TEXT,
  permission   TEXT DEFAULT 'SOS Only',
  status       TEXT DEFAULT 'Accepted',
  enabled      BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE trusted_contacts ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE trusted_contacts ADD COLUMN IF NOT EXISTS permission TEXT DEFAULT 'SOS Only';
ALTER TABLE trusted_contacts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Accepted';
ALTER TABLE trusted_contacts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ── 4. locations ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS locations (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude  NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  address   TEXT,
  zone      TEXT
);

-- ── 5. routes ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS routes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_id      UUID REFERENCES locations(id),
  destination_id UUID REFERENCES locations(id),
  distance       NUMERIC,
  eta            INTERVAL,
  route_type     TEXT CHECK (route_type IN ('fastest','safest','balanced')),
  safe_score     NUMERIC CHECK (safe_score BETWEEN 0 AND 100),
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ── 6. route_segments ──────────────────────────────────
CREATE TABLE IF NOT EXISTS route_segments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id       UUID REFERENCES routes(id) ON DELETE CASCADE,
  geometry       JSONB,
  safety_score   NUMERIC,
  lighting_score NUMERIC,
  crowd_score    NUMERIC,
  incident_risk  NUMERIC,
  isolation_risk NUMERIC
);

-- ── 7. safety_events ───────────────────────────────────
CREATE TABLE IF NOT EXISTS safety_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT,
  severity    TEXT CHECK (severity IN ('low','medium','high')),
  location    JSONB,
  description TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 8. journeys ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS journeys (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
  route_id          UUID REFERENCES routes(id),
  route_summary     TEXT,
  origin_name       TEXT,
  destination_name  TEXT,
  duration_mins     INTEGER,
  status            TEXT CHECK (status IN ('active','completed','cancelled')) DEFAULT 'active',
  started_at        TIMESTAMPTZ DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  current_safe_score NUMERIC
);

ALTER TABLE journeys ADD COLUMN IF NOT EXISTS route_summary TEXT;
ALTER TABLE journeys ADD COLUMN IF NOT EXISTS origin_name TEXT;
ALTER TABLE journeys ADD COLUMN IF NOT EXISTS destination_name TEXT;
ALTER TABLE journeys ADD COLUMN IF NOT EXISTS duration_mins INTEGER;

-- ── 9. sos_incidents ───────────────────────────────────
CREATE TABLE IF NOT EXISTS sos_incidents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id  UUID REFERENCES journeys(id),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT DEFAULT 'Emergency SOS Broadcast',
  location    JSONB,
  location_name TEXT,
  resolved_by TEXT,
  status      TEXT DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sos_incidents ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Emergency SOS Broadcast';
ALTER TABLE sos_incidents ADD COLUMN IF NOT EXISTS location_name TEXT;
ALTER TABLE sos_incidents ADD COLUMN IF NOT EXISTS resolved_by TEXT;

-- ── 10. safe_zones ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS safe_zones (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name     TEXT,
  type     TEXT CHECK (type IN ('police','hospital','metro','mall','campus','other')),
  location JSONB,
  source   TEXT DEFAULT 'osm_overpass'
);

-- ── 11. institutional_incidents ────────────────────────
CREATE TABLE IF NOT EXISTS institutional_incidents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id),
  location       JSONB,
  type           TEXT,
  severity       TEXT,
  status         TEXT DEFAULT 'open',
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ── 12. district_safety_scores ─────────────────────────
CREATE TABLE IF NOT EXISTS district_safety_scores (
  district_name          TEXT PRIMARY KEY,
  state                  TEXT,
  historical_safety_score NUMERIC CHECK (historical_safety_score BETWEEN 0 AND 100),
  source                 TEXT DEFAULT 'NCRB',
  updated_at             TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_journeys_user ON journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user ON trusted_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_incidents_user ON sos_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_events_location ON safety_events USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_institutional_incidents_institution ON institutional_incidents(institution_id);

-- ── Row Level Security ─────────────────────────────────
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE journeys              ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_contacts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_incidents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_zones            ENABLE ROW LEVEL SECURITY;
ALTER TABLE district_safety_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutional_incidents ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update/insert their own row
DROP POLICY IF EXISTS "own profile" ON profiles;
CREATE POLICY "own profile" ON profiles FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Journeys: users own their journeys
DROP POLICY IF EXISTS "own journeys" ON journeys;
CREATE POLICY "own journeys" ON journeys FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Trusted contacts: users own their contacts
DROP POLICY IF EXISTS "own contacts" ON trusted_contacts;
CREATE POLICY "own contacts" ON trusted_contacts FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- SOS incidents: users own their incidents
DROP POLICY IF EXISTS "own sos" ON sos_incidents;
CREATE POLICY "own sos" ON sos_incidents FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Safety events: public read
DROP POLICY IF EXISTS "public read events" ON safety_events;
CREATE POLICY "public read events" ON safety_events FOR SELECT USING (true);

-- Safe zones: public read
DROP POLICY IF EXISTS "public read safe zones" ON safe_zones;
CREATE POLICY "public read safe zones" ON safe_zones FOR SELECT USING (true);

-- District safety scores: public read
DROP POLICY IF EXISTS "public read district scores" ON district_safety_scores;
CREATE POLICY "public read district scores" ON district_safety_scores FOR SELECT USING (true);

-- Institutional incidents: scoped to institution members
DROP POLICY IF EXISTS "institution scoped read" ON institutional_incidents;
CREATE POLICY "institution scoped read" ON institutional_incidents FOR SELECT
  USING (institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid()));

-- ── Auto-profile trigger ────────────────────────────────
-- Creates a profile row automatically when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, onboarded)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'consumer'),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
