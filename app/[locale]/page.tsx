import type { Metadata } from 'next';
import { routing } from '@/src/i18n/routing';
import { getFeaturedProperties, getPopularLocations } from '@/src/lib/data';
import { PropertyCard } from '@/src/components/PropertyCard';
import { Link } from '@/src/navigation';

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

export default async function HomePage({ params }: Props) {
  const [featured, popularLocations] = await Promise.all([
    getFeaturedProperties(),
    Promise.resolve(getPopularLocations()),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-luxury-black overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/malta-hero.jpg')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/40 via-transparent to-luxury-black" />
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-24">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px w-16 bg-gold/50" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
              {"Malta's Premier Real Estate Portal"}
            </span>
            <div className="h-px w-16 bg-gold/50" />
          </div>
          <h1 className="font-serif text-6xl md:text-8xl text-white leading-none mb-8">
            {'Luxury Living'}<br />
            <span className="text-gold italic">{'in Malta'}</span>
          </h1>
          <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            {'Exclusive villas, penthouses, and investment properties in the heart of the Mediterranean.'}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/properties/all" className="inline-flex items-center px-10 py-4 gold-gradient text-luxury-black font-bold text-[11px] uppercase tracking-widest rounded-full hover:opacity-90 transition-opacity">
              {'Browse Properties'}
            </Link>
            <Link href="/tools/quiz" className="inline-flex items-center px-10 py-4 border border-white/20 text-white font-medium text-[11px] uppercase tracking-widest rounded-full hover:border-gold/40 hover:text-gold transition-all">
              {'Find Your Property'}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured properties */}
      {featured.length > 0 && (
        <section className="py-32 bg-luxury-black px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-16">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">
                  {'Hand-Picked Selection'}
                </span>
                <h2 className="font-serif text-5xl text-white">
                  {'Featured Properties'}
                </h2>
              </div>
              <Link href="/properties/all" className="hidden md:flex items-center gap-2 text-sm uppercase tracking-widest text-gold hover:text-white transition-colors">
                'View All' →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular locations */}
      <section className="py-32 bg-white/[0.02] px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-6 block">
              {'Prime Locations'}
            </span>
            <h2 className="font-serif text-5xl text-white mb-4">
              {'Where to Buy in Malta'}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {popularLocations.slice(0, 10).map(loc => (
              <Link
                key={loc.slug}
                href={`/properties/${loc.slug}` as any}
                className="group glass-card rounded-2xl p-6 border border-white/5 hover:border-gold/20 transition-all text-center block"
              >
                <h3 className="font-serif text-lg text-white group-hover:text-gold transition-colors">{loc.nameEn}</h3>
                <div className="h-0.5 w-0 group-hover:w-8 bg-gold mx-auto mt-3 transition-all duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Insights CTA */}
      <section className="py-32 px-6 bg-luxury-black">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-8 block">
            {'Expert Knowledge'}
          </span>
          <h2 className="font-serif text-5xl text-white mb-6">
            {'Malta Property Guides'}
          </h2>
          <p className="text-white/50 text-lg mb-10 leading-relaxed">
            {'In-depth guides for buyers, investors, and expats moving to Malta.'}
          </p>
          <Link href="/insights" className="inline-flex items-center px-10 py-4 border border-gold/40 text-gold font-medium text-[11px] uppercase tracking-widest rounded-full hover:bg-gold/5 transition-all">
            {'Explore All Guides'} →
          </Link>
        </div>
      </section>
    </main>
  );
}
