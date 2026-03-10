-- Malta Luxury Estates: GRAND FINALE Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Agencies Table: Stores B2B agency profiles (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.agencies (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  license_no  TEXT,
  vat_no      TEXT,
  phone       TEXT,
  logo_url    TEXT,
  plan        TEXT DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'featured')),
  active      BOOLEAN DEFAULT TRUE,
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status    TEXT DEFAULT 'active',
  plan_updated_at        TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for Stripe webhooks
CREATE INDEX IF NOT EXISTS agencies_stripe_customer_idx ON public.agencies (stripe_customer_id);

-- 1.1 Locations Table: Geographic metadata for pSEO
CREATE TABLE IF NOT EXISTS public.locations (
  id            INTEGER PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  name_en       TEXT NOT NULL,
  name_mt       TEXT,
  island        TEXT,
  region        TEXT,
  location_type TEXT,
  is_popular    BOOLEAN DEFAULT FALSE,
  is_luxury_hub BOOLEAN DEFAULT FALSE,
  short_desc    TEXT,
  long_intro    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Articles Table: Knowledge Hub content
CREATE TABLE IF NOT EXISTS public.articles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  category      TEXT,
  excerpt       TEXT,
  content       TEXT,
  image         TEXT,
  date          TEXT,
  read_time     TEXT,
  published     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Properties Table: The core listings database (pSEO source)
CREATE TABLE IF NOT EXISTS public.properties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE,
  location_id   INTEGER, -- Link to your local locations logic
  location_text TEXT,    -- Human readable location
  property_type TEXT,    -- Apartment, Villa, etc.
  bedrooms      SMALLINT,
  bathrooms     SMALLINT,
  area_sqm      NUMERIC,
  floor_no      TEXT,
  price         NUMERIC NOT NULL,
  listing_type  TEXT DEFAULT 'sale',  -- sale | rent
  status        TEXT DEFAULT 'draft', -- draft | active | paused | sold
  is_seafront   BOOLEAN DEFAULT FALSE,
  has_pool      BOOLEAN DEFAULT FALSE,
  has_garage    BOOLEAN DEFAULT FALSE,
  is_sda        BOOLEAN DEFAULT FALSE,
  is_uca        BOOLEAN DEFAULT FALSE,
  epc_rating    TEXT,
  features      JSONB DEFAULT '[]',
  description   TEXT,
  images        TEXT[] DEFAULT '{}',
  views_count   INTEGER DEFAULT 0,
  leads_count   INTEGER DEFAULT 0,
  external_ref  TEXT,        -- Agency's internal ID for deduplication
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for CSV Import deduplication
CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_agency_external_ref
  ON public.properties (agency_id, external_ref)
  WHERE external_ref IS NOT NULL;

-- 3. Leads Table: Inbound enquiries
CREATE TABLE IF NOT EXISTS public.leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  agency_id   UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  intent      TEXT,           -- Buy | Rent | Info
  budget_min  NUMERIC,
  budget_max  NUMERIC,
  status      TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  source      TEXT,           -- Website | Referral
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS (Row Level Security)
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Agencies see/edit their own profile
CREATE POLICY "agencies_own_profile" ON public.agencies
  FOR ALL USING (id = auth.uid());

-- Public can read active listings
CREATE POLICY "public_read_properties" ON public.properties
  FOR SELECT USING (status = 'active');

-- Agencies manage own listings
CREATE POLICY "agencies_manage_properties" ON public.properties
  FOR ALL USING (agency_id = auth.uid());

-- Public can insert leads (contact form)
CREATE POLICY "public_insert_leads" ON public.leads
  FOR INSERT WITH CHECK (true);

-- Agencies see/update own leads
CREATE POLICY "agencies_manage_leads" ON public.leads
  FOR ALL USING (agency_id = auth.uid());

-- Public read for locations and articles
CREATE POLICY "public_read_locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "public_read_articles" ON public.articles FOR SELECT USING (published = true);

-- 6. Updated At Trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_modtime BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_agencies_modtime BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_locations_modtime BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_articles_modtime BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 7. Auto-create agency row on user signup (trigger)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.agencies (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'agency_name', 'New Agency'),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
