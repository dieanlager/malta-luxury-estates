import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight, MapPin, ArrowLeft, Home, TrendingUp, Info, Award, DollarSign, Waves, Building, Check } from 'lucide-react';
import { getLocationBySlug, getLocationStats, getCityPropertyTypes, getPropertiesByLocation, PRICE_FILTERS, FEATURE_FILTERS } from '../lib/data';
import { Location, LocationStats, Property } from '../types';
import { MarketSnapshot } from '../components/MarketSnapshot';
import { PropertyCard } from '../components/PropertyCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { generateCityFAQSchema } from '../lib/seo/schemas';
import { usePageMeta } from '../lib/seo/meta';
import { injectInternalLinks } from '../lib/seo/internal-linking';
import ReactMarkdown from 'react-markdown';
import { SchemaScript } from '../components/SchemaScript';

interface CityPageProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onContact: (propertyId: string, propertyTitle: string) => void;
}

export const CityPage: React.FC<CityPageProps> = ({
  favorites,
  onToggleFavorite,
  onContact,
}) => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const [location, setLocation] = useState<Location | null>(null);
  const [stats, setStats] = useState<LocationStats | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!citySlug) return;

      const loc = await getLocationBySlug(citySlug);
      if (loc) {
        setLocation(loc);
        const [s, types, props] = await Promise.all([
          getLocationStats(loc.id),
          getCityPropertyTypes(loc.id),
          getPropertiesByLocation(loc.id),
        ]);
        setStats(s);
        setPropertyTypes(types);
        setProperties(props);
      }
      setLoading(false);
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [citySlug]);

  // SEO – must be called before any conditional returns (React hook rules)
  const islandLabel = location?.island === 'malta' ? 'Malta' : 'Gozo';
  const pageTitle = location
    ? `${location.nameEn} Property for Sale & Rent in ${islandLabel} | Malta Luxury Real Estate`
    : 'Malta Property | Malta Luxury Real Estate';

  usePageMeta({
    title: pageTitle,
    description: location
      ? `Discover curated properties in ${location.nameEn}, ${islandLabel} – seafront apartments, penthouses and villas from top local agencies. Explore prices and investment opportunities in ${location.nameEn}.`
      : 'Discover luxury property across the Maltese islands.',
    canonicalPath: location ? `/properties/${location.slug}` : '/properties/all',
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
      <div className="min-h-screen bg-luxury-black flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-serif mb-4">Location Not Found</h1>
        <p className="text-white/40 mb-8">We couldn't find the area you're looking for.</p>
        <Link to="/" className="gold-gradient text-luxury-black px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest">
          Return Home
        </Link>
      </div>
    );
  }

  // SEO schemas (safe – location is guaranteed by this point)
  const faqSchema = generateCityFAQSchema(location, stats);

  // Quick filter links
  const quickFilters = [
    ...PRICE_FILTERS.map(f => ({ slug: f.slug, label: f.label, icon: DollarSign })),
    ...FEATURE_FILTERS.map(f => ({ slug: f.slug, label: f.label, icon: f.slug === 'sea-view' ? Waves : Building })),
  ];

  return (
    <main className="min-h-screen bg-luxury-black">
      <SchemaScript data={faqSchema} />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#C5A059_0%,transparent_50%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb items={[
              { label: 'Home', href: '/' },
              { label: 'Properties', href: '/properties/all' },
              { label: location.nameEn },
            ]} />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold" />
                <span className="text-gold uppercase tracking-widest text-xs font-bold">{islandLabel} · Prime Location</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">
                Properties in <br />
                <span className="text-gold-gradient italic">{location.nameEn}</span>
              </h1>
              <div className="text-white/60 text-lg leading-relaxed max-w-2xl prose-p:leading-relaxed prose-a:text-gold hover:prose-a:underline">
                <ReactMarkdown>{injectInternalLinks(location.longIntro)}</ReactMarkdown>
              </div>
            </div>

            <div className="w-full lg:w-96">
              <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Home className="text-gold" size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">Quick Facts</span>
                </div>
                {stats && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-2xl font-serif text-gold">{stats.listingsSaleCount}</div>
                      <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">For Sale</div>
                    </div>
                    <div>
                      <div className="text-2xl font-serif text-gold">{stats.listingsRentCount}</div>
                      <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">For Rent</div>
                    </div>
                  </div>
                )}
                <Link
                  to={`/properties/${location.slug}/under-1m`}
                  className="w-full gold-gradient text-luxury-black py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg block text-center"
                >
                  Browse Listings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK FILTERS BAR */}
      <section className="py-8 border-b border-white/5 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 min-w-max">
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold shrink-0">Filter by:</span>
            {quickFilters.map((f) => (
              <Link
                key={f.slug}
                to={`/properties/${location.slug}/${f.slug}`}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:border-gold/50 hover:text-gold transition-all whitespace-nowrap"
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MARKET SNAPSHOT */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <MarketSnapshot location={location} stats={stats} listingType="both" />

          {/* New pSEO Unique Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-20">
            {location.marketHighlights && location.marketHighlights.length > 0 && (
              <div className="glass-card rounded-[2rem] p-8 border border-white/10">
                <h3 className="text-2xl font-serif mb-6 flex items-center gap-3">
                  <TrendingUp className="text-gold" size={24} />
                  Market Intelligence
                </h3>
                <ul className="space-y-4">
                  {location.marketHighlights.map((highlight, idx) => (
                    <li key={idx} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="text-gold" size={14} />
                      </div>
                      <span className="text-white/60 text-sm leading-relaxed">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {location.lifestyleTags && location.lifestyleTags.length > 0 && (
              <div className="glass-card rounded-[2rem] p-8 border border-white/10">
                <h3 className="text-2xl font-serif mb-6 flex items-center gap-3">
                  <Waves className="text-gold" size={24} />
                  Area Atmosphere
                </h3>
                <div className="flex flex-wrap gap-3">
                  {location.lifestyleTags.map((tag, idx) => (
                    <div key={idx} className="px-6 py-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2 group hover:border-gold/30 transition-all">
                      <span className="text-gold font-serif text-lg">{tag}</span>
                      <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Lifestyle Pillar</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-center gap-8 p-8 glass-card rounded-[2rem] border border-gold/20">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
              <TrendingUp className="text-gold" size={32} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="font-serif text-2xl mb-2">Further Reading: Investing in {location.nameEn}</h4>
              <p className="text-sm text-white/40">Discover why {location.nameEn} is a top choice for international investors in 2026. Explore yields, tax benefits, and market trends.</p>
            </div>
            <Link
              to="/insights/malta-real-estate-investment-guide-2026"
              className="px-8 py-4 gold-gradient text-luxury-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform shrink-0"
            >
              Read Guide
            </Link>
          </div>
        </div>
      </section>

      {/* LISTINGS GRID */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-serif mb-2">Latest Properties in {location.nameEn}</h2>
              <p className="text-white/40 text-sm">Showing {properties.length} curated listings from leading agencies.</p>
            </div>
            <Link
              to="/properties/all"
              className="text-gold text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
            >
              View All Properties <ChevronRight size={14} />
            </Link>
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
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
            <div className="text-center py-20 glass-card rounded-3xl border border-white/10">
              <Home className="text-white/10 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-serif mb-2">Listings coming soon</h3>
              <p className="text-white/40 text-sm">New properties are being added to {location.nameEn} regularly.</p>
            </div>
          )}
        </div>
      </section>

      {/* PROPERTY TYPES */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-serif mb-4">Property Types in {location.nameEn}</h2>
            <p className="text-white/40">Explore the most popular residential categories in this area.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertyTypes.map((type) => (
              <Link
                key={type.slug}
                to={`/properties/${location.slug}/${type.slug}`}
                className="group glass-card rounded-2xl p-8 border border-white/5 hover:border-gold/30 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-gold/10 transition-colors">
                  <Home className="text-gold/60 group-hover:text-gold transition-colors" size={24} />
                </div>
                <h3 className="text-xl font-serif mb-2 group-hover:text-gold transition-colors">{type.label}</h3>
                <p className="text-xs text-white/40 leading-relaxed mb-6">{type.description}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ChevronRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* LIFESTYLE & INSIGHTS */}
      <section className="py-24 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="flex-1">
              <h2 className="text-3xl font-serif mb-8">Living in {location.nameEn}</h2>
              <div className="space-y-6 text-white/60 leading-relaxed">
                <p>
                  {location.nameEn} offers a unique blend of Maltese tradition and modern luxury. As one of the most sought-after locations on the island, it provides residents with unparalleled access to premium amenities, international schools, and high-end dining.
                </p>
                <p>
                  Whether you're looking for a historic palazzo in the heart of the city or a contemporary penthouse overlooking the Mediterranean, {location.nameEn} has something for the most discerning buyers.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="text-gold" size={20} />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg mb-1">High Yields</h4>
                    <p className="text-xs text-white/40">Strong rental demand from international expats.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <Award className="text-gold" size={20} />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg mb-1">Premium Status</h4>
                    <p className="text-xs text-white/40">One of Malta's most prestigious addresses.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/3">
              <div className="glass-card rounded-3xl p-8 border border-gold/20">
                <div className="flex items-center gap-3 mb-6">
                  <Info className="text-gold" size={20} />
                  <h3 className="text-xl font-serif">Investment Guide</h3>
                </div>
                <p className="text-sm text-white/50 mb-8 leading-relaxed">
                  Explore our 2026 analysis of {location.nameEn} real estate trends and tax implications for foreign buyers.
                </p>
                <Link
                  to="/insights/rental-yields-malta-2026"
                  className="w-full py-4 border border-gold/30 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-luxury-black transition-all block text-center"
                >
                  Read Yields Report
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

