import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { CityListings } from '@/src/components/CityListings';
import { MarketSnapshot } from '@/src/components/MarketSnapshot';
import { getLocationBySlug, getLocationStats, getPropertiesByLocation } from '@/src/lib/data';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string; city: string }>;
}

const base = 'https://www.maltaluxuryrealestate.com';
const locales = ['en', 'de', 'fr', 'it', 'pl'];

const getCityData = cache(async (city: string) => {
  const location = await getLocationBySlug(city);
  if (!location) return null;
  const [stats, properties] = await Promise.all([
    getLocationStats(location.id),
    getPropertiesByLocation(location.id),
  ]);
  return { location, stats, properties };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, city } = await params;
  const data = await getCityData(city);
  const cityName = city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const path = `/properties/city/${city}`;
  const hasListings = (data?.properties.length ?? 0) > 0;

  return {
    title: `Properties in ${cityName}`,
    description: `Browse luxury properties for sale in ${cityName}, Malta.`,
    robots: { index: hasListings, follow: true },
    alternates: {
      canonical: `${base}${prefix}${path}`,
      languages: {
        'x-default': `${base}${path}`,
        ...Object.fromEntries(
          locales.map(l => [l, `${base}${l === 'en' ? '' : `/${l}`}${path}`])
        ),
      },
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const cityName = city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const data = await getCityData(city);
  if (!data) notFound();

  const { location, stats, properties } = data;

  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-serif text-4xl md:text-5xl text-gold mb-4">{cityName}</h1>
        <p className="text-white/60 mb-10">Luxury properties for sale in {cityName}, Malta</p>
        <MarketSnapshot location={location} stats={stats} />
        <div className="mt-10">
          <CityListings locationId={location.id} initialProperties={properties} />
        </div>
      </div>
    </main>
  );
}
