-- SafeSphere Supabase Schema

-- Auth-linked profile
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  role TEXT CHECK (role IN ('consumer','institution')) DEFAULT 'consumer',
  institution_id UUID REFERENCES institutions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE trusted_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  relationship TEXT,
  contact TEXT,
  enabled BOOLEAN DEFAULT true
);

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  address TEXT,
  zone TEXT
);

CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_id UUID REFERENCES locations(id),
  destination_id UUID REFERENCES locations(id),
  distance NUMERIC,
  eta INTERVAL,
  route_type TEXT CHECK (route_type IN ('fastest','safest','balanced')),
  safe_score NUMERIC CHECK (safe_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE route_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES routes(id),
  geometry JSONB,
  safety_score NUMERIC,
  lighting_score NUMERIC,
  crowd_score NUMERIC,
  incident_risk NUMERIC,
  isolation_risk NUMERIC
);

CREATE TABLE safety_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT,
  severity TEXT CHECK (severity IN ('low','medium','high')),
  location JSONB,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  route_id UUID REFERENCES routes(id),
  status TEXT CHECK (status IN ('active','completed','cancelled')) DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  current_safe_score NUMERIC
);

CREATE TABLE sos_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES journeys(id),
  user_id UUID REFERENCES profiles(id),
  location JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE safe_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  type TEXT CHECK (type IN ('police','hospital','metro','mall','campus','other')),
  location JSONB,
  source TEXT DEFAULT 'osm_overpass'
);

CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE institutional_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id),
  location JSONB,
  type TEXT,
  severity TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE district_safety_scores (
  district_name TEXT PRIMARY KEY,
  state TEXT,
  historical_safety_score NUMERIC CHECK (historical_safety_score BETWEEN 0 AND 100),
  source TEXT DEFAULT 'NCRB',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_journeys_user ON journeys(user_id);
CREATE INDEX idx_safety_events_location ON safety_events USING GIN (location);
CREATE INDEX idx_institutional_incidents_institution ON institutional_incidents(institution_id);

-- Row Level Security (enable on every table)
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own journeys" ON journeys FOR ALL USING (user_id = auth.uid());

ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own contacts" ON trusted_contacts FOR ALL USING (user_id = auth.uid());

ALTER TABLE sos_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sos" ON sos_incidents FOR ALL USING (user_id = auth.uid());

ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read events" ON safety_events FOR SELECT USING (true);

ALTER TABLE safe_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read safe zones" ON safe_zones FOR SELECT USING (true);

ALTER TABLE district_safety_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read district scores" ON district_safety_scores FOR SELECT USING (true);

ALTER TABLE institutional_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "institution scoped read" ON institutional_incidents FOR SELECT
  USING (institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid()));
