import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';
import { BuyVsRentCalculator } from '@/src/components/calculators/BuyVsRentCalculator';

interface Props { params: Promise<{ locale: string }> }

const BASE = 'https://www.maltaluxuryrealestate.com';

const ogLocaleMap: Record<string, string> = {
  en: 'en_US', de: 'de_DE', fr: 'fr_FR', it: 'it_IT', pl: 'pl_PL',
};

export async function generateStaticParams() { return routing.locales.map(locale => ({ locale })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return {
    title: t('seo.tools.buyVsRent.title', { defaultValue: 'Buy vs Rent Calculator Malta 2026 | Malta Luxury Real Estate' }),
    description: t('seo.tools.buyVsRent.description', { defaultValue: 'Compare buying vs renting property in Malta — net worth projections over 1 to 30 years.' }),
    alternates: { canonical: `${BASE}${prefix}/tools/buy-vs-rent` },
    openGraph: {
      locale: ogLocaleMap[locale] ?? 'en_US',
      images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: [`${BASE}/og-image.png`] },
  };
}

export default async function BuyVsRentPage({ params }: Props) {
  const { locale } = await params;
  await getTranslations({ locale, namespace: 'common' });

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Buy vs Rent in Malta — How to Compare',
    description: 'Use our calculator to determine whether buying or renting property in Malta makes more financial sense for your situation.',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Enter property details', text: 'Input the purchase price, monthly rent equivalent, and your investment horizon.' },
      { '@type': 'HowToStep', position: 2, name: 'Set financial assumptions', text: 'Adjust mortgage rate, deposit, expected price appreciation, and investment returns.' },
      { '@type': 'HowToStep', position: 3, name: 'Compare total costs', text: 'See a 10-year breakdown comparing total cost of buying vs renting in Malta.' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Is it cheaper to buy or rent in Malta?', acceptedAnswer: { '@type': 'Answer', text: 'For stays over 5 years, buying is typically more economical in Malta due to low mortgage rates and consistent capital growth of 3-6% per year. Short-term renters or those uncertain about staying benefit from renting flexibility.' } },
      { '@type': 'Question', name: 'What are typical rental prices in Malta?', acceptedAnswer: { '@type': 'Answer', text: 'Rental prices vary by location: Sliema/St Julians EUR 1,200-2,500/month for 2-bed; Valletta EUR 1,000-1,800/month; Gozo EUR 600-1,200/month. Seafront properties command 20-30% premium.' } },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-serif text-4xl md:text-5xl text-gold mb-4">Buy vs Rent Calculator</h1>
          <p className="text-white/60 mb-12 max-w-2xl">See how buying compares to renting in Malta over 1 to 30 years, including net worth projections.</p>
          <BuyVsRentCalculator />
        </div>
      </main>
    </>
  );
}