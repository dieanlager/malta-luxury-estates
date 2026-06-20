import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';
import { getAllProperties, LOCATIONS } from '@/src/lib/data';
import { PropertyCard } from '@/src/components/PropertyCard';
import { Link } from '@/src/navigation';

interface Props {
  params: Promise<{ locale: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const base = 'https://www.maltaluxuryrealestate.com';
  const prefix = locale === 'en' ? '' : `/${locale}`;

  return {
    title: t('seo.properties.title', { defaultValue: 'Luxury Properties for Sale in Malta' }),
    description: t('seo.properties.description', { defaultValue: 'Browse our curated selection of luxury properties.' }),
    alternates: {
      canonical: `${base}${prefix}/properties/all`,
      languages: {
        'x-default': `${base}/properties/all`,
        en: `${base}/properties/all`,
        it: `${base}/it/immobiliare/tutti`,
        de: `${base}/de/immobilien/alle`,
        fr: `${base}/fr/proprietes/toutes`,
        pl: `${base}/pl/nieruchomosci/wszystkie`,
      },
    },
    openGraph: {
      title: t('seo.properties.title', { defaultValue: 'Luxury Properties for Sale in Malta' }),
      description: t('seo.properties.description', { defaultValue: 'Browse our curated selection of luxury properties.' }),
      type: 'website',
      url: `${base}${prefix}/properties/all`,
      locale: ({ en: 'en_US', de: 'de_DE', fr: 'fr_FR', it: 'it_IT', pl: 'pl_PL' } as Record<string, string>)[locale] ?? 'en_US',
      images: [{ url: `${base}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      images: [`${base}/og-image.png`],
    },
  };
}

export default async function PropertiesAllPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const properties = await getAllProperties();

  const popularCities = LOCATIONS.filter(l => l.isPopular).slice(0, 8);

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Luxury Properties for Sale in Malta',
    url: `https://www.maltaluxuryrealestate.com${locale === 'en' ? '' : `/${locale}`}/properties/all`,
    numberOfItems: properties.length,
    itemListElement: properties.slice(0, 20).map((prop: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: prop.title,
      url: `https://www.maltaluxuryrealestate.com/properties/${prop.slug ?? prop.id}`,
      ...(prop.images?.[0] && { image: prop.images[0] }),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <main className="min-h-screen bg-luxury-black pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-6 block">
              {t('common.our_collection', { defaultValue: 'Our Collection' })}
            </span>
            <h1 className="font-serif text-5xl md:text-7xl text-white mb-6">
              {t('seo.properties.h1', { defaultValue: 'Luxury Properties in Malta' })}
            </h1>
            <p className="text-white/50 text-lg max-w-2xl leading-relaxed">
              {t('seo.properties.description', { defaultValue: 'Curated selection of premium real estate across Malta and Gozo.' })}
            </p>
          </div>

          {/* Location filters */}
          <div className="flex flex-wrap gap-3 mb-16">
            <span className="text-[9px] uppercase tracking-widest text-white/30 border border-white/10 bg-white/5 rounded-full px-4 py-2">
              {t('common.all', { defaultValue: 'All' })} ({properties.length})
            </span>
            {popularCities.map(city => (
              <Link
                key={city.slug}
                href={`/properties/${city.slug}` as any}
                className="text-[9px] uppercase tracking-widest text-white/40 border border-white/10 hover:border-gold/30 hover:text-gold rounded-full px-4 py-2 transition-all"
              >
                {city.nameEn}
              </Link>
            ))}
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 text-white/40">
              <p className="font-serif text-3xl mb-6">{t('common.no_listings', { defaultValue: 'No listings available' })}</p>
              <Link href="/contact" className="text-gold text-sm uppercase tracking-widest hover:text-white transition-colors">
                {t('common.contact_us', { defaultValue: 'Contact Us' })} →
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}