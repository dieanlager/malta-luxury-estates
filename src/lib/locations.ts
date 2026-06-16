import type { Location, LocationStats } from '../types';

export const LOCATIONS: Location[] = [
  { id: 1, slug: 'sliema', nameEn: 'Sliema', nameMt: 'Tas-Sliema', island: 'malta', region: 'Northern Harbour', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'Seafront lifestyle hub.', lifestyleTags: ['Cosmopolitan', 'Seafront'] },
  { id: 2, slug: 'st-julians', nameEn: "St. Julian's", nameMt: "San Ġiljan", island: 'malta', region: 'Northern Harbour', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'Entertainment and luxury.', lifestyleTags: ['Nightlife', 'Maritime'] },
  { id: 3, slug: 'valletta', nameEn: 'Valletta', nameMt: 'Il-Belt Valletta', island: 'malta', region: 'Southern Harbour', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'UNESCO-listed capital.', lifestyleTags: ['Boutique', 'Historic'] },
  { id: 4, slug: 'mdina', nameEn: 'Mdina', nameMt: 'L-Imdina', island: 'malta', region: 'Western', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'The Silent City.', lifestyleTags: ['Noble', 'Tranquil'] },
  { id: 5, slug: 'Mellieha', nameEn: 'Mellieha', nameMt: 'Il-Mellieha', island: 'malta', region: 'Northern', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'Stunning villas.', lifestyleTags: ['Beachfront', 'Villa Living'] },
  { id: 6, slug: 'victoria', nameEn: 'Victoria', nameMt: 'Ir-Rabat', island: 'gozo', region: 'Gozo', locationType: 'city', isPopular: true, isLuxuryHub: true, shortDesc: 'Heart of Gozo.' },
  { id: 7, slug: 'swieqi', nameEn: 'Swieqi', nameMt: 'Is-Swieqi', island: 'malta', region: 'Northern Harbour', locationType: 'city', isPopular: true },
  { id: 8, slug: 'attard', nameEn: 'Attard', nameMt: "H'Attard", island: 'malta', region: 'Central', locationType: 'city', isPopular: true },
  { id: 9, slug: 'madliena', nameEn: 'Madliena', nameMt: 'Il-Madliena', island: 'malta', region: 'Northern', locationType: 'area', isPopular: true, isLuxuryHub: true },
  { id: 10, slug: 'san-pawl-il-bahar', nameEn: "St. Paul's Bay", nameMt: "San Pawl il-Bahar", island: 'malta', region: 'Northern', locationType: 'city', isPopular: true },
  { id: 11, slug: 'naxxar', nameEn: 'Naxxar', nameMt: 'In-Naxxar', island: 'malta', region: 'Northern', locationType: 'city' },
  { id: 12, slug: 'marsascala', nameEn: 'Marsascala', nameMt: 'Wied il-Ghajn', island: 'malta', region: 'South Eastern', locationType: 'city' },
  { id: 13, slug: 'three-cities', nameEn: 'Three Cities', nameMt: 'Il-Kottonera', island: 'malta', region: 'Southern Harbour', locationType: 'area', isPopular: true },
  { id: 14, slug: 'xlendi', nameEn: 'Xlendi', nameMt: 'Ix-Xlendi', island: 'gozo', region: 'Gozo', locationType: 'area', isPopular: true },
  { id: 15, slug: 'Gharghar', nameEn: 'Gharghar', nameMt: 'Hal Gharghar', island: 'malta', region: 'Northern', locationType: 'village' },
  { id: 16, slug: 'gzira', nameEn: 'Gzira', island: 'malta', region: 'Northern Harbour', locationType: 'city' },
  { id: 17, slug: 'msida', nameEn: 'Msida', island: 'malta', region: 'Northern Harbour', locationType: 'city' },
  { id: 18, slug: 'pembroke', nameEn: 'Pembroke', island: 'malta', region: 'Northern Harbour', locationType: 'city' },
  { id: 19, slug: 'san-gwann', nameEn: 'San Gwann', island: 'malta', region: 'Northern Harbour', locationType: 'city' },
  { id: 20, slug: 'mosta', nameEn: 'Mosta', island: 'malta', region: 'Northern', locationType: 'city' },
  { id: 21, slug: 'rabat', nameEn: 'Rabat', island: 'malta', region: 'Western', locationType: 'city' },
  { id: 22, slug: 'marsaxlokk', nameEn: 'Marsaxlokk', island: 'malta', region: 'South Eastern', locationType: 'village' },
  { id: 23, slug: 'zejtun', nameEn: 'Zejtun', island: 'malta', region: 'South Eastern', locationType: 'city' },
  { id: 24, slug: 'qormi', nameEn: 'Qormi', island: 'malta', region: 'Northern Harbour', locationType: 'city' },
  { id: 25, slug: 'zebbug', nameEn: 'Zebbug', island: 'malta', region: 'Western', locationType: 'city' },
  { id: 26, slug: 'siggiewi', nameEn: 'Siggiewi', island: 'malta', region: 'Western', locationType: 'city' },
  { id: 27, slug: 'gozo-marsalforn', nameEn: 'Marsalforn', island: 'gozo', region: 'Gozo', locationType: 'area' },
  { id: 28, slug: 'gozo-nadur', nameEn: 'Nadur', island: 'gozo', region: 'Gozo', locationType: 'village' },
  { id: 29, slug: 'gozo-xaghra', nameEn: 'Xaghra', island: 'gozo', region: 'Gozo', locationType: 'village' },
  { id: 30, slug: 'gozo-qala', nameEn: 'Qala', island: 'gozo', region: 'Gozo', locationType: 'village' },
];

export const ALL_LOCALITIES = [
  "Sliema", "St. Julian's", "Valletta", "Mdina", "Mellieha", "Senglea", "Cospicua", "Vittoriosa",
  "Gzira", "Msida", "Swieqi", "Pembroke", "San Gwann", "St. Paul's Bay", "Qawra", "Bugibba",
  "Naxxar", "Gharghar", "Madliena", "Iklin", "Lija", "Balzan", "Attard", "Mosta", "Rabat",
  "Marsaxlokk", "Marsascala", "Birzebbuga", "Zejtun", "Qormi", "Zebbug", "Siggiewi",
  "Dingli", "Mgarr", "Bahrija", "Zurrieq", "Qrendi", "Mqabba", "Kirkop", "Safi", "Luqa", "Gudja",
  "Ghaxaq", "Tarxien", "Paola", "Fgura", "Santa Lucija", "Kalkara", "Xghajra", "Floriana",
  "Gozo - Victoria", "Gozo - Xlendi", "Gozo - Marsalforn", "Gozo - Nadur", "Gozo - Xaghra",
  "Gozo - Ghajnsielem", "Gozo - Qala", "Gozo - Sannat", "Gozo - Munxar", "Gozo - Zebbug",
  "Gozo - Gharb", "Gozo - Ghasri", "Gozo - San Lawrenz",
];

export const LOCATION_STATS: Record<number, LocationStats> = {
  1: { locationId: 1, listingsSaleCount: 245, listingsRentCount: 120, medianPriceSale: 1850000, medianPriceRent: 3500, avgPriceSale: 2100000, avgPriceRent: 4200, lastCalculatedAt: new Date().toISOString() },
  2: { locationId: 2, listingsSaleCount: 180, listingsRentCount: 95, medianPriceSale: 2400000, medianPriceRent: 4500, avgPriceSale: 2800000, avgPriceRent: 5200, lastCalculatedAt: new Date().toISOString() },
  3: { locationId: 3, listingsSaleCount: 95, listingsRentCount: 42, medianPriceSale: 1800000, medianPriceRent: 3200, avgPriceSale: 2200000, avgPriceRent: 3800, lastCalculatedAt: new Date().toISOString() },
  5: { locationId: 5, listingsSaleCount: 110, listingsRentCount: 45, medianPriceSale: 2100000, medianPriceRent: 3800, avgPriceSale: 2450000, avgPriceRent: 4500, lastCalculatedAt: new Date().toISOString() },
};

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

export const getFilterLabel = (filterSlug: string): string => {
  const labels: Record<string, string> = {
    'under-500k': 'Under €500k', 'under-1m': 'Under €1M', '500k-1m': '€500k – €1M',
    'over-1m': 'Over €1M', 'over-3m': 'Over €3M',
    'sea-view': 'Sea View', 'with-pool': 'With Pool', 'new-build': 'New Build', 'furnished': 'Furnished',
  };
  return labels[filterSlug] || filterSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getAllLocations = (): Location[] => LOCATIONS;
export const getPopularLocations = (): Location[] => LOCATIONS.filter(l => l.isPopular);