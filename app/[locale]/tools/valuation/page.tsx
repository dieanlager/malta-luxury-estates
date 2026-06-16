import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';
import { PropertyValuation } from '@/src/components/tools/PropertyValuation';

interface Props { params: Promise<{ locale: string }> }
export async function generateStaticParams() { return routing.locales.map(locale => ({ locale })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const base = 'https://www.maltaluxuryrealestate.com';
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return {
    title: t('seo.tools.valuation.title', { defaultValue: 'Free Property Valuation Malta | AI-Powered Estimate' }),
    description: t('seo.tools.valuation.description', { defaultValue: 'Get an AI-powered instant property valuation for Malta real estate. Free, accurate, and instant.' }),
    alternates: { canonical: `${base}${prefix}/tools/valuation` },
  };
}

export default async function ValuationPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  return (
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
  );
}
