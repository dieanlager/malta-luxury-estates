import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';

interface Props { params: Promise<{ locale: string }> }

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const base = 'https://www.maltaluxuryrealestate.com';
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return {
    title: 'Terms of Service | Malta Luxury Real Estate',
    description: 'Terms and conditions for using Malta Luxury Real Estate portal.',
    alternates: { canonical: `${base}${prefix}/terms-of-service` },
    robots: { index: false },
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  return (
    <main className="min-h-screen bg-luxury-black pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-serif text-4xl text-white mb-8">{t('seo.terms.title', { defaultValue: 'Terms of Service' })}</h1>
        <div className="text-white/60 space-y-4 leading-relaxed text-sm">
          <p>Last updated: 1 January 2026</p>
          <p>By using maltaluxuryrealestate.com you agree to these terms. The site provides property information for informational purposes only and does not constitute financial or legal advice.</p>
          <h2 className="font-serif text-white text-xl mt-8">Listings</h2>
          <p>Property listings are provided by third-party agencies. Prices and availability are subject to change. Always verify details directly with the listing agent.</p>
          <h2 className="font-serif text-white text-xl mt-8">Intellectual Property</h2>
          <p>All content on this site is the property of Malta Luxury Real Estate or its content suppliers and is protected by copyright.</p>
        </div>
      </div>
    </main>
  );
}
