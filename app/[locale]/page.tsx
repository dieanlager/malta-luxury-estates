import type { Metadata } from 'next';
import { routing } from '@/src/i18n/routing';
import { getFeaturedProperties, getPopularLocations } from '@/src/lib/data';
import { ARTICLES, MALTA_AGENCIES } from '@/src/constants';
import { LOCATION_STATS } from '@/src/lib/data';
import { PropertyCard } from '@/src/components/PropertyCard';
import { Link } from '@/src/navigation';
import { HeroSection } from '@/src/components/HeroSection';
import { MarketSnapshot } from '@/src/components/MarketSnapshot';
import { InteractiveTools } from '@/src/components/InteractiveTools';
import { MapSection } from '@/src/components/MapSection';

import { ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';


interface Props {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const base = 'https://www.maltaluxuryrealestate.com';
  const prefix = locale === 'en' ? '' : `/${locale}`;

  return {
    title: 'Malta Luxury Real Estate | Premium Properties in Malta & Gozo',
    description: 'Discover luxury villas, penthouses and exclusive properties for sale in Malta and Gozo. Expert real estate services for discerning buyers and investors.',
    alternates: {
      canonical: `${base}${prefix}`,
      languages: Object.fromEntries(
        routing.locales.map(l => [l, `${base}${l === 'en' ? '' : `/${l}`}`])
      ),
    },
  };
}

const FEATURED_LOCATIONS = [
  { slug: 'sliema', name: 'Sliema', count: 245, image: '/assets/images/locations/sliema.png' },
  { slug: 'st-julians', name: "St. Julian's", count: 180, image: '/assets/images/locations/st-julians.png' },
  { slug: 'valletta', name: 'Valletta', count: 95, image: '/assets/images/locations/valletta.png' },
  { slug: 'three-cities', name: 'Three Cities', count: 65, image: '/assets/images/locations/three-cities.png' },
  { slug: 'mellieha', name: 'Mellieħa', count: 110, image: '/assets/images/locations/mellieha.png' },
  { slug: 'victoria', name: 'Gozo', count: 120, image: '/assets/images/locations/gozo.png' },
];

const SLIEMA_STATS = {
  locationId: 1,
  listingsSaleCount: 245,
  listingsRentCount: 120,
  medianPriceSale: 1850000,
  medianPriceRent: 3500,
  avgPriceSale: 2100000,
  avgPriceRent: 4200,
  lastCalculatedAt: new Date().toISOString(),
};

const SLIEMA_LOCATION = {
  id: 1,
  slug: 'sliema',
  nameEn: 'Sliema',
  island: 'malta' as const,
  locationType: 'city' as const,
  isPopular: true,
  isLuxuryHub: true,
};

export default async function HomePage({ params }: Props) {
  const featured = await getFeaturedProperties();
  const featuredArticles = ARTICLES.slice(0, 3);

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Featured Properties ──────────────────────────────── */}
      {featured.length > 0 && (
        <section id="properties" className="py-32 max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-px bg-gold" />
                <span className="text-gold uppercase tracking-widest text-xs font-bold">Exclusive Portfolio</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white">Curated Selection</h2>
              <p className="text-white/50 max-w-md">Hand-picked premium properties across the Maltese islands, vetted for quality and investment potential.</p>
            </div>
            <Link href="/properties/all" className="gold-gradient text-luxury-black px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}

      {/* ── Interactive Map ───────────────────────────────────── */}
      <section className="py-32 bg-luxury-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1 bg-gold/10 border border-gold/20 rounded-full mb-6">
              <span className="text-gold text-[10px] font-bold uppercase tracking-widest">Geographic Exploration</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white">Explore the Archipelago</h2>
            <p className="text-white/50 max-w-2xl mx-auto">From the historic streets of Valletta to the serene farmhouses of Gozo, find your perfect location on the map.</p>
          </div>
          <div className="h-[600px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <MapSection />
          </div>
        </div>
      </section>

      {/* ── Market Snapshot ───────────────────────────────────── */}
      <section className="py-32 bg-luxury-black">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif mb-4 uppercase tracking-widest text-white">Market Snapshot</h2>
            <p className="text-white/40 text-sm">Live pricing intelligence for Malta&apos;s premium real estate market</p>
          </div>
          <MarketSnapshot location={SLIEMA_LOCATION} stats={SLIEMA_STATS} />
        </div>
      </section>

      {/* ── Featured Locations ────────────────────────────────── */}
      <section className="py-32 bg-luxury-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-serif mb-4 text-white">Prime Locations</h2>
            <p className="text-white/40">Discover Malta&apos;s most sought-after neighbourhoods</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_LOCATIONS.map((loc) => (
              <Link
                key={loc.slug}
                href={`/properties/${loc.slug}` as any}
                className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer border border-white/5 block"
              >
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-serif mb-1 text-white">{loc.name}</h3>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gold">{loc.count} Properties</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partners / Agencies ───────────────────────────────── */}
      <section className="py-32 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-gold uppercase tracking-widest text-xs font-bold mb-6 block">Industry Leaders</span>
          <h2 className="text-3xl md:text-4xl font-serif mb-16 text-white">Trusted by Malta&apos;s Leading Agencies</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 items-center opacity-50 hover:opacity-100 transition-all duration-700">
            {MALTA_AGENCIES.slice(0, 10).map((agency) => (
              <div key={agency.name} className="flex flex-col items-center gap-2 group cursor-pointer">
                <span className="text-lg md:text-xl font-serif italic group-hover:text-gold transition-colors text-white">{agency.name}</span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-white/30">{agency.website}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Agencies CTA ─────────────────────────────────── */}
      <section className="py-32 bg-luxury-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-card rounded-[3rem] p-12 md:p-20 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-block px-4 py-1 bg-gold/10 border border-gold/20 rounded-full mb-6">
                <span className="text-gold text-[10px] font-bold uppercase tracking-widest">For Professionals</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight text-white">
                List your properties <br /><span className="text-gold">with us</span>
              </h2>
              <p className="text-white/50 text-lg mb-10 leading-relaxed">
                Join Malta&apos;s premier luxury property network. Reach international HNWIs, expats, and investors actively seeking premium Maltese real estate.
              </p>
              <ul className="space-y-4 mb-12">
                {['Premium listing placement', 'International buyer reach', 'Dedicated account manager', 'Advanced analytics dashboard'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm font-medium text-white">
                    <ShieldCheck className="text-gold shrink-0" size={18} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={"/agency/register" as any} className="gold-gradient text-luxury-black px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl inline-block">
                Join as Agency
              </Link>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-square rounded-3xl overflow-hidden border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000"
                  className="w-full h-full object-cover opacity-60"
                  alt="Modern Office"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 glass-card p-8 rounded-2xl border border-gold/20 shadow-2xl max-w-xs">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center">
                    <span className="text-luxury-black font-bold text-lg">↑</span>
                  </div>
                  <div>
                    <div className="text-2xl font-serif text-white">150k+</div>
                    <div className="text-[9px] uppercase tracking-widest font-bold text-white/40">Monthly Reach</div>
                  </div>
                </div>
                <p className="text-xs text-white/50 italic">&ldquo;The highest conversion rate for luxury leads we&apos;ve seen on the island.&rdquo;</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Tools ─────────────────────────────────── */}
      <InteractiveTools />

      {/* ── Investment Guides ─────────────────────────────────── */}
      <section id="investment" className="py-32 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Expert Knowledge</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white">Investment Insights</h2>
          <p className="text-white/50 max-w-2xl mx-auto">Strategic advice for international investors, residency seekers, and high-net-worth individuals looking at the Maltese market.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {featuredArticles.map((article) => (
            <Link key={article.slug} href={`/insights/${article.slug}` as any} className="group block">
              <div className="aspect-video overflow-hidden rounded-2xl mb-6 relative">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-gold text-luxury-black text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {article.category}
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-serif mb-3 group-hover:text-gold transition-colors leading-tight text-white">{article.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-4">{article.excerpt}</p>
              <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold">
                Read Guide <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Gold CTA ─────────────────────────────────────────── */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto gold-gradient rounded-[3rem] p-12 md:p-24 text-center text-luxury-black relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-serif mb-8">Ready to find your dream estate?</h2>
            <p className="text-luxury-black/70 mb-12 max-w-lg mx-auto font-medium text-lg">
              Connect with our luxury specialists today for a private consultation and exclusive access to off-market listings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="bg-luxury-black text-white px-12 py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl inline-block">
                Contact a Specialist
              </Link>
              <Link href="/properties/all" className="border-2 border-luxury-black text-luxury-black px-12 py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-luxury-black hover:text-white transition-all inline-block">
                Explore Malta Property
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}