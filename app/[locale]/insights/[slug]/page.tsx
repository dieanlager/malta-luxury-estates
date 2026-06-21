import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Metadata } from 'next';
import { routing } from '@/src/i18n/routing';
import {
  getAllArticleEnSlugs,
  getEnSlugFromLocalized,
  loadArticle,
  extractFAQs,
} from '@/src/lib/markdown-server';
import { generateArticleSchema, generateBreadcrumbSchema, generateArticleFAQSchema } from '@/src/lib/seo/schemas';
import { Link } from '@/src/navigation';
import { LOCATIONS } from '@/src/lib/data';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const enSlugs = getAllArticleEnSlugs();
  return routing.locales.flatMap(locale => enSlugs.map(slug => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await loadArticle(slug, locale as any);
  if (!article) return {};

  const base = 'https://www.maltaluxuryrealestate.com';
  const prefix = (l: string) => l === 'en' ? '' : `/${l}`;
  const insightPaths = routing.pathnames['/insights/[slug]'] as Record<string, string>;
  const localizedSeg = (l: string) => {
    const tpl = insightPaths[l] ?? `/insights/${slug}`;
    return tpl.replace('[slug]', slug);
  };

  return {
    title: article.title,
    description: article.excerpt || article.title,
    alternates: {
      canonical: `${base}${prefix(locale)}${localizedSeg(locale)}`,
      languages: {
        'x-default': `${base}${localizedSeg('en')}`,
        ...Object.fromEntries(
          routing.locales.map(l => [l, `${base}${prefix(l)}${localizedSeg(l)}`])
        ),
      },
    },
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      type: 'article',
      publishedTime: article.date,
      url: `${base}${prefix(locale)}${localizedSeg(locale)}`,
      locale: ({ en: 'en_US', de: 'de_DE', fr: 'fr_FR', it: 'it_IT', pl: 'pl_PL' } as Record<string, string>)[locale] ?? 'en_US',
      images: article.image ? [{ url: article.image }] : [],
    },
    twitter: {
      card: 'summary_large_image' as const,
      images: article.image ? [article.image] : [`${base}/og-image.png`],
    },
  };
}

export default async function InsightPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });

  const article = await loadArticle(slug, locale as any);
  if (!article) notFound();

  const faqs = extractFAQs(article.content);
  const readingTime = Math.ceil(article.content.split(/\s+/).length / 200);

  const base = 'https://www.maltaluxuryrealestate.com';
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const insightPaths = routing.pathnames['/insights/[slug]'] as Record<string, string>;
  const localizedSeg = (insightPaths[locale] ?? `/insights/${slug}`).replace('[slug]', slug);
  const pageUrl = `${base}${prefix}${localizedSeg}`;

  const articleSchema = generateArticleSchema(article, locale);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: base },
    { name: t('nav.insights', { defaultValue: 'Insights' }), url: `${base}${prefix}/insights` },
    { name: article.title, url: pageUrl },
  ]);
  const faqSchema = faqs.length > 0 ? generateArticleFAQSchema(faqs) : null;

  const relatedCity = LOCATIONS.find(l =>
    article.title.toLowerCase().includes(l.nameEn.toLowerCase())
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <main className="min-h-screen bg-luxury-black">
        <div className="relative pt-32 pb-20 px-6 max-w-4xl mx-auto text-center">
          {article.category && (
            <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-gold border border-gold/30 rounded-full px-4 py-1.5 mb-8">
              {article.category}
            </span>
          )}
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight mb-8">{article.title}</h1>
          {article.excerpt && (
            <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">{article.excerpt}</p>
          )}
          <div className="flex items-center justify-center gap-6 text-xs text-white/60 uppercase tracking-widest">
            {article.date && (
              <span>{new Date(article.date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            )}
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{readingTime} min read</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 pb-32">
          <article className="article-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
          </article>

          {faqs.length > 0 && (
            <section className="mt-20 pt-16 border-t border-white/10">
              <h2 className="font-serif text-3xl text-white mb-10">
                {t('common.faq', { defaultValue: 'Frequently Asked Questions' })}
              </h2>
              <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <details key={i} className="group border border-white/10 rounded-2xl overflow-hidden">
                    <summary className="flex items-center justify-between p-6 cursor-pointer text-white/80 hover:text-white list-none">
                      <span className="font-medium pr-4">{faq.question}</span>
                      <span className="text-gold shrink-0 group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <div className="px-6 pb-6 text-white/60 text-sm leading-relaxed border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          <nav className="mt-16 flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <Link href="/insights" className="hover:text-gold transition-colors">
              {t('nav.insights', { defaultValue: 'Insights' })}
            </Link>
            <span>/</span>
            <span className="text-white/50 truncate max-w-xs">{article.title}</span>
          </nav>

          {relatedCity && (
            <div className="mt-16 p-8 glass-card rounded-3xl border border-gold/10">
              <p className="text-[10px] uppercase tracking-widest text-gold mb-3">
                {t('common.explore_location', { defaultValue: 'Explore Properties' })}
              </p>
              <h3 className="font-serif text-2xl text-white mb-4">{relatedCity.nameEn} Real Estate</h3>
              <Link
                href={`/properties/${relatedCity.slug}` as any}
                className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-gold hover:text-white transition-colors"
              >
                {t('common.view_properties', { defaultValue: 'View Properties' })} →
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
