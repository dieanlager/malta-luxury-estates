import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Filter, MapPin, Home, TrendingUp, ChevronRight } from 'lucide-react';
import { getLocationBySlug, getFilteredProperties, getFilterLabel, PROPERTY_TYPES, PRICE_FILTERS, FEATURE_FILTERS } from '../lib/data';
import { Property, Location } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { generateFilterFAQSchema, localBusinessSchema } from '../lib/seo/schemas';
import { usePageMeta, getCanonicalPath } from '../lib/seo/meta';
import { SchemaScript } from '../components/SchemaScript';
import { useTranslation } from 'react-i18next';

interface FilteredPropertiesPageProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onContact: (propertyId: string, propertyTitle: string) => void;
}

export const FilteredPropertiesPage: React.FC<FilteredPropertiesPageProps> = ({
  favorites,
  onToggleFavorite,
  onContact,
}) => {
  const { t, i18n } = useTranslation();
  const { citySlug, filterSlug } = useParams<{ citySlug: string; filterSlug: string }>();
  const [location, setLocation] = useState<Location | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!citySlug || !filterSlug) return;

      const loc = await getLocationBySlug(citySlug);
      setLocation(loc || null);

      if (loc) {
        const filtered = await getFilteredProperties(loc.id, filterSlug);
        setProperties(filtered);
      }
      setLoading(false);
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [citySlug, filterSlug]);

  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    if (location) {
      import('../lib/data').then(m => m.getLocationStats(location.id)).then(setStats);
    }
  }, [location]);

  // SEO – must be called before any conditional returns (React hook rules)
  const filterLabel = getFilterLabel(filterSlug || '');
  const islandLabel = location?.island === 'malta' ? 'Malta' : 'Gozo';
  const pageTitle = location
    ? `${filterLabel} for Sale in ${location.nameEn}, ${islandLabel} | Malta Luxury Real Estate`
    : `${filterLabel} for Sale in Malta | Malta Luxury Real Estate`;

  usePageMeta({
    title: pageTitle,
    description: location
      ? `Browse curated ${filterLabel.toLowerCase()} for sale in ${location.nameEn}, ${islandLabel}. Verified listings from leading agencies with seafront and exclusive options. ${properties.length > 0 ? `${properties.length} listings available.` : ''}`
      : `Browse curated ${filterLabel.toLowerCase()} for sale across the Maltese islands. Verified listings from Malta's leading luxury real estate agencies.`,
    canonicalPath: location ? getCanonicalPath(location.slug, filterSlug) : '/properties/all',
    currentLang: i18n.language,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-luxury-black pt-32 px-6 text-center">
        <h1 className="text-4xl font-serif mb-4">Location Not Found</h1>
        <Link to="/properties/all" className="text-gold hover:underline">Return to all properties</Link>
      </div>
    );
  }

  // FAQ Schema for this filter page
  const faqSchema = generateFilterFAQSchema(location.nameEn, filterSlug || '', properties.length);

  // Local Business Schema for Local Pack dominance
  const lbSchema = location ? localBusinessSchema({
    nameEn: location.nameEn,
    slug: location.slug,
    lat: 35.9122, // Fallback lat/lng if not in DB
    lng: 14.5041,
    island: location.island,
    shortDesc: location.shortDesc,
    listingsSaleCount: properties.length,
    medianPriceSale: stats?.medianPriceSale
  }) : null;

  // Related filters (show others from different categories)
  const relatedFilters = [
    ...PRICE_FILTERS.filter(f => f.slug !== filterSlug).slice(0, 2),
    ...FEATURE_FILTERS.filter(f => f.slug !== filterSlug).slice(0, 2),
    ...PROPERTY_TYPES.filter(t => t.slug !== filterSlug).slice(0, 2),
  ].slice(0, 6);

  return (
    <main className="min-h-screen bg-luxury-black pt-32 pb-20">
      {/* SEO: Title + FAQ Schema */}
      <SchemaScript data={[faqSchema, lbSchema].filter(Boolean) as object[]} />

      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Properties', href: '/properties/all' },
            { label: location.nameEn, href: `/properties/${citySlug}` },
            { label: filterLabel },
          ]} />
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="text-gold" size={18} />
              <span className="text-gold uppercase tracking-widest text-xs font-bold">{location.nameEn}, {islandLabel}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">
              {filterLabel} in <span className="text-gold-gradient italic">{location.nameEn}</span>
            </h1>
            <p className="text-white/60 text-lg">
              {(() => {
                const cityName = location.nameEn;
                const fLabel = filterLabel.toLowerCase();

                if (filterSlug === 'apartments') {
                  return `Discover the most exclusive ${fLabel} in ${cityName}. From high-end seafront units with panoramic Mediterranean views to modern designer pieds-à-terre, our curated selection represents the pinnacle of residential living in the heart of the Maltese islands.`;
                }
                if (filterSlug === 'villas') {
                  return `Explore premium ${fLabel} in ${cityName}, offering total privacy, expansive grounds, and private pools. This area is renowned for its detached properties that blend traditional architectural charm with contemporary luxury finishes suitable for discerning international buyers.`;
                }
                if (filterSlug === 'penthouses') {
                  return `Elevate your lifestyle with our selection of luxury ${fLabel} in ${cityName}. These top-floor residences offer unmatched horizons, expansive terraces for outdoor entertaining, and the high-spec interiors expected of Malta's most prestigious real estate.`;
                }
                if (filterSlug === 'sea-view') {
                  return `Wake up to the horizon with our hand-picked properties ${fLabel} in ${cityName}. These residences are chosen specifically for their unobstructed vistas and proximity to the water, ensuring your investment retains its value through the lure of the Mediterranean.`;
                }
                if (filterSlug === 'over-1m' || filterSlug === 'over-3m') {
                  return `Enter the high-net-worth market with these elite ${cityName} properties. These ${fLabel.replace('over ', 'above ')} listings represent the absolute crème de la crème of Malta's real estate, featuring architectural masterpieces and legacy estates.`;
                }

                return `Explore our curated selection of ${fLabel} properties in the prestigious ${cityName} area. Each property has been hand-selected for its quality, location, and long-term investment potential in the competitive Malta real estate market.`;
              })()}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Results</div>
              <div className="text-xl font-serif">{properties.length} Properties</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <Filter className="text-gold" size={20} />
          </div>
        </div>

        {/* Related Filters */}
        <div className="flex flex-wrap gap-2 mb-12">
          <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold self-center mr-2">Also explore:</span>
          {relatedFilters.map((f) => (
            <Link
              key={f.slug}
              to={`/properties/${citySlug}/${f.slug}`}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${f.slug === filterSlug
                ? 'bg-gold text-luxury-black border-gold'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-gold/50 hover:text-gold'
                }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PropertyCard
                  property={property}
                  isFavorite={favorites.includes(property.id)}
                  onToggleFavorite={onToggleFavorite}
                  onContact={onContact}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 glass-card rounded-[3rem] border border-white/10">
            <Home className="text-white/10 mx-auto mb-6" size={64} />
            <h3 className="text-2xl font-serif mb-4">No matching properties</h3>
            <p className="text-white/40 mb-8 max-w-md mx-auto">We couldn't find any {filterLabel.toLowerCase()} properties in {location.nameEn} at the moment. New listings are added daily.</p>
            <Link
              to={`/properties/${citySlug}`}
              className="px-8 py-4 gold-gradient text-luxury-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform inline-block"
            >
              View All {location.nameEn} Properties
            </Link>
          </div>
        )}

        {/* SEO Content Section */}
        <section className="mt-32 pt-32 border-t border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <h2 className="text-3xl font-serif mb-8">{filterLabel} in {location.nameEn} – Market Overview</h2>
              <div className="prose prose-invert max-w-none text-white/60 space-y-6">
                <p>
                  {location.nameEn} remains one of Malta's most sought-after locations for both local and international investors.
                  The area is known for its high standard of living, excellent amenities, and strong capital appreciation.
                </p>
                <p>
                  Whether you are looking for a primary residence or a high-yield rental investment, {location.nameEn} offers
                  a diverse range of properties from modern seafront apartments to historic townhouses.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 glass-card rounded-3xl border border-white/5">
                <TrendingUp className="text-gold mb-4" size={24} />
                <h4 className="font-serif text-lg mb-2">Market Growth</h4>
                <p className="text-xs text-white/40 leading-relaxed">Average property values in {location.nameEn} have increased by 6.2% over the last 12 months.</p>
              </div>
              <div className="p-8 glass-card rounded-3xl border border-white/5">
                <Home className="text-gold mb-4" size={24} />
                <h4 className="font-serif text-lg mb-2">Rental Demand</h4>
                <p className="text-xs text-white/40 leading-relaxed">High demand for luxury rentals ensures consistent yields for property owners in this region.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

