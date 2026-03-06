import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, X, TrendingDown, TrendingUp, Calendar, ArrowRight, Info, AlertCircle } from 'lucide-react';
import { Property, PriceHistoryItem } from '../types';
import { LOCATION_STATS } from '../lib/data';

interface PriceHistoryModalProps {
    property: Property;
    isOpen: boolean;
    onClose: () => void;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({ property, isOpen, onClose }) => {
    if (!property.priceHistory) return null;

    const sortedHistory = [...property.priceHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalDaysOnMarket = Math.floor(
        (new Date().getTime() - new Date(sortedHistory[sortedHistory.length - 1].date).getTime()) / (1000 * 60 * 60 * 24)
    );

    const priceDrops = property.priceHistory.filter(item => item.event === 'Price drop').length;

    // Market Benchmark Logic
    const areaStats = LOCATION_STATS[property.locationId];
    const currentPriceSqm = Math.round(property.price / property.sqm);
    const areaMedianSqm = areaStats ? (property.type === 'sale' ? areaStats.medianPriceSale : areaStats.medianPriceRent) : 0;

    const isGoodDeal = areaMedianSqm ? currentPriceSqm <= areaMedianSqm : false;
    const areaDiff = areaMedianSqm ? Math.round(((currentPriceSqm - areaMedianSqm) / areaMedianSqm) * 100) : 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-luxury-black/90 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                                    <History size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-serif text-white">Price Intelligence</h3>
                                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Listing ID: {property.id} · Market Benchmarking</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 md:p-12 overflow-y-auto max-h-[70vh]">
                            <div className="mb-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                <div>
                                    <h4 className="text-lg font-serif mb-1 text-white">{property.title}</h4>
                                    <div className="text-sm text-white/40">{property.locationName}</div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
                                        <div className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold mb-1">On Market</div>
                                        <div className="text-lg font-serif text-white">{totalDaysOnMarket} Days</div>
                                    </div>
                                    <div className="px-4 py-2 bg-gold/5 border border-gold/20 rounded-xl text-center">
                                        <div className="text-[9px] uppercase tracking-widest text-gold font-bold mb-1">Current €/m²</div>
                                        <div className="text-lg font-serif text-white">€{currentPriceSqm.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Benchmark Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                <div className={`p-6 rounded-2xl border ${isGoodDeal ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                                    <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-2">Area Comparison</div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xl font-serif ${isGoodDeal ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {areaDiff > 0 ? '+' : ''}{areaDiff}%
                                        </span>
                                        <span className="text-xs text-white/40">vs Local Median</span>
                                    </div>
                                </div>
                                <div className="p-6 bg-white/3 border border-white/5 rounded-2xl">
                                    <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-2">Market Sentiment</div>
                                    <div className="text-sm text-white font-medium">{isGoodDeal ? '🔥 Competitive Pricing' : '💎 Premium Property'}</div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="relative space-y-8 before:absolute before:inset-0 before:left-[11px] before:w-px before:bg-white/10">
                                {sortedHistory.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="relative pl-10 group"
                                    >
                                        {/* Circle */}
                                        <div className={`absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-2 bg-luxury-black transition-all ${item.event === 'Current' ? 'border-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]' :
                                            item.event === 'Price drop' ? 'border-emerald-500' : 'border-white/20'
                                            }`}>
                                            {item.event === 'Current' && <div className="absolute inset-1 bg-gold rounded-full animate-pulse" />}
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white/3 border border-white/5 rounded-2xl group-hover:bg-white/5 transition-all">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className={`text-[10px] uppercase tracking-widest font-bold ${item.event === 'Price drop' ? 'text-emerald-400' :
                                                        item.event === 'Current' ? 'text-gold' : 'text-white/40'
                                                        }`}>
                                                        {item.event}
                                                    </span>
                                                    <span className="text-[10px] text-white/20 mx-1">/</span>
                                                    <span className="text-[10px] text-white/40 font-medium font-mono">{item.date}</span>
                                                </div>
                                                <div className="text-xl font-serif text-white">
                                                    €{item.price.toLocaleString()}
                                                </div>
                                            </div>

                                            {item.change && (
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold ${item.change < 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                                    }`}>
                                                    {item.change < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                                    {item.change > 0 ? '+' : ''}{item.change}%
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Insight */}
                            <div className="mt-12 p-6 bg-gold/5 border border-gold/20 rounded-3xl flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0 text-gold">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-white mb-2 uppercase tracking-widest">Market Insight</h5>
                                    <p className="text-xs text-white/60 leading-relaxed">
                                        This property has been listed for {totalDaysOnMarket} days with {priceDrops} price adjustments.
                                        Comparative data suggests this reflects a motivated seller for current market conditions.
                                        Use this data for your negotiation leverage.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-white/5 bg-black/40 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-gold text-luxury-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
                            >
                                Close History
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export const PriceHistoryButton: React.FC<{
    property: Property;
    variant?: 'card' | 'page';
}> = ({ property, variant = 'card' }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!property.priceHistory) return null;

    if (variant === 'page') {
        return (
            <>
                <button
                    onClick={() => setIsOpen(true)}
                    className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all text-center gap-2 w-full"
                >
                    <History size={20} className="text-gold" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-gold">Price History</span>
                </button>
                <PriceHistoryModal property={property} isOpen={isOpen} onClose={() => setIsOpen(false)} />
            </>
        );
    }

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-luxury-black/60 backdrop-blur-md border border-white/10 rounded-lg text-white/60 hover:text-gold hover:border-gold transition-all group"
            >
                <History size={12} className="group-hover:rotate-[-30deg] transition-transform" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Price History</span>
            </button>

            <PriceHistoryModal
                property={property}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
};
