import { Property, Agency, Article } from './types';
import { ARTICLES_PHASE2 } from './content/articles-phase2';
import { ARTICLES_PHASE3 } from './content/articles-phase3';
import { ARTICLES_PHASE3B } from './content/articles-phase3b';
import { ARTICLES_PHASE4 } from './content/articles-phase4';
import { ARTICLES_PHASE4B } from './content/articles-phase4b';
import { ARTICLES_PHASE5 } from './content/articles-phase5';
import { ARTICLES_PHASE5B } from './content/articles-phase5b';
import { ARTICLES_FINANCE } from './content/articles-finance';
import { ARTICLES_LIFESTYLE } from './content/articles-lifestyle';
import { ARTICLES_CITIES } from './content/articles-cities';
import { ARTICLES_LONGTAIL } from './content/articles-longtail';
import { ARTICLES_TECHNICAL } from './content/articles-technical';
export const PROPERTIES: Property[] = [
  // === SLIEMA (locationId: 1) ===
  {
    id: '1',
    title: 'Majestic Seafront Palazzo',
    locationName: 'Sliema, Malta',
    locationId: 1,
    price: 12500000,
    beds: 7,
    baths: 8,
    sqm: 1200,
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Palazzo',
    isSeafront: true,
    description: 'A truly unique 17th-century palazzo meticulously restored to its former glory, offering unparalleled views of the Mediterranean.',
    features: ['Pool', 'Wine Cellar', 'Elevator', 'Staff Quarters', 'Sea View'],
    tags: ['Seafront', 'Exclusive'],
    agency: { name: 'Frank Salt Real Estate', logo: 'https://picsum.photos/seed/agency1/100/100' },
    priceHistory: [
      { date: '2024-08-10', price: 13500000, event: 'Listed' },
      { date: '2025-01-20', price: 12500000, event: 'Price drop', change: -7.4 },
      { date: '2026-03-01', price: 12500000, event: 'Current' }
    ],
    epcRating: 'C',
    noiseLevel: {
      score: 88,
      traffic: 'Low',
      nightlife: 'Quiet',
      constructionRisk: 'Low',
      isFlightPath: false
    }
  },
  {
    id: '5',
    title: 'Designer Apartment in Tigné Point',
    locationName: 'Sliema, Malta',
    locationId: 1,
    price: 1850000,
    beds: 3,
    baths: 2,
    sqm: 210,
    images: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Apartment',
    isSeafront: true,
    epcRating: 'B',
    noiseLevel: {
      score: 65,
      traffic: 'Moderate',
      nightlife: 'Active',
      constructionRisk: 'Medium',
      isFlightPath: false
    },
    description: 'A sleek, modern apartment in Malta\'s most prestigious residential development, offering access to exclusive amenities.',
    features: ['Pool Access', 'Underground Parking', '24/7 Security', 'Fully Furnished'],
    tags: ['Modern', 'Investment'],
    agency: { name: 'Belair Real Estate', logo: 'https://picsum.photos/seed/agency5/100/100' }
  },
  {
    id: '6',
    title: 'Luxury Seafront Apartment',
    locationName: 'Sliema, Malta',
    locationId: 1,
    price: 3500,
    beds: 2,
    baths: 2,
    sqm: 140,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'rent',
    propertyType: 'Apartment',
    isSeafront: true,
    description: 'A stunning designer-finished apartment in the heart of Sliema, offering breathtaking views of the Mediterranean.',
    features: ['Sea View', 'Modern Finishes', 'Fully Furnished'],
    tags: ['Seafront', 'Luxury'],
    agency: { name: 'RE/MAX Lettings', logo: 'https://picsum.photos/seed/agency2/100/100' }
  },
  {
    id: '7',
    title: 'Fort Cambridge Penthouse',
    locationName: 'Sliema, Malta',
    locationId: 1,
    price: 4200000,
    beds: 4,
    baths: 4,
    sqm: 380,
    images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Penthouse',
    isSeafront: true,
    description: 'Spectacular penthouse in the prestigious Fort Cambridge SDA development with 360° views of the Mediterranean and Valletta skyline.',
    features: ['Infinity Pool', 'Smart Home', 'Wine Room', 'Triple Parking', 'Fully Furnished'],
    tags: ['New Build', 'Pool', 'SDA'],
    agency: { name: 'Malta Sotheby\'s International Realty', logo: 'https://picsum.photos/seed/agency3/100/100' },
    priceHistory: [
      { date: '2023-01-15', price: 4500000, event: 'Listed' },
      { date: '2023-06-10', price: 4350000, event: 'Price drop', change: -3.3 },
      { date: '2025-02-05', price: 4200000, event: 'Price drop', change: -3.4 },
      { date: '2026-03-01', price: 4200000, event: 'Current' }
    ],
    epcRating: 'A',
    noiseLevel: {
      score: 42,
      traffic: 'High',
      nightlife: 'Vibrant',
      constructionRisk: 'High',
      isFlightPath: false
    }
  },
  {
    id: '8',
    title: 'The Strand Studio Investment',
    locationName: 'Sliema, Malta',
    locationId: 1,
    price: 285000,
    beds: 1,
    baths: 1,
    sqm: 55,
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Apartment',
    isSeafront: false,
    description: 'Excellent investment opportunity – a compact studio apartment steps from The Strand promenade, perfect for short-let.',
    features: ['Modern Finishes', 'Close to Seafront', 'Fully Furnished'],
    tags: ['Investment', 'Starter'],
    agency: { name: 'Quicklets', logo: 'https://picsum.photos/seed/agency12/100/100' }
  },

  // === ST. JULIAN'S (locationId: 2) ===
  {
    id: '2',
    title: 'Ultra-Modern Sky Penthouse',
    locationName: "St. Julian's, Malta",
    locationId: 2,
    price: 4850000,
    beds: 3,
    baths: 4,
    sqm: 450,
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Penthouse',
    isSeafront: true,
    description: 'Experience the pinnacle of luxury living in this designer-finished penthouse with a private infinity pool overlooking Spinola Bay.',
    features: ['Infinity Pool', 'Smart Home', 'Terrace', 'Concierge'],
    tags: ['New', 'Pool'],
    agency: { name: 'RE/MAX Lettings', logo: 'https://picsum.photos/seed/agency2/100/100' }
  },
  {
    id: '9',
    title: 'Portomaso Marina Apartment',
    locationName: "St. Julian's, Malta",
    locationId: 2,
    price: 2200000,
    beds: 3,
    baths: 3,
    sqm: 280,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Apartment',
    isSeafront: true,
    description: 'Elegant marina-front apartment in the iconic Portomaso SDA complex, with direct access to the yacht marina and Hilton amenities.',
    features: ['Marina View', 'Pool Access', 'Gym', 'Concierge', 'Fully Furnished'],
    tags: ['SDA', 'Marina'],
    agency: { name: 'Frank Salt Real Estate', logo: 'https://picsum.photos/seed/agency1/100/100' }
  },
  {
    id: '10',
    title: 'Spinola Bay View Flat',
    locationName: "St. Julian's, Malta",
    locationId: 2,
    price: 2800,
    beds: 2,
    baths: 1,
    sqm: 120,
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'rent',
    propertyType: 'Apartment',
    isSeafront: true,
    description: 'Charming seafront apartment overlooking the picturesque Spinola Bay, fully furnished and renovated to a high standard.',
    features: ['Sea View', 'Balcony', 'Fully Furnished', 'Close to Restaurants'],
    tags: ['Bay View'],
    agency: { name: 'Sara Grech', logo: 'https://picsum.photos/seed/agency4/100/100' }
  },
  {
    id: '11',
    title: 'Pender Gardens Luxury Unit',
    locationName: "St. Julian's, Malta",
    locationId: 2,
    price: 950000,
    beds: 2,
    baths: 2,
    sqm: 160,
    images: ['https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Apartment',
    isSeafront: false,
    description: 'Modern apartment in the Pender Gardens SDA development, featuring landscaped gardens, communal pool and 24/7 security.',
    features: ['Pool Access', 'Garden', 'Security', 'Underground Parking'],
    tags: ['SDA', 'New Build'],
    agency: { name: 'Dhalia Real Estate', logo: 'https://picsum.photos/seed/agency6/100/100' }
  },

  // === VALLETTA (locationId: 3) ===
  {
    id: '4',
    title: 'Historic Valletta Residence',
    locationName: 'Valletta, Malta',
    locationId: 3,
    price: 3200000,
    beds: 4,
    baths: 3,
    sqm: 320,
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'House of Character',
    isSeafront: false,
    description: 'A beautifully converted traditional townhouse in the heart of the capital city, featuring original limestone walls and high ceilings.',
    features: ['Roof Terrace', 'Traditional Balcony', 'Fireplace'],
    tags: ['Historic', 'Capital City'],
    agency: { name: 'Sara Grech', logo: 'https://picsum.photos/seed/agency4/100/100' }
  },
  {
    id: '12',
    title: 'Grand Harbour Palazzo',
    locationName: 'Valletta, Malta',
    locationId: 3,
    price: 8500000,
    beds: 6,
    baths: 5,
    sqm: 650,
    images: ['https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Palazzo',
    isSeafront: true,
    description: 'An extraordinary 16th-century palazzo with sweeping Grand Harbour views, meticulously restored with modern amenities while preserving every historic detail.',
    features: ['Grand Harbour View', 'Elevator', 'Wine Cellar', 'Staff Quarters', 'Garden'],
    tags: ['Exclusive', 'Historic'],
    agency: { name: 'Malta Sotheby\'s International Realty', logo: 'https://picsum.photos/seed/agency3/100/100' }
  },
  {
    id: '13',
    title: 'Republic Street Boutique Apartment',
    locationName: 'Valletta, Malta',
    locationId: 3,
    price: 680000,
    beds: 2,
    baths: 1,
    sqm: 95,
    images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Apartment',
    isSeafront: false,
    description: 'Charming converted apartment on Valletta\'s main street, ideal for holiday let or pied-à-terre. High ceilings, limestone walls and a traditional gallarija balcony.',
    features: ['Traditional Balcony', 'High Ceilings', 'Fully Furnished', 'Central Location'],
    tags: ['Investment', 'Character'],
    agency: { name: 'Belair Real Estate', logo: 'https://picsum.photos/seed/agency5/100/100' }
  },

  // === MDINA (locationId: 4) ===
  {
    id: '14',
    title: 'Noble Palazzo in the Silent City',
    locationName: 'Mdina, Malta',
    locationId: 4,
    price: 9800000,
    beds: 8,
    baths: 7,
    sqm: 1400,
    images: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Palazzo',
    isSeafront: false,
    description: 'One of Mdina\'s most storied noble residences, this grand palazzo features frescoed ceilings, an internal courtyard, a chapel, and extensive terraced gardens overlooking the island.',
    features: ['Chapel', 'Internal Courtyard', 'Frescoed Ceilings', 'Terraced Gardens', 'Wine Cellar'],
    tags: ['Exclusive', 'Heritage'],
    agency: { name: 'Malta Sotheby\'s International Realty', logo: 'https://picsum.photos/seed/agency3/100/100' }
  },

  // === MELLIEĦA (locationId: 5) ===
  {
    id: '3',
    title: 'Contemporary Cliffside Villa',
    locationName: 'Mellieħa, Malta',
    locationId: 5,
    price: 7200000,
    beds: 5,
    baths: 6,
    sqm: 850,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Villa',
    isSeafront: false,
    description: 'A masterpiece of modern architecture, this villa blends seamlessly into the rugged Mellieħa cliffs, offering total privacy.',
    features: ['Gym', 'Cinema', 'Infinity Pool', 'Garage'],
    tags: ['Private', 'Pool'],
    agency: { name: 'Malta Sotheby\'s International Realty', logo: 'https://picsum.photos/seed/agency3/100/100' }
  },
  {
    id: '15',
    title: 'Santa Maria Estate Villa',
    locationName: 'Mellieħa, Malta',
    locationId: 5,
    price: 3800000,
    beds: 4,
    baths: 4,
    sqm: 520,
    images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Villa',
    isSeafront: false,
    description: 'A stunning detached villa in the exclusive Santa Maria Estate, featuring a large pool, manicured gardens and spectacular bay views.',
    features: ['Heated Pool', 'Garden', 'BBQ Area', 'Garage', 'Sea View'],
    tags: ['Pool', 'Family'],
    agency: { name: 'Frank Salt Real Estate', logo: 'https://picsum.photos/seed/agency1/100/100' }
  },
  {
    id: '16',
    title: 'Mellieħa Bay Apartment',
    locationName: 'Mellieħa, Malta',
    locationId: 5,
    price: 420000,
    beds: 2,
    baths: 2,
    sqm: 110,
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Apartment',
    isSeafront: false,
    description: 'Modern apartment with bay views, walking distance to Malta\'s most popular sandy beach. Perfect for holiday let investment.',
    features: ['Bay View', 'Modern Finishes', 'Parking'],
    tags: ['Investment', 'Beach'],
    agency: { name: 'Perry Real Estate', logo: 'https://picsum.photos/seed/agency7/100/100' },
    lat: 35.9550,
    lng: 14.3580
  },

  // === VICTORIA, GOZO (locationId: 6) ===
  {
    id: '17',
    title: 'Converted Farmhouse with Pool',
    locationName: 'Victoria, Gozo',
    locationId: 6,
    price: 1200000,
    beds: 4,
    baths: 3,
    sqm: 450,
    images: ['https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'House of Character',
    isSeafront: false,
    description: 'Meticulously restored 300-year-old farmhouse with vaulted ceilings, original stone floors, a courtyard garden and a stunning infinity pool.',
    features: ['Pool', 'Courtyard', 'Vaulted Ceilings', 'Garden', 'Wine Cellar'],
    tags: ['Character', 'Pool'],
    agency: { name: 'Move2Gozo', logo: 'https://picsum.photos/seed/agency20/100/100' },
    lat: 36.0438,
    lng: 14.2400
  },
  {
    id: '18',
    title: 'Citadella View Maisonette',
    locationName: 'Victoria, Gozo',
    locationId: 6,
    price: 340000,
    beds: 3,
    baths: 2,
    sqm: 180,
    images: ['https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Maisonette',
    isSeafront: false,
    description: 'Spacious maisonette with views of the iconic Citadella, featuring traditional limestone finishes and a large roof terrace.',
    features: ['Roof Terrace', 'Citadella Views', 'Traditional Finishes', 'Garage'],
    tags: ['Character', 'Views'],
    agency: { name: 'Gozo Properties', logo: 'https://picsum.photos/seed/agency21/100/100' }
  },

  // === SWIEQI (locationId: 7) ===
  {
    id: '19',
    title: 'Modern Family Apartment',
    locationName: 'Swieqi, Malta',
    locationId: 7,
    price: 580000,
    beds: 3,
    baths: 2,
    sqm: 180,
    images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Apartment',
    isSeafront: false,
    description: 'Bright, modern apartment in a quiet residential complex, close to international schools and local amenities.',
    features: ['Balcony', 'Underground Parking', 'Storage Room', 'Close to Schools'],
    tags: ['Family', 'Modern'],
    agency: { name: 'Dhalia Real Estate', logo: 'https://picsum.photos/seed/agency6/100/100' }
  },

  // === ATTARD (locationId: 8) ===
  {
    id: '20',
    title: 'Villa near San Anton Gardens',
    locationName: 'Attard, Malta',
    locationId: 8,
    price: 2800000,
    beds: 5,
    baths: 4,
    sqm: 550,
    images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Villa',
    isSeafront: false,
    description: 'Elegant detached villa with lush gardens, a few minutes\' walk from the iconic San Anton Presidential Gardens.',
    features: ['Private Pool', 'Large Garden', 'Home Office', 'Garage for 3 Cars'],
    tags: ['Pool', 'Prestige'],
    agency: { name: 'Sara Grech', logo: 'https://picsum.photos/seed/agency4/100/100' }
  },

  // === MADLIENA (locationId: 9) ===
  {
    id: '21',
    title: 'Hilltop Luxury Villa',
    locationName: 'Madliena, Malta',
    locationId: 9,
    price: 5500000,
    beds: 6,
    baths: 6,
    sqm: 750,
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Villa',
    isSeafront: false,
    description: 'Commanding hilltop villa with panoramic views stretching from Sliema to Comino. Features include indoor/outdoor pools, a wine cellar and a private cinema.',
    features: ['Infinity Pool', 'Indoor Pool', 'Cinema Room', 'Wine Cellar', 'Gym', 'Sea View'],
    tags: ['Exclusive', 'Pool', 'Views'],
    agency: { name: 'Malta Sotheby\'s International Realty', logo: 'https://picsum.photos/seed/agency3/100/100' }
  },

  // === ST. PAUL'S BAY (locationId: 10) ===
  {
    id: '22',
    title: 'Qawra Seafront Studio',
    locationName: "St. Paul's Bay, Malta",
    locationId: 10,
    price: 165000,
    beds: 1,
    baths: 1,
    sqm: 48,
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Apartment',
    isSeafront: true,
    description: 'Affordable seafront studio in Qawra, ideal for starter investment with proven rental yield from tourism.',
    features: ['Sea View', 'Fully Furnished', 'Close to Promenade'],
    tags: ['Investment', 'Budget'],
    agency: { name: 'Quicklets', logo: 'https://picsum.photos/seed/agency12/100/100' }
  },
  {
    id: '23',
    title: 'Buġibba Two-Bedroom Flat',
    locationName: "St. Paul's Bay, Malta",
    locationId: 10,
    price: 230000,
    beds: 2,
    baths: 1,
    sqm: 85,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Apartment',
    isSeafront: false,
    description: 'Well-maintained two-bedroom apartment in Buġibba, close to the square and all amenities. Great rental potential.',
    features: ['Balcony', 'Close to Amenities', 'Parking'],
    tags: ['Value', 'Starter'],
    agency: { name: 'Open House', logo: 'https://picsum.photos/seed/agency13/100/100' }
  },

  // === THREE CITIES (locationId: 13) ===
  {
    id: '24',
    title: 'Vittoriosa Waterfront Townhouse',
    locationName: 'Three Cities, Malta',
    locationId: 13,
    price: 950000,
    beds: 3,
    baths: 2,
    sqm: 220,
    images: ['https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'House of Character',
    isSeafront: true,
    description: 'Beautifully restored waterfront townhouse in Birgu, overlooking the Grand Harbour marina. Original features combined with contemporary luxury.',
    features: ['Harbour View', 'Roof Terrace', 'Original Features', 'Marina Access'],
    tags: ['Character', 'Waterfront'],
    agency: { name: 'Belair Real Estate', logo: 'https://picsum.photos/seed/agency5/100/100' }
  },
  {
    id: '25',
    title: 'Senglea Harbour View Apartment',
    locationName: 'Three Cities, Malta',
    locationId: 13,
    price: 480000,
    beds: 2,
    baths: 2,
    sqm: 130,
    images: ['https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Apartment',
    isSeafront: true,
    description: 'Modern apartment in a converted historic building in Senglea, featuring stunning Grand Harbour views from an expansive balcony.',
    features: ['Harbour View', 'Balcony', 'Modern Finishes', 'Fully Furnished'],
    tags: ['Views', 'Value'],
    agency: { name: 'AX Real Estate', logo: 'https://picsum.photos/seed/agency14/100/100' }
  },

  // === XLENDI, GOZO (locationId: 14) ===
  {
    id: '26',
    title: 'Xlendi Bay Cliffside Apartment',
    locationName: 'Xlendi, Gozo',
    locationId: 14,
    price: 320000,
    beds: 2,
    baths: 1,
    sqm: 100,
    images: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Apartment',
    isSeafront: true,
    description: 'Stunning cliffside apartment overlooking the iconic Xlendi Bay. Perfect holiday retreat or rental investment in Gozo.',
    features: ['Bay View', 'Balcony', 'Close to Beach', 'Fully Furnished'],
    tags: ['Beach', 'Views'],
    agency: { name: 'Gozo Properties', logo: 'https://picsum.photos/seed/agency21/100/100' }
  },

  // === NAXXAR (locationId: 11) ===
  {
    id: '27',
    title: 'Naxxar Semi-Detached Villa',
    locationName: 'Naxxar, Malta',
    locationId: 11,
    price: 750000,
    beds: 4,
    baths: 3,
    sqm: 280,
    images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Villa',
    isSeafront: false,
    description: 'Spacious semi-detached villa in a quiet cul-de-sac near the Naxxar centre. Features a good-sized garden and pool.',
    features: ['Pool', 'Garden', 'Garage', 'Close to Centre'],
    tags: ['Family', 'Pool'],
    agency: { name: 'Dhalia Real Estate', logo: 'https://picsum.photos/seed/agency6/100/100' }
  },

  // === MARSASCALA (locationId: 12) ===
  {
    id: '28',
    title: 'Marsascala Waterfront Apartment',
    locationName: 'Marsascala, Malta',
    locationId: 12,
    price: 295000,
    beds: 2,
    baths: 2,
    sqm: 110,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Apartment',
    isSeafront: true,
    description: 'Charming waterfront apartment with panoramic sea views along the Marsascala promenade. Excellent value for seafront living.',
    features: ['Sea View', 'Promenade Access', 'Balcony', 'Parking'],
    tags: ['Value', 'Seafront'],
    agency: { name: 'Malta Real Estate', logo: 'https://picsum.photos/seed/agency8/100/100' }
  },

  // === GĦARGĦUR (locationId: 15) ===
  {
    id: '29',
    title: 'Għargħur Countryside Villa',
    locationName: 'Għargħur, Malta',
    locationId: 15,
    price: 1650000,
    beds: 4,
    baths: 3,
    sqm: 400,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Villa',
    isSeafront: false,
    description: 'Beautiful detached villa on the edge of Għargħur with sweeping countryside and distant sea views. Large plot with pool and mature gardens.',
    features: ['Pool', 'Large Garden', 'Countryside Views', 'Garage for 2 Cars'],
    tags: ['Countryside', 'Pool'],
    agency: { name: 'Frank Salt Real Estate', logo: 'https://picsum.photos/seed/agency1/100/100' }
  },
  {
    id: '30',
    title: 'Panoramic Penthouse with Views',
    locationName: 'Għargħur, Malta',
    locationId: 15,
    price: 890000,
    beds: 3,
    baths: 2,
    sqm: 220,
    images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1600&fm=webp'],
    type: 'sale',
    propertyType: 'Penthouse',
    isSeafront: false,
    description: 'New-build penthouse offering 180° panoramic views of the Maltese landscape. Modern finishes, large terraces and an enviable hilltop position.',
    features: ['Panoramic Views', 'Large Terrace', 'Modern Finishes', 'Parking'],
    tags: ['New Build', 'Views'],
    agency: { name: 'Perry Real Estate', logo: 'https://picsum.photos/seed/agency7/100/100' }
  }
];

export const AGENCIES: Agency[] = [
  {
    id: 'a1',
    name: 'Frank Salt Real Estate',
    logo: 'https://picsum.photos/seed/fs/200/100',
    description: 'Malta\'s oldest and most established real estate agency.',
    propertyCount: 1240,
    email: 'info@maltaluxuryrealestate.com',
    plan: 'featured',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'a2',
    name: 'RE/MAX Malta',
    logo: 'https://picsum.photos/seed/remax/200/100',
    description: 'The global leader in real estate, with a strong local presence.',
    propertyCount: 3150,
    email: 'info@maltaluxuryrealestate.com',
    plan: 'pro',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'a3',
    name: 'Malta Sotheby\'s',
    logo: 'https://picsum.photos/seed/sothebys/200/100',
    description: 'Specializing in the world\'s most extraordinary properties.',
    propertyCount: 450,
    email: 'info@maltaluxuryrealestate.com',
    plan: 'featured',
    active: true,
    created_at: new Date().toISOString()
  },
];

const _ARTICLES_PHASE1: Article[] = [
  {
    slug: 'buying-property-in-malta-as-a-foreigner-2026',
    title: 'Buying Property in Malta as a Foreigner in 2026',
    category: 'Buying',
    excerpt: 'A comprehensive step-by-step guide to eligibility, AIP permits, taxes, and the legal process for international buyers.',
    metaDescription: 'Thinking of buying property in Malta as a foreigner? Our 2026 guide covers AIP permits, SDA luxury developments, legal steps, and total costs in detail.',
    image: '/assets/images/insights/buying-guide.png',
    date: 'March 2026',
    readTime: '12 min read',
    content: `
# Buying Property in Malta as a Foreigner in 2026

Malta offers a stable real estate market, robust legal protections, and attractive residency programs for international investors. This guide provides a comprehensive overview of the buying process, costs, and regulations as of 2026.

## Who Can Buy Property in Malta as a Foreigner?

The rules for purchasing property in Malta depend on your citizenship and residency status.

### EU Citizens vs Non-EU Buyers
- **EU Citizens:** Those who have resided in Malta for at least five continuous years can purchase multiple properties without restrictions. New EU residents are generally limited to one property for their own residence, unless buying in a Special Designated Area (SDA).
- **Non-EU Buyers:** Generally require an **AIP (Acquisition of Immovable Property) permit** to buy property outside of SDAs. This permit usually limits the buyer to a single property for personal use.

### Buying Inside vs Outside Special Designated Areas (SDA)
**Special Designated Areas (SDAs)** are high-end developments where foreigners (both EU and non-EU) can purchase multiple properties without an AIP permit. These properties can also be freely rented out, making them ideal for investors.
Examples include: **Portomaso, Tigné Point, Pender Gardens, and Fort Cambridge.**

## The Buying Process (Step-by-Step)

1.  **Selection & Negotiation:** Find your property and agree on a price.
2.  **Promise of Sale (Konvenju):** A binding agreement signed before a notary. You typically pay a 10% deposit and 1% provisional stamp duty.
3.  **Due Diligence:** The notary conducts title searches and verifies permits over a period of 3-6 months.
4.  **Final Deed:** Once all conditions are met, the final contract is signed, the balance is paid, and the keys are handed over.

## Costs and Taxes in 2026

*   **Stamp Duty:** Standard rate is 5%.
*   **Notary Fees:** Approximately 1% to 1.5%.
*   **Agency Fees:** Usually paid by the seller (standard 5% + VAT).
*   **AIP Permit Fee:** €233 (if applicable).

## Mortgage & Financing in 2026
Before committing to a purchase, it's essential to understand your borrowing capacity. Use our interactive tool below to estimate your monthly repayments based on the latest 2026 bank rates.

\`\`\`calculator
\`\`\`

> [!TIP]
> **Non-Resident Tip:** Most Maltese banks require a 30% deposit from non-residents. However, if you are a tax resident, you may qualify for a 10% deposit.
    `
  },
  {
    slug: 'malta-real-estate-investment-guide-2026',
    title: 'Malta Real Estate Investment Guide 2026',
    category: 'Investing',
    excerpt: 'A comprehensive guide to the Maltese property market, yields, and strategic locations for 2026.',
    metaDescription: 'Explore the Malta Real Estate Investment Guide 2026. Discover top-performing areas, actual rental yields, and wealth management strategies through property.',
    image: '/assets/images/insights/investment.png',
    date: 'March 1, 2026',
    readTime: '12 min read',
    content: `
# Malta Real Estate Investment Guide 2026

Malta continues to be one of the most attractive real estate markets in the Mediterranean. With a stable economy, high demand for rentals, and a unique legal framework, investors are finding significant opportunities in 2026.

## Why Invest in Malta?

1. **Capital Appreciation**: Historically, Maltese property has shown consistent growth, averaging 5-7% annually in prime areas.
2. **High Rental Yields**: Areas like Sliema and St. Julian's offer gross yields between 4.5% and 6.5%.
3. **Tax Efficiency**: No annual property tax and no inheritance tax on property.
4. **Residency Programs**: Property investment is a key path to Maltese residency (MPRP).

## Strategic Locations

### The Golden Mile (Sliema to St. Julian's)
The commercial and social heart of the island. Highest demand for short-lets and corporate rentals.

### The Three Cities (Vittoriosa, Senglea, Cospicua)
Historic charm meeting modern regeneration. High potential for capital growth as the area gentrifies.

### Gozo
For those seeking tranquility and "Houses of Character". A growing niche for eco-tourism and digital nomads.

## Special Designated Areas (SDA)
SDAs are luxury developments where foreigners can buy property with the same rights as Maltese citizens, meaning no AIP permit is required and you can buy multiple units.

**Current Top SDAs:**
*   **Portomaso** (St. Julian's)
*   **Tigné Point** (Sliema)
*   **Fort Cambridge** (Sliema)
*   **Manoel Island** (Upcoming)
    `
  },
  {
    slug: 'property-taxes-malta-2026',
    title: 'Property Taxes & Fees in Malta 2026',
    category: 'Finance',
    excerpt: 'A detailed breakdown of stamp duty, notary fees, and tax benefits for first-time buyers.',
    metaDescription: 'Detailed breakdown of all property taxes and fees in Malta for 2026. Learn about stamp duty exemptions, notary costs, and how to optimize your acquisition budget.',
    image: '/assets/images/insights/tax-optimization.png',
    date: 'February 25, 2026',
    readTime: '10 min read',
    content: `
# Property Taxes & Fees in Malta 2026

Understanding the total cost of acquisition is crucial for any investor.

## Buyer's Costs
*   **Stamp Duty**: Standard rate is 5%. However, for your primary residence, it's 3.5% on the first €200,000.
*   **Notary Fees**: Usually 1% to 1.5% of the property price.
*   **Search Fees**: Paid to the notary for title searches (approx. €300-€600).
*   **AIP Fee**: €233 (if applicable).

## Seller's Costs
*   **Property Transfer Tax**: Usually 8% of the sale price (Final Settlement Tax).
*   **Agency Commission**: Typically 5% + VAT.

## Tax Benefits 2026
*   **First-Time Buyers**: Exemption from stamp duty on the first €200,000.
*   **Second-Time Buyers**: Refund on stamp duty when selling primary residence to buy another.
*   **UCA Properties**: Properties in Urban Conservation Areas often have reduced stamp duty rates.
    `
  },
  {
    slug: 'special-designated-areas-malta-guide',
    title: 'Special Designated Areas (SDA) in Malta: Complete Guide',
    category: 'Buying',
    excerpt: 'Everything you need to know about SDAs – the developments where foreigners can buy without AIP permits.',
    metaDescription: 'All you need to know about Special Designated Areas (SDAs) in Malta. Find luxury developments with zero restrictions for foreign buyers and investors.',
    image: '/assets/images/insights/sda-guide.png',
    date: 'February 20, 2026',
    readTime: '8 min read',
    content: `
# Special Designated Areas (SDA) in Malta: Complete 2026 Guide

Special Designated Areas represent the gateway for international investors into Maltese real estate. Understanding SDAs is essential for any foreign buyer.

## What are SDAs?

SDAs are government-approved luxury developments where foreign nationals can purchase property without the need for an AIP (Acquisition of Immovable Property) permit. This removes the biggest regulatory barrier for international buyers.

## Key Benefits
- **No AIP permit required** for any nationality
- **Buy multiple units** in different SDAs
- **Rent freely** – no restrictions on short or long-term rentals
- **Resell to anyone** – foreigners can sell to other foreigners

## Top SDA Developments in 2026

### Portomaso (St. Julian's)
Malta's flagship development featuring the Hilton Hotel, a yacht marina, and premium apartments. Average price: €6,000-€8,000/sqm.

### Tigné Point (Sliema)
Premier waterfront development on the Tigné peninsula. Features The Point Shopping Mall, five-star dining, and designer apartments. Average price: €5,000-€7,000/sqm.

### Fort Cambridge (Sliema)
Converted 19th-century military fort offering exclusive apartments with historic character. One of Malta's most unique addresses. Average price: €5,500-€7,500/sqm.

### Pender Gardens (St. Julian's)
Modern complex with landscaped gardens and communal pool. More affordable entry point to the SDA market. Average price: €3,500-€5,000/sqm.

## Upcoming SDAs
- **Manoel Island** – Major waterfront regeneration project
- **MIDI Masterplan** – Extension of the Tigné development  
- **SmartCity Malta** – Technology hub with residential component
    `
  },
  {
    slug: 'rental-yields-malta-2026',
    title: 'Rental Yields by Location: Malta 2026 Analysis',
    category: 'Investing',
    excerpt: 'Data-driven breakdown of gross and net yields across Malta\'s top rental markets.',
    metaDescription: 'Where are the best rental yields in Malta for 2026? A data-driven analysis of Sliema, St. Julian\'s, and budget-friendly emerging property markets.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    date: 'February 15, 2026',
    readTime: '10 min read',
    content: `
# Rental Yields by Location: Malta 2026 Analysis

Malta's rental market continues to offer attractive returns for property investors, driven by a growing expatriate community, tourism, and limited land supply.

## Average Gross Yields by Area

| Location | Avg. Sale Price | Avg. Monthly Rent | Gross Yield |
|----------|----------------|-------------------|-------------|
| Sliema | €2,100,000 | €4,200 | 2.4% |
| St. Julian's | €2,800,000 | €5,200 | 2.2% |
| Valletta | €2,200,000 | €3,800 | 2.1% |
| St. Paul's Bay | €350,000 | €1,300 | 4.5% |
| Three Cities | €780,000 | €1,900 | 2.9% |
| Victoria (Gozo) | €980,000 | €2,200 | 2.7% |
| Swieqi | €750,000 | €2,100 | 3.4% |

## Short-Let vs Long-Let

Short-term holiday lets (Airbnb-style) can generate significantly higher returns:
- **Peak season (Jun-Sep):** Up to 2x the long-let monthly rate
- **Average occupancy:** 65-80% in prime areas
- **Estimated short-let yield:** 5-8% gross in Sliema/St. Julian's

However, short-lets require more management effort and have regulatory requirements (MTA licence).

## Best Areas for Investment Returns

1. **St. Paul's Bay** – Highest gross yield, lowest entry price
2. **Three Cities** – Strong capital growth + improving yields
3. **Swieqi** - Stable expat demand near international schools
    `
  }
];

// Merge all articles: Phase 1 (5) + Phase 2 (4) + Phase 3 (2) + Phase 3B (2) + Phase 4 (2) + Phase 4B (2) + Phase 5 (2) + Phase 5B (2) + Finance (5) + Lifestyle (5) + Cities (5) + Longtail (5) + Technical (5) = 46 total
export const ARTICLES: Article[] = [..._ARTICLES_PHASE1, ...ARTICLES_PHASE2, ...ARTICLES_PHASE3, ...ARTICLES_PHASE3B, ...ARTICLES_PHASE4, ...ARTICLES_PHASE4B, ...ARTICLES_PHASE5, ...ARTICLES_PHASE5B, ...ARTICLES_FINANCE, ...ARTICLES_LIFESTYLE, ...ARTICLES_CITIES, ...ARTICLES_LONGTAIL, ...ARTICLES_TECHNICAL];

export const MALTA_AGENCIES = [
  { name: "Frank Salt Real Estate", website: "franksalt.com.mt", offices: 20 },
  { name: "RE/MAX Malta", website: "remax-malta.com", offices: 15 },
  { name: "Malta Sotheby's International Realty", website: "maltasothebysrealty.com" },
  { name: "Sara Grech", website: "saragrech.com" },
  { name: "Dhalia Real Estate", website: "dhalia.com" },
  { name: "Belair Real Estate", website: "belair.com.mt" },
  { name: "Perry Real Estate", website: "perry.com.mt" },
  { name: "Malta Real Estate", website: "maltarealestate.com" },
  { name: "Engel & Völkers Malta", website: "engelvoelkers.com/malta" },
  { name: "Simoncini Estates", website: "simonciniestates.com" },
  { name: "Open House", website: "openhouse.com.mt" },
  { name: "Quicklets", website: "quicklets.com.mt" },
  { name: "AX Real Estate", website: "axrealestate.com.mt" },
  { name: "Malta Homes", website: "malta-homes.com" },
  { name: "Island Estates", website: "islandestates.com.mt" },
  { name: "Fine & Country Malta", website: "fineandcountry.com/malta" },
  { name: "Christie's International Real Estate Malta", website: "christiesrealestate.com" },
  { name: "Brandão Real Estate", website: "brandao.com.mt" },
  { name: "Majestats", website: "majestats.com" },
  { name: "Move2Gozo", website: "move2gozo.com" },
  { name: "Gozo Properties", website: "gozoproperties.com" },
  { name: "Luxury Malta Property", website: "luxurymaltaproperty.com" },
  { name: "Knight Frank Malta", website: "knightfrank.com/malta" },
];
