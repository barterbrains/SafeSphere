-- SafeSphere Supabase PostgreSQL Database Schema
-- Execute this SQL in your Supabase SQL Editor to set up tables and initial indexes.

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trusted Contacts Table
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  contact TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true
);

-- 3. Institutions Table
CREATE TABLE IF NOT EXISTS institutions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Journeys Table
CREATE TABLE IF NOT EXISTS journeys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled', 'emergency')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  current_safe_score NUMERIC DEFAULT 100,
  events JSONB DEFAULT '[]'::jsonb
);

-- 5. SOS Incidents Table
CREATE TABLE IF NOT EXISTS sos_incidents (
  id TEXT PRIMARY KEY,
  journey_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  location JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'resolved'))
);

-- 6. Safety Events Table
CREATE TABLE IF NOT EXISTS safety_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location JSONB NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  description TEXT NOT NULL,
  active BOOLEAN DEFAULT false
);

-- 7. Safe Zones Table
CREATE TABLE IF NOT EXISTS safe_zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  location JSONB NOT NULL
);

-- 8. Institutional Incidents Table
CREATE TABLE IF NOT EXISTS institutional_incidents (
  id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  location JSONB NOT NULL,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('open', 'investigating', 'resolved')),
  description TEXT NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user_id ON trusted_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_journeys_user_id ON journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_incidents_user_id ON sos_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_institutional_incidents_inst ON institutional_incidents(institution_id);
