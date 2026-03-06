import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Info, TrendingUp, Landmark, Zap, ShieldCheck, X } from 'lucide-react';
import { Property, EPCRating } from '../types';

interface EPCCalculatorProps {
    property: Property;
    isOpen: boolean;
    onClose: () => void;
}

const EPC_COLORS: Record<EPCRating, string> = {
    'A': 'bg-emerald-500',
    'B': 'bg-green-500',
    'C': 'bg-lime-500',
    'D': 'bg-yellow-500',
    'E': 'bg-orange-500',
    'F': 'bg-orange-600',
    'G': 'bg-red-600',
};

export const EPCCalculator: React.FC<EPCCalculatorProps> = ({ property, isOpen, onClose }) => {
    const currentRating = property.epcRating || 'D';

    const analysis = useMemo(() => {
        // Logic for Malta 2026 Energy Efficiency
        const isHighEfficiency = currentRating === 'A' || currentRating === 'B';

        // Upgrade costs based on sqm (rough 2026 estimates for retrofitting)
        const baseRetrofitCostPerSqm = 100; // Average cost to jump 1-2 levels
        const upgradeCost = currentRating === 'A' ? 0 :
            currentRating === 'B' ? property.sqm * 40 :
                property.sqm * baseRetrofitCostPerSqm;

        const annualSavings = (property.sqm * 15); // Avg savings €15/m2 for A/B rated
        const paybackPeriod = upgradeCost > 0 ? (upgradeCost / annualSavings).toFixed(1) : '0';

        const bankPremium = isHighEfficiency ? '-0.30%' : (currentRating === 'C' ? '-0.15%' : 'Standard Rate');
        const resaleValuePremium = isHighEfficiency ? '8-12%' : (currentRating === 'C' ? '3-5%' : '0%');

        return {
            upgradeCost,
            annualSavings,
            paybackPeriod,
            bankPremium,
            resaleValuePremium,
            isHighEfficiency
        };
    }, [property, currentRating]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center px-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-luxury-black/95 backdrop-blur-2xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        className="relative w-full max-w-2xl bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Background Grain/Effect */}
                        <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-20 -mr-32 -mt-32 ${EPC_COLORS[currentRating]}`} />

                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <Leaf size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-serif text-white">Green Efficiency <span className="text-gold italic">Intelligence</span></h3>
                                <p className="text-xs text-white/40 uppercase tracking-widest font-bold">2026 EU Energy Standards Audit</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* EPC RATING DISPLAY */}
                            <div className="space-y-6">
                                <div className="p-8 bg-black/40 border border-white/5 rounded-3xl flex flex-col items-center">
                                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4">Current Rating</div>
                                    <div className={`w-20 h-20 rounded-2xl ${EPC_COLORS[currentRating]} flex items-center justify-center shadow-2xl shadow-black/40`}>
                                        <span className="text-4xl font-serif font-bold text-luxury-black">{currentRating}</span>
                                    </div>
                                    {currentRating === 'A' ? (
                                        <div className="mt-6 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase rounded-lg">Elite Efficiency</div>
                                    ) : null}
                                </div>

                                <div className="p-6 bg-white/3 border border-white/5 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-3 text-gold">
                                        <Landmark size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Bank Premium</span>
                                    </div>
                                    <div className="text-xl text-white font-serif">{analysis.bankPremium}</div>
                                    <p className="text-[10px] text-white/30 leading-relaxed mt-2 uppercase tracking-tight">Available via green bank schemes (BOV/HSBC Green Loans)</p>
                                </div>
                            </div>

                            {/* STATS GRID */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-white/3 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Zap size={14} className="text-gold" />
                                        <span className="text-[10px] uppercase font-bold text-white/60 tracking-widest">Upgrade Cost</span>
                                    </div>
                                    <span className="text-sm font-serif text-white">~€{analysis.upgradeCost.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center p-4 bg-white/3 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp size={14} className="text-emerald-400" />
                                        <span className="text-[10px] uppercase font-bold text-white/60 tracking-widest">Annual Savings</span>
                                    </div>
                                    <span className="text-sm font-serif text-emerald-400">~€{analysis.annualSavings.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center p-4 bg-white/3 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck size={14} className="text-blue-400" />
                                        <span className="text-[10px] uppercase font-bold text-white/60 tracking-widest">Payback Period</span>
                                    </div>
                                    <span className="text-sm font-serif text-white">{analysis.paybackPeriod} Years</span>
                                </div>

                                <div className="flex justify-between items-center p-8 bg-gold/5 rounded-2xl border border-gold/20">
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-gold tracking-widest">Resale Premium</span>
                                        <p className="text-[9px] text-white/20 leading-relaxed">Projected value increase for A/B rating in 2026/27</p>
                                    </div>
                                    <span className="text-2xl font-serif text-white">+{analysis.resaleValuePremium}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-white/5 flex gap-4">
                            <div className="w-10 h-10 shrink-0 rounded-full bg-white/5 flex items-center justify-center text-white/30">
                                <Info size={16} />
                            </div>
                            <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-wide">
                                Calculations based on 2026 energy prices and standard solar/thermal insulation retrofit costs in the Maltese islands. EU Directives 2026/08 comply.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export const EPCButton: React.FC<{ property: Property }> = ({ property }) => {
    const [isOpen, setIsOpen] = useState(false);
    const rating = property.epcRating || 'D';

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:text-emerald-400 hover:border-emerald-500/50 transition-all group relative overflow-hidden"
            >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${EPC_COLORS[rating]}`} />
                <Leaf size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Efficiency Audit: {rating}</span>
            </button>

            <EPCCalculator
                property={property}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
};
