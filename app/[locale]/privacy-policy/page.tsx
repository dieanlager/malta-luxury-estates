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
    title: 'Privacy Policy | Malta Luxury Real Estate',
    description: 'Privacy Policy for Malta Luxury Real Estate. Learn how we collect and use your data.',
    alternates: { canonical: `${base}${prefix}/privacy-policy` },
    robots: { index: false },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  return (
    <main className="min-h-screen bg-luxury-black pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-serif text-4xl text-white mb-8">{t('seo.privacy.title', { defaultValue: 'Privacy Policy' })}</h1>
        <div className="text-white/60 space-y-4 leading-relaxed text-sm">
          <p>Last updated: 1 January 2026</p>
          <p>Malta Luxury Real Estate ("we", "our", "us") respects your privacy. This policy describes how we collect, use, and share personal data when you visit maltaluxuryrealestate.com.</p>
          <h2 className="font-serif text-white text-xl mt-8">Data We Collect</h2>
          <p>We collect information you provide directly (contact forms, newsletter sign-ups) and automatically via cookies and analytics (Google Analytics 4).</p>
          <h2 className="font-serif text-white text-xl mt-8">How We Use Data</h2>
          <p>To respond to enquiries, send newsletters (with consent), improve our services, and comply with legal obligations.</p>
          <h2 className="font-serif text-white text-xl mt-8">Your Rights</h2>
          <p>Under GDPR you have rights to access, rectify, erase, restrict, or port your data. Contact: privacy@maltaluxuryrealestate.com</p>
        </div>
      </div>
    </main>
  );
}
