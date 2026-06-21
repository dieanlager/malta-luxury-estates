import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/src/navigation';
import { routing } from '@/src/i18n/routing';
import { loadAllArticles } from '@/src/lib/markdown-server';

interface Props {
  params: Promise<{ locale: string }>;
}

const BASE = 'https://www.maltaluxuryrealestate.com';

const INSIGHTS_PATHS: Record<string, string> = {
  en: '/insights',
  de: '/de/einblicke',
  fr: '/fr/conseils',
  it: '/it/approfondimenti',
  pl: '/pl/wiedza',
};

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const ogLocaleMap: Record<string, string> = {
    en: 'en_US', de: 'de_DE', fr: 'fr_FR', it: 'it_IT', pl: 'pl_PL',
  };

  return {
    title: t('seo.insights.title', { defaultValue: 'Malta Property Insights & Investment Guides' }),
    description: t('seo.insights.description', { defaultValue: 'Expert guides on buying property in Malta, investment analysis, legal requirements, and market forecasts.' }),
    alternates: {
      canonical: `${BASE}${prefix}/insights`,
      languages: Object.fromEntries(
        routing.locales.map(l => [l, `${BASE}${INSIGHTS_PATHS[l]}`])
      ),
    },
    openGraph: {
      locale: ogLocaleMap[locale] ?? 'en_US',
      images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`${BASE}/og-image.png`],
    },
  };
}

export default async function InsightsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const articles = await loadAllArticles(locale as any);
  const prefix = locale === 'en' ? '' : `/${locale}`;

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];

  const insightsSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Malta Real Estate Insights & Market Reports',
    description: 'Expert articles on Malta property market, buying guides, investment tips and legal guides.',
    url: `${BASE}${prefix}/insights`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(insightsSchema) }}
      />
      <main className="min-h-screen bg-luxury-black pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-16 bg-gold/30" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold">
                {t('common.knowledge_hub', { defaultValue: 'Knowledge Hub' })}
              </span>
              <div className="h-px w-16 bg-gold/30" />
            </div>
            <h1 className="font-serif text-5xl md:text-7xl text-white mb-6">
              {t('seo.insights.title', { defaultValue: 'Malta Property Insights' })}
            </h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
              {t('seo.insights.description', { defaultValue: 'Expert guides on buying, investing, and living in Malta.' })}
            </p>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12 justify-center">
              {categories.map(cat => (
                <span key={cat} className="text-[10px] uppercase tracking-widest text-white/60 border border-white/10 rounded-full px-4 py-1.5">
                  {cat}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(article => (
              <Link
                key={article.slug}
                href={`/insights/${article.slug}` as any}
                className="group glass-card rounded-3xl p-8 border border-white/5 hover:border-gold/20 transition-all duration-300 block"
              >
                {article.category && (
                  <span className="text-[9px] uppercase tracking-widest text-gold mb-4 block">
                    {article.category}
                  </span>
                )}
                <h2 className="font-serif text-xl text-white group-hover:text-gold transition-colors mb-4 leading-snug">
                  {article.title}
                </h2>
                <p className="text-white/60 text-sm leading-relaxed line-clamp-3 mb-6">
                  {article.excerpt}
                </p>
                {article.date && (
                  <div className="text-[10px] uppercase tracking-widest text-white/70">
                    {new Date(article.date).toLocaleDateString(locale, { year: 'numeric', month: 'short' })}
                  </div>
                )}
                <div className="h-0.5 w-0 group-hover:w-full bg-gold/30 mt-6 transition-all duration-500" />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}