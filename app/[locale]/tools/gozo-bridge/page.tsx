import type { Metadata } from 'next';
import { GozoBridgeTrackerClient } from '@/src/components/GozoBridgeTrackerClient';

const base = 'https://www.maltaluxuryrealestate.com';
const locales = ['en', 'de', 'fr', 'it', 'pl'];
const toolPath = '/tools/gozo-bridge';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const prefix = locale === 'en' ? '' : `/${locale}`;

  return {
    title: 'Gozo Bridge Tracker | Malta Luxury Real Estate',
    description: 'Track the Gozo Bridge project status and its impact on Gozo property values.',
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${base}${prefix}${toolPath}`,
      languages: {
        'x-default': `${base}${toolPath}`,
        ...Object.fromEntries(
          locales.map(l => [l, `${base}${l === 'en' ? '' : `/${l}`}${toolPath}`])
        ),
      },
    },
  };
}

export default function GozoBridgePage() {
  return (
    <main className="min-h-screen pt-20">
      <GozoBridgeTrackerClient />
    </main>
  );
}