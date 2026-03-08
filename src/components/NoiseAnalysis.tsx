import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Info, Car, Music, Hammer, Plane, X, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Property, NoiseAssessment } from '../types';

interface NoiseAnalysisProps {
    property: Property;
    isOpen: boolean;
    onClose: () => void;
}

const DEFAULT_NOISE: NoiseAssessment = {
    score: 75,
    traffic: 'Low',
    nightlife: 'Quiet',
    constructionRisk: 'Medium',
    isFlightPath: false
};

export const NoiseAnalysisModal: React.FC<NoiseAnalysisProps> = ({ property, isOpen, onClose }) => {
    const { t } = useTranslation();
    const noise = property.noiseLevel || DEFAULT_NOISE;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-gold';
        return 'text-red-400';
    };

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
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Background Glow */}
                        <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20 rounded-full ${noise.score >= 80 ? 'bg-emerald-500' : 'bg-gold'}`} />

                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-[150] shadow-2xl border border-white/10"
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                                <Volume2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-serif text-white">{t('interactive.noise.title', 'Smart Sound Assessment')}</h3>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{t('interactive.noise.subtitle', 'Malta Environmental Noise Audit v2.0')}</p>
                            </div>
                        </div>

                        {/* Score Circle */}
                        <div className="flex flex-col items-center justify-center mb-12">
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        fill="transparent"
                                        stroke="rgba(255,255,255,0.05)"
                                        strokeWidth="12"
                                    />
                                    <motion.circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        strokeDasharray={440}
                                        initial={{ strokeDashoffset: 440 }}
                                        animate={{ strokeDashoffset: 440 - (440 * noise.score) / 100 }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={getScoreColor(noise.score)}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-5xl font-serif font-bold ${getScoreColor(noise.score)}`}>{noise.score}</span>
                                    <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">{t('interactive.noise.score_label')}</span>
                                </div>
                            </div>
                            <p className="mt-6 text-sm text-white/60 text-center max-w-xs">
                                {noise.score >= 80
                                    ? t('interactive.noise.exceptional')
                                    : noise.score >= 60
                                        ? t('interactive.noise.standard')
                                        : t('interactive.noise.high')}
                            </p>
                        </div>

                        {/* Breakdown Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white/3 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3 text-white/40 mb-2">
                                    <Car size={14} />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">{t('interactive.noise.traffic')}</span>
                                </div>
                                <div className="text-sm text-white font-medium">{noise.traffic} {t('interactive.noise.intensity')}</div>
                            </div>

                            <div className="p-5 bg-white/3 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3 text-white/40 mb-2">
                                    <Music size={14} />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">{t('interactive.noise.nightlife')}</span>
                                </div>
                                <div className="text-sm text-white font-medium">{noise.nightlife} {t('interactive.noise.surroundings')}</div>
                            </div>

                            <div className="p-5 bg-white/3 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3 text-white/40 mb-2">
                                    <Hammer size={14} />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">{t('interactive.noise.construction')}</span>
                                </div>
                                <div className="text-sm text-white font-medium">{noise.constructionRisk} {t('interactive.noise.risk')}</div>
                            </div>

                            <div className="p-5 bg-white/3 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3 text-white/40 mb-2">
                                    <Plane size={14} />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">{t('interactive.noise.aviation')}</span>
                                </div>
                                <div className="text-sm text-white font-medium">{noise.isFlightPath ? t('interactive.noise.flight_path') : t('interactive.noise.outside_flight_path')}</div>
                            </div>
                        </div>

                        {/* Certification Badge */}
                        <div className="mt-10 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <ShieldCheck size={18} />
                            </div>
                            <p className="text-[10px] text-emerald-400/80 uppercase tracking-wide leading-relaxed font-medium">
                                {t('interactive.noise.verified_desc')}
                            </p>
                        </div>

                        <div className="mt-8 flex gap-3 text-white/20">
                            <Info size={14} className="shrink-0 mt-0.5" />
                            <p className="text-[9px] uppercase tracking-wider leading-relaxed">
                                {t('interactive.noise.disclaimer')}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export const NoiseAnalysisButton: React.FC<{
    property: Property;
    variant?: 'card' | 'page';
}> = ({ property, variant = 'card' }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const score = property.noiseLevel?.score || 75;

    if (variant === 'page') {
        return (
            <>
                <button
                    onClick={() => setIsOpen(true)}
                    className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all text-center gap-2 w-full"
                >
                    {score >= 80 ? (
                        <VolumeX size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                    ) : (
                        <Volume2 size={20} className="text-gold group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-gold">{t('common.quiet_score')}: {score}</span>
                </button>
                <NoiseAnalysisModal property={property} isOpen={isOpen} onClose={() => setIsOpen(false)} />
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
                className="flex-1 flex items-center gap-2 px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:text-gold hover:border-gold/50 transition-all group relative overflow-hidden h-10"
            >
                {score >= 80 ? (
                    <VolumeX size={14} className="text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                ) : (
                    <Volume2 size={14} className="text-gold group-hover:scale-110 transition-transform shrink-0" />
                )}
                <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">{t('common.quiet_score')}: {score}</span>
            </button>

            <NoiseAnalysisModal
                property={property}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
};
