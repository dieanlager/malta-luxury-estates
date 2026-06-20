import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';
import { PropertyValuation } from '@/src/components/tools/PropertyValuation';

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
    title: t('seo.tools.valuation.title', { defaultValue: 'Free Property Valuation Malta | AI-Powered Estimate' }),
    description: t('seo.tools.valuation.description', { defaultValue: 'Get an AI-powered instant property valuation for Malta real estate. Free, accurate, and instant.' }),
    alternates: { canonical: `${BASE}${prefix}/tools/valuation` },
    openGraph: {
      locale: ogLocaleMap[locale] ?? 'en_US',
      images: [{ url: `${BASE}/og-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: [`${BASE}/og-image.jpg`] },
  };
}

export default async function ValuationPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Value Your Malta Property',
    description: 'Use our free AI-powered property valuation tool to estimate your Malta property value.',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Enter property details', text: 'Fill in the property type, location, size, and number of bedrooms.' },
      { '@type': 'HowToStep', position: 2, name: 'Add property features', text: 'Select additional features like seafront view, pool, or garage.' },
      { '@type': 'HowToStep', position: 3, name: 'Get AI valuation', text: 'Our AI analyses current market data and provides an estimated value range.' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'How accurate is the Malta property valuation tool?', acceptedAnswer: { '@type': 'Answer', text: 'Our AI valuation uses current Supabase listing data and market trends. Estimates are within 10-15% of market value for well-established areas.' } },
      { '@type': 'Question', name: 'Is the property valuation tool free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, the online valuation tool is completely free to use with no registration required.' } },
      { '@type': 'Question', name: 'What factors affect property value in Malta?', acceptedAnswer: { '@type': 'Answer', text: 'Key factors include location, sea views, property type, floor area, number of bedrooms, pool and garage, proximity to Valletta, and whether it is in a Special Designated Area (SDA).' } },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="min-h-screen bg-luxury-black pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-6 block">
              {t('valuation.eyebrow', { defaultValue: 'AI-Powered' })}
            </span>
            <h1 className="font-serif text-5xl text-white mb-4">
              {t('seo.tools.valuation.title', { defaultValue: 'Free Property Valuation' })}
            </h1>
            <p className="text-white/50 text-lg leading-relaxed">
              {t('valuation.subtitle', { defaultValue: 'Get an instant AI estimate for any Malta or Gozo property.' })}
            </p>
          </div>
          <PropertyValuation />
        </div>
      </main>
    </>
  );
}