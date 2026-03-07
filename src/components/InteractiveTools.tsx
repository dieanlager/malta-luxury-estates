import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Calculator, TrendingUp, ShieldCheck, ArrowRight, Home, Scale, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BuyingCostsCalculator } from './BuyingCostsCalculator';
import { ROICalculator } from './calculators/ROICalculator';
import { SalesTaxCalculator } from './calculators/SalesTaxCalculator';
import { MortgageCalculator } from './calculators/MortgageCalculator';
import { BuyVsRentCalculator } from './calculators/BuyVsRentCalculator';
import { MortgagePreQualifier } from './calculators/MortgagePreQualifier';

/**
 * Interactive Intelligence Tools Wrapper
 * Switching between Buying, ROI and Selling calculators.
 */
export const InteractiveTools = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'buying' | 'roi' | 'selling' | 'mortgage' | 'buyvsrent' | 'prequalifier'>('buying');

    const tabs = [
        { id: 'buying', label: t('interactive_tools.tabs.buying'), icon: Calculator, color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30' },
        { id: 'prequalifier', label: t('interactive_tools.tabs.prequalifier'), icon: Landmark, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/30' },
        { id: 'mortgage', label: t('interactive_tools.tabs.mortgage'), icon: Home, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/30' },
        { id: 'buyvsrent', label: t('interactive_tools.tabs.buyvsrent'), icon: Scale, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-500/30' },
        { id: 'roi', label: t('interactive_tools.tabs.roi'), icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-500/30' },
        { id: 'selling', label: t('interactive_tools.tabs.selling'), icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/30' },
    ];

    return (
        <section className="py-20" id="tools">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-px bg-gold" />
                            <span className="text-gold uppercase tracking-widest text-xs font-bold">{t('interactive_tools.subtitle')}</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">
                            {t('interactive_tools.title_part1')} <span className="text-gold-gradient italic">{t('interactive_tools.title_part2')}</span>
                        </h2>
                        <p className="text-white/60 text-lg leading-relaxed">
                            {t('interactive_tools.intro')}
                        </p>
                    </div>

                    <div className="flex flex-wrap p-2 bg-white/5 border border-white/10 rounded-3xl gap-2 w-full lg:w-auto justify-start md:justify-center lg:justify-end">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all ${activeTab === tab.id
                                    ? `${tab.bg} ${tab.color} border ${tab.border} shadow-lg shadow-black/20`
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon size={18} />
                                <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                            {activeTab === 'buying' && <BuyingCostsCalculator />}
                            {activeTab === 'prequalifier' && <MortgagePreQualifier />}
                            {activeTab === 'mortgage' && <MortgageCalculator />}
                            {activeTab === 'buyvsrent' && <BuyVsRentCalculator />}
                            {activeTab === 'roi' && <ROICalculator />}
                            {activeTab === 'selling' && <SalesTaxCalculator />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Info Grid */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass-card p-8 rounded-3xl border border-white/5 group hover:border-gold/30 transition-all">
                        <h4 className="font-serif text-xl mb-3 text-gold">{t('interactive_tools.info.tax_update_title')}</h4>
                        <p className="text-xs text-white/40 leading-relaxed mb-6">
                            {t('interactive_tools.info.tax_update_desc')}
                        </p>
                        <Link to="/insights/property-taxes-malta-2026" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-gold transition-colors">
                            {t('interactive_tools.info.read_tax_guide')} <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="glass-card p-8 rounded-3xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                        <h4 className="font-serif text-xl mb-3 text-emerald-400">{t('interactive_tools.info.roi_benchmarks_title')}</h4>
                        <p className="text-xs text-white/40 leading-relaxed mb-6">
                            {t('interactive_tools.info.roi_benchmarks_desc')}
                        </p>
                        <Link to="/insights/rental-yields-malta-2026" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-gold transition-colors">
                            {t('interactive_tools.info.yield_reports')} <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="glass-card p-10 rounded-[2.5rem] border border-gold/20 bg-gold/5 flex flex-col justify-between items-start group hover:scale-[1.02] transition-all">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-6">
                                <Landmark size={24} />
                            </div>
                            <h4 className="font-serif text-2xl mb-3 text-white">{t('interactive_tools.info.oracle_title')}</h4>
                            <p className="text-sm text-white/40 leading-relaxed mb-8">
                                {t('interactive_tools.info.oracle_desc')}
                            </p>
                        </div>
                        <Link to="/tools/property-valuation" className="px-8 py-4 bg-gold text-luxury-black rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-xl shadow-gold/10">
                            {t('interactive_tools.info.try_oracle')}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
