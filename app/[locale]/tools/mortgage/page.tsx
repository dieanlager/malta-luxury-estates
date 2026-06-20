import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';
import { MortgageCalculator } from '@/src/components/calculators/MortgageCalculator';
import { MortgagePreQualifier } from '@/src/components/calculators/MortgagePreQualifier';

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
    title: t('seo.tools.mortgage.title', { defaultValue: 'Malta Mortgage Calculator 2026 | Malta Luxury Real Estate' }),
    description: t('seo.tools.mortgage.description', { defaultValue: 'Calculate your mortgage payments, LTV ratio, and pre-qualify for a Malta property loan. Free tool.' }),
    alternates: { canonical: `${BASE}${prefix}/tools/mortgage` },
    openGraph: {
      locale: ogLocaleMap[locale] ?? 'en_US',
      images: [{ url: `${BASE}/og-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: [`${BASE}/og-image.jpg`] },
  };
}

export default async function MortgagePage({ params }: Props) {
  const { locale } = await params;
  await getTranslations({ locale, namespace: 'common' });

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Your Malta Mortgage',
    description: 'Calculate monthly mortgage payments for Malta property purchases using our free calculator.',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Enter property price', text: 'Input the purchase price of the Malta property in EUR.' },
      { '@type': 'HowToStep', position: 2, name: 'Set deposit and term', text: 'Enter your deposit amount and preferred loan term in years.' },
      { '@type': 'HowToStep', position: 3, name: 'View repayment schedule', text: 'See your monthly repayments, total interest, and full amortisation schedule.' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Can foreigners get a mortgage in Malta?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, Maltese banks offer mortgages to non-residents. EU citizens can borrow up to 80% LTV; non-EU citizens typically up to 70% LTV. Interest rates range from 2.5% to 4.5% depending on the bank and profile.' } },
      { '@type': 'Question', name: 'What is the minimum deposit for a Malta mortgage?', acceptedAnswer: { '@type': 'Answer', text: 'Most Maltese banks require a minimum 20% deposit for EU buyers and 30% for non-EU buyers on residential property.' } },
      { '@type': 'Question', name: 'What is the maximum mortgage term in Malta?', acceptedAnswer: { '@type': 'Answer', text: 'Mortgage terms in Malta can extend up to 40 years, but most lenders cap at 65 years of age at end of term.' } },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-serif text-4xl md:text-5xl text-gold mb-4">Malta Mortgage Calculator</h1>
          <p className="text-white/60 mb-12 max-w-2xl">Calculate your monthly payments and check if you pre-qualify for financing in Malta.</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MortgageCalculator />
            <MortgagePreQualifier />
          </div>
        </div>
      </main>
    </>
  );
}