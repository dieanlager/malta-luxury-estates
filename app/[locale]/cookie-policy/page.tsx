import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';

interface Props { params: Promise<{ locale: string }> }
export async function generateStaticParams() { return routing.locales.map(locale => ({ locale })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: 'Cookie Policy | Malta Luxury Real Estate', robots: { index: false } };
}
export default async function CookiePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  return (
    <main className="min-h-screen bg-luxury-black pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-serif text-4xl text-white mb-8">{t('seo.cookies.title', { defaultValue: 'Cookie Policy' })}</h1>
        <div className="text-white/60 space-y-4 leading-relaxed text-sm">
          <p>We use cookies to improve your browsing experience. Essential cookies are required for the site to function. Analytics cookies (Google Analytics 4) help us understand how visitors use our site.</p>
          <p>You can manage cookie preferences at any time through your browser settings.</p>
        </div>
      </div>
    </main>
  );
}
