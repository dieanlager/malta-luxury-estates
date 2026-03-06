import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Share2, Bookmark } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getArticleBySlug, getArticlesByCategory } from '../lib/data';
import { Article } from '../types';
import { Breadcrumb } from '../components/Breadcrumb';
import { generateArticleSchema } from '../lib/seo/schemas';
import { usePageMeta } from '../lib/seo/meta';
import { injectInternalLinks } from '../lib/seo/internal-linking';
import { SchemaScript } from '../components/SchemaScript';

// ─── FIX #3: Reading Progress ──────────────────────────────────────────────────
// Używamy bezpośredniego ref.style.width zamiast CSS custom property
// (CSS var w inline style wymaga @property registration aby działać)
const ReadingProgress = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      const pct = total > 0 ? (el.scrollTop / total) * 100 : 0;
      if (barRef.current) barRef.current.style.width = `${pct}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="reading-progress" aria-hidden="true">
      <div ref={barRef} className="reading-progress__bar" style={{ width: '0%' }} />
    </div>
  );
};

// ─── FIX #2: ReactMarkdown komponenty ─────────────────────────────────────────
// Problem: ReactMarkdown renderuje bare <p>, <h2>, <table> etc.
// Tailwind Typography (.prose) miało własne definicje dla tych elementów
// i wygrywało z naszym CSS ze względu na specificity i kolejność.
// Rozwiązanie: mapujemy każdy element jawnie przez components prop
// + wrapper .article-prose zamiast .prose (FIX #1)
const MarkdownComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  // ── Paragraphs
  p: ({ children }) => <p>{children}</p>,

  // ── Headings
  h1: ({ children }) => <h1>{children}</h1>,
  h2: ({ children }) => <h2>{children}</h2>,
  h3: ({ children }) => <h3>{children}</h3>,
  h4: ({ children }) => <h4>{children}</h4>,

  // ── Lists
  ul: ({ children }) => <ul>{children}</ul>,
  ol: ({ children }) => <ol>{children}</ol>,
  li: ({ children }) => <li>{children}</li>,

  // ── Inline
  a: ({ href, children }) => <a href={href}>{children}</a>,
  strong: ({ children }) => <strong>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,

  // ── HR
  hr: () => <hr />,

  // ── Tables – owijamy w .table-wrapper dla scroll mobile + premium styles
  table: ({ children }) => (
    <div className="table-wrapper">
      <table>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => <th>{children}</th>,
  td: ({ children }) => <td>{children}</td>,

  // ── Blockquote → Callout lub Pull Quote
  blockquote: ({ children }) => {
    // Wyciągamy surowy tekst żeby sprawdzić czy to callout
    const firstChild = React.Children.toArray(children)[0] as any;
    let rawText = '';

    if (typeof firstChild?.props?.children === 'string') {
      rawText = firstChild.props.children;
    } else if (Array.isArray(firstChild?.props?.children)) {
      rawText = String(firstChild.props.children[0] ?? '');
    }

    if (typeof rawText === 'string' && rawText.startsWith('[!')) {
      // Callout
      let type: 'tip' | 'warning' | 'info' | 'success' = 'tip';
      let label = 'Key Point';

      if (rawText.includes('IMPORTANT')) { type = 'warning'; label = 'Important'; }
      else if (rawText.includes('WARNING')) { type = 'warning'; label = 'Caution'; }
      else if (rawText.includes('NOTE')) { type = 'info'; label = 'Note'; }
      else if (rawText.includes('TIP')) { type = 'tip'; label = 'Expert Tip'; }
      else if (rawText.includes('SUCCESS')) { type = 'success'; label = 'Confirmed'; }

      const clean = (txt: string) =>
        txt.replace(/\[!(IMPORTANT|WARNING|TIP|NOTE|SUCCESS)\]\s*/i, '');

      const cleanChildren = React.Children.map(children, (child: any) => {
        if (!child?.props) return child;
        if (typeof child.props.children === 'string')
          return React.cloneElement(child, { children: clean(child.props.children) });
        if (Array.isArray(child.props.children))
          return React.cloneElement(child, {
            children: child.props.children.map((c: any) =>
              typeof c === 'string' ? clean(c) : c
            ),
          });
        return child;
      });

      return (
        <div className={`callout callout--${type}`}>
          <div className="callout__label">{label}</div>
          <div>{cleanChildren}</div>
        </div>
      );
    }

    // Pull Quote (zwykły cytat)
    return <blockquote className="pull-quote">{children}</blockquote>;
  },
};

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
  <details className="faq-item">
    <summary className="faq-item__question">
      <span>{question}</span>
      <svg className="faq-item__chevron" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </summary>
    <p className="faq-item__answer">{answer}</p>
  </details>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      setLoading(true);
      const data = await getArticleBySlug(slug);
      if (data) {
        setArticle(data);
        const allRelated = await getArticlesByCategory(data.category);
        setRelatedArticles(allRelated.filter(a => a.slug !== slug).slice(0, 3));
      } else {
        setArticle(null);
      }
      setLoading(false);
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  usePageMeta({
    title: article ? `${article.title} | Malta Luxury Real Estate` : 'Insights | Malta Luxury Real Estate',
    description: article?.metaDescription || article?.excerpt || '',
    canonicalPath: article ? `/insights/${article.slug}` : '/insights',
    ogType: 'article',
    ogImage: article?.image,
  });

  const articleSchema = article ? generateArticleSchema(article) : null;
  const linkedContent = article ? injectInternalLinks(article.content) : '';

  // ── Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  // ── 404
  if (!article) {
    return (
      <div className="min-h-screen bg-luxury-black flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-serif text-4xl text-white mb-6">Article Not Found</h1>
        <Link to="/insights"
          className="gold-gradient text-luxury-black px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest">
          Back to Insights
        </Link>
      </div>
    );
  }

  return (
    <>
      {articleSchema && <SchemaScript data={articleSchema} />}

      <ReadingProgress />

      <div className="min-h-screen bg-luxury-black">

        {/* ──────────────────────── HERO ──────────────────────── */}
        <header className="relative h-[65vh] min-h-[560px] overflow-hidden">
          {article.image && (
            <img src={article.image} alt={article.title}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/55 to-transparent" />

          <div className="absolute inset-0 flex items-end">
            <div className="w-full max-w-5xl mx-auto px-6 pb-14">
              <div className="mb-5">
                <Breadcrumb items={[
                  { label: 'Home', href: '/' },
                  { label: 'Insights', href: '/insights' },
                  { label: article.title },
                ]} />
              </div>

              <div className="flex flex-wrap items-center gap-5 mb-6">
                <span className="article-category-badge">{article.category}</span>
                <span className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-[0.15em] font-medium">
                  <Calendar size={13} className="text-gold/60" /> {article.date}
                </span>
                <span className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-[0.15em] font-medium">
                  <Clock size={13} className="text-gold/60" /> {article.readTime}
                </span>
              </div>

              <h1 className="font-serif font-light text-4xl md:text-6xl lg:text-7xl
                             leading-[1.08] text-white max-w-4xl">
                {article.title}
              </h1>
            </div>
          </div>
        </header>

        {/* ─────────────────────── BODY ───────────────────────── */}
        <div className="article-layout py-16 md:py-24">

          {/* Main column */}
          <article className="min-w-0">

            {/* Quick Summary box */}
            {article.excerpt && (
              <div className="article-summary-box">
                <span className="article-summary-box__label">Quick Summary</span>
                <p>{article.excerpt}</p>
              </div>
            )}

            {/*
              ═══════════════════════════════════════════════════
              FIX GŁÓWNY (#1 + #2):
              - Klasa .article-prose zamiast .prose
              - .prose było przejmowane przez Tailwind Typography
              - .article-prose ma tylko nasze custom CSS
              - MarkdownComponents mapuje każdy element jawnie
              ═══════════════════════════════════════════════════
            */}
            <div className="article-prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={MarkdownComponents}
              >
                {linkedContent}
              </ReactMarkdown>
            </div>

            {/* FAQ z danych artykułu (jeśli istnieją) */}
            {(article as any).faqs && (article as any).faqs.length > 0 && (
              <section className="faq-section">
                <div className="faq-section__label">Frequently Asked Questions</div>
                {(article as any).faqs.map((faq: { question: string; answer: string }, i: number) => (
                  <FAQItem key={i} question={faq.question} answer={faq.answer} />
                ))}
              </section>
            )}

            {/* Actions */}
            <div className="mt-16 pt-8 border-t border-white/5 flex items-center gap-8">
              <button
                onClick={() => (navigator as any).share?.({ title: article.title, url: window.location.href })}
                className="flex items-center gap-2 text-white/30 hover:text-gold transition-colors
                           text-[10px] uppercase tracking-[0.15em] font-semibold">
                <Share2 size={15} /> Share
              </button>
              <button className="flex items-center gap-2 text-white/30 hover:text-gold transition-colors
                                 text-[10px] uppercase tracking-[0.15em] font-semibold">
                <Bookmark size={15} /> Save
              </button>
            </div>

            {/* Disclaimer */}
            <p className="article-disclaimer">
              Last updated: {article.date}. Information provided on Malta Luxury Real Estate is for
              general guidance only and does not constitute legal, financial, or tax advice.
              Always consult a licensed professional for advice specific to your circumstances.
            </p>
          </article>

          {/* ─── Sidebar ─── */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-12">

              <div>
                <h3 className="text-[10px] uppercase tracking-[0.18em] font-bold text-gold/50 mb-8">
                  Related Guides
                </h3>
                <div className="space-y-8">
                  {relatedArticles.map(rel => (
                    <Link key={rel.slug} to={`/insights/${rel.slug}`} className="group block">
                      <div className="aspect-[16/10] rounded-lg overflow-hidden mb-3
                                      bg-zinc-900 border border-white/5">
                        {rel.image && (
                          <img src={rel.image} alt={rel.title}
                            className="w-full h-full object-cover opacity-55
                                       group-hover:opacity-85 group-hover:scale-105
                                       transition-all duration-500"
                            referrerPolicy="no-referrer" />
                        )}
                      </div>
                      <span className="block text-[9px] uppercase tracking-widest text-gold/45 mb-1">
                        {rel.category}
                      </span>
                      <h4 className="font-serif text-base leading-snug text-white/65
                                     group-hover:text-white transition-colors line-clamp-2">
                        {rel.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-white/[0.025] border border-white/[0.07] p-8 rounded-2xl">
                <h3 className="font-serif text-lg mb-2 text-white">Malta Intelligence</h3>
                <p className="text-[11px] text-white/30 mb-6 leading-relaxed">
                  Exclusive market updates and investment insights, monthly.
                </p>
                <div className="space-y-3">
                  <input type="email" placeholder="Your email"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3
                               text-sm text-white placeholder-white/20 outline-none
                               focus:border-gold/50 transition-colors" />
                  <button className="w-full gold-gradient text-luxury-black py-3 rounded-lg
                                     text-[10px] font-bold uppercase tracking-widest
                                     hover:brightness-110 transition-all">
                    Join Insider List
                  </button>
                </div>
              </div>

            </div>
          </aside>
        </div>
      </div>
    </>
  );
};
