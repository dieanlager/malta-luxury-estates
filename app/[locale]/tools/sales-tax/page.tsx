import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';
import { SalesTaxCalculator } from '@/src/components/calculators/SalesTaxCalculator';
import { BuyingCostsCalculator } from '@/src/components/BuyingCostsCalculator';

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
    title: t('seo.tools.salesTax.title', { defaultValue: 'Malta Property Tax & Buying Costs Calculator 2026 | Malta Luxury Real Estate' }),
    description: t('seo.tools.salesTax.description', { defaultValue: 'Calculate stamp duty, transfer tax, notary fees, and total buying costs for Malta property.' }),
    alternates: { canonical: `${BASE}${prefix}/tools/sales-tax` },
    openGraph: {
      locale: ogLocaleMap[locale] ?? 'en_US',
      images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: [`${BASE}/og-image.png`] },
  };
}

export default async function SalesTaxPage({ params }: Props) {
  const { locale } = await params;
  await getTranslations({ locale, namespace: 'common' });

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Malta Property Taxes',
    description: 'Calculate stamp duty, notary fees, and total buying costs for purchasing property in Malta.',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Enter purchase price', text: 'Input the agreed purchase price of the Malta property in EUR.' },
      { '@type': 'HowToStep', position: 2, name: 'Select buyer type', text: 'Indicate whether you are a first-time buyer, EU citizen, or non-EU buyer for accurate tax rates.' },
      { '@type': 'HowToStep', position: 3, name: 'View full cost breakdown', text: 'See stamp duty (3.5-5%), notary fees (1-1.5%), search fees, and AIP permit costs where applicable.' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is stamp duty in Malta?', acceptedAnswer: { '@type': 'Answer', text: 'Standard stamp duty in Malta is 5% of purchase price. First-time buyers pay 3.5% on the first EUR 200,000 and 5% on the remainder. Properties in Special Designated Areas may have different rates.' } },
      { '@type': 'Question', name: 'What are total buying costs in Malta?', acceptedAnswer: { '@type': 'Answer', text: 'Total buying costs in Malta typically range from 7-10% of purchase price, including stamp duty (3.5-5%), notary fees (1-1.5%), estate agent commission (1-3% paid by seller), search fees (EUR 300-600), and AIP permit (EUR 233) where applicable.' } },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-serif text-4xl md:text-5xl text-gold mb-4">Malta Property Tax & Costs</h1>
          <p className="text-white/60 mb-12 max-w-2xl">Calculate stamp duty, transfer tax, and all buying costs before you commit.</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SalesTaxCalculator />
            <BuyingCostsCalculator />
          </div>
        </div>
      </main>
    </>
  );
}