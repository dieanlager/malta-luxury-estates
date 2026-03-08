import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, X, Zap, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Property } from '../types';
import { PROPERTIES } from '../constants';
import { PropertyCard } from './PropertyCard';

interface PropertyTwinFinderProps {
    currentProperty: Property;
    isOpen: boolean;
    onClose: () => void;
}

export const PropertyTwinFinder: React.FC<PropertyTwinFinderProps> = ({ currentProperty, isOpen, onClose }) => {
    const { t } = useTranslation();
    const [analyzing, setAnalyzing] = useState(true);

    // AI Twin Finder Logic
    const twins = useMemo(() => {
        return PROPERTIES
            .filter(p => p.id !== currentProperty.id) // Not the same one
            .map(p => {
                let score = 0;
                // Same property type is a strong signal
                if (p.propertyType === currentProperty.propertyType) score += 40;

                // Same vibe (seafront, tags)
                if (p.isSeafront === currentProperty.isSeafront) score += 20;

                // Similar size
                const sizeDiff = Math.abs(p.sqm - currentProperty.sqm) / currentProperty.sqm;
                if (sizeDiff < 0.2) score += 20;

                // Features overlap
                const commonFeatures = p.features.filter(f => currentProperty.features.includes(f));
                score += commonFeatures.length * 5;

                return { property: p, score: Math.min(score, 99) };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 2); // Get top 2 twins
    }, [currentProperty]);

    // Simulate AI Thinking
    React.useEffect(() => {
        if (isOpen) {
            setAnalyzing(true);
            const timer = setTimeout(() => setAnalyzing(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

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
                        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white/5 border border-white/10 rounded-[3rem] shadow-2xl p-8 md:p-12 scrollbar-hide"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-[150] shadow-2xl border border-white/10"
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center text-center mb-16">
                            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-6 relative">
                                <Sparkles size={32} />
                                <motion.div
                                    className="absolute inset-0 rounded-2xl border border-gold"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">{t('interactive.twin.title', 'AI Property Twin Finder')}</h2>
                            <p className="text-white/40 max-w-xl">
                                {t('interactive.twin.subtitle')}
                            </p>
                        </div>

                        {analyzing ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-8">
                                <div className="relative w-24 h-24">
                                    <motion.div
                                        className="absolute inset-0 border-4 border-gold/20 border-t-gold rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    />
                                </div>
                                <div className="space-y-2 text-center">
                                    <motion.div
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold"
                                    >
                                        {t('interactive.twin.analyzing', 'Analyzing Layout DNA...')}
                                    </motion.div>
                                    <div className="text-sm text-white/20">{t('interactive.twin.analyzing_subtitle')}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-12">
                                {twins.map(({ property, score }, idx) => (
                                    <motion.div
                                        key={property.id}
                                        initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="relative"
                                    >
                                        <div className="absolute -top-6 left-8 z-10">
                                            <div className="px-4 py-2 bg-luxury-black border border-gold/30 rounded-xl flex items-center gap-3 shadow-xl">
                                                <CheckCircle2 size={16} className="text-emerald-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                                                    {score}% {t('interactive.twin.match_confidence', 'Match Confidence')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pointer-events-none opacity-40 scale-95 blur-[2px]">
                                            <PropertyCard property={property} />
                                        </div>

                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-2xl p-8 border border-white/5">
                                            <div className="text-center mb-10">
                                                <div className="text-xs text-gold font-bold uppercase tracking-widest mb-2">{t('interactive.twin.why_title')}</div>
                                                <h4 className="text-2xl font-serif text-white mb-4">{property.title}</h4>
                                                <p className="text-xs text-white/60 leading-relaxed">
                                                    {t('interactive.twin.why_desc', {
                                                        type: property.propertyType,
                                                        location: property.locationName,
                                                        f1: property.features[0],
                                                        f2: property.features[1]
                                                    })}
                                                </p>
                                            </div>
                                            <button className="w-full py-4 bg-gold text-luxury-black rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 group">
                                                {t('interactive.twin.explore_button', 'Explore This Twin')}
                                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        <div className="mt-20 pt-12 border-t border-white/5 text-center">
                            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/3 border border-white/5">
                                <Zap size={16} className="text-gold animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                                    {t('interactive.twin.footer_note')}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export const PropertyTwinButton: React.FC<{ property: Property }> = ({ property }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className="flex-1 flex items-center gap-2 px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:text-gold hover:border-gold transition-all group overflow-hidden relative h-10"
            >
                <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles size={14} className="text-gold group-hover:rotate-12 transition-transform shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-widest relative whitespace-nowrap">{t('common.find_twin')}</span>
            </button>

            <PropertyTwinFinder
                currentProperty={property}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
};
