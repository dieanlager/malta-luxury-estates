import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    const [activeTab, setActiveTab] = useState<'buying' | 'roi' | 'selling' | 'mortgage' | 'buyvsrent' | 'prequalifier'>('buying');

    const tabs = [
        { id: 'buying', label: 'Buying Costs', icon: Calculator, color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30' },
        { id: 'prequalifier', label: 'Pre-Qualifier', icon: Landmark, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/30' },
        { id: 'mortgage', label: 'Mortgage', icon: Home, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/30' },
        { id: 'buyvsrent', label: 'Buy vs Rent', icon: Scale, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-500/30' },
        { id: 'roi', label: 'Investment ROI', icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-500/30' },
        { id: 'selling', label: 'Selling Tax', icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/30' },
    ];

    return (
        <section className="py-20" id="tools">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-px bg-gold" />
                            <span className="text-gold uppercase tracking-widest text-xs font-bold">Financial Intelligence</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">
                            Interactive <span className="text-gold-gradient italic">Market Tools</span>
                        </h2>
                        <p className="text-white/60 text-lg leading-relaxed">
                            Precise financial modeling for the Maltese real estate market.
                            Our tools utilize the latest 2026 tax regulations and proprietary market data.
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
                        <h4 className="font-serif text-xl mb-3 text-gold">2026 Tax Update</h4>
                        <p className="text-xs text-white/40 leading-relaxed mb-6">
                            Our tools reflect the latest budget measures including UCA exemptions and the Gozo first-residence scheme.
                        </p>
                        <Link to="/insights/property-taxes-malta-2026" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-gold transition-colors">
                            Read Tax Guide <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="glass-card p-8 rounded-3xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                        <h4 className="font-serif text-xl mb-3 text-emerald-400">ROI Benchmarks</h4>
                        <p className="text-xs text-white/40 leading-relaxed mb-6">
                            Sliema and St. Julian's are currently delivering 4.2% - 5.8% net yields for luxury rental property.
                        </p>
                        <Link to="/insights/rental-yields-malta-2026" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-gold transition-colors">
                            Yield Reports <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="glass-card p-10 rounded-[2.5rem] border border-gold/20 bg-gold/5 flex flex-col justify-between items-start group hover:scale-[1.02] transition-all">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-6">
                                <Landmark size={24} />
                            </div>
                            <h4 className="font-serif text-2xl mb-3 text-white">AI Price Oracle</h4>
                            <p className="text-sm text-white/40 leading-relaxed mb-8">
                                Get an instant, AI-powered valuation for any Maltese property using our neural market index.
                            </p>
                        </div>
                        <Link to="/tools/property-valuation" className="px-8 py-4 bg-gold text-luxury-black rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-xl shadow-gold/10">
                            Try AI Oracle
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
