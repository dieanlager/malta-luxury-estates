import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';
import { getFeaturedProperties } from '@/src/lib/data';
import { ARTICLES, MALTA_AGENCIES } from '@/src/constants';
import { PropertyCard } from '@/src/components/PropertyCard';
import { Link } from '@/src/navigation';
import { HeroSection } from '@/src/components/HeroSection';
import { MarketSnapshot } from '@/src/components/MarketSnapshot';
import { InteractiveToolsLazy as InteractiveTools } from '@/src/components/InteractiveToolsLazy';
import { MapSection } from '@/src/components/MapSection';
import { ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

interface Props {
  params: Promise<{ locale: string }>;
}

export const revalidate = 900;

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  const base = 'https://www.maltaluxuryrealestate.com';
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const ogLocaleMap: Record<string, string> = {
    en: 'en_US', de: 'de_DE', fr: 'fr_FR', it: 'it_IT', pl: 'pl_PL',
  };

  return {
    title: { absolute: t('home.title') },
    description: t('home.description'),
    alternates: {
      canonical: `${base}${prefix}`,
      languages: {
        'x-default': base,
        ...Object.fromEntries(
          routing.locales.map(l => [l, `${base}${l === 'en' ? '' : `/${l}`}`])
        ),
      },
    },
    openGraph: {
      title: { absolute: t('home.title') },
      description: t('home.description'),
      type: 'website',
      url: `${base}${prefix}`,
      locale: ogLocaleMap[locale] ?? 'en_US',
      images: [{ url: `${base}/og-image.png`, width: 1200, height: 630, alt: 'Malta Luxury Real Estate' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: { absolute: t('home.title') },
      description: t('home.description'),
      images: [`${base}/og-image.png`],
    },
  };
}

const FEATURED_LOCATIONS = [
  { slug: 'sliema', name: 'Sliema', count: 245, image: '/assets/images/locations/sliema.png' },
  { slug: 'st-julians', name: "St. Julian's", count: 180, image: '/assets/images/locations/st-julians.png' },
  { slug: 'valletta', name: 'Valletta', count: 95, image: '/assets/images/locations/valletta.png' },
  { slug: 'three-cities', name: 'Three Cities', count: 65, image: '/assets/images/locations/three-cities.png' },
  { slug: 'mellieha', name: 'Mellieha', count: 110, image: '/assets/images/locations/mellieha.png' },
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
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const featured = await getFeaturedProperties();
  const featuredArticles = ARTICLES.slice(0, 3);

  return (
    <main>
      <HeroSection />

      {featured.length > 0 && (
        <section id="properties" className="py-32 max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-px bg-gold" />
                <span className="text-gold uppercase tracking-widest text-xs font-bold">{t('sections.featured.badge')}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white">{t('sections.featured.title')}</h2>
              <p className="text-white/50 max-w-md">{t('sections.featured.subtitle')}</p>
            </div>
            <Link href="/properties/all" className="gold-gradient text-luxury-black px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform">
              {t('sections.featured.view_all')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}

      <section className="py-32 bg-luxury-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1 bg-gold/10 border border-gold/20 rounded-full mb-6">
              <span className="text-gold text-[10px] font-bold uppercase tracking-widest">{t('sections.map.badge')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white">{t('sections.map.title')}</h2>
            <p className="text-white/50 max-w-2xl mx-auto">{t('sections.map.subtitle')}</p>
          </div>
          <div className="h-[600px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <MapSection />
          </div>
        </div>
      </section>

      <section className="py-32 bg-luxury-black">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif mb-4 uppercase tracking-widest text-white">{t('sections.market_snapshot.badge')}</h2>
            <p className="text-white/60 text-sm">{t('sections.market_snapshot.subtitle')}</p>
          </div>
          <MarketSnapshot location={SLIEMA_LOCATION} stats={SLIEMA_STATS} />
        </div>
      </section>

      <section className="py-32 bg-luxury-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-serif mb-4 text-white">{t('sections.locations_grid.badge')}</h2>
            <p className="text-white/60">{t('sections.locations_grid.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_LOCATIONS.map((loc) => (
              <Link
                key={loc.slug}
                href={`/properties/${loc.slug}` as any}
                className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer border border-white/5 block"
              >
                <Image
                  src={loc.image}
                  alt={loc.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-serif mb-1 text-white">{loc.name}</h3>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gold">{t('sections.locations_grid.count', { count: loc.count })}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-gold uppercase tracking-widest text-xs font-bold mb-6 block">{t('sections.partners.badge')}</span>
          <h2 className="text-3xl md:text-4xl font-serif mb-16 text-white">{t('sections.partners.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 items-center">
            {MALTA_AGENCIES.slice(0, 10).map((agency) => (
              <div key={agency.name} className="flex flex-col items-center gap-2 group cursor-pointer opacity-60 hover:opacity-100 transition-opacity duration-500">
                <span className="text-lg md:text-xl font-serif italic group-hover:text-gold transition-colors text-white">{agency.name}</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/80">{agency.website}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-luxury-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-card rounded-[3rem] p-12 md:p-20 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-block px-4 py-1 bg-gold/10 border border-gold/20 rounded-full mb-6">
                <span className="text-gold text-[10px] font-bold uppercase tracking-widest">{t('sections.cta.badge')}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight text-white">
                {t('sections.cta.title')} <span className="text-gold"></span>
              </h2>
              <p className="text-white/50 text-lg mb-10 leading-relaxed">
                {t('sections.cta.subtitle')}
              </p>
              <ul className="space-y-4 mb-12">
                {(['feature_1', 'feature_2', 'feature_3', 'feature_4'] as const).map((key) => (
                  <li key={key} className="flex items-center gap-3 text-sm font-medium text-white">
                    <ShieldCheck className="text-gold shrink-0" size={18} />
                    <span>{t(`sections.cta.${key}`)}</span>
                  </li>
                ))}
              </ul>
              <Link href={"/agency/register" as any} className="gold-gradient text-luxury-black px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl inline-block">
                {t('sections.cta.button')}
              </Link>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-square rounded-3xl overflow-hidden border border-white/10 relative">
                <Image
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover opacity-60"
                  alt="Modern Office"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 glass-card p-8 rounded-2xl border border-gold/20 shadow-2xl max-w-xs">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center">
                    <span className="text-luxury-black font-bold text-lg">M</span>
                  </div>
                  <div>
                    <div className="text-2xl font-serif text-white">150k+</div>
                    <div className="text-[9px] uppercase tracking-widest font-bold text-white/60">{t('sections.cta.reach_label')}</div>
                  </div>
                </div>
                <p className="text-xs text-white/50 italic">&ldquo;{t('sections.cta.testimonial')}&rdquo;</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InteractiveTools />

      <section id="investment" className="py-32 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
            <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{t('sections.insights.badge')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white">{t('sections.insights.title')}</h2>
          <p className="text-white/50 max-w-2xl mx-auto">{t('sections.insights.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {featuredArticles.map((article) => (
            <Link key={article.slug} href={`/insights/${article.slug}` as any} className="group block">
              <div className="aspect-video overflow-hidden rounded-2xl mb-6 relative">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-gold text-luxury-black text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {article.category}
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-serif mb-3 group-hover:text-gold transition-colors leading-tight text-white">{article.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">{article.excerpt}</p>
              <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold">
                {t('sections.insights.cta')} <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

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