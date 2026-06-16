import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { routing } from '@/src/i18n/routing';
import { getAllProperties, getPropertyBySlug } from '@/src/lib/data';
import { generatePropertySchema, generateBreadcrumbSchema } from '@/src/lib/seo/schemas';
import { Link } from '@/src/navigation';
import { Bed, Bath, Maximize, MapPin, ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const properties = await getAllProperties();
  const top50 = properties.slice(0, 50);
  return routing.locales.flatMap(locale =>
    top50.map(p => ({ locale, slug: p.slug ?? p.id }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return {};

  const base = 'https://www.maltaluxuryrealestate.com';
  const prefix = locale === 'en' ? '' : `/${locale}`;
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

export default async function PropertyPage({ params }: Props) {
  const { locale, slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const t = await getTranslations({ locale, namespace: 'common' });

  const base = 'https://www.maltaluxuryrealestate.com';
  const prefix = locale === 'en' ? '' : `/${locale}`;

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

      <main className="min-h-screen bg-luxury-black pt-24 pb-24">
        <div className="relative h-[60vh] overflow-hidden">
          {property.images?.[0] ? (
            <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <span className="text-white/20 font-serif text-4xl">Malta Luxury</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 via-transparent to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto px-6 -mt-32 relative z-10">
          <div className="mb-8">
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
                  €{property.price?.toLocaleString('en-GB')}
                </div>
                <div className="text-white/30 text-xs uppercase tracking-widest mt-1">
                  {property.type === 'rent' ? t('common.per_month', { defaultValue: 'per month' }) : t('common.for_sale', { defaultValue: 'For Sale' })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 mt-8 py-6 border-y border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Bed size={16} className="text-gold" />
                <span>{property.beds} {t('common.beds', { defaultValue: 'beds' })}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Bath size={16} className="text-gold" />
                <span>{property.baths} {t('common.baths', { defaultValue: 'baths' })}</span>
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
              <div className="glass-card p-8 rounded-3xl border border-white/10 sticky top-28">
                <h3 className="font-serif text-xl text-white mb-2">{t('common.enquire', { defaultValue: 'Enquire About This Property' })}</h3>
                {property.agency?.name && (
                  <p className="text-white/40 text-xs mb-6">{t('common.listed_by', { defaultValue: 'Listed by' })} {property.agency.name}</p>
                )}
                {property.affiliate_url ? (
                  <a
                    href={property.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block text-center py-4 gold-gradient text-luxury-black font-bold text-sm uppercase tracking-widest rounded-2xl hover:opacity-90 transition-opacity"
                  >
                    {t('common.view_listing', { defaultValue: 'View Full Listing' })}
                  </a>
                ) : (
                  <Link
                    href="/contact"
                    className="w-full block text-center py-4 gold-gradient text-luxury-black font-bold text-sm uppercase tracking-widest rounded-2xl hover:opacity-90 transition-opacity"
                  >
                    {t('common.contact_agent', { defaultValue: 'Contact Agent' })}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
