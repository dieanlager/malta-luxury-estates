-- ============================================================
-- Malta Luxury Estates – Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. LOCATIONS (15+ areas across Malta & Gozo)
-- ============================================================
CREATE TABLE IF NOT EXISTS locations (
  id            SERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  name_en       TEXT NOT NULL,
  name_mt       TEXT,
  island        TEXT NOT NULL CHECK (island IN ('malta', 'gozo', 'comino')),
  region        TEXT,
  location_type TEXT NOT NULL DEFAULT 'city' CHECK (location_type IN ('city', 'area', 'village')),
  is_popular    BOOLEAN NOT NULL DEFAULT false,
  is_luxury_hub BOOLEAN NOT NULL DEFAULT false,
  short_desc    TEXT NOT NULL DEFAULT '',
  long_intro    TEXT NOT NULL DEFAULT '',
  hero_image    TEXT,
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_locations_slug ON locations(slug);
CREATE INDEX idx_locations_island ON locations(island);
CREATE INDEX idx_locations_popular ON locations(is_popular) WHERE is_popular = true;

-- ============================================================
-- 2. LOCATION STATS (aggregated market data per location)
-- ============================================================
CREATE TABLE IF NOT EXISTS location_stats (
  id                  SERIAL PRIMARY KEY,
  location_id         INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  listings_sale_count INTEGER NOT NULL DEFAULT 0,
  listings_rent_count INTEGER NOT NULL DEFAULT 0,
  median_price_sale   BIGINT,
  median_price_rent   BIGINT,
  avg_price_sale      BIGINT,
  avg_price_rent      BIGINT,
  last_calculated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(location_id)
);

-- ============================================================
-- 3. PROPERTIES (main listings table)
-- ============================================================
CREATE TABLE IF NOT EXISTS properties (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  location_id   INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  price         BIGINT NOT NULL,
  listing_type  TEXT NOT NULL DEFAULT 'sale' CHECK (listing_type IN ('sale', 'rent')),
  property_type TEXT NOT NULL DEFAULT 'apartment',
  bedrooms      INTEGER NOT NULL DEFAULT 0,
  bathrooms     INTEGER NOT NULL DEFAULT 0,
  area_sqm      INTEGER NOT NULL DEFAULT 0,
  has_sea_view  BOOLEAN NOT NULL DEFAULT false,
  has_pool      BOOLEAN NOT NULL DEFAULT false,
  is_seafront   BOOLEAN NOT NULL DEFAULT false,
  is_new_build  BOOLEAN NOT NULL DEFAULT false,
  is_furnished  BOOLEAN NOT NULL DEFAULT false,
  is_luxury_tag BOOLEAN NOT NULL DEFAULT false,
  features      TEXT[] NOT NULL DEFAULT '{}',
  tags          TEXT[] NOT NULL DEFAULT '{}',
  images        TEXT[] NOT NULL DEFAULT '{}',
  agency_name   TEXT,
  agency_logo   TEXT,
  source_url    TEXT,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'rented', 'inactive')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_properties_location ON properties(location_id);
CREATE INDEX idx_properties_status ON properties(status) WHERE status = 'active';
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_listing_type ON properties(listing_type);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_luxury ON properties(is_luxury_tag) WHERE is_luxury_tag = true;
CREATE INDEX idx_properties_slug ON properties(slug);

-- Composite indexes for common pSEO filter combinations
CREATE INDEX idx_properties_location_price ON properties(location_id, price) WHERE status = 'active';
CREATE INDEX idx_properties_location_type ON properties(location_id, property_type) WHERE status = 'active';
CREATE INDEX idx_properties_seafront ON properties(is_seafront) WHERE status = 'active' AND is_seafront = true;
CREATE INDEX idx_properties_pool ON properties(has_pool) WHERE status = 'active' AND has_pool = true;
CREATE INDEX idx_properties_new_build ON properties(is_new_build) WHERE status = 'active' AND is_new_build = true;

-- ============================================================
-- 4. ARTICLES (Knowledge Hub content)
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'Buying',
  excerpt     TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  image       TEXT NOT NULL DEFAULT '',
  date        TEXT NOT NULL DEFAULT '',
  read_time   TEXT NOT NULL DEFAULT '',
  published   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published ON articles(published) WHERE published = true;

-- ============================================================
-- 5. INQUIRIES (contact form submissions)
-- ============================================================
CREATE TABLE IF NOT EXISTS inquiries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  message         TEXT,
  property_id     UUID REFERENCES properties(id) ON DELETE SET NULL,
  property_title  TEXT,
  status          TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created ON inquiries(created_at DESC);

-- ============================================================
-- 6. AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Public read for all tables, write only via service_role

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Public read policies (anon can SELECT)
CREATE POLICY "Public read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Public read location_stats" ON location_stats FOR SELECT USING (true);
CREATE POLICY "Public read properties" ON properties FOR SELECT USING (status = 'active');
CREATE POLICY "Public read articles" ON articles FOR SELECT USING (published = true);

-- Inquiries: anyone can INSERT (contact form), only service_role can read
CREATE POLICY "Public insert inquiries" ON inquiries FOR INSERT WITH CHECK (true);

-- ============================================================
-- 8. SEED: 15 LOCATIONS
-- ============================================================
INSERT INTO locations (slug, name_en, name_mt, island, region, location_type, is_popular, is_luxury_hub, short_desc, long_intro, lat, lng) VALUES
  ('sliema', 'Sliema', 'Tas-Sliema', 'malta', 'Northern Harbour', 'city', true, true,
   'Seafront lifestyle hub with modern apartments, penthouses and a vibrant promenade.',
   'Sliema is Malta''s prime seafront residential hub, known for luxury apartments, high-rise penthouses and a bustling promenade lined with shops and restaurants. Its central location and sea views make it one of the most sought-after areas for both international buyers and long-term renters. Key developments include Tigné Point, Fort Cambridge and The Strand.',
   35.9126, 14.5043),
  ('st-julians', 'St. Julian''s', 'San Ġiljan', 'malta', 'Northern Harbour', 'city', true, true,
   'Entertainment and luxury living around Spinola Bay and Portomaso Marina.',
   'St. Julian''s combines seafront living with Malta''s main entertainment district in Paceville. Five-star hotels, marinas and high-end apartment complexes make it ideal for investors targeting premium rentals and holiday lets. Portomaso and Pender Gardens are flagship SDA developments.',
   35.9198, 14.4898),
  ('valletta', 'Valletta', 'Il-Belt Valletta', 'malta', 'Southern Harbour', 'city', true, true,
   'UNESCO-listed capital with historic palazzos and panoramic harbour views.',
   'Valletta is Malta''s UNESCO-listed capital, characterised by baroque palazzos, narrow streets and dramatic harbour views. Refurbished townhouses and boutique apartments attract buyers seeking historic charm with strong long-term value.',
   35.8989, 14.5146),
  ('mdina', 'Mdina', 'L-Imdina', 'malta', 'Western', 'city', true, true,
   'The "Silent City", offering exclusive historic noble residences and unparalleled privacy.',
   'Mdina, Malta''s ancient capital, is a fortified medieval city perched on a hilltop. Known as the "Silent City," it offers a unique living experience in grand historic palazzos and noble residences.',
   35.8867, 14.4031),
  ('mellieha', 'Mellieħa', 'Il-Mellieħa', 'malta', 'Northern', 'city', true, true,
   'Famous for its stunning villas perched on the cliffs overlooking the northern bays.',
   'Mellieħa is a picturesque village in the north of Malta, renowned for its beautiful sandy beaches and high-end villa developments.',
   35.9547, 14.3665),
  ('victoria', 'Victoria', 'Ir-Rabat Għawdex', 'gozo', 'Gozo', 'city', true, true,
   'The heart of Gozo, offering charming farmhouses and luxury retreats.',
   'Victoria (also known as Rabat) is the capital of Gozo. The surrounding areas offer a mix of traditional farmhouses and modern luxury apartments.',
   36.0447, 14.2395),
  ('swieqi', 'Swieqi', 'Is-Swieqi', 'malta', 'Northern Harbour', 'city', true, false,
   'Upscale residential suburb minutes from St. Julian''s with excellent international schools.',
   'Swieqi is a modern residential suburb located on the ridge between St. Julian''s and Madliena.',
   35.9248, 14.4815),
  ('attard', 'Attard', 'Ħ''Attard', 'malta', 'Central', 'city', true, false,
   'Prestigious residential village with the presidential palace and San Anton Gardens.',
   'Attard is one of Malta''s most desirable residential areas, home to the Presidential Palace at San Anton Gardens.',
   35.8898, 14.4435),
  ('madliena', 'Madliena', 'Il-Madliena', 'malta', 'Northern', 'area', true, true,
   'Exclusive hilltop enclave with commanding views and premium detached villas.',
   'Madliena is an exclusive residential area perched on the hills above Swieqi.',
   35.9317, 14.4751),
  ('san-pawl-il-bahar', 'St. Paul''s Bay', 'San Pawl il-Baħar', 'malta', 'Northern', 'city', true, false,
   'Affordable seafront living with strong rental yields, including Qawra and Buġibba.',
   'St. Paul''s Bay encompasses the popular tourist areas of Qawra and Buġibba.',
   35.9505, 14.3987),
  ('naxxar', 'Naxxar', 'In-Naxxar', 'malta', 'Northern', 'city', false, false,
   'Historic village with a growing luxury development scene.',
   'Naxxar is a charming village in the north of Malta with a rich heritage.',
   35.9137, 14.4433),
  ('marsascala', 'Marsascala', 'Wied il-Għajn', 'malta', 'South Eastern', 'city', false, false,
   'A relaxed seaside town popular with locals, offering great value seafront properties.',
   'Marsascala is a charming fishing village turned seaside town on Malta''s south-eastern coast.',
   35.8622, 14.5567),
  ('three-cities', 'Three Cities', 'Il-Kottonera', 'malta', 'Southern Harbour', 'area', true, false,
   'Gentrifying historic bastions – Vittoriosa, Senglea, Cospicua – with strong growth potential.',
   'The Three Cities – Vittoriosa (Birgu), Senglea (Isla), and Cospicua (Bormla) – are historic fortified cities across the Grand Harbour from Valletta.',
   35.8875, 14.5225),
  ('xlendi', 'Xlendi', 'Ix-Xlendi', 'gozo', 'Gozo', 'area', true, false,
   'Picturesque bay village in Gozo, known for seafront apartments and diving culture.',
   'Xlendi is a stunning inlet on the southern coast of Gozo, surrounded by dramatic cliffs and crystal-clear waters.',
   36.0281, 14.2155),
  ('gharghur', 'Għargħur', 'Ħal Għargħur', 'malta', 'Northern', 'village', false, false,
   'Quiet hilltop village with breathtaking views and a growing luxury villa market.',
   'Għargħur is a quiet, elevated village offering panoramic views of the island.',
   35.9226, 14.4524)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 9. SEED: LOCATION STATS
-- ============================================================
INSERT INTO location_stats (location_id, listings_sale_count, listings_rent_count, median_price_sale, median_price_rent, avg_price_sale, avg_price_rent)
SELECT id, 
  CASE slug
    WHEN 'sliema' THEN 245 WHEN 'st-julians' THEN 180 WHEN 'valletta' THEN 95
    WHEN 'mdina' THEN 12 WHEN 'mellieha' THEN 110 WHEN 'victoria' THEN 120
    WHEN 'swieqi' THEN 140 WHEN 'attard' THEN 85 WHEN 'madliena' THEN 35
    WHEN 'san-pawl-il-bahar' THEN 320 WHEN 'naxxar' THEN 75 WHEN 'marsascala' THEN 90
    WHEN 'three-cities' THEN 65 WHEN 'xlendi' THEN 40 WHEN 'gharghur' THEN 30
    ELSE 0
  END,
  CASE slug
    WHEN 'sliema' THEN 120 WHEN 'st-julians' THEN 95 WHEN 'valletta' THEN 42
    WHEN 'mdina' THEN 5 WHEN 'mellieha' THEN 45 WHEN 'victoria' THEN 65
    WHEN 'swieqi' THEN 80 WHEN 'attard' THEN 30 WHEN 'madliena' THEN 10
    WHEN 'san-pawl-il-bahar' THEN 180 WHEN 'naxxar' THEN 25 WHEN 'marsascala' THEN 55
    WHEN 'three-cities' THEN 40 WHEN 'xlendi' THEN 25 WHEN 'gharghur' THEN 8
    ELSE 0
  END,
  CASE slug
    WHEN 'sliema' THEN 1850000 WHEN 'st-julians' THEN 2400000 WHEN 'valletta' THEN 1800000
    WHEN 'mdina' THEN 4500000 WHEN 'mellieha' THEN 2100000 WHEN 'victoria' THEN 850000
    WHEN 'swieqi' THEN 680000 WHEN 'attard' THEN 1200000 WHEN 'madliena' THEN 3500000
    WHEN 'san-pawl-il-bahar' THEN 280000 WHEN 'naxxar' THEN 520000 WHEN 'marsascala' THEN 320000
    WHEN 'three-cities' THEN 650000 WHEN 'xlendi' THEN 380000 WHEN 'gharghur' THEN 980000
    ELSE NULL
  END,
  CASE slug
    WHEN 'sliema' THEN 3500 WHEN 'st-julians' THEN 4500 WHEN 'valletta' THEN 3200
    WHEN 'mdina' THEN 8000 WHEN 'mellieha' THEN 3800 WHEN 'victoria' THEN 1800
    WHEN 'swieqi' THEN 1800 WHEN 'attard' THEN 2800 WHEN 'madliena' THEN 5500
    WHEN 'san-pawl-il-bahar' THEN 1100 WHEN 'naxxar' THEN 1400 WHEN 'marsascala' THEN 950
    WHEN 'three-cities' THEN 1600 WHEN 'xlendi' THEN 1200 WHEN 'gharghur' THEN 2200
    ELSE NULL
  END,
  CASE slug
    WHEN 'sliema' THEN 2100000 WHEN 'st-julians' THEN 2800000 WHEN 'valletta' THEN 2200000
    WHEN 'mdina' THEN 5200000 WHEN 'mellieha' THEN 2450000 WHEN 'victoria' THEN 980000
    WHEN 'swieqi' THEN 750000 WHEN 'attard' THEN 1450000 WHEN 'madliena' THEN 4200000
    WHEN 'san-pawl-il-bahar' THEN 350000 WHEN 'naxxar' THEN 620000 WHEN 'marsascala' THEN 380000
    WHEN 'three-cities' THEN 780000 WHEN 'xlendi' THEN 420000 WHEN 'gharghur' THEN 1150000
    ELSE NULL
  END,
  CASE slug
    WHEN 'sliema' THEN 4200 WHEN 'st-julians' THEN 5200 WHEN 'valletta' THEN 3800
    WHEN 'mdina' THEN 9500 WHEN 'mellieha' THEN 4500 WHEN 'victoria' THEN 2200
    WHEN 'swieqi' THEN 2100 WHEN 'attard' THEN 3200 WHEN 'madliena' THEN 6500
    WHEN 'san-pawl-il-bahar' THEN 1300 WHEN 'naxxar' THEN 1600 WHEN 'marsascala' THEN 1100
    WHEN 'three-cities' THEN 1900 WHEN 'xlendi' THEN 1400 WHEN 'gharghur' THEN 2500
    ELSE NULL
  END
FROM locations
ON CONFLICT (location_id) DO NOTHING;

-- ============================================================
-- Done! Your schema is ready.
-- Next: Import properties via POST /api/import/properties
-- ============================================================
