-- ============================================================
-- Malta Luxury Estates - Run in Supabase SQL Editor
-- ============================================================

-- 1. Add affiliate_url column to properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS affiliate_url TEXT;

-- 2. Insert Property 1: Portomaso St Julian's (SAPT1119672)
INSERT INTO public.properties (
  title, slug, location_text, property_type,
  bedrooms, bathrooms, area_sqm, floor_no,
  price, listing_type, status,
  has_pool, is_seafront,
  features, description, images, external_ref, affiliate_url
) VALUES (
  '2 Bedroom Apartment – Portomaso, St Julian''s',
  '2-bedroom-apartment-portomaso-st-julians',
  'St Julian''s, Malta',
  'Apartment',
  2, 1, 117, '8th',
  840000, 'sale', 'active',
  TRUE, FALSE,
  '["Portomaso Marina Views","8th Floor","Zaha Hadid Design","Swimming Pool","Spa","Gym","Concierge","Fitness Centre","Shopping Mall"]'::jsonb,
  'An exceptional two-bedroom apartment on the 8th floor of one of the most sought-after developments in Malta. Enjoy unobstructed views of the Portomaso marina and Sliema promenade all the way to Gozo. Designed by world-renowned architect Zaha Hadid, this development offers luxury hotel-style facilities including a swimming pool, spa, concierge service, fitness centre and shopping mall – making it the ultimate rental investment or primary residence.',
  ARRAY[
    'https://cdn.reapcrm.com/media/rk2gh5.0osf/images/ClientImages/Alliance/propertyImages/fbddb8ee-05a3-4639-ae7c-5b8ced68b92a.jpg',
    'https://cdn.reapcrm.com/media/rk2gh5.0osf/images/ClientImages/Alliance/propertyImages/c1bad40b-a78b-4da1-9418-9ceb003cb3ea.jpg',
    'https://cdn.reapcrm.com/media/rk2gh5.0osf/images/ClientImages/Alliance/propertyImages/d2aeff80-5367-49fb-942a-b862d14e5b58.jpg',
    'https://cdn.reapcrm.com/media/rk2gh5.0osf/images/ClientImages/Alliance/propertyImages/ded4b8d4-0953-4655-824f-4227f58e7b39.jpg',
    'https://cdn.reapcrm.com/media/rk2gh5.0osf/images/ClientImages/Alliance/propertyImages/89b41316-a112-49d9-b728-3d25fcacbdc1.jpg',
    'https://cdn.reapcrm.com/media/rk2gh5.0osf/images/ClientImages/Alliance/propertyImages/6a8711dc-e52e-4998-9838-17d30528190c.jpg',
    'https://cdn.reapcrm.com/media/rk2gh5.0osf/images/ClientImages/Alliance/propertyImages/17645177-6829-413a-a0c9-305a2cfb6d81.jpg',
    'https://cdn.reapcrm.com/media/rk2gh5.0osf/images/ClientImages/Alliance/propertyImages/b47d8fd4-42c5-4c03-b713-7f673de582b0.jpg'
  ],
  'SAPT1119672',
  'https://alliance.mt/property/2-bedroom-apartment-st-julian-s-san-giljan-sapt1119672/?aid=ANIKIE'
)
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Property 2: Fort Cambridge, Sliema
INSERT INTO public.properties (
  title, slug, location_text, property_type,
  bedrooms, bathrooms, area_sqm,
  price, listing_type, status,
  has_pool, is_seafront,
  features, description, images, external_ref, affiliate_url
) VALUES (
  '3 Bedroom Apartment – Fort Cambridge, Sliema',
  '3-bedroom-apartment-fort-cambridge-sliema',
  'Sliema, Malta',
  'Apartment',
  3, 2, 195,
  1460000, 'sale', 'active',
  TRUE, TRUE,
  '["Direct Sea Views","24/7 Concierge & Security","Communal Outdoor Pool","Indoor Pool","Gym","Spa Centre","Underground Parking","Luxury Finishes"]'::jsonb,
  'A prestigious three-bedroom apartment within the iconic Fort Cambridge development – one of Malta''s most acclaimed luxury residential complexes, built within historic British barracks dating to the 1880s. Set on Sliema''s prime seafront, this exceptional residence commands breathtaking sea views across the Mediterranean. Residents enjoy 24/7 concierge and security, exclusive communal and indoor pools, a fully-equipped gym and spa centre. Fort Cambridge represents the pinnacle of Maltese luxury living.',
  ARRAY[
    'https://cdn.reapcrm.com/media/rk2gh5.0osf/images/ClientImages/Alliance/propertyImages/fbddb8ee-05a3-4639-ae7c-5b8ced68b92a.jpg'
  ],
  'FORT-CAMBRIDGE-SLIEMA-1460K',
  'https://alliance.mt/property-list/?refNumber=SAPT642329&aid=PAVBRA'
)
ON CONFLICT (slug) DO NOTHING;

-- 4. Verify
SELECT id, title, price, status, affiliate_url FROM public.properties ORDER BY created_at DESC;
