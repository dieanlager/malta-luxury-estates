import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

const base = 'https://www.maltaluxuryrealestate.com';
const locales = ['en', 'de', 'fr', 'it', 'pl'];
const toolPath = '/tools';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const prefix = locale === 'en' ? '' : `/${locale}`;

  return {
    title: 'Malta Property Tools | Malta Luxury Real Estate',
    description: 'Free property tools for Malta buyers: mortgage calculator, ROI calculator, buying costs, and more.',
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

export default function ToolsPage({ params }: { params: Promise<{ locale: string }> }) {
    // Redirect to mortgage calculator as default tool
    redirect('/tools/mortgage');
}