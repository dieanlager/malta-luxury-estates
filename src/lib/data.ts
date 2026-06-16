import type { Location, LocationStats, Property, Article } from '../types';
import { PROPERTIES, ARTICLES } from '../constants';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  loadAllArticles,
  loadArticle,
  resolveArticleLang,
} from './markdown-server';

// ============================================================
// DUAL-MODE DATA LAYER
// ============================================================

export const LOCATIONS: Location[] = [
  { id: 1, slug: 'sliema', nameEn: 'Sliema', nameMt: 'Tas-Sliema', island: 'malta', region: 'Northern Harbour', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'Seafront lifestyle hub.', lifestyleTags: ['Cosmopolitan', 'Seafront'] },
  { id: 2, slug: 'st-julians', nameEn: "St. Julian's", nameMt: "San Giljan", island: 'malta', region: 'Northern Harbour', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'Entertainment and luxury.', lifestyleTags: ['Nightlife', 'Maritime'] },
  { id: 3, slug: 'valletta', nameEn: 'Valletta', nameMt: 'Il-Belt Valletta', island: 'malta', region: 'Southern Harbour', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'UNESCO-listed capital.', lifestyleTags: ['Boutique', 'Historic'] },
  { id: 4, slug: 'mdina', nameEn: 'Mdina', nameMt: 'L-Imdina', island: 'malta', region: 'Western', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'The Silent City.', lifestyleTags: ['Noble', 'Tranquil'] },
  { id: 5, slug: 'mellieha', nameEn: 'Mellieha', nameMt: 'Il-Mellieha', island: 'malta', region: 'Northern', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'Stunning villas.', lifestyleTags: ['Beachfront', 'Villa Living'] },
  { id: 6, slug: 'victoria', nameEn: 'Victoria', nameMt: 'Ir-Rabat', island: 'gozo', region: 'Gozo', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'Heart of Gozo.' },
  { id: 7, slug: 'swieqi', nameEn: 'Swieqi', nameMt: 'Is-Swieqi', island: 'malta', region: 'Northern Harbour', locationType: 'city', isPopular: true },
  { id: 8, slug: 'attard', nameEn: 'Attard', nameMt: "H'Attard", island: 'malta', region: 'Central', locationType: 'city', isPopular: true },
  { id: 9, slug: 'madliena', nameEn: 'Madliena', nameMt: 'Il-Madliena', island: 'malta', region: 'Northern', locationType: 'area', isPopular: true, isLuxuryHub: true },
  { id: 10, slug: 'san-pawl-il-bahar', nameEn: "St. Paul's Bay", nameMt: "San Pawl il-Bahar", island: 'malta', region: 'Northern', locationType: 'city', isPopular: true },
  { id: 11, slug: 'naxxar', nameEn: 'Naxxar', nameMt: 'In-Naxxar', island: 'malta', region: 'Northern', locationType: 'city' },
  { id: 12, slug: 'marsascala', nameEn: 'Marsascala', nameMt: 'Wied il-Ghajn', island: 'malta', region: 'South Eastern', locationType: 'city' },
  { id: 13, slug: 'three-cities', nameEn: 'Three Cities', nameMt: 'Il-Kottonera', island: 'malta', region: 'Southern Harbour', locationType: 'area', isPopular: true },
  { id: 14, slug: 'xlendi', nameEn: 'Xlendi', nameMt: 'Ix-Xlendi', island: 'gozo', region: 'Gozo', locationType: 'area', isPopular: true },
  { id: 15, slug: 'gharghur', nameEn: 'Gharghur', nameMt: 'Hal Gharghur', island: 'malta', region: 'Northern', locationType: 'village' },
  { id: 16, slug: 'gzira', nameEn: 'G¿ira', island: 'malta', region: 'Northern Harbour', locationType: 'city' },
  { id: 17, slug: 'msida', nameEn: 'Msida', island: 'malta', region: 'Northern Harbour', locationType: 'city' },
  { id: 18, slug: 'pembroke', nameEn: 'Pembroke', island: 'malta', region: 'Northern Harbour', locationType: 'city' },
  { id: 19, slug: 'san-gwann', nameEn: 'San Gwann', island: 'malta', region: 'Northern Harbour', locationType: 'city' },
  { id: 20, slug: 'mosta', nameEn: 'Mosta', island: 'malta', region: 'Northern', locationType: 'city' },
  { id: 21, slug: 'rabat', nameEn: 'Rabat', island: 'malta', region: 'Western', locationType: 'city' },
  { id: 22, slug: 'marsaxlokk', nameEn: 'Marsaxlokk', island: 'malta', region: 'South Eastern', locationType: 'village' },
  { id: 23, slug: 'zejtun', nameEn: '¯ejtun', island: 'malta', region: 'South Eastern', locationType: 'city' },
  { id: 24, slug: 'qormi', nameEn: 'Qormi', island: 'malta', region: 'Northern Harbour', locationType: 'city' },
  { id: 25, slug: 'zebbug', nameEn: '¯ebbug', island: 'malta', region: 'Western', locationType: 'city' },
  { id: 26, slug: 'siggiewi', nameEn: 'Siggiewi', island: 'malta', region: 'Western', locationType: 'city' },
  { id: 27, slug: 'gozo-marsalforn', nameEn: 'Marsalforn', island: 'gozo', region: 'Gozo', locationType: 'area' },
  { id: 28, slug: 'gozo-nadur', nameEn: 'Nadur', island: 'gozo', region: 'Gozo', locationType: 'village' },
  { id: 29, slug: 'gozo-xaghra', nameEn: 'Xaghra', island: 'gozo', region: 'Gozo', locationType: 'village' },
  { id: 30, slug: 'gozo-qala', nameEn: 'Qala', island: 'gozo', region: 'Gozo', locationType: 'village' },
];

export const ALL_LOCALITIES = [
  "Sliema", "St. Julian's", "Valletta", "Mdina", "Mellieha", "Senglea", "Cospicua", "Vittoriosa",
  "G¿ira", "Msida", "Swieqi", "Pembroke", "San Gwann", "St. Paul's Bay", "Qawra", "Bugibba",
  "Naxxar", "Gharghur", "Madliena", "Iklin", "Lija", "Balzan", "Attard", "Mosta", "Rabat",
  "Marsaxlokk", "Marsascala", "Bir¿ebbuga", "¯ejtun", "Qormi", "¯ebbug", "Siggiewi",
  "Dingli", "Mgarr", "Bahrija", "¯urrieq", "Qrendi", "Mqabba", "Kirkop", "Safi", "Luqa", "Gudja",
  "Ghaxaq", "Tarxien", "Paola", "Fgura", "Santa Lucija", "Kalkara", "Xghajra", "Floriana",
  "Gozo – Victoria", "Gozo – Xlendi", "Gozo – Marsalforn", "Gozo – Nadur", "Gozo – Xaghra",
  "Gozo – Ghajnsielem", "Gozo – Qala", "Gozo – Sannat", "Gozo – Munxar", "Gozo – ¯ebbug",
  "Gozo – Gharb", "Gozo – Ghasri", "Gozo – San Lawrenz",
];

export const LOCATION_STATS: Record<number, LocationStats> = {
  1: { locationId: 1, listingsSaleCount: 245, listingsRentCount: 120, medianPriceSale: 1850000, medianPriceRent: 3500, avgPriceSale: 2100000, avgPriceRent: 4200, lastCalculatedAt: new Date().toISOString() },
  2: { locationId: 2, listingsSaleCount: 180, listingsRentCount: 95, medianPriceSale: 2400000, medianPriceRent: 4500, avgPriceSale: 2800000, avgPriceRent: 5200, lastCalculatedAt: new Date().toISOString() },
  3: { locationId: 3, listingsSaleCount: 95, listingsRentCount: 42, medianPriceSale: 1800000, medianPriceRent: 3200, avgPriceSale: 2200000, avgPriceRent: 3800, lastCalculatedAt: new Date().toISOString() },
  5: { locationId: 5, listingsSaleCount: 110, listingsRentCount: 45, medianPriceSale: 2100000, medianPriceRent: 3800, avgPriceSale: 2450000, avgPriceRent: 4500, lastCalculatedAt: new Date().toISOString() },
};

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
  const affiliateMatch = (row.description as string | null)?.match(/^\[AFFILIATE_URL:(https?:\/\/[^\]]+)\]\n?/);
  let cleanDesc = affiliateMatch ? row.description.replace(affiliateMatch[0], '') : row.description;
  const featuresMatch = (cleanDesc as string | null)?.match(/\[FEATURES:([^\]]+)\]\n?/);
  let extractedFeatures: string[] = row.features || [];
  if (featuresMatch) {
    extractedFeatures = featuresMatch[1].split(',').map((f: string) => f.trim()).filter(Boolean);
    cleanDesc = cleanDesc.replace(featuresMatch[0], '');
  }
  
  // Generate slug from title and location if not provided
  const generateSlug = (title: string, location: string) => {
    const combined = `${location}-${title}`;
    return combined.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };
  
  return {
    id: row.id,
    slug: row.slug || generateSlug(row.title, row.location_text || ''),
    title: row.title,
    locationName: row.location_text || '',
    locationId: row.location_id,
    price: row.price,
    beds: row.bedrooms,
    baths: row.bathrooms,
    sqm: row.area_sqm,
    images: row.images || [],
    type: row.listing_type,
    propertyType: row.property_type,
    isSeafront: row.is_seafront,
    description: cleanDesc,
    features: extractedFeatures,
    tags: row.tags || [],
    agency: row.agency_name ? { name: row.agency_name, logo: row.agency_logo || '' } : undefined,
    affiliate_url: affiliateMatch ? affiliateMatch[1] : undefined,
  };
}

export const PROPERTY_TYPES = [
  { slug: 'apartments', label: 'Apartments', description: 'Modern flats and luxury seafront units.' },
  { slug: 'villas', label: 'Villas', description: 'Detached homes with private pools and gardens.' },
  { slug: 'penthouses', label: 'Penthouses', description: 'Top-floor residences with panoramic views.' },
  { slug: 'houses-of-character', label: 'Houses of Character', description: 'Traditional homes with historic features.' },
  { slug: 'maisonettes', label: 'Maisonettes', description: 'Multi-level units with private entrances.' },
  { slug: 'palazzos', label: 'Palazzos', description: 'Grand historic residences of noble origin.' },
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

export const getLocationBySlug = async (slug: string): Promise<Location | undefined> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('slug', slug)
      .single();
    if (data && !error) return mapLocation(data);
  }
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
      .select('*')
      .eq('location_id', locationId)
      .eq('status', 'active')
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
      .select('*')
      .eq('id', id)
      .single();
    if (data && !error) return mapProperty(data);
  }
  return PROPERTIES.find(p => p.id === id);
};

export const getPropertyBySlug = async (slug: string): Promise<Property | undefined> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('slug', slug)
      .single();
    if (data && !error) return mapProperty(data);
  }
  return PROPERTIES.find(p => p.slug === slug);
};

export const getAllProperties = async (): Promise<Property[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .order('price', { ascending: false });
    if (data && !error) return data.map(mapProperty);
  }
  return PROPERTIES;
};

export const getFilteredProperties = async (
  locationId: number,
  filterSlug: string
): Promise<Property[]> => {
  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('location_id', locationId)
      .eq('status', 'active');

    const filterMap: Record<string, () => void> = {
      'under-500k': () => { query = (query as any).lt('price', 500000); },
      'under-1m': () => { query = (query as any).lt('price', 1000000); },
      '500k-1m': () => { query = (query as any).gte('price', 500000).lt('price', 1000000); },
      'over-1m': () => { query = (query as any).gte('price', 1000000); },
      'over-3m': () => { query = (query as any).gte('price', 3000000); },
      'sea-view': () => { query = (query as any).eq('is_seafront', true); },
      'with-pool': () => { query = (query as any).eq('has_pool', true); },
      'apartments': () => { query = (query as any).eq('property_type', 'Apartment'); },
      'villas': () => { query = (query as any).eq('property_type', 'Villa'); },
      'penthouses': () => { query = (query as any).eq('property_type', 'Penthouse'); },
      'houses-of-character': () => { query = (query as any).eq('property_type', 'House of Character'); },
      'maisonettes': () => { query = (query as any).eq('property_type', 'Maisonette'); },
      'palazzos': () => { query = (query as any).eq('property_type', 'Palazzo'); },
    };

    if (filterMap[filterSlug]) filterMap[filterSlug]();
    const { data, error } = await (query as any).order('created_at', { ascending: false }).limit(24);
    if (data && !error) return data.map(mapProperty);
  }

  const allProps = PROPERTIES.filter(p => p.locationId === locationId);
  const priceFilter = PRICE_FILTERS.find(f => f.slug === filterSlug);
  if (priceFilter) return allProps.filter(p => p.price >= priceFilter.min && p.price < priceFilter.max);
  if (filterSlug === 'sea-view') return allProps.filter(p => p.isSeafront);
  return allProps;
};

export const getArticles = async (lang = 'en'): Promise<Article[]> => {
  const activeLang = resolveArticleLang(lang);
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('articles').select('*').eq('published', true);
    if (data && !error && data.length > 0) return data as any;
  }
  return loadAllArticles(activeLang);
};

export const getArticleBySlug = async (slug: string, lang = 'en'): Promise<Article | undefined> => {
  const activeLang = resolveArticleLang(lang);
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('articles').select('*').eq('slug', slug).single();
    if (data && !error) return data as any;
  }
  return loadArticle(slug, activeLang) as any;
};

export const getArticlesByCategory = async (category: Article['category'], lang = 'en'): Promise<Article[]> => {
  const all = await getArticles(lang);
  return all.filter(a => a.category === category);
};

export const getFilterLabel = (filterSlug: string): string => {
  const labels: Record<string, string> = {
    'under-500k': 'Under €500k', 'under-1m': 'Under €1M', '500k-1m': '€500k – €1M',
    'over-1m': 'Over €1M', 'over-3m': 'Over €3M',
    'sea-view': 'Sea View', 'with-pool': 'With Pool', 'new-build': 'New Build', 'furnished': 'Furnished',
  };
  return labels[filterSlug] || filterSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};


export const getFeaturedProperties = async (): Promise<Property[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .eq('featured', true)
      .order('featured_position', { ascending: true })
      .limit(6);
    if (data && !error) return data.map(mapProperty);
  }
  return [];
};
export const getAllLocations = (): Location[] => LOCATIONS;
export const getPopularLocations = (): Location[] => LOCATIONS.filter(l => l.isPopular);


