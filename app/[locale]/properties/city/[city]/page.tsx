import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CityListings } from '@/src/components/CityListings';
import { MarketSnapshot } from '@/src/components/MarketSnapshot';
import { getLocationBySlug, getLocationStats } from '@/src/lib/data';

interface Props {
  params: Promise<{ locale: string; city: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityName = city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: `Properties in ${cityName}`,
    description: `Browse luxury properties for sale in ${cityName}, Malta.`,
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const cityName = city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const location = await getLocationBySlug(city);
  if (!location) {
    notFound();
  }

  const stats = await getLocationStats(location.id);

  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-serif text-4xl md:text-5xl text-gold mb-4">{cityName}</h1>
        <p className="text-white/60 mb-10">Luxury properties for sale in {cityName}, Malta</p>
        <MarketSnapshot location={location} stats={stats} />
        <div className="mt-10">
          <CityListings locationId={location.id} />
        </div>
      </div>
    </main>
  );
}