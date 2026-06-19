import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { routing } from '@/src/i18n/routing';
import { LOCATIONS, getLocationBySlug, getLocationStats, getAllProperties, getPropertyBySlug } from '@/src/lib/data';
import { generateCityFAQSchema, generateBreadcrumbSchema, generatePropertySchema, formatPrice } from '@/src/lib/seo/schemas';
import { Link } from '@/src/navigation';
import { PropertyCard } from '@/src/components/PropertyCard';
import { Bed, Bath, Maximize, MapPin, ArrowLeft } from 'lucide-react';
import PropertyDetailTools from '@/src/components/PropertyDetailTools';
import { PropertyGallery } from '@/src/components/PropertyGallery';
import { PropertyContactCard } from '@/src/components/PropertyContactCard';
import { StickyPropertyBar } from '@/src/components/StickyPropertyBar';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const properties = await getAllProperties();
  const cityParams = routing.locales.flatMap(locale =>
    LOCATIONS.map(loc => ({ locale, slug: loc.slug }))
  );
  const propertyParams = routing.locales.flatMap(locale =>
    properties.slice(0, 50).map(p => ({ locale, slug: p.slug ?? String(p.id) }))
  );
  const seen = new Set<string>();
  return [...cityParams, ...propertyParams].filter(p => {
    const key = `${p.locale}|${p.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const base = 'https://www.maltaluxuryrealestate.com';
  const prefix = locale === 'en' ? '' : `/${locale}`;

  const location = await getLocationBySlug(slug);
  if (location) {
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
        canonical: `${base}${prefix}/properties/${slug}`,
        languages: Object.fromEntries(
          routing.locales.map(l => [l, `${base}${l === 'en' ? '' : `/${l}`}/properties/${slug}`])
        ),
      },
      openGraph: { title, description, type: 'website', url: `${base}${prefix}/properties/${slug}` },
    };
  }

  const property = await getPropertyBySlug(slug);
  if (!property) return {};
  const title = `${property.title} | Malta Luxury Real Estate`;
  const description = property.description?.slice(0, 160) ?? title;
  return {
    title,
    description,
    alternates: {
      canonical: `${base}${prefix}/properties/${slug}`,
      languages: Object.fromEntries(
        routing.locales.map(l => [l, `${base}${l === 'en' ? '' : `/${l}`}/properties/${slug}`])
      ),
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${base}${prefix}/properties/${slug}`,
      images: property.images?.[0] ? [{ url: property.images[0] }] : [],
    },
  };
}

export default async function PropertyOrCityPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const base = 'https://www.maltaluxuryrealestate.com';
  const prefix = locale === 'en' ? '' : `/${locale}`;

  const location = await getLocationBySlug(slug);
  if (location) {
    const [stats, allProperties] = await Promise.all([
      getLocationStats(location.id),
      getAllProperties(),
    ]);
    const cityProperties = allProperties
      .filter(p => p.locationName?.toLowerCase().includes(location.nameEn.toLowerCase()))
      .slice(0, 12);

    const breadcrumb = generateBreadcrumbSchema([
      { name: 'Home', url: base },
      { name: t('nav.properties', { defaultValue: 'Properties' }), url: `${base}${prefix}/properties/all` },
      { name: location.nameEn, url: `${base}${prefix}/properties/${slug}` },
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
                    {location.island === 'gozo' ? 'Gozo' : 'Malta'} {'·'} {t('common.luxury_real_estate', { defaultValue: 'Luxury Real Estate' })}
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
                    {t('common.view_all', { defaultValue: 'View All' })} {'→'}
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
                  {t('common.view_all_properties', { defaultValue: 'Browse all properties' })} {'→'}
                </Link>
              </div>
            )}
          </div>
        </main>
      </>
    );
  }

  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: base },
    { name: t('nav.properties', { defaultValue: 'Properties' }), url: `${base}${prefix}/properties/all` },
    { name: property.title, url: `${base}${prefix}/properties/${slug}` },
  ]);
  const propertySchema = generatePropertySchema(property);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(propertySchema) }} />
      <main className="min-h-screen bg-luxury-black pt-24 pb-24 lg:pb-24">
        <PropertyGallery images={property.images ?? []} title={property.title} />
        <StickyPropertyBar
          title={property.title}
          price={property.price}
          image={property.images?.[0]}
          slug={property.slug ?? String(property.id)}
          statusLabel={property.type === 'rent' ? t('common.per_month', { defaultValue: 'per month' }) : t('common.for_sale', { defaultValue: 'For Sale' })}
          sentinelId="property-title-sentinel"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10 pb-24 lg:pb-0">
          <div className="mb-8" id="property-title-sentinel">
            <Link href="/properties/all" className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-gold transition-colors mb-6">
              <ArrowLeft size={14} />
              {t('common.back_to_listings', { defaultValue: 'Back to Listings' })}
            </Link>
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                {property.propertyType && (
                  <span className="text-[9px] uppercase tracking-[0.3em] text-gold mb-3 block">{property.propertyType}</span>
                )}
                <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">{property.title}</h1>
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <MapPin size={14} />
                  <span>{property.locationName}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-serif text-4xl text-gold">
                  {'€'}{property.price?.toLocaleString('en-GB')}
                </div>
                <div className="text-white/30 text-xs uppercase tracking-widest mt-1">
                  {property.type === 'rent' ? t('common.per_month', { defaultValue: 'per month' }) : t('common.for_sale', { defaultValue: 'For Sale' })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-8 mt-8 py-6 border-y border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Bed size={16} className="text-gold" />
                <span>{property.beds} {t('common.beds_label')}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Bath size={16} className="text-gold" />
                <span>{property.baths} {t('common.baths_label')}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Maximize size={16} className="text-gold" />
                <span>{property.sqm} m²</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl text-white mb-6">{t('common.description', { defaultValue: 'Property Description' })}</h2>
              <div className="text-white/60 leading-relaxed whitespace-pre-line">{property.description}</div>
              {property.features && property.features.length > 0 && (
                <div className="mt-12">
                  <h3 className="font-serif text-xl text-white mb-6">{t('common.features', { defaultValue: 'Features & Amenities' })}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {property.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-white/60 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <PropertyContactCard
                price={property.price}
                slug={property.slug ?? String(property.id)}
                statusLabel={property.type === 'rent' ? t('common.per_month', { defaultValue: 'per month' }) : t('common.for_sale', { defaultValue: 'For Sale' })}
                agencyName={property.agency?.name}
                agencyLogo={property.agency?.logo}
              />
            </div>
          </div>
        </div>
        <PropertyDetailTools property={property} />
      </main>
    </>
  );
}