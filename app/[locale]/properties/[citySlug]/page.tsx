import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { routing } from '@/src/i18n/routing';
import { LOCATIONS, getLocationBySlug, getLocationStats, getAllProperties } from '@/src/lib/data';
import { generateCityFAQSchema, generateBreadcrumbSchema, formatPrice } from '@/src/lib/seo/schemas';
import { Link } from '@/src/navigation';
import { PropertyCard } from '@/src/components/PropertyCard';

interface Props {
  params: Promise<{ locale: string; citySlug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return routing.locales.flatMap(locale =>
    LOCATIONS.map(loc => ({ locale, citySlug: loc.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, citySlug } = await params;
  const location = await getLocationBySlug(citySlug);
  if (!location) return {};

  const base = 'https://www.maltaluxuryrealestate.com';
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const t = await getTranslations({ locale, namespace: 'common' });

  const title = t('seo.city.title', {
    location: location.nameEn,
    defaultValue: `${location.nameEn} Luxury Property for Sale | Malta Real Estate`,
  });
  const description = t('seo.city.description', {
    location: location.nameEn,
    defaultValue: `Browse luxury properties for sale in ${location.nameEn}, Malta. Exclusive villas, penthouses, and apartments.`,
  });

  return {
    title,
    description,
    alternates: {
      canonical: `${base}${prefix}/properties/${citySlug}`,
      languages: Object.fromEntries(
        routing.locales.map(l => [l, `${base}${l === 'en' ? '' : `/${l}`}/properties/${citySlug}`])
      ),
    },
    openGraph: { title, description, type: 'website', url: `${base}${prefix}/properties/${citySlug}` },
  };
}

export default async function CityPage({ params }: Props) {
  const { locale, citySlug } = await params;
  const location = await getLocationBySlug(citySlug);
  if (!location) notFound();

  const t = await getTranslations({ locale, namespace: 'common' });
  const [stats, allProperties] = await Promise.all([
    getLocationStats(location.id),
    getAllProperties(),
  ]);

  const cityProperties = allProperties
    .filter(p => p.locationName?.toLowerCase().includes(location.nameEn.toLowerCase()))
    .slice(0, 12);

  const base = 'https://www.maltaluxuryrealestate.com';
  const prefix = locale === 'en' ? '' : `/${locale}`;

  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: base },
    { name: t('nav.properties', { defaultValue: 'Properties' }), url: `${base}${prefix}/properties/all` },
    { name: location.nameEn, url: `${base}${prefix}/properties/${citySlug}` },
  ]);

  const faqSchema = generateCityFAQSchema(location, stats);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="min-h-screen bg-luxury-black pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20">
            <nav className="flex items-center gap-2 text-xs text-white/30 mb-8 uppercase tracking-widest">
              <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              <span>/</span>
              <Link href="/properties/all" className="hover:text-gold transition-colors">
                {t('nav.properties', { defaultValue: 'Properties' })}
              </Link>
              <span>/</span>
              <span className="text-white/60">{location.nameEn}</span>
            </nav>

            <div className="flex items-start justify-between gap-8 flex-wrap">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">
                  {location.island === 'gozo' ? 'Gozo' : 'Malta'} · {t('common.luxury_real_estate', { defaultValue: 'Luxury Real Estate' })}
                </span>
                <h1 className="font-serif text-5xl md:text-7xl text-white mb-6">{location.nameEn}</h1>
                {location.description && (
                  <p className="text-white/50 text-lg max-w-2xl leading-relaxed">{location.description}</p>
                )}
              </div>

              {stats && (
                <div className="grid grid-cols-2 gap-4 min-w-[240px]">
                  {stats.medianPriceSale && (
                    <div className="glass-card p-5 rounded-2xl border border-white/5">
                      <div className="text-gold font-serif text-2xl">{formatPrice(stats.medianPriceSale)}</div>
                      <div className="text-white/30 text-[10px] uppercase tracking-widest mt-1">{t('common.median_price', { defaultValue: 'Median Price' })}</div>
                    </div>
                  )}
                  {stats.listingsSaleCount > 0 && (
                    <div className="glass-card p-5 rounded-2xl border border-white/5">
                      <div className="text-gold font-serif text-2xl">{stats.listingsSaleCount}</div>
                      <div className="text-white/30 text-[10px] uppercase tracking-widest mt-1">{t('common.listings', { defaultValue: 'Listings' })}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {cityProperties.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-10">
                <h2 className="font-serif text-2xl text-white">
                  {t('common.properties_in', { location: location.nameEn, defaultValue: `Properties in ${location.nameEn}` })}
                </h2>
                <Link href="/properties/all" className="text-[10px] uppercase tracking-widest text-gold hover:text-white transition-colors">
                  {t('common.view_all', { defaultValue: 'View All' })} →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cityProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-24 text-white/40">
              <p className="font-serif text-2xl mb-4">{t('common.no_listings', { defaultValue: 'No listings available yet' })}</p>
              <Link href="/properties/all" className="text-gold hover:text-white transition-colors text-sm uppercase tracking-widest">
                {t('common.view_all_properties', { defaultValue: 'Browse all properties' })} →
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
