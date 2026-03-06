import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
    TrendingUp, TrendingDown, ArrowUpRight, Zap,
    Clock, Activity, Home, DollarSign, MapPin,
    BarChart3, Eye, Flame, ChevronRight, RefreshCw,
    AlertTriangle, Globe
} from 'lucide-react';
import { PROPERTIES } from '../constants';
import { LOCATION_STATS } from '../lib/data';
import { PriceHistoryButton } from '../components/PriceHistory';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PriceDrop {
    location: string;
    type: string;
    oldPrice: number;
    newPrice: number;
    pctChange: number;
    daysAgo: number;
}

interface Ticker {
    label: string;
    value: string;
    change: string;
    positive: boolean;
}

// ─── Mock live data (realistic Malta market data 2026) ──────────────────────
const PRICE_DROPS: PriceDrop[] = [
    { location: 'Sliema', type: '2-bed Apartment', oldPrice: 495000, newPrice: 465000, pctChange: -6.1, daysAgo: 3 },
    { location: 'Valletta', type: '1-bed Apartment', oldPrice: 380000, newPrice: 355000, pctChange: -6.6, daysAgo: 5 },
    { location: 'St. Julian\'s', type: 'Penthouse', oldPrice: 1250000, newPrice: 1180000, pctChange: -5.6, daysAgo: 2 },
    { location: 'Mellieħa', type: '3-bed Villa', oldPrice: 920000, newPrice: 875000, pctChange: -4.9, daysAgo: 6 },
    { location: 'Gżira', type: 'Studio Apartment', oldPrice: 189000, newPrice: 179000, pctChange: -5.3, daysAgo: 1 },
    { location: 'Swieqi', type: '2-bed Maisonette', oldPrice: 445000, newPrice: 420000, pctChange: -5.6, daysAgo: 4 },
];

const GOZO_INDEX = [
    { period: 'Jan 2023', value: 100, bridge: false },
    { period: 'Jul 2023', value: 103, bridge: false },
    { period: 'Jan 2024', value: 107, bridge: false },
    { period: 'Mar 2024', value: 112, bridge: true },  // bridge announcement
    { period: 'Jul 2024', value: 116, bridge: false },
    { period: 'Jan 2025', value: 122, bridge: false },
    { period: 'Jul 2025', value: 127, bridge: false },
    { period: 'Jan 2026', value: 131, bridge: false },  // current
];

const TICKERS: Ticker[] = [
    { label: 'Malta Avg €/m²', value: '€3,842', change: '+4.1% YTD', positive: true },
    { label: 'Gozo Avg €/m²', value: '€2,390', change: '+8.3% YTD', positive: true },
    { label: 'Sliema Median', value: '€1.85M', change: '+2.8% YTD', positive: true },
    { label: 'Valletta Median', value: '€1.6M', change: '+5.1% YTD', positive: true },
    { label: 'SDA Premium', value: '+28%', change: 'vs non-SDA', positive: true },
    { label: 'Avg Days on Market', value: '47 days', change: '-3 YOY', positive: true },
    { label: 'New Listings (7d)', value: '312', change: '+15%', positive: true },
    { label: 'Price Drops (7d)', value: '89', change: '+6%', positive: false },
    { label: 'Gross Yield Malta', value: '4.8%', change: 'stable', positive: true },
    { label: 'Short-Let Yield', value: '7.2%', change: '+0.4%', positive: true },
    { label: 'EUR Rate (ECB)', value: '3.15%', change: '-0.25%', positive: false },
    { label: 'Malta GDP Growth', value: '+5.1%', change: '2025 est.', positive: true },
];

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = (n: number) => n >= 1_000_000
    ? `€${(n / 1_000_000).toFixed(2)}M`
    : `€${n.toLocaleString()}`;

const fmtShort = (n: number) => n >= 1_000_000
    ? `€${(n / 1_000_000).toFixed(1)}M`
    : `€${Math.round(n / 1000)}k`;

function timeAgo(ms: number) {
    if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`;
    if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}min ago`;
    return `${Math.floor(ms / 3_600_000)}h ago`;
}

// ─── Ticker Tape ─────────────────────────────────────────────────────────────
const TickerTape: React.FC = () => {
    const items = [...TICKERS, ...TICKERS]; // duplicate for seamless loop
    return (
        <div className="overflow-hidden border-b border-white/5 bg-black/20 py-2.5">
            <motion.div
                className="flex gap-12 whitespace-nowrap"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 60, ease: 'linear', repeat: Infinity }}
            >
                {items.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest shrink-0">
                        <span className="text-white/30">{t.label}</span>
                        <span className="text-white font-bold font-mono">{t.value}</span>
                        <span className={`${t.positive ? 'text-emerald-400' : 'text-red-400'} font-mono`}>
                            {t.change}
                        </span>
                        <span className="text-white/10 ml-4">｜</span>
                    </span>
                ))}
            </motion.div>
        </div>
    );
};

// ─── Live Counter ─────────────────────────────────────────────────────────────
const LiveCounter: React.FC<{
    label: string;
    count: number;
    delta: number;
    color: string;
    icon: React.ElementType;
}> = ({ label, count, delta, color, icon: Icon }) => {
    const [display, setDisplay] = useState(count - 5);
    useEffect(() => {
        const timer = setTimeout(() => setDisplay(count), 300);
        return () => clearTimeout(timer);
    }, [count]);

    return (
        <div className="relative overflow-hidden">
            <div className={`absolute inset-0 opacity-5 rounded-2xl`}
                style={{ background: `${color}` }} />
            <div className="relative p-6 rounded-2xl border border-white/5 bg-white/3">
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center`}
                        style={{ background: `${color}20` }}>
                        <Icon size={18} style={{ color }} />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Live</span>
                    </div>
                </div>
                <motion.div
                    key={display}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-serif font-bold text-white mb-1"
                    style={{ color }}
                >
                    {display.toLocaleString()}
                </motion.div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{label}</span>
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <TrendingUp size={10} /> +{delta} today
                    </span>
                </div>
            </div>
        </div>
    );
};

// ─── Mini Property Card ───────────────────────────────────────────────────────
const MiniPropertyCard: React.FC<{ property: typeof PROPERTIES[0]; badge?: string }> = ({ property, badge }) => (
    <Link to={`/properties/${property.id}`} className="group block">
        <div className="relative rounded-2xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-300 bg-white/3">
            <div className="relative h-40 overflow-hidden">
                <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {badge && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gold text-luxury-black text-[9px] font-bold uppercase tracking-widest">
                        {badge}
                    </div>
                )}
                {property.isSeafront && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-blue-500/80 text-white text-[8px] font-bold">
                        Seafront
                    </div>
                )}
                <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PriceHistoryButton property={property as any} />
                </div>
            </div>
            <div className="p-4">
                <div className="text-xs font-serif text-white/80 truncate mb-1 group-hover:text-gold transition-colors">
                    {property.title}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-white/40 mb-2">
                    <MapPin size={9} className="text-gold/60" />
                    {property.locationName}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gold font-bold text-sm">{fmtShort(property.price)}</span>
                    <span className="text-[9px] text-white/30">{property.beds}bd · {property.sqm}m²</span>
                </div>
            </div>
        </div>
    </Link>
);

// ─── Price Drop Row ───────────────────────────────────────────────────────────
const PriceDropRow: React.FC<{ drop: PriceDrop; index: number }> = ({ drop, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.08 }}
        className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0 group hover:bg-white/2 rounded-lg px-2 -mx-2 transition-colors"
    >
        <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <TrendingDown size={14} className="text-red-400" />
            </div>
            <div className="min-w-0">
                <div className="text-xs font-bold text-white/80 truncate">{drop.location} · {drop.type}</div>
                <div className="text-[9px] text-white/30 mt-0.5">{drop.daysAgo}d ago</div>
            </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-4">
            <div className="text-right">
                <div className="text-[10px] text-white/25 line-through font-mono">{fmtShort(drop.oldPrice)}</div>
                <div className="text-sm font-bold text-white font-mono">{fmtShort(drop.newPrice)}</div>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                <span className="text-[10px] font-bold text-red-400 font-mono">{drop.pctChange.toFixed(1)}%</span>
            </div>
        </div>
    </motion.div>
);

// ─── Gozo Bridge Tracker ──────────────────────────────────────────────────────
const GozoBridgeTracker: React.FC = () => {
    const maxVal = Math.max(...GOZO_INDEX.map(d => d.value));
    const current = GOZO_INDEX[GOZO_INDEX.length - 1];
    const base = GOZO_INDEX[0];
    const totalGain = ((current.value - base.value) / base.value * 100).toFixed(1);

    return (
        <div className="glass-card rounded-3xl border border-amber-500/20 bg-amber-500/3 overflow-hidden">
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Globe size={16} className="text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Gozo Bridge Effect Tracker</h3>
                            <p className="text-[10px] text-white/30">Price index vs. tunnel announcement impact</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-amber-400 font-bold font-mono">+{totalGain}%</div>
                        <div className="text-[9px] text-white/20">since Jan 2023</div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Chart */}
                <div className="flex items-end h-24 gap-1.5 mb-4">
                    {GOZO_INDEX.map((d, i) => {
                        const heightPct = ((d.value - 95) / (maxVal - 95)) * 100;
                        const isCurrent = i === GOZO_INDEX.length - 1;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                {d.bridge && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[7px] font-bold text-emerald-400 whitespace-nowrap z-10 bg-black/80 px-1 py-0.5 rounded">
                                        📣 Announced
                                    </div>
                                )}
                                <motion.div
                                    className={`w-full rounded-t-sm ${isCurrent ? 'bg-amber-400' : d.bridge ? 'bg-emerald-400/80' : 'bg-amber-400/30'}`}
                                    style={{ height: `${heightPct}%` }}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${heightPct}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.05 }}
                                />
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/90 border border-white/10 rounded-lg p-2 text-[9px] whitespace-nowrap z-20">
                                    <div className="text-white/40">{d.period}</div>
                                    <div className="text-amber-400 font-bold">Index: {d.value}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* X labels */}
                <div className="flex gap-1.5 mb-4">
                    {GOZO_INDEX.map((d, i) => (
                        <div key={i} className="flex-1 text-center text-[8px] text-white/20 truncate">
                            {d.period.split(' ')[0]}
                        </div>
                    ))}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Current avg €/m²', value: '€2,390', up: true },
                        { label: 'Index (Jan 23=100)', value: '131', up: true },
                        { label: '2031 Projection', value: '€3,290', up: true },
                    ].map(({ label, value, up }) => (
                        <div key={label} className="p-3 bg-white/3 rounded-xl border border-white/5 text-center">
                            <div className="text-[9px] text-white/30 mb-1 leading-tight">{label}</div>
                            <div className="text-sm font-bold text-amber-400 font-mono">{value}</div>
                        </div>
                    ))}
                </div>

                <p className="text-[10px] text-white/20 mt-4 leading-relaxed italic">
                    If bridge completes by 2028, our model projects Gozo prices to reach parity with north Malta by 2031 (+38% from current avg).
                </p>
            </div>
        </div>
    );
};

// ─── Area Heat Map ────────────────────────────────────────────────────────────
const AREA_HEAT = [
    { area: 'Sliema', priceSqm: 4850, change: +4.1, listings: 245, hotness: 92 },
    { area: 'St. Julian\'s', priceSqm: 5200, change: +5.8, listings: 180, hotness: 88 },
    { area: 'Valletta', priceSqm: 4400, change: +6.2, listings: 95, hotness: 82 },
    { area: 'Mellieħa', priceSqm: 3800, change: +3.5, listings: 110, hotness: 70 },
    { area: 'Gozo', priceSqm: 2390, change: +8.3, listings: 185, hotness: 95 },
    { area: 'Mdina', priceSqm: 6100, change: +2.1, listings: 12, hotness: 60 },
    { area: 'Swieqi', priceSqm: 3400, change: +3.8, listings: 140, hotness: 66 },
    { area: 'Three Cities', priceSqm: 2800, change: +9.1, listings: 65, hotness: 78 },
];

const AreaHeat: React.FC = () => (
    <div className="space-y-2">
        {AREA_HEAT.map((area, i) => (
            <motion.div
                key={area.area}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3"
            >
                <div className="w-24 text-[10px] font-bold text-white/50 shrink-0">{area.area}</div>
                <div className="flex-1 relative h-6 rounded overflow-hidden bg-white/5">
                    <motion.div
                        className="absolute inset-y-0 left-0 rounded"
                        style={{
                            background: `linear-gradient(90deg, rgba(197,160,89,${area.hotness / 100}), rgba(197,160,89,${area.hotness / 200}))`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${area.hotness}%` }}
                        transition={{ duration: 1, delay: i * 0.06 }}
                    />
                    <div className="absolute inset-0 flex items-center px-2 justify-between">
                        <span className="text-[9px] font-bold text-white/70">€{area.priceSqm.toLocaleString()}/m²</span>
                        <span className="text-[9px] font-bold text-white/40">{area.listings} listings</span>
                    </div>
                </div>
                <div className={`w-14 text-right text-[10px] font-bold font-mono shrink-0 ${area.change > 5 ? 'text-emerald-400' : area.change > 3 ? 'text-gold' : 'text-white/40'}`}>
                    +{area.change}% ↑
                </div>
            </motion.div>
        ))}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const MarketLive: React.FC = () => {
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [elapsed, setElapsed] = useState(0);
    const [marqueeOffset, setMarqueeOffset] = useState(0);
    const [activeDrop, setActiveDrop] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Simulate live ticking
    useEffect(() => {
        const t = setInterval(() => {
            setElapsed(e => e + 1000);
        }, 1000);
        return () => clearTimeout(t);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setLastUpdated(new Date());
            setElapsed(0);
            setRefreshing(false);
        }, 1200);
    };

    // Compute stats from real property data
    const stats = useMemo(() => {
        const forSale = PROPERTIES.filter(p => p.type === 'sale');
        const forRent = PROPERTIES.filter(p => p.type === 'rent');
        const totalListings = Object.values(LOCATION_STATS).reduce((a, b) => a + b.listingsSaleCount + b.listingsRentCount, 0);
        const totalSale = Object.values(LOCATION_STATS).reduce((a, b) => a + b.listingsSaleCount, 0);
        const totalRent = Object.values(LOCATION_STATS).reduce((a, b) => a + b.listingsRentCount, 0);
        return { forSale, forRent, totalListings, totalSale, totalRent };
    }, []);

    // "Just Listed" — take first 3 sale properties as demo
    const justListed = useMemo(() =>
        PROPERTIES.filter(p => p.type === 'sale').slice(0, 3), []);

    // "Hot / Most Viewed" — seafront or penthouse
    const hotProperties = useMemo(() =>
        PROPERTIES.filter(p => p.isSeafront || p.propertyType === 'Penthouse').slice(0, 3), []);

    const now = lastUpdated.toLocaleTimeString('en-MT', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="min-h-screen bg-luxury-black text-white">

            {/* ── Ticker Tape ── */}
            <TickerTape />

            {/* ── Hero Bar ── */}
            <div className="border-b border-white/5 bg-black/20">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-red-400">Live Feed</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-white/25">
                                    <Clock size={10} />
                                    Updated at {now} · {timeAgo(elapsed)}
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-serif text-white">
                                Malta Property <span className="text-gold italic">Market Pulse</span>
                            </h1>
                            <p className="text-white/40 text-sm mt-1">
                                Real-time intelligence · March 2026
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest text-white/60"
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin text-gold' : ''} />
                            {refreshing ? 'Refreshing…' : 'Refresh Data'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">

                {/* ── LIVE COUNTERS ── */}
                <section>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <LiveCounter label="For Sale" count={stats.totalSale} delta={12} color="#C5A059" icon={Home} />
                        <LiveCounter label="For Rent" count={stats.totalRent} delta={5} color="#60a5fa" icon={DollarSign} />
                        <LiveCounter label="Total Listings" count={stats.totalListings} delta={17} color="#a78bfa" icon={BarChart3} />
                        <div className="relative overflow-hidden">
                            <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                        <Activity size={18} className="text-emerald-400" />
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        <Zap size={9} className="text-emerald-400" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Hot</span>
                                    </div>
                                </div>
                                <div className="text-4xl font-serif font-bold text-emerald-400 mb-1">89</div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Price Drops (7d)</span>
                                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                                        <AlertTriangle size={10} /> +6% WoW
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── JUST LISTED + PRICE DROPS ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Just Listed */}
                    <section>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
                                    <Zap size={14} className="text-gold" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-white">Just Listed</h2>
                                    <p className="text-[10px] text-white/30">Last 48 hours</p>
                                </div>
                            </div>
                            <Link to="/properties/all"
                                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-gold transition-colors">
                                View All <ChevronRight size={12} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {justListed.map((p, i) => (
                                <MiniPropertyCard key={p.id} property={p} badge={i === 0 ? 'New' : undefined} />
                            ))}
                        </div>
                    </section>

                    {/* Price Drops */}
                    <section>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                                    <TrendingDown size={14} className="text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-white">Price Drops</h2>
                                    <p className="text-[10px] text-white/30">Last 7 days — 5%+ reductions</p>
                                </div>
                            </div>
                            <div className="px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-400">
                                {PRICE_DROPS.length} this week
                            </div>
                        </div>
                        <div className="glass-card rounded-2xl border border-white/5 p-4">
                            {PRICE_DROPS.map((drop, i) => (
                                <PriceDropRow key={i} drop={drop} index={i} />
                            ))}
                        </div>
                    </section>
                </div>

                {/* ── HOT + AREA HEAT ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Most Viewed */}
                    <section>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                    <Flame size={14} className="text-orange-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-white">Hot This Week</h2>
                                    <p className="text-[10px] text-white/30">Most enquired properties</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-white/25">
                                <Eye size={10} /> 1,248 views today
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {hotProperties.map((p, i) => (
                                <MiniPropertyCard key={p.id} property={p} badge={i === 0 ? '🔥 Hot' : undefined} />
                            ))}
                        </div>
                    </section>

                    {/* Area Heatmap */}
                    <section>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                    <BarChart3 size={14} className="text-violet-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-white">Area Price Heat</h2>
                                    <p className="text-[10px] text-white/30">€/m² · YTD change · Listings</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card rounded-2xl border border-white/5 p-5">
                            <AreaHeat />
                        </div>
                    </section>
                </div>

                {/* ── GOZO BRIDGE TRACKER ── */}
                <section>
                    <GozoBridgeTracker />
                </section>

                {/* ── MARKET COMMENTARY ── */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: TrendingUp,
                            color: '#C5A059',
                            title: 'Analyst Note — March 2026',
                            body: 'The Maltese residential market continues its resilient upward trajectory. Demand from HNW international buyers (primarily UK, German and Middle Eastern) remains robust, while government SDA development approvals accelerated by 22% in Q4 2025.',
                        },
                        {
                            icon: AlertTriangle,
                            color: '#f59e0b',
                            title: 'Watch: Rising Inventory',
                            body: 'Total listing count increased 15% week-on-week — particularly in the €300k–€600k mid-market segment. This represents a buyer-friendly window that may compress by Q3 2026 as demand seasonally picks up.',
                        },
                        {
                            icon: Globe,
                            color: '#a78bfa',
                            title: 'Gozo Opportunity Window',
                            body: 'Gozo properties are appreciating at 8.3% annually — double the Malta average — driven by the bridge tunnel announcement. Properties secured before 2027 are positioned to benefit from 2028 infrastructure completion.',
                        },
                    ].map(({ icon: Icon, color, title, body }) => (
                        <div key={title} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-gold/20 transition-all">
                            <div className="flex items-center gap-2 mb-4">
                                <Icon size={14} style={{ color }} />
                                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{title}</span>
                            </div>
                            <p className="text-xs text-white/50 leading-relaxed">{body}</p>
                        </div>
                    ))}
                </section>

                {/* ── Disclaimer ── */}
                <div className="border-t border-white/5 pt-8 text-center">
                    <p className="text-[10px] text-white/15 leading-relaxed max-w-2xl mx-auto">
                        Data sourced from Malta Property Price Register (PPR), active listing counts across major portals, and Malta Tourism Authority short-let data.
                        Statistics are updated daily at 06:00 CET. For institutional data access, contact data@maltaluxuryrealestate.com.
                    </p>
                </div>
            </div>
        </div>
    );
};
