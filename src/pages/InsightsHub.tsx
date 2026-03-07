import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, TrendingUp, Scale, MapPin, Calculator } from 'lucide-react';
import { getArticles } from '../lib/data';
import { Article } from '../types';
import { usePageMeta } from '../lib/seo/meta';
import { InteractiveTools } from '../components/InteractiveTools';
import { resolveArticleLang } from '../lib/markdown';

import { useTranslation } from 'react-i18next';

export const InsightsHub = () => {
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const activeLang = resolveArticleLang(i18n.language);
      const data = await getArticles(activeLang);
      setArticles(data);
      setLoading(false);
    };
    fetchArticles();
    window.scrollTo(0, 0);
  }, [i18n.language]);

  const getLocalizedPath = (path: string) => {
    if (i18n.language === 'en') return path;
    const parts = path.split('/').filter(Boolean);
    const translatedParts = parts.map(part => t(`slugs.${part}`, { defaultValue: part }));
    return `/${i18n.language}/${translatedParts.join('/')}`;
  };

  usePageMeta({
    title: t('seo:insights.title'),
    description: t('seo:insights.description'),
    canonicalPath: '/insights',
    currentLang: i18n.language,
    i18n,
  });

  const categories = [
    { name: t('insights.categories.buying'), icon: BookOpen, color: 'text-blue-400' },
    { name: t('insights.categories.investing'), icon: TrendingUp, color: 'text-emerald-400' },
    { name: t('insights.categories.legal'), icon: Scale, color: 'text-amber-400' },
    { name: t('insights.categories.finance'), icon: Calculator, color: 'text-gold' },
    { name: t('insights.categories.areas'), icon: MapPin, color: 'text-rose-400' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-luxury-black pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero */}
        <div className="max-w-3xl mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-px bg-gold" />
            <span className="text-gold uppercase tracking-widest text-xs font-bold">{t('insights.hub.subtitle')}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">
            {t('insights.hub.title_part1')} <br />
            <span className="text-gold-gradient italic">{t('insights.hub.title_part2')}</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            {t('insights.hub.description')}
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-20">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="glass-card p-6 rounded-2xl border border-white/5 hover:border-gold/30 transition-all text-left group"
            >
              <cat.icon className={`${cat.color} mb-4 group-hover:scale-110 transition-transform`} size={24} />
              <h3 className="font-serif text-lg">{cat.name}</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{t('insights.categories.explore_guide')}</p>
            </button>
          ))}
        </div>

        {/* Featured Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {articles.map((article) => (
            <Link
              key={article.slug}
              to={getLocalizedPath(`/insights/${article.slug}`)}
              className="group relative h-[500px] rounded-[2.5rem] overflow-hidden border border-white/10"
            >
              <img
                src={article.image}
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/40 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-gold text-luxury-black text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {article.category}
                  </span>
                  <span className="text-white/40 text-xs">{article.readTime}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif mb-4 group-hover:text-gold transition-colors">
                  {article.title}
                </h2>
                <p className="text-white/60 mb-8 line-clamp-2 max-w-xl">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-widest">
                  {t('insights.hub.read_full_guide')} <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Interactive Tools Suite */}
        <div className="mb-20">
          <InteractiveTools />
        </div>

        {/* Newsletter / CTA */}
        <div className="glass-card rounded-[3rem] p-12 md:p-20 border border-gold/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#C5A059_0%,transparent_70%)]" />
          </div>

          <div className="max-w-2xl relative z-10">
            <h2 className="text-4xl font-serif mb-6">{t('insights.newsletter.title')}</h2>
            <p className="text-white/60 text-lg mb-10">
              {t('insights.newsletter.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder={t('insights.newsletter.placeholder')}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-8 py-4 outline-none focus:border-gold transition-colors"
              />
              <button className="gold-gradient text-luxury-black px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                {t('insights.newsletter.subscribe_button')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
