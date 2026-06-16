import type { Location, LocationStats, Property, Article } from '../types';
import { PROPERTIES, ARTICLES } from '../constants';
import { supabase, isSupabaseConfigured } from './supabase';

// Static data (no Node.js deps) — safe to import from client components
export {
  LOCATIONS,
  ALL_LOCALITIES,
  LOCATION_STATS,
  PROPERTY_TYPES,
  PRICE_FILTERS,
  FEATURE_FILTERS,
  ALL_FILTER_SLUGS,
  getFilterLabel,
  getAllLocations,
  getPopularLocations,
} from './locations';

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapLocation(row: any): Location {
  return {
    id: row.id, slug: row.slug, nameEn: row.name_en, nameMt: row.name_mt,
    island: row.island, region: row.region, locationType: row.location_type,
    isPopular: row.is_popular, isLuxuryHub: row.is_luxury_hub,
    shortDesc: row.short_desc, longIntro: row.long_intro,
    marketHighlights: row.market_highlights || [], lifestyleTags: row.lifestyle_tags || [],
  };
}

function mapLocationStats(row: any): LocationStats {
  return {
    locationId: row.location_id, listingsSaleCount: row.listings_sale_count,
    listingsRentCount: row.listings_rent_count, medianPriceSale: row.median_price_sale,
    medianPriceRent: row.median_price_rent, avgPriceSale: row.avg_price_sale,
    avgPriceRent: row.avg_price_rent, lastCalculatedAt: row.last_calculated_at,
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
  const generateSlug = (title: string, location: string) =>
    `${location}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return {
    id: row.id, slug: row.slug || generateSlug(row.title, row.location_text || ''),
    title: row.title, locationName: row.location_text || '', locationId: row.location_id,
    price: row.price, beds: row.bedrooms, baths: row.bathrooms, sqm: row.area_sqm,
    images: row.images || [], type: row.listing_type, propertyType: row.property_type,
    isSeafront: row.is_seafront, description: cleanDesc, features: extractedFeatures,
    tags: row.tags || [],
    agency: row.agency_name ? { name: row.agency_name, logo: row.agency_logo || '' } : undefined,
    affiliate_url: affiliateMatch ? affiliateMatch[1] : undefined,
  };
}

// ── Location queries ──────────────────────────────────────────────────────────

import { LOCATIONS, LOCATION_STATS } from './locations';

export const getLocationBySlug = async (slug: string): Promise<Location | undefined> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('locations').select('*').eq('slug', slug).single();
    if (data && !error) return mapLocation(data);
  }
  return LOCATIONS.find(l => l.slug === slug);
};

export const getLocationStats = async (id: number): Promise<LocationStats | null> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('location_stats').select('*').eq('location_id', id).single();
    if (data && !error) return mapLocationStats(data);
  }
  return LOCATION_STATS[id] || null;
};

export const getCityPropertyTypes = async (_id: number) => {
  const { PROPERTY_TYPES } = await import('./locations');
  return PROPERTY_TYPES;
};

// ── Property queries ──────────────────────────────────────────────────────────

export const getPropertiesByLocation = async (locationId: number): Promise<Property[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('properties').select('*').eq('location_id', locationId).eq('status', 'active').order('created_at', { ascending: false }).limit(24);
    if (data && !error) return data.map(mapProperty);
  }
  return PROPERTIES.filter(p => p.locationId === locationId);
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
    if (data && !error) return mapProperty(data);
  }
  return PROPERTIES.find(p => p.id === id);
};

export const getPropertyBySlug = async (slug: string): Promise<Property | undefined> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('properties').select('*').eq('slug', slug).single();
    if (data && !error) return mapProperty(data);
  }
  return PROPERTIES.find(p => p.slug === slug);
};

export const getAllProperties = async (): Promise<Property[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('properties').select('*').eq('status', 'active').order('price', { ascending: false });
    if (data && !error) return data.map(mapProperty);
  }
  return PROPERTIES;
};

export const getFilteredProperties = async (locationId: number, filterSlug: string): Promise<Property[]> => {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('properties').select('*').eq('location_id', locationId).eq('status', 'active');
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
  const { PRICE_FILTERS } = await import('./locations');
  const allProps = PROPERTIES.filter(p => p.locationId === locationId);
  const priceFilter = PRICE_FILTERS.find(f => f.slug === filterSlug);
  if (priceFilter) return allProps.filter(p => p.price >= priceFilter.min && p.price < priceFilter.max);
  if (filterSlug === 'sea-view') return allProps.filter(p => p.isSeafront);
  return allProps;
};

// ── Article queries (markdown-server loaded dynamically — never in client bundle) ─

export const getArticles = async (lang = 'en'): Promise<Article[]> => {
  const { loadAllArticles, resolveArticleLang } = await import('./markdown-server');
  const activeLang = resolveArticleLang(lang);
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('articles').select('*').eq('published', true);
    if (data && !error && data.length > 0) return data as any;
  }
  return loadAllArticles(activeLang);
};

export const getArticleBySlug = async (slug: string, lang = 'en'): Promise<Article | undefined> => {
  const { loadArticle, resolveArticleLang } = await import('./markdown-server');
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

export const getFeaturedProperties = async (): Promise<Property[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('properties').select('*').eq('status', 'active').eq('featured', true).order('featured_position', { ascending: true }).limit(6);
    if (data && !error) return data.map(mapProperty);
  }
  return [];
};