import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';
import { getAllProperties } from '@/src/lib/data';

export const revalidate = 60;

interface Props { params: Promise<{ locale: string }> }
export async function generateStaticParams() { return routing.locales.map(locale => ({ locale })); }

const MARKET_PATHS: Record<string, string> = {
  en: '/market/live',
  de: '/de/markt/live-ticker',
  fr: '/fr/marche/en-direct',
  it: '/it/mercato/in-diretta',
  pl: '/pl/rynek/na-zywo',
};

const ogLocaleMap: Record<string, string> = {
  en: 'en_US', de: 'de_DE', fr: 'fr_FR', it: 'it_IT', pl: 'pl_PL',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const base = 'https://www.maltaluxuryrealestate.com';
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return {
    title: t('seo.market.title', { defaultValue: 'Malta Property Market Pulse | Live Data 2026' }),
    description: t('seo.market.description', { defaultValue: 'Live Malta real estate market data: prices, inventory, trends, and forecasts updated daily.' }),
    alternates: {
      canonical: `${base}${MARKET_PATHS[locale]}`,
      languages: Object.fromEntries(
        routing.locales.map(l => [l, `${base}${MARKET_PATHS[l]}`])
      ),
    },
    openGraph: {
      locale: ogLocaleMap[locale] ?? 'en_US',
      images: [{ url: `${base}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: [`${base}/og-image.png`] },
  };
}

export default async function MarketLivePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  let properties: Awaited<ReturnType<typeof getAllProperties>> = [];
  try { properties = await getAllProperties(); } catch { properties = []; }

  const saleProps = properties.filter((p: any) => p.type === 'sale');
  const avgPrice = saleProps.length ? Math.round(saleProps.reduce((sum: number, p: any) => sum + (p.price ?? 0), 0) / saleProps.length) : null;
  const avgSqm = saleProps.filter((p: any) => p.sqm).length
    ? Math.round(saleProps.filter((p: any) => p.sqm).reduce((sum: number, p: any) => sum + (p.sqm ?? 0), 0) / saleProps.filter((p: any) => p.sqm).length)
    : null;

  return (
    <main className="min-h-screen bg-luxury-black pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">
              {t('market.live_data', { defaultValue: 'Live Market Data' })}
            </span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-6">
            {t('seo.market.title', { defaultValue: 'Malta Property Market Pulse' })}
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-2xl">
            {t('market.subtitle', { defaultValue: 'Real-time insights into Malta\'s luxury real estate market, updated continuously from live listing data.' })}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          <div className="glass-card p-8 rounded-3xl border border-white/5">
            <div className="text-gold font-serif text-4xl mb-2">{properties.length}</div>
            <div className="text-white/60 text-[10px] uppercase tracking-widest">{t('market.total_listings', { defaultValue: 'Active Listings' })}</div>
          </div>
          <div className="glass-card p-8 rounded-3xl border border-white/5">
            <div className="text-gold font-serif text-4xl mb-2">{avgPrice ? `€${(avgPrice / 1000).toFixed(0)}K` : '—'}</div>
            <div className="text-white/60 text-[10px] uppercase tracking-widest">{t('market.avg_price', { defaultValue: 'Avg Sale Price' })}</div>
          </div>
          <div className="glass-card p-8 rounded-3xl border border-white/5">
            <div className="text-gold font-serif text-4xl mb-2">{saleProps.length}</div>
            <div className="text-white/60 text-[10px] uppercase tracking-widest">{t('market.for_sale', { defaultValue: 'For Sale' })}</div>
          </div>
          <div className="glass-card p-8 rounded-3xl border border-white/5">
            <div className="text-gold font-serif text-4xl mb-2">{avgSqm ? `${avgSqm}m²` : '—'}</div>
            <div className="text-white/60 text-[10px] uppercase tracking-widest">{t('market.avg_size', { defaultValue: 'Avg Size' })}</div>
          </div>
        </div>

        <div className="text-center py-16 text-white/60">
          <p className="text-sm">{t('market.data_updated', { defaultValue: 'Data refreshed every 60 seconds' })}</p>
        </div>
      </div>
    </main>
  );
}
