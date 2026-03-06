export type EPCRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface NoiseAssessment {
  score: number; // 1-100 (Higher is quieter)
  traffic: 'Low' | 'Moderate' | 'High';
  nightlife: 'Quiet' | 'Active' | 'Vibrant';
  constructionRisk: 'Low' | 'Medium' | 'High';
  isFlightPath: boolean;
}

export interface PriceHistoryItem {
  date: string;
  price: number;
  event: 'Listed' | 'Price drop' | 'Price increase' | 'Relisted' | 'Sold' | 'New listing' | 'Current';
  change?: number; // Percent change
}

export interface Property {
  id: string;
  title: string;
  locationName: string;
  locationId: number;
  price: number;
  beds: number;
  baths: number;
  sqm: number;
  images: string[];
  type: 'sale' | 'rent';
  propertyType: 'Villa' | 'Penthouse' | 'Palazzo' | 'Apartment' | 'House of Character' | 'Maisonette';
  isSeafront?: boolean;
  description: string;
  features: string[];
  tags?: string[];
  agency: {
    name: string;
    logo: string;
  };
  lat?: number;
  lng?: number;
  priceHistory?: PriceHistoryItem[];
  epcRating?: EPCRating;
  noiseLevel?: NoiseAssessment;
}

export interface Agency {
  id: string;
  name: string;
  logo: string;
  description: string;
  propertyCount: number;
}

export interface Article {
  slug: string;
  title: string;
  category: 'Buying' | 'Investing' | 'Residency' | 'Legal' | 'Areas' | 'Finance' | 'Relocation' | 'Selling';
  excerpt: string;
  metaDescription?: string;
  content: string;
  image: string;
  date: string;
  readTime: string;
  author?: string;
}

export interface Location {
  id: number;
  slug: string;
  nameEn: string;
  nameMt?: string;
  island: 'malta' | 'gozo' | 'comino';
  region?: string;
  locationType: 'council' | 'city' | 'village' | 'area';
  isPopular: boolean;
  isLuxuryHub: boolean;
  shortDesc?: string;
  longIntro?: string;
}

export interface LocationStats {
  locationId: number;
  listingsSaleCount: number;
  listingsRentCount: number;
  medianPriceSale: number | null;
  medianPriceRent: number | null;
  avgPriceSale: number | null;
  avgPriceRent: number | null;
  lastCalculatedAt: string;
}
