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
        const lng = i18n.language === 'en' ? '' : `/${i18n.language}`;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${lng}${cleanPath === '/' ? '' : cleanPath}`;
    };

    usePageMeta({
        title: t('seo:about.title'),
        description: t('seo:about.description'),
        canonicalPath: i18n.language === 'en' ? '/about' : `/${i18n.language}/about`
    });

    const stats = [
        { label: 'Properties Pulled', value: '450+' },
        { label: 'Partner Agencies', value: '15' },
        { label: 'Expert Guides', value: '50+' },
        { label: 'Client Satisfaction', value: '100%' }
    ];

    const values = [
        {
            icon: <Shield className="text-gold" size={24} />,
            title: 'Integrity First',
            description: 'We curate only the most reputable agencies and properties, ensuring a transparent and secure acquisition process for international HNWIs.'
        },
        {
            icon: <Award className="text-gold" size={24} />,
            title: 'Unrivaled Expertise',
            description: 'Our deep understanding of Maltese property law, tax optimization (MPRP/SDA), and market trends provides an unfair advantage to our clients.'
        },
        {
            icon: <Users className="text-gold" size={24} />,
            title: 'Discreet Service',
            description: 'Luxury real estate is about privacy. Our platform and partners operate with the highest level of confidentiality and professionalism.'
        },
        {
            icon: <Globe className="text-gold" size={24} />,
            title: 'Global Perspective',
            description: 'Tailored for the international buyer, our insights bridge the gap between Mediterranean charm and global investment standards.'
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
                        <p className="text-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Establishing Excellence</p>
                        <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight mb-8">
                            The Finest Addresses <br />
                            <span className="text-gold italic font-light">Across the Islands.</span>
                        </h1>
                        <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-xl">
                            Malta Luxury Real Estate was founded on a simple premise: to simplify the acquisition of the Maltese islands' most exceptional properties. We are not just a marketplace; we are the bridge between discerning international investors and the islands' most reputable real estate specialists.
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
                            <p className="text-luxury-black font-serif text-xl leading-snug">Authorized Luxury Property Network</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Our Values */}
            <section className="bg-white/[0.02] py-24 lg:py-32 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">Our Foundational <span className="text-gold italic">Principles</span></h2>
                        <p className="text-white/40 leading-relaxed">Everything we do is guided by a commitment to quality and a deep respect for the architectural heritage of Malta and Gozo.</p>
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
                                <p className="text-gold font-bold uppercase tracking-widest text-xs">Director's Note</p>
                            </div>
                            <p className="text-2xl md:text-4xl font-serif text-white italic leading-snug">
                                "We don't just list properties; we represent a way of life that respects the history of these islands while embracing the future of global investment."
                            </p>
                            <div className="flex items-center gap-6 pt-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold/30">
                                    <ImgWithPlaceholder src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&fm=webp" alt="Director" />
                                </div>
                                <div>
                                    <p className="text-white font-bold tracking-wide">Alexander Vanhaut</p>
                                    <p className="text-gold/60 text-xs uppercase tracking-widest">Managing Director</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-2xl font-serif text-white">The Quality Standard (E-E-A-T)</h3>
                            <p className="text-white/50 leading-relaxed">
                                As a verified member of the Maltese real estate ecosystem, we provide more than just listings. Our intelligence suite—including ROI calculators and tax guides—is built on primary research and 20+ years of local market data.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    'Verified Agency Partnerships',
                                    'Quarterly Market Intelligence Reports',
                                    'Compliant with 2026 Real Estate Regulations',
                                    'Expert Advisory on SDAs and Residency'
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
                <h2 className="text-3xl font-serif text-white mb-8">Ready to discover your <span className="text-gold italic">unrivaled residence?</span></h2>
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
