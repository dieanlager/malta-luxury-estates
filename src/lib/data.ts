import type { Location, LocationStats, Property, Article } from '../types';
import { PROPERTIES, ARTICLES } from '../constants';
import { supabase, isSupabaseConfigured } from './supabase';

// ============================================================
// DUAL-MODE DATA LAYER
// When Supabase is configured → queries real DB
// When not configured → falls back to mock data in constants.ts
// This lets you develop locally without Supabase setup
// ============================================================

// --- Location Data ---

export const LOCATIONS: Location[] = [
  { id: 1, slug: 'sliema', nameEn: 'Sliema', nameMt: 'Tas-Sliema', island: 'malta', region: 'Northern Harbour', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'Seafront lifestyle hub with modern apartments, penthouses and a vibrant promenade.', longIntro: 'Sliema is Malta\'s prime seafront residential hub, known for luxury apartments, high-rise penthouses and a bustling promenade lined with shops and restaurants. Its central location and sea views make it one of the most sought-after areas for both international buyers and long-term renters. Key developments include Tigné Point, Fort Cambridge and The Strand.', marketHighlights: ['SDA projects like Tigné Point & Fort Cambridge', 'Highest liquidity in Malta property market', 'Prime seafront rental yields up to 5%'], lifestyleTags: ['Cosmopolitan', 'Seafront', 'Shopping Hub'] },
  { id: 2, slug: 'st-julians', nameEn: "St. Julian's", nameMt: "San Ġiljan", island: 'malta', region: 'Northern Harbour', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'Entertainment and luxury living around Spinola Bay and Portomaso Marina.', longIntro: "St. Julian's combines seafront living with Malta's main entertainment district in Paceville. Five-star hotels, marinas and high-end apartment complexes make it ideal for investors targeting premium rentals and holiday lets.", marketHighlights: ['Portomaso Marina exclusivity', 'Balluta & Spinola Bay demand', 'High occupancy for short-let investments'], lifestyleTags: ['Nightlife', 'Maritime', 'Bustling'] },
  { id: 3, slug: 'valletta', nameEn: 'Valletta', nameMt: 'Il-Belt Valletta', island: 'malta', region: 'Southern Harbour', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'UNESCO-listed capital with historic palazzos and panoramic harbour views.', longIntro: 'Valletta is Malta\'s UNESCO-listed capital, characterised by baroque palazzos, narrow streets and dramatic harbour views.', marketHighlights: ['UNESCO World Heritage status protection', 'Finite supply of historic boutique assets', 'Zero stamp duty for UCA property buyers'], lifestyleTags: ['Boutique', 'Historic', 'Culture'] },
  { id: 4, slug: 'mdina', nameEn: 'Mdina', nameMt: 'L-Imdina', island: 'malta', region: 'Western', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'The "Silent City", offering exclusive historic noble residences.', longIntro: 'Mdina, Malta\'s ancient capital, is a fortified medieval city perched on a hilltop.', marketHighlights: ['Most prestigious residential address', 'Stable long-term capital preservation', 'Collection-grade palazzo assets'], lifestyleTags: ['Noble', 'Tranquil', 'Prestige'] },
  { id: 5, slug: 'mellieha', nameEn: 'Mellieħa', nameMt: 'Il-Mellieħa', island: 'malta', region: 'Northern', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'Famous for stunning villas overlooking the northern bays.', longIntro: 'Mellieħa is a picturesque village in the north of Malta, renowned for its beautiful sandy beaches and high-end villa developments.', marketHighlights: ['Best villa rental yields for summer season', 'Santa Maria Estate high-end enclave', 'Lower price per sqm than North Harbour'], lifestyleTags: ['Beachfront', 'Villa Living', 'Northern Retreat'] },
  { id: 6, slug: 'victoria', nameEn: 'Victoria', nameMt: 'Ir-Rabat Għawdex', island: 'gozo', region: 'Gozo', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'The heart of Gozo, offering charming farmhouses and luxury retreats.', longIntro: 'Victoria (also known as Rabat) is the capital of Gozo.' },
  { id: 7, slug: 'swieqi', nameEn: 'Swieqi', nameMt: 'Is-Swieqi', island: 'malta', region: 'Northern Harbour', locationType: 'city', isPopular: true, isLuxuryHub: false, shortDesc: 'Upscale residential suburb near international schools.', longIntro: 'Swieqi is a modern residential suburb located on the ridge between St. Julian\'s and Madliena.' },
  { id: 8, slug: 'attard', nameEn: 'Attard', nameMt: 'Ħ\'Attard', island: 'malta', region: 'Central', locationType: 'city', isPopular: true, isLuxuryHub: false, shortDesc: 'Prestigious village with the presidential palace.', longIntro: 'Attard is one of Malta\'s most desirable residential areas, home to the Presidential Palace at San Anton Gardens.' },
  { id: 9, slug: 'madliena', nameEn: 'Madliena', nameMt: 'Il-Madliena', island: 'malta', region: 'Northern', locationType: 'area', isPopular: true, isLuxuryHub: true, shortDesc: 'Exclusive hilltop enclave with premium villas.', longIntro: 'Madliena is an exclusive residential area perched on the hills above Swieqi.', marketHighlights: ['Malta\'s answer to "Beverly Hills"', 'Strict building height restrictions', 'Panoramic northern coastline views'], lifestyleTags: ['Suburban', 'Upscale', 'Hilltop'] },
  { id: 10, slug: 'san-pawl-il-bahar', nameEn: "St. Paul's Bay", nameMt: "San Pawl il-Baħar", island: 'malta', region: 'Northern', locationType: 'city', isPopular: true, isLuxuryHub: false, shortDesc: 'Affordable seafront living with strong rental yields.', longIntro: "St. Paul's Bay encompasses the popular tourist areas of Qawra and Buġibba." },
  { id: 11, slug: 'naxxar', nameEn: 'Naxxar', nameMt: 'In-Naxxar', island: 'malta', region: 'Northern', locationType: 'city', isPopular: false, isLuxuryHub: false, shortDesc: 'Historic village with a growing development scene.', longIntro: 'Naxxar is a charming village in the north of Malta with a rich heritage.' },
  { id: 12, slug: 'marsascala', nameEn: 'Marsascala', nameMt: 'Wied il-Għajn', island: 'malta', region: 'South Eastern', locationType: 'city', isPopular: false, isLuxuryHub: false, shortDesc: 'Relaxed seaside town with great value properties.', longIntro: 'Marsascala is a charming fishing village turned seaside town.' },
  { id: 13, slug: 'three-cities', nameEn: 'Three Cities', nameMt: 'Il-Kottonera', island: 'malta', region: 'Southern Harbour', locationType: 'area', isPopular: true, isLuxuryHub: false, shortDesc: 'Gentrifying historic bastions with strong growth potential.', longIntro: 'The Three Cities – Vittoriosa, Senglea, and Cospicua – are historic fortified cities across the Grand Harbour from Valletta.' },
  { id: 14, slug: 'xlendi', nameEn: 'Xlendi', nameMt: 'Ix-Xlendi', island: 'gozo', region: 'Gozo', locationType: 'area', isPopular: true, isLuxuryHub: false, shortDesc: 'Picturesque bay village in Gozo.', longIntro: 'Xlendi is a stunning inlet on the southern coast of Gozo.' },
  { id: 15, slug: 'gharghur', nameEn: 'Għargħur', nameMt: 'Ħal Għargħur', island: 'malta', region: 'Northern', locationType: 'village', isPopular: false, isLuxuryHub: false, shortDesc: 'Quiet hilltop village with breathtaking views.', longIntro: 'Għargħur is a quiet, elevated village offering panoramic views.' }
];

export const LOCATION_STATS: Record<number, LocationStats> = {
  1: { locationId: 1, listingsSaleCount: 245, listingsRentCount: 120, medianPriceSale: 1850000, medianPriceRent: 3500, avgPriceSale: 2100000, avgPriceRent: 4200, lastCalculatedAt: new Date().toISOString() },
  2: { locationId: 2, listingsSaleCount: 180, listingsRentCount: 95, medianPriceSale: 2400000, medianPriceRent: 4500, avgPriceSale: 2800000, avgPriceRent: 5200, lastCalculatedAt: new Date().toISOString() },
  3: { locationId: 3, listingsSaleCount: 95, listingsRentCount: 42, medianPriceSale: 1800000, medianPriceRent: 3200, avgPriceSale: 2200000, avgPriceRent: 3800, lastCalculatedAt: new Date().toISOString() },
  4: { locationId: 4, listingsSaleCount: 12, listingsRentCount: 5, medianPriceSale: 4500000, medianPriceRent: 8000, avgPriceSale: 5200000, avgPriceRent: 9500, lastCalculatedAt: new Date().toISOString() },
  5: { locationId: 5, listingsSaleCount: 110, listingsRentCount: 45, medianPriceSale: 2100000, medianPriceRent: 3800, avgPriceSale: 2450000, avgPriceRent: 4500, lastCalculatedAt: new Date().toISOString() },
  6: { locationId: 6, listingsSaleCount: 120, listingsRentCount: 65, medianPriceSale: 850000, medianPriceRent: 1800, avgPriceSale: 980000, avgPriceRent: 2200, lastCalculatedAt: new Date().toISOString() },
  7: { locationId: 7, listingsSaleCount: 140, listingsRentCount: 80, medianPriceSale: 680000, medianPriceRent: 1800, avgPriceSale: 750000, avgPriceRent: 2100, lastCalculatedAt: new Date().toISOString() },
  8: { locationId: 8, listingsSaleCount: 85, listingsRentCount: 30, medianPriceSale: 1200000, medianPriceRent: 2800, avgPriceSale: 1450000, avgPriceRent: 3200, lastCalculatedAt: new Date().toISOString() },
  9: { locationId: 9, listingsSaleCount: 35, listingsRentCount: 10, medianPriceSale: 3500000, medianPriceRent: 5500, avgPriceSale: 4200000, avgPriceRent: 6500, lastCalculatedAt: new Date().toISOString() },
  10: { locationId: 10, listingsSaleCount: 320, listingsRentCount: 180, medianPriceSale: 280000, medianPriceRent: 1100, avgPriceSale: 350000, avgPriceRent: 1300, lastCalculatedAt: new Date().toISOString() },
  11: { locationId: 11, listingsSaleCount: 75, listingsRentCount: 25, medianPriceSale: 520000, medianPriceRent: 1400, avgPriceSale: 620000, avgPriceRent: 1600, lastCalculatedAt: new Date().toISOString() },
  12: { locationId: 12, listingsSaleCount: 90, listingsRentCount: 55, medianPriceSale: 320000, medianPriceRent: 950, avgPriceSale: 380000, avgPriceRent: 1100, lastCalculatedAt: new Date().toISOString() },
  13: { locationId: 13, listingsSaleCount: 65, listingsRentCount: 40, medianPriceSale: 650000, medianPriceRent: 1600, avgPriceSale: 780000, avgPriceRent: 1900, lastCalculatedAt: new Date().toISOString() },
  14: { locationId: 14, listingsSaleCount: 40, listingsRentCount: 25, medianPriceSale: 380000, medianPriceRent: 1200, avgPriceSale: 420000, avgPriceRent: 1400, lastCalculatedAt: new Date().toISOString() },
  15: { locationId: 15, listingsSaleCount: 30, listingsRentCount: 8, medianPriceSale: 980000, medianPriceRent: 2200, avgPriceSale: 1150000, avgPriceRent: 2500, lastCalculatedAt: new Date().toISOString() }
};

// --- Mappers: Supabase row → App type ---

function mapLocation(row: any): Location {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.name_en,
    nameMt: row.name_mt,
    island: row.island,
    region: row.region,
    locationType: row.location_type,
    isPopular: row.is_popular,
    isLuxuryHub: row.is_luxury_hub,
    shortDesc: row.short_desc,
    longIntro: row.long_intro,
    marketHighlights: row.market_highlights || [],
    lifestyleTags: row.lifestyle_tags || [],
  };
}

function mapLocationStats(row: any): LocationStats {
  return {
    locationId: row.location_id,
    listingsSaleCount: row.listings_sale_count,
    listingsRentCount: row.listings_rent_count,
    medianPriceSale: row.median_price_sale,
    medianPriceRent: row.median_price_rent,
    avgPriceSale: row.avg_price_sale,
    avgPriceRent: row.avg_price_rent,
    lastCalculatedAt: row.last_calculated_at,
  };
}

function mapProperty(row: any): Property {
  return {
    id: row.id,
    title: row.title,
    locationName: row.locations ? `${row.locations.name_en}, Malta` : '',
    locationId: row.location_id,
    price: row.price,
    beds: row.bedrooms,
    baths: row.bathrooms,
    sqm: row.area_sqm,
    images: row.images || [],
    type: row.listing_type,
    propertyType: row.property_type,
    isSeafront: row.is_seafront,
    description: row.description,
    features: row.features || [],
    tags: row.tags || [],
    agency: row.agency_name ? { name: row.agency_name, logo: row.agency_logo || '' } : undefined,
  };
}

// --- Config ---

export const PROPERTY_TYPES = [
  { slug: 'apartments', label: 'Apartments', description: 'Modern flats and luxury seafront units.' },
  { slug: 'villas', label: 'Villas', description: 'Detached homes with private pools and gardens.' },
  { slug: 'penthouses', label: 'Penthouses', description: 'Top-floor residences with panoramic views.' },
  { slug: 'houses-of-character', label: 'Houses of Character', description: 'Traditional homes with historic features.' },
  { slug: 'maisonettes', label: 'Maisonettes', description: 'Multi-level units with private entrances.' },
  { slug: 'palazzos', label: 'Palazzos', description: 'Grand historic residences of noble origin.' }
];

export const PRICE_FILTERS = [
  { slug: 'under-500k', label: 'Under €500k', min: 0, max: 500000 },
  { slug: 'under-1m', label: 'Under €1M', min: 0, max: 1000000 },
  { slug: '500k-1m', label: '€500k – €1M', min: 500000, max: 1000000 },
  { slug: 'over-1m', label: 'Over €1M', min: 1000000, max: Infinity },
  { slug: 'over-3m', label: 'Over €3M', min: 3000000, max: Infinity },
];

export const FEATURE_FILTERS = [
  { slug: 'sea-view', label: 'Sea View' },
  { slug: 'with-pool', label: 'With Pool' },
  { slug: 'new-build', label: 'New Build' },
  { slug: 'furnished', label: 'Furnished' },
];

export const ALL_FILTER_SLUGS = [
  ...PROPERTY_TYPES.map(t => t.slug),
  ...PRICE_FILTERS.map(p => p.slug),
  ...FEATURE_FILTERS.map(f => f.slug),
];

// --- Dynamic type map for DB queries ---
const PROPERTY_TYPE_MAP: Record<string, string> = {
  apartments: 'Apartment',
  villas: 'Villa',
  penthouses: 'Penthouse',
  'houses-of-character': 'House of Character',
  maisonettes: 'Maisonette',
  palazzos: 'Palazzo',
};

// ============================================================
// DATA FUNCTIONS – Supabase-first with mock fallback
// ============================================================

export const getLocationBySlug = async (slug: string): Promise<Location | undefined> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('slug', slug)
      .single();
    if (data && !error) return mapLocation(data);
  }
  // Fallback to mock
  return LOCATIONS.find(l => l.slug === slug);
};

export const getLocationStats = async (id: number): Promise<LocationStats | null> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('location_stats')
      .select('*')
      .eq('location_id', id)
      .single();
    if (data && !error) return mapLocationStats(data);
  }
  return LOCATION_STATS[id] || null;
};

export const getCityPropertyTypes = async (_id: number) => {
  return PROPERTY_TYPES;
};

export const getPropertiesByLocation = async (locationId: number): Promise<Property[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('properties')
      .select('*, locations(name_en, slug)')
      .eq('location_id', locationId)
      .eq('status', 'active')
      .order('is_luxury_tag', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(24);
    if (data && !error) return data.map(mapProperty);
  }
  return PROPERTIES.filter(p => p.locationId === locationId);
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('properties')
      .select('*, locations(name_en, slug)')
      .eq('id', id)
      .single();
    if (data && !error) return mapProperty(data);
  }
  return PROPERTIES.find(p => p.id === id);
};

// ============================================================
// CORE PSEO FUNCTION – filterMap with Supabase
// This is the heart of programmatic SEO:
//   One URL slug → one SQL query → one unique page
// ============================================================

export const getFilteredProperties = async (
  locationId: number,
  filterSlug: string
): Promise<Property[]> => {
  // --- SUPABASE PATH ---
  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('properties')
      .select('*, locations(name_en, slug)')
      .eq('location_id', locationId)
      .eq('status', 'active');

    // Dynamic filter map: slug → SQL conditions
    // This is what makes pSEO work at scale
    const filterMap: Record<string, () => void> = {
      'under-500k': () => { query = query.lt('price', 500000); },
      'under-1m': () => { query = query.lt('price', 1000000); },
      '500k-1m': () => { query = query.gte('price', 500000).lt('price', 1000000); },
      'over-1m': () => { query = query.gte('price', 1000000); },
      'over-3m': () => { query = query.gte('price', 3000000); },
      'sea-view': () => { query = query.eq('has_sea_view', true); },
      'with-pool': () => { query = query.eq('has_pool', true); },
      'new-build': () => { query = query.eq('is_new_build', true); },
      'furnished': () => { query = query.eq('is_furnished', true); },
      'for-sale': () => { query = query.eq('listing_type', 'sale'); },
      'for-rent': () => { query = query.eq('listing_type', 'rent'); },
      'apartments': () => { query = query.eq('property_type', 'Apartment'); },
      'villas': () => { query = query.eq('property_type', 'Villa'); },
      'penthouses': () => { query = query.eq('property_type', 'Penthouse'); },
      'houses-of-character': () => { query = query.eq('property_type', 'House of Character'); },
      'maisonettes': () => { query = query.eq('property_type', 'Maisonette'); },
      'palazzos': () => { query = query.eq('property_type', 'Palazzo'); },
      '3-bed-plus': () => { query = query.gte('bedrooms', 3); },
    };

    if (filterMap[filterSlug]) {
      filterMap[filterSlug]();
    }

    const { data, error } = await query
      .order('is_luxury_tag', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(24);

    if (data && !error) return data.map(mapProperty);
  }

  // --- MOCK FALLBACK ---
  const allProps = PROPERTIES.filter(p => p.locationId === locationId);

  const priceFilter = PRICE_FILTERS.find(f => f.slug === filterSlug);
  if (priceFilter) return allProps.filter(p => p.price >= priceFilter.min && p.price < priceFilter.max);

  const typeFilter = PROPERTY_TYPES.find(t => t.slug === filterSlug);
  if (typeFilter && PROPERTY_TYPE_MAP[filterSlug]) {
    return allProps.filter(p => p.propertyType === PROPERTY_TYPE_MAP[filterSlug]);
  }

  if (filterSlug === 'sea-view') return allProps.filter(p => p.isSeafront);
  if (filterSlug === 'with-pool') return allProps.filter(p => p.features.some(f => f.toLowerCase().includes('pool')));
  if (filterSlug === 'new-build') return allProps.filter(p => p.tags?.includes('New Build') || p.tags?.includes('New'));
  if (filterSlug === 'furnished') return allProps.filter(p => p.features.some(f => f.toLowerCase().includes('furnished')));

  return allProps;
};

// --- Articles ---

export const getArticles = async (): Promise<Article[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (data && !error) {
      return (data as any[]).map((row: any) => ({
        slug: row.slug,
        title: row.title,
        category: row.category as Article['category'],
        excerpt: row.excerpt,
        content: row.content,
        image: row.image,
        date: row.date,
        readTime: row.read_time,
      }));
    }
  }
  return ARTICLES;
};

export const getArticleBySlug = async (slug: string): Promise<Article | undefined> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();
    if (data && !error) {
      const row = data as any;
      return {
        slug: row.slug,
        title: row.title,
        category: row.category as Article['category'],
        excerpt: row.excerpt,
        content: row.content,
        image: row.image,
        date: row.date,
        readTime: row.read_time,
      };
    }
  }
  return ARTICLES.find(a => a.slug === slug);
};

export const getArticlesByCategory = async (category: Article['category']): Promise<Article[]> => {
  const all = await getArticles();
  return all.filter(a => a.category === category);
};

// --- Utility ---

export const getFilterLabel = (filterSlug: string): string => {
  const labels: Record<string, string> = {
    'under-500k': 'Under €500k', 'under-1m': 'Under €1M', '500k-1m': '€500k – €1M',
    'over-1m': 'Over €1M', 'over-3m': 'Over €3M',
    'sea-view': 'Sea View', 'with-pool': 'With Pool', 'new-build': 'New Build', 'furnished': 'Furnished',
    'for-sale': 'For Sale', 'for-rent': 'For Rent', '3-bed-plus': '3+ Bedrooms',
    apartments: 'Apartments', villas: 'Villas', penthouses: 'Penthouses',
    'houses-of-character': 'Houses of Character', maisonettes: 'Maisonettes', palazzos: 'Palazzos',
  };
  return labels[filterSlug] || filterSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getAllLocations = (): Location[] => LOCATIONS;
export const getPopularLocations = (): Location[] => LOCATIONS.filter(l => l.isPopular);
