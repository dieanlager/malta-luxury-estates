import React from 'react';
import { motion } from 'motion/react';
import { Shield, Award, Users, Globe, Building2, Landmark, Quote, CheckCircle2 } from 'lucide-react';
import { usePageMeta } from '../lib/seo/meta';
import { ImgWithPlaceholder } from '../components/ImgWithPlaceholder';

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
    const { t, i18n } = useTranslation();

    const getLocalizedPath = (path: string) => {
        if (i18n.language === 'en') return path;
        const parts = path.split('/').filter(Boolean);
        const translatedParts = parts.map(part => t(`slugs.${part}`, { defaultValue: part }));
        return `/${i18n.language}/${translatedParts.join('/')}`;
    };

    usePageMeta({
        title: t('seo:about.title'),
        description: t('seo:about.description'),
        canonicalPath: '/about',
        currentLang: i18n.language,
        i18n,
    });

    const stats = [
        { label: t('about.stats.properties'), value: '450+' },
        { label: t('about.stats.agencies'), value: '15' },
        { label: t('about.stats.guides'), value: '50+' },
        { label: t('about.stats.satisfaction'), value: '100%' }
    ];

    const values = [
        {
            icon: <Shield className="text-gold" size={24} />,
            title: t('about.values.value1.title'),
            description: t('about.values.value1.desc')
        },
        {
            icon: <Award className="text-gold" size={24} />,
            title: t('about.values.value2.title'),
            description: t('about.values.value2.desc')
        },
        {
            icon: <Users className="text-gold" size={24} />,
            title: t('about.values.value3.title'),
            description: t('about.values.value3.desc')
        },
        {
            icon: <Globe className="text-gold" size={24} />,
            title: t('about.values.value4.title'),
            description: t('about.values.value4.desc')
        }
    ];

    return (
        <div className="min-h-screen bg-luxury-black pt-32">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 mb-24 lg:mb-32">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-4">{t('about.badge')}</p>
                        <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight mb-8">
                            {t('about.title_part1')} <br />
                            <span className="text-gold italic font-light">{t('about.title_part2')}</span>
                        </h1>
                        <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-xl">
                            {t('about.description')}
                        </p>
                        <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-10">
                            {stats.map((stat, i) => (
                                <div key={i}>
                                    <p className="text-3xl font-serif text-white mb-1">{stat.value}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
                            <ImgWithPlaceholder
                                src="https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=1600&fm=webp"
                                alt="Luxury living in Malta"
                                priority
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Floating Trust Badge */}
                        <div className="absolute -bottom-8 -left-8 bg-gold-gradient p-8 rounded-3xl shadow-2xl max-w-[240px] hidden md:block">
                            <Landmark className="text-luxury-black mb-4" size={32} />
                            <p className="text-luxury-black font-serif text-xl leading-snug">{t('about.cta.trust_badge')}</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Our Values */}
            <section className="bg-white/[0.02] py-24 lg:py-32 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">{t('about.values.title')}</h2>
                        <p className="text-white/40 leading-relaxed">{t('about.values.subtitle')}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {values.map((v, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="space-y-4"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mb-6">
                                    {v.icon}
                                </div>
                                <h3 className="text-xl font-serif text-white">{v.title}</h3>
                                <p className="text-sm text-white/50 leading-relaxed">{v.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Founder's Vision */}
            <section className="py-24 lg:py-32 max-w-7xl mx-auto px-6">
                <div className="glass-card rounded-[4rem] p-12 lg:p-24 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                        <div className="absolute inset-0 bg-gold-gradient blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-0.5 w-12 bg-gold" />
                                <p className="text-gold font-bold uppercase tracking-widest text-xs">{t('about.director.tag')}</p>
                            </div>
                            <p className="text-2xl md:text-4xl font-serif text-white italic leading-snug">
                                "{t('about.director.quote')}"
                            </p>
                            <div className="flex items-center gap-6 pt-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold/30">
                                    <ImgWithPlaceholder src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&fm=webp" alt="Director" />
                                </div>
                                <div>
                                    <p className="text-white font-bold tracking-wide">{t('about.director.name')}</p>
                                    <p className="text-gold/60 text-xs uppercase tracking-widest">{t('about.director.role')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-2xl font-serif text-white">{t('about.eeat.title')}</h3>
                            <p className="text-white/50 leading-relaxed">
                                {t('about.eeat.desc')}
                            </p>
                            <ul className="space-y-3">
                                {[
                                    t('about.eeat.points.0'),
                                    t('about.eeat.points.1'),
                                    t('about.eeat.points.2'),
                                    t('about.eeat.points.3')
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-white/70">
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 text-center max-w-3xl mx-auto px-6">
                <h2 className="text-3xl font-serif text-white mb-8">{t('about.cta.title')}</h2>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link to={getLocalizedPath('/properties/all')} className="gold-gradient text-luxury-black px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[11px] shadow-2xl hover:scale-105 transition-transform">
                        {t('about.view_collections', 'View Collections')}
                    </Link>
                    <Link to={getLocalizedPath('/insights')} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[11px] transition-all">
                        {t('about.read_insights', 'Read Insights')}
                    </Link>
                </div>
            </section>
        </div>
    );
};
