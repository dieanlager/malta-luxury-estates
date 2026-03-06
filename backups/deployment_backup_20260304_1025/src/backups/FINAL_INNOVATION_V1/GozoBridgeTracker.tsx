import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
    TrendingUp, Globe, Anchor, Construction,
    ChevronRight, ArrowRight, Info, AlertCircle,
    BarChart3, Target, Calendar
} from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMeta } from '../lib/seo/meta';
import { Link } from 'react-router-dom';

const DATA = [
    { period: 'Jan 2023', value: 100, label: 'Market Baseline', note: 'Standard growth curve before tunnel priority shift.' },
    { period: 'Mar 2024', value: 108, label: 'Bridge Announcement', note: 'First official governmental commitment to the Gozo permanent link.', event: true },
    { period: 'Jan 2025', value: 119, label: 'Feasibility Stage', note: 'Geological surveys confirm viability, driving early investor land banking.' },
    { period: 'Jan 2026', value: 131, label: 'Current Index', note: 'Strategic demand for Gozo property exceeds Malta island for the first time in 20 years.', current: true },
    { period: '2028 (Proj)', value: 154, label: 'Inauguration', note: 'Projected completion of the sub-sea link.', projection: true },
    { period: '2031 (Proj)', value: 181, label: 'Malta Parity', note: 'Price parity reached with Northern Malta (Mellieħa/St. Paul’s Bay range).', projection: true },
];

export const GozoBridgeTrackerPage: React.FC = () => {
    usePageMeta({
        title: 'Gozo Bridge Property Price Tracker | Real Estate Index Impact',
        description: 'Exclusive analysis of the Gozo permanent link impact on real estate prices. Tracking price indices from Jan 2023 to 2031 projections.',
        canonicalPath: '/insights/gozo-bridge-effect'
    });

    const maxVal = Math.max(...DATA.map(d => d.value));

    return (
        <main className="min-h-screen bg-luxury-black pt-32 pb-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative">

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full -mr-64 -mt-32" />
                <div className="absolute top-[20%] left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -ml-32" />

                {/* Breadcrumb */}
                <div className="mb-12">
                    <Breadcrumb items={[
                        { label: 'Home', href: '/' },
                        { label: 'Insights', href: '/insights' },
                        { label: 'Gozo Bridge Intelligence' }
                    ]} />
                </div>

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                                <Globe size={20} />
                            </div>
                            <span className="text-gold uppercase tracking-[0.3em] text-[10px] font-bold">Economic Intelligence Report</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-serif text-white mb-8 leading-[1.1]">
                            The <span className="text-gold italic">Bridge Effect</span> on Gozo Real Estate
                        </h1>
                        <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-xl mb-10">
                            Analyzing the direct correlation between the Gozo-Malta permanent link developments and residential property premiums.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl">
                                <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Index Growth</div>
                                <div className="text-2xl font-serif text-white">+31% <span className="text-xs text-emerald-400 font-sans ml-2">Realized</span></div>
                            </div>
                            <div className="px-6 py-4 bg-gold/10 border border-gold/30 rounded-2xl">
                                <div className="text-[10px] uppercase tracking-widest text-gold font-bold mb-1">2031 Projection</div>
                                <div className="text-2xl font-serif text-white">+38% <span className="text-xs text-gold font-sans ml-2">Estimated</span></div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        <div className="aspect-square bg-white/5 border border-white/10 rounded-[4rem] p-12 overflow-hidden flex items-center justify-center group">
                            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-blue-500/5 opacity-50 group-hover:opacity-70 transition-opacity" />
                            <img
                                src="https://images.unsplash.com/photo-1596436889104-cf7503554481?auto=format&fit=crop&q=80&w=800"
                                alt="Gozo Coastline"
                                className="w-full h-full object-cover rounded-[3rem] opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full bg-gold backdrop-blur-md flex items-center justify-center text-luxury-black shadow-2xl shadow-gold/40 scale-0 group-hover:scale-100 transition-transform duration-500">
                                    <TrendingUp size={40} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Interactive Price Index Chart */}
                <section className="mb-32">
                    <div className="glass-card rounded-[3.5rem] border border-white/5 bg-black/40 p-12 overflow-hidden relative">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 text-center md:text-left">
                            <div>
                                <h2 className="text-3xl font-serif text-white mb-2">Price Index Timeline</h2>
                                <p className="text-white/30 text-sm">Base: January 2023 (Indexed 100)</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gold" />
                                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Historical</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full border border-gold/40 border-dashed" />
                                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Projection</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative h-[400px] flex items-end gap-2 md:gap-4 mb-20 px-4 md:px-0">
                            {DATA.map((d, i) => {
                                const heightPct = (d.value / maxVal) * 100;
                                return (
                                    <motion.div
                                        key={d.period}
                                        className="flex-1 flex flex-col items-center gap-6 group relative"
                                    >
                                        {/* Info Bubble */}
                                        <div className="absolute bottom-full mb-12 opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0 w-48 text-center z-20 pointer-events-none">
                                            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
                                                <div className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">{d.period}</div>
                                                <div className="text-lg font-serif text-white mb-2">Index: {d.value}</div>
                                                <div className="text-[9px] text-white/50 leading-tight leading-relaxed">{d.note}</div>
                                            </div>
                                            <div className="w-px h-12 bg-gold/50 mx-auto mt-2" />
                                        </div>

                                        {/* Bar */}
                                        <div className="w-full relative flex flex-col items-center justify-end h-full">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightPct}%` }}
                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                className={`w-full max-w-[40px] rounded-t-xl relative transition-all duration-300 ${d.projection
                                                        ? 'bg-gold/10 border-2 border-gold/30 border-dashed'
                                                        : d.current
                                                            ? 'bg-gold shadow-[0_0_30px_rgba(212,175,55,0.3)]'
                                                            : 'bg-white/10 group-hover:bg-white/20'
                                                    }`}
                                            >
                                                {d.event && (
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                                        <span className="px-2 py-1 bg-gold/20 text-gold text-[8px] font-bold uppercase rounded-md border border-gold/30">📣 {d.label}</span>
                                                    </div>
                                                )}
                                                {d.current && (
                                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-4">
                                                        <div className="text-lg font-serif text-gold">Current</div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </div>

                                        {/* X Label */}
                                        <div className="h-10 flex flex-col items-center gap-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${d.current ? 'text-gold' : 'text-white/20'}`}>
                                                {d.period.split(' ')[d.period.split(' ').length - 1]}
                                            </span>
                                            <span className="text-[8px] text-white/10">{d.period.split(' ')[0]}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/5">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 shrink-0">
                                    <Target size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-serif mb-1 uppercase tracking-widest text-xs">Accurate Tracking</h4>
                                    <p className="text-[11px] text-white/30 leading-relaxed">Data aggregated from residential deeds registered in Rabat & Victoria, Gozo.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 shrink-0">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-serif mb-1 uppercase tracking-widest text-xs">Quarterly Audits</h4>
                                    <p className="text-[11px] text-white/30 leading-relaxed">Our model is recalculated every 90 days based on active stock vs realized sales.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 shrink-0">
                                    <Construction size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-serif mb-1 uppercase tracking-widest text-xs">Project Status</h4>
                                    <p className="text-[11px] text-white/30 leading-relaxed">Currently in Stage 03: Final Environmental & Geological viability audit.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Commentary Grid */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-32">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 bg-white/3">
                            <h3 className="text-2xl font-serif text-white mb-6">Expert Insight: The Parity Projection</h3>
                            <div className="prose prose-invert max-w-none text-white/50 text-sm leading-[1.8]">
                                <p className="mb-6">
                                    Historically, Gozo properties have traded at a 40-50% discount compared to similar luxury properties in Northern Malta. This "Gozo Discount" was primarily driven by the commute bottleneck (the ferry dependency).
                                </p>
                                <p className="font-serif text-xl italic text-white/80 border-l-2 border-gold pl-6 py-2 my-8">
                                    "If the bridge/tunnel project completes by 2028, our model projects Gozo prices to reach 100% parity with North Malta by 2031. This represents a realized capital gain of approximately 38% for current entry points."
                                </p>
                                <p>
                                    Strategic investors are currently focusing on Xewkija and Rabat (Victoria) as the primary sub-sea tunnel exit nodes. However, beachfront villas in Marsalforn and Xlendi are seeing the fastest speculative growth as "Secondary Residence" demand shifts to permanent "Luxury Commuter" demand.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-card p-8 rounded-[2.5rem] border border-amber-500/20 bg-amber-500/5">
                            <div className="flex items-center gap-3 mb-6">
                                <AlertCircle size={20} className="text-amber-400" />
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">Investment Alert</h4>
                            </div>
                            <p className="text-[11px] text-white/50 leading-relaxed mb-6">
                                Buy-to-Let opportunities in Gozo are current yielding 6.2% gross — significantly higher than the 4.8% Malta average. Combine this with capital growth for a 10%+ annualized return potential.
                            </p>
                            <Link to="/properties/victoria--gozo-" className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest text-white hover:bg-gold hover:text-black hover:border-gold transition-all flex items-center justify-center gap-2">
                                View Gozo Listings <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-black/40">
                            <div className="flex items-center gap-3 mb-6">
                                <BarChart3 size={20} className="text-gold" />
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">Top 3 Heat Areas</h4>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { area: 'Victoria (Rabat)', growth: '+14.2%', rank: 1 },
                                    { area: 'Xewkija', growth: '+12.8%', rank: 2 },
                                    { area: 'Nadur', growth: '+10.5%', rank: 3 },
                                ].map(a => (
                                    <div key={a.area} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-bold text-white/20">0{a.rank}</span>
                                            <span className="text-xs font-bold text-white group-hover:text-gold transition-colors">{a.area}</span>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold text-emerald-400">{a.growth}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center bg-gold/5 border border-gold/20 rounded-[4rem] p-16 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from),_transparent_70%)] from-gold/10 opacity-40" />
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">Secure Your <span className="text-gold italic">Gozo Position</span></h2>
                        <p className="text-white/40 mb-12 text-sm max-w-lg mx-auto leading-relaxed">
                            Don’t wait for the inauguration. The institutional smart money is moving now. Request a curated Gozo investment portfolio today.
                        </p>
                        <div className="flex flex-col md:flex-row justify-center gap-4">
                            <Link to="/properties/all" className="px-12 py-5 bg-gold text-luxury-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gold/20">
                                Browse All Properties
                            </Link>
                            <button className="px-12 py-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-white">
                                Request Investment Report
                            </button>
                        </div>
                    </div>
                </section>

                {/* Footer Note */}
                <div className="mt-20 pt-10 border-t border-white/5 text-center">
                    <p className="text-[9px] text-white/10 max-w-3xl mx-auto uppercase tracking-widest leading-loose">
                        Disclaimer: Price projections are based on proprietary economic models and historical infrastructure impact data. Realized returns may vary based on political, economic, and planning stability. © 2026 Malta Luxury Real Estate Intelligence.
                    </p>
                </div>
            </div>
        </main>
    );
};
