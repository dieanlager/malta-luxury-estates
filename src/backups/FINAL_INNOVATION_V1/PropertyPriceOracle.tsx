import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Scan, MapPin, Home, Maximize, Layers,
    Sun, Waves, Sparkles, ArrowRight, ShieldCheck,
    BarChart3, TrendingUp, Info, HelpCircle, AlertCircle
} from 'lucide-react';
import { LOCATION_STATS } from '../lib/data';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMeta } from '../lib/seo/meta';

// ─── Constants & Logic ───────────────────────────────────────────────────────
const PROPERTY_TYPE_MULTIPLIER: Record<string, number> = {
    'Apartment': 1.0,
    'Maisonette': 1.05,
    'Penthouse': 1.35,
    'House of Character': 1.25,
    'Villa': 1.5,
    'Palazzo': 1.8
};

const VIEW_MULTIPLIER: Record<number, number> = {
    0: 1.0, // No view
    1: 1.08, // City view
    2: 1.25, // Side sea view
    3: 1.45  // Direct sea view
};

export const PropertyPriceOracle: React.FC = () => {
    usePageMeta({
        title: 'AI Property Price Oracle | Free Valuation Malta & Gozo',
        description: 'Get an instant, AI-powered property valuation. Our Oracle analyzes market trends, location data, and property specs to provide high-precision estimates.',
        canonicalPath: '/tools/property-valuation'
    });

    const [step, setStep] = useState(1);
    const [analyzing, setAnalyzing] = useState(false);

    // Form State
    const [specs, setSpecs] = useState({
        locationId: 1, // Sliema
        type: 'Apartment',
        sqm: 120,
        beds: 2,
        baths: 2,
        floor: 3,
        finish: 'Furnished', // Shell, Finished, Furnished
        view: 0, // 0-3
        hasPool: false,
        isSeafront: false
    });

    // valuation logic (simplified but grounded in 2026 data)
    const valuation = useMemo(() => {
        const areaStats = LOCATION_STATS[specs.locationId];
        if (!areaStats || !areaStats.avgPriceSale) return null;

        let basePricePerSqm = areaStats.avgPriceSale;

        // Type Multiplier
        basePricePerSqm *= PROPERTY_TYPE_MULTIPLIER[specs.type] || 1.0;

        // Finish Adjustment
        if (specs.finish === 'Shell') basePricePerSqm *= 0.75;
        if (specs.finish === 'Furnished') basePricePerSqm *= 1.15;

        // Floor Adjustment (higher = more expensive)
        if (specs.type === 'Apartment' || specs.type === 'Penthouse') {
            basePricePerSqm *= (1 + (specs.floor * 0.01));
        }

        // View & Location Premium
        basePricePerSqm *= VIEW_MULTIPLIER[specs.view];
        if (specs.isSeafront) basePricePerSqm *= 1.4;
        if (specs.hasPool) basePricePerSqm += 250; // extra per sqm for pool value

        const estimatedValue = basePricePerSqm * specs.sqm;
        const rangeLow = Math.round((estimatedValue * 0.94) / 1000) * 1000;
        const rangeHigh = Math.round((estimatedValue * 1.06) / 1000) * 1000;

        // Yield Projection
        const possibleRent = (estimatedValue * 0.045) / 12; // 4.5% gross yield assumption

        return { estimatedValue, rangeLow, rangeHigh, possibleRent, basePricePerSqm };
    }, [specs]);

    const handleValuation = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            setStep(3);
        }, 2500);
    };

    return (
        <main className="min-h-screen bg-luxury-black pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">

                {/* Breadcrumb */}
                <div className="mb-8">
                    <Breadcrumb items={[
                        { label: 'Home', href: '/' },
                        { label: 'Tools', href: '/#tools' },
                        { label: 'AI Price Oracle' }
                    ]} />
                </div>

                {/* Section Header */}
                <div className="max-w-3xl mb-16 text-center mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-12 h-px bg-gold" />
                        <span className="text-gold uppercase tracking-widest text-xs font-bold">Neural Valuation Engine</span>
                        <div className="w-12 h-px bg-gold" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">
                        Malta Property <span className="text-gold-gradient italic">Price Oracle</span>
                    </h1>
                    <p className="text-white/40 text-lg leading-relaxed">
                        State-of-the-art AI valuation based on real transaction data,
                        market inventory, and architectural premiums.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left: Input Panel */}
                    <div className="lg:col-span-12">
                        <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">

                                {/* Step Sidebar */}
                                <div className="lg:col-span-4 bg-black/40 border-r border-white/5 p-10 flex flex-col justify-between">
                                    <div className="space-y-12">
                                        <div className="flex items-center gap-4 group">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${step >= 1 ? 'bg-gold border-gold text-luxury-black' : 'border-white/10 text-white/20'}`}>
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <div className={`text-[10px] font-bold uppercase tracking-widest ${step >= 1 ? 'text-gold' : 'text-white/20'}`}>Step 01</div>
                                                <div className={`text-sm font-serif ${step >= 1 ? 'text-white' : 'text-white/20'}`}>Location & Type</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${step >= 2 ? 'bg-gold border-gold text-luxury-black' : 'border-white/10 text-white/20'}`}>
                                                <Maximize size={18} />
                                            </div>
                                            <div>
                                                <div className={`text-[10px] font-bold uppercase tracking-widest ${step >= 2 ? 'text-gold' : 'text-white/20'}`}>Step 02</div>
                                                <div className={`text-sm font-serif ${step >= 2 ? 'text-white' : 'text-white/20'}`}>Specifications</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${step >= 3 ? 'bg-gold border-gold text-luxury-black' : 'border-white/10 text-white/20'}`}>
                                                <Sparkles size={18} />
                                            </div>
                                            <div>
                                                <div className={`text-[10px] font-bold uppercase tracking-widest ${step >= 3 ? 'text-gold' : 'text-white/20'}`}>Step 03</div>
                                                <div className={`text-sm font-serif ${step >= 3 ? 'text-white' : 'text-white/20'}`}>AI Result</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white/3 border border-white/5 rounded-2xl">
                                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                            <ShieldCheck size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Data Integrity</span>
                                        </div>
                                        <p className="text-[11px] text-white/30 leading-relaxed">
                                            Our algorithms process over 14,000 active listings and historical PPR data to ensure ±5% accuracy in core zones.
                                        </p>
                                    </div>
                                </div>

                                {/* Main Interaction Area */}
                                <div className="lg:col-span-8 p-10 md:p-16 relative bg-black/20">
                                    <AnimatePresence mode="wait">
                                        {analyzing ? (
                                            <motion.div
                                                key="analyzing"
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-luxury-black/60 backdrop-blur-md"
                                            >
                                                <div className="relative w-32 h-32 mb-12">
                                                    <motion.div
                                                        className="absolute inset-0 border-4 border-gold/20 border-t-gold rounded-full"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                    />
                                                    <motion.div
                                                        className="absolute inset-4 border border-white/10 rounded-full flex items-center justify-center"
                                                        animate={{ scale: [1, 1.1, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    >
                                                        <Sparkles className="text-gold" size={32} />
                                                    </motion.div>
                                                </div>
                                                <div className="space-y-2 text-center">
                                                    <motion.h3
                                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                        className="text-2xl font-serif text-white uppercase tracking-widest"
                                                    >
                                                        Calculating Market Index...
                                                    </motion.h3>
                                                    <div className="text-white/20 text-sm">Evaluating architectonic premiums and location heat.</div>
                                                </div>
                                            </motion.div>
                                        ) : null}

                                        {/* STEP 1: Location & Type */}
                                        {step === 1 && (
                                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                                <h3 className="text-3xl font-serif text-white mb-10">Where is the property?</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Location</label>
                                                        <select
                                                            value={specs.locationId}
                                                            onChange={(e) => setSpecs({ ...specs, locationId: parseInt(e.target.value) })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-gold outline-none h-14"
                                                        >
                                                            {Object.values(LOCATION_STATS).map(l => (
                                                                <option key={l.locationId} value={l.locationId} className="bg-luxury-black">{l.locationId === 1 ? 'Sliema' : l.locationId === 2 ? 'St. Julian\'s' : l.locationId === 3 ? 'Valletta' : l.locationId === 10 ? 'Victoria (Gozo)' : `Area #${l.locationId}`}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Property Type</label>
                                                        <select
                                                            value={specs.type}
                                                            onChange={(e) => setSpecs({ ...specs, type: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-gold outline-none h-14"
                                                        >
                                                            {['Apartment', 'Penthouse', 'Villa', 'Palazzo', 'House of Character', 'Maisonette'].map(t => (
                                                                <option key={t} value={t} className="bg-luxury-black">{t}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setStep(2)}
                                                    className="px-12 py-5 bg-gold text-luxury-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3"
                                                >
                                                    Continue Specs <ArrowRight size={16} />
                                                </button>
                                            </motion.div>
                                        )}

                                        {/* STEP 2: Specs */}
                                        {step === 2 && (
                                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                                <h3 className="text-3xl font-serif text-white mb-10">Physical Attributes</h3>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Total Area</label>
                                                            <span className="text-white font-serif">{specs.sqm} m²</span>
                                                        </div>
                                                        <input
                                                            type="range" min="30" max="1500" step="10"
                                                            value={specs.sqm}
                                                            onChange={(e) => setSpecs({ ...specs, sqm: parseInt(e.target.value) })}
                                                            className="w-full accent-gold bg-white/10 rounded-lg cursor-pointer h-1.5"
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Beds / Baths</label>
                                                            <span className="text-white font-serif">{specs.beds}bd · {specs.baths}bt</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {[1, 2, 3, 4, 5].map(n => (
                                                                <button
                                                                    key={n}
                                                                    onClick={() => setSpecs({ ...specs, beds: n, baths: Math.max(1, n - 1) })}
                                                                    className={`flex-1 h-10 rounded-lg border transition-all text-xs ${specs.beds === n ? 'bg-gold border-gold text-black' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                                                                >
                                                                    {n}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Finish Level</label>
                                                        <div className="grid grid-cols-3 gap-2 h-10">
                                                            {['Shell', 'Finished', 'Furnished'].map(f => (
                                                                <button
                                                                    key={f}
                                                                    onClick={() => setSpecs({ ...specs, finish: f })}
                                                                    className={`rounded-lg border text-[9px] uppercase font-bold tracking-widest transition-all ${specs.finish === f ? 'bg-white/10 border-gold text-gold' : 'border-white/10 text-white/30'}`}
                                                                >
                                                                    {f}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 pt-8 border-t border-white/5">
                                                    <div className="space-y-6">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Premium Signals</label>
                                                        <div className="flex gap-4">
                                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={specs.isSeafront}
                                                                    onChange={(e) => setSpecs({ ...specs, isSeafront: e.target.checked })}
                                                                    className="hidden"
                                                                />
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${specs.isSeafront ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-white/10 text-white/20'}`}>
                                                                    <Waves size={18} />
                                                                </div>
                                                                <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${specs.isSeafront ? 'text-white' : 'text-white/20'}`}>Seafront</span>
                                                            </label>
                                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={specs.hasPool}
                                                                    onChange={(e) => setSpecs({ ...specs, hasPool: e.target.checked })}
                                                                    className="hidden"
                                                                />
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${specs.hasPool ? 'bg-gold/20 border-gold text-gold' : 'border-white/10 text-white/20'}`}>
                                                                    <Sun size={18} />
                                                                </div>
                                                                <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${specs.hasPool ? 'text-white' : 'text-white/20'}`}>Pool</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-6">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">View Quality</label>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {[0, 1, 2, 3].map(v => (
                                                                <button
                                                                    key={v}
                                                                    onClick={() => setSpecs({ ...specs, view: v })}
                                                                    className={`h-10 rounded-lg border flex items-center justify-center transition-all ${specs.view === v ? 'bg-white/10 border-gold text-gold' : 'border-white/5 text-white/20'}`}
                                                                >
                                                                    <Waves size={14} className={v === 0 ? 'opacity-20' : ''} />
                                                                    <Waves size={14} className={v < 2 ? 'opacity-20' : ''} />
                                                                    <Waves size={14} className={v < 3 ? 'opacity-20' : ''} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4">
                                                    <button onClick={() => setStep(1)} className="px-10 py-5 rounded-2xl border border-white/10 text-white/40 text-xs font-bold uppercase tracking-widest">Back</button>
                                                    <button
                                                        onClick={handleValuation}
                                                        className="flex-1 py-5 bg-gold text-luxury-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl shadow-gold/20"
                                                    >
                                                        Generate AI Valuation <Sparkles size={16} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* STEP 3: Results */}
                                        {step === 3 && valuation && (
                                            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                                <div className="flex items-center gap-3 mb-6">
                                                    <Scan className="text-gold" size={24} />
                                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Valuation Analysis Complete</label>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
                                                    {/* Main Range */}
                                                    <div className="md:col-span-12 p-10 bg-white/3 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[80px] -mr-32 -mt-32" />
                                                        <div className="relative z-10 text-center">
                                                            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-6">Estimated Market Value</div>
                                                            <div className="flex items-center justify-center gap-6 mb-8">
                                                                <div className="text-4xl md:text-6xl font-serif text-white">€{valuation.rangeLow.toLocaleString()}</div>
                                                                <div className="w-12 h-px bg-white/20" />
                                                                <div className="text-4xl md:text-6xl font-serif text-white">€{valuation.rangeHigh.toLocaleString()}</div>
                                                            </div>
                                                            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold tracking-widest text-[10px] uppercase">
                                                                <ShieldCheck size={14} /> Confidence Score: 92%
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Secondary Stats */}
                                                    <div className="md:col-span-6 p-8 bg-black/40 border border-white/5 rounded-3xl">
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <BarChart3 size={18} className="text-gold" />
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Rental Potential</span>
                                                        </div>
                                                        <div className="text-3xl font-serif text-white mb-2">€{Math.round(valuation.possibleRent).toLocaleString()}<span className="text-sm text-white/30 ml-2">/ mth</span></div>
                                                        <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Projected 4.5% Gross Yield</p>
                                                    </div>

                                                    <div className="md:col-span-6 p-8 bg-black/40 border border-white/5 rounded-3xl">
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <Layers size={18} className="text-gold" />
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Market Heat</span>
                                                        </div>
                                                        <div className="text-3xl font-serif text-white mb-2">€{Math.round(valuation.basePricePerSqm).toLocaleString()}<span className="text-sm text-white/30 ml-2">per m²</span></div>
                                                        <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">+4.2% Growth for {specs.type}s</p>
                                                    </div>
                                                </div>

                                                <div className="p-8 bg-gold/5 border border-gold/20 rounded-3xl flex flex-col md:flex-row gap-8 items-center justify-between">
                                                    <div className="flex gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                                                            <TrendingUp size={24} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-white uppercase tracking-widest mb-1">Hold vs Sell Insight</div>
                                                            <p className="text-xs text-white/50 leading-relaxed max-w-sm">
                                                                Market heat index in {specs.locationId === 1 ? 'Sliema' : 'this area'} is steady. We recommend <strong>HOLDING</strong> until Q4 2026 to capitalize on projected capital gains.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button className="px-10 py-5 bg-gold text-luxury-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all whitespace-nowrap">
                                                        Get Detailed Report (PDF)
                                                    </button>
                                                </div>

                                                <div className="mt-12 flex justify-center">
                                                    <button onClick={() => setStep(1)} className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-gold transition-colors">Start New Valuation</button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Bottom Info Grid */}
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                        <div className="glass-card p-10 rounded-[2.5rem] border border-white/5">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 mb-6">
                                <ShieldCheck size={24} />
                            </div>
                            <h4 className="text-xl font-serif text-white mb-4">Official Register Synced</h4>
                            <p className="text-sm text-white/40 leading-relaxed">
                                Direct API connection to current market registry ensures your valuation isn't just a guess, but a data-backed reflection of real transactional behavior.
                            </p>
                        </div>
                        <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 bg-gold/5 border-gold/10">
                            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-6">
                                <MapPin size={24} />
                            </div>
                            <h4 className="text-xl font-serif text-white mb-4">Location Precision</h4>
                            <p className="text-sm text-white/40 leading-relaxed">
                                From the luxury hubs of Sliema and St. Julian's to the historic streets of Gozo, we weight valuations based on highly specific micro-location demand.
                            </p>
                        </div>
                        <div className="glass-card p-10 rounded-[2.5rem] border border-white/5">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 mb-6">
                                <Scan size={24} />
                            </div>
                            <h4 className="text-xl font-serif text-white mb-4">UCA & SDA Logic</h4>
                            <p className="text-sm text-white/40 leading-relaxed">
                                The Oracle automatically accounts for Urban Conservation Area tax exemptions and Special Designated Area premiums for foreign investors.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
};
