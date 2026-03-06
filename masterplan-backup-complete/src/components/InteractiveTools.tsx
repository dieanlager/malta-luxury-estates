import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, TrendingUp, ShieldCheck, ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BuyingCostsCalculator } from './BuyingCostsCalculator';
import { ROICalculator } from './calculators/ROICalculator';
import { SalesTaxCalculator } from './calculators/SalesTaxCalculator';
import { MortgageCalculator } from './calculators/MortgageCalculator';

/**
 * Interactive Intelligence Tools Wrapper
 * Switching between Buying, ROI and Selling calculators.
 */
export const InteractiveTools = () => {
    const [activeTab, setActiveTab] = useState<'buying' | 'roi' | 'selling' | 'mortgage'>('buying');

    const tabs = [
        { id: 'buying', label: 'Buying Costs', icon: Calculator, color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30' },
        { id: 'mortgage', label: 'Mortgage', icon: Home, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/30' },
        { id: 'roi', label: 'Investment ROI', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/30' },
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

                    <div className="flex p-2 bg-white/5 border border-white/10 rounded-3xl gap-2 w-fit">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === tab.id
                                    ? `${tab.bg} ${tab.color} border ${tab.border} flex-1`
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon size={20} />
                                <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">{tab.label}</span>
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
                            {activeTab === 'mortgage' && <MortgageCalculator />}
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
                    <div className="glass-card p-8 rounded-3xl border border-white/5 group hover:border-amber-500/30 transition-all">
                        <h4 className="font-serif text-xl mb-3 text-amber-400">Legal Support</h4>
                        <p className="text-xs text-white/40 leading-relaxed mb-6">
                            Calculations are estimates. We partner with top-tier Maltese notaries for official title searches and deeds.
                        </p>
                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-gold transition-colors">
                            Contact Notary <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
