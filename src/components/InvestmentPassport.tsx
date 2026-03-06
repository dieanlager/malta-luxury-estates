import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    FileText, X, Mail, CheckCircle, Loader2,
    TrendingUp, ShieldCheck, Home, Download,
    ArrowRight, Star
} from 'lucide-react';
import { Property } from '../types';
import { generateInvestmentPassport } from '../lib/investmentPassport';

// ─── Types ────────────────────────────────────────────────────────────────────
interface InvestmentPassportModalProps {
    property: Property;
    isOpen: boolean;
    onClose: () => void;
}

// ─── What's Inside Preview ────────────────────────────────────────────────────
const pages = [
    { icon: Home, label: 'Property Summary', desc: 'Full specs, overview, price/m²' },
    { icon: TrendingUp, label: 'Rental Yield Analysis', desc: 'Long-let & short-let projections' },
    { icon: Star, label: '5-Year Return Projection', desc: 'Bear / Base / Bull scenarios' },
    { icon: FileText, label: 'Buying Costs Breakdown', desc: 'Stamp duty, notary, AIP fees' },
    { icon: ShieldCheck, label: 'Legal Checklist', desc: 'AIP / SDA / UCA requirements' },
    { icon: Download, label: 'Investment Verdict', desc: 'Oracle score + next steps' },
];

// ─── Modal Component ──────────────────────────────────────────────────────────
export const InvestmentPassportModal: React.FC<InvestmentPassportModalProps> = ({
    property, isOpen, onClose,
}) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [activePage, setActivePage] = useState(0);

    // Rotate page preview automatically
    useEffect(() => {
        if (!isOpen) return;
        const t = setInterval(() => setActivePage(p => (p + 1) % pages.length), 2500);
        return () => clearInterval(t);
    }, [isOpen]);

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleGenerate = async () => {
        if (!email || !email.includes('@')) return;
        setStatus('loading');
        try {
            await generateInvestmentPassport(property, email);
            setStatus('success');
            // Save email locally (could also send to backend / CRM)
            const existing = JSON.parse(localStorage.getItem('mle_leads') || '[]');
            existing.push({ email, propertyId: property.id, propertyTitle: property.title, ts: Date.now() });
            localStorage.setItem('mle_leads', JSON.stringify(existing));
        } catch {
            setStatus('error');
        }
    };

    const formatPrice = (n: number) =>
        n >= 1_000_000 ? `€${(n / 1_000_000).toFixed(1)}M` : `€${n.toLocaleString()}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.92, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 24 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="pointer-events-auto w-full max-w-3xl max-h-[90vh] overflow-y-auto
                         bg-[#0a0a0f] border border-gold/20 rounded-[2rem] shadow-2xl
                         relative"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Top gold stripe */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-[2rem] bg-gradient-to-r from-transparent via-gold to-transparent" />

                            {/* Close */}
                            <button
                                onClick={onClose}
                                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10
                           flex items-center justify-center hover:bg-white/10 transition-colors z-10"
                            >
                                <X size={14} className="text-white/60" />
                            </button>

                            <div className="p-8 md:p-10">

                                {/* ── Header ── */}
                                <div className="flex items-start gap-5 mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                                        <FileText className="text-gold" size={26} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-gold border border-gold/30 bg-gold/10 px-3 py-1 rounded-full">
                                                Investment Passport
                                            </span>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 border border-emerald-500/30 bg-emerald-400/10 px-3 py-1 rounded-full">
                                                Free · Instant PDF
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-serif text-white leading-tight mt-2">
                                            Your personal investment<br />
                                            <span className="text-gold italic">dossier in 6 pages</span>
                                        </h2>
                                        <p className="text-white/40 text-sm mt-1.5">
                                            Built from Malta PPR data, current market comps, and 2026 tax regulations.
                                        </p>
                                    </div>
                                </div>

                                {/* ── Property Preview Strip ── */}
                                <div className="flex items-center gap-4 p-4 bg-white/3 border border-white/5 rounded-2xl mb-8">
                                    <img
                                        src={property.images?.[0]}
                                        alt={property.title}
                                        className="w-20 h-16 object-cover rounded-xl shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[9px] font-bold uppercase tracking-widest text-gold mb-0.5">{property.propertyType}</div>
                                        <div className="font-serif text-base text-white truncate">{property.title}</div>
                                        <div className="text-xs text-white/40">{property.locationName}</div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-[9px] text-white/30 uppercase tracking-widest">Asking</div>
                                        <div className="text-gold font-bold text-lg">{formatPrice(property.price)}</div>
                                        <div className="text-[9px] text-white/30">{property.beds}bd · {property.baths}ba · {property.sqm}m²</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                    {/* ── Left: What's Inside ── */}
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">
                                            What's inside your passport
                                        </div>
                                        <div className="space-y-2">
                                            {pages.map((pg, i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{
                                                        backgroundColor: activePage === i
                                                            ? 'rgba(197, 160, 89, 0.08)' : 'rgba(255,255,255,0.02)',
                                                        borderColor: activePage === i
                                                            ? 'rgba(197, 160, 89, 0.3)' : 'rgba(255,255,255,0.06)',
                                                    }}
                                                    transition={{ duration: 0.3 }}
                                                    className="flex items-center gap-3 p-3 rounded-xl border cursor-default"
                                                    onClick={() => setActivePage(i)}
                                                >
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${activePage === i ? 'bg-gold/20' : 'bg-white/5'}`}>
                                                        <pg.icon size={13} className={activePage === i ? 'text-gold' : 'text-white/30'} />
                                                    </div>
                                                    <div>
                                                        <div className={`text-xs font-bold transition-colors ${activePage === i ? 'text-white' : 'text-white/50'}`}>
                                                            <span className="text-white/20 mr-1.5 font-mono">0{i + 1}</span>
                                                            {pg.label}
                                                        </div>
                                                        <div className="text-[10px] text-white/25 mt-0.5">{pg.desc}</div>
                                                    </div>
                                                    {activePage === i && (
                                                        <ArrowRight size={12} className="text-gold ml-auto shrink-0" />
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ── Right: Email capture / Status ── */}
                                    <div className="flex flex-col justify-center">

                                        <AnimatePresence mode="wait">
                                            {status === 'success' ? (
                                                // Success state
                                                <motion.div
                                                    key="success"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex flex-col items-center text-center p-8"
                                                >
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                                                        className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30
                                       flex items-center justify-center mb-6"
                                                    >
                                                        <CheckCircle className="text-emerald-400" size={36} />
                                                    </motion.div>
                                                    <h3 className="text-xl font-serif text-white mb-2">Passport Downloaded!</h3>
                                                    <p className="text-white/40 text-sm leading-relaxed mb-6">
                                                        Your 6-page Investment Passport for<br />
                                                        <strong className="text-white/70">{property.title}</strong><br />
                                                        has been downloaded to your device.
                                                    </p>
                                                    <button
                                                        onClick={() => { setStatus('idle'); setEmail(''); }}
                                                        className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-gold transition-colors"
                                                    >
                                                        Generate another →
                                                    </button>
                                                </motion.div>

                                            ) : (
                                                // Form state (idle / loading / error)
                                                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                    <div className="p-6 bg-gold/5 border border-gold/20 rounded-2xl mb-6">
                                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gold mb-4">
                                                            ✦  Generate Your Free PDF
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-2">
                                                                    Your Email Address
                                                                </label>
                                                                <div className="relative">
                                                                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                                                                    <input
                                                                        type="email"
                                                                        placeholder="name@example.com"
                                                                        value={email}
                                                                        onChange={e => setEmail(e.target.value)}
                                                                        onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                                                                        className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10
                                               rounded-xl text-sm text-white placeholder:text-white/20
                                               focus:outline-none focus:border-gold/40 transition-colors"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {status === 'error' && (
                                                                <p className="text-xs text-red-400">Something went wrong. Please try again.</p>
                                                            )}

                                                            <button
                                                                onClick={handleGenerate}
                                                                disabled={!email.includes('@') || status === 'loading'}
                                                                className="w-full py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest
                                           transition-all flex items-center justify-center gap-2
                                           disabled:opacity-40 disabled:cursor-not-allowed
                                           bg-gradient-to-r from-[#9A7A35] via-gold to-[#9A7A35]
                                           text-luxury-black hover:shadow-gold/20 hover:shadow-lg"
                                                            >
                                                                {status === 'loading' ? (
                                                                    <>
                                                                        <Loader2 size={14} className="animate-spin" />
                                                                        Generating PDF…
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Download size={14} />
                                                                        Download Investment Passport
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Trust signals */}
                                                    <div className="space-y-2.5">
                                                        {[
                                                            { icon: ShieldCheck, text: 'No spam — your data stays private' },
                                                            { icon: FileText, text: '6 pages, instant download, no login required' },
                                                            { icon: TrendingUp, text: 'Malta PPR data + 2026 tax calculations' },
                                                        ].map(({ icon: Icon, text }) => (
                                                            <div key={text} className="flex items-center gap-2.5">
                                                                <Icon size={12} className="text-white/20 shrink-0" />
                                                                <span className="text-[11px] text-white/30">{text}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// ─── Trigger Button ───────────────────────────────────────────────────────────
// Compact button to embed in PropertyCard or property detail page.
export const InvestmentPassportButton: React.FC<{
    property: Property;
    variant?: 'card' | 'page';
}> = ({ property, variant = 'page' }) => {
    const [open, setOpen] = useState(false);

    if (variant === 'card') {
        return (
            <>
                <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                     bg-gold/10 border border-gold/20 text-gold
                     text-[9px] font-bold uppercase tracking-widest
                     hover:bg-gold/20 transition-colors"
                >
                    <FileText size={10} />
                    PDF Report
                </button>
                <InvestmentPassportModal property={property} isOpen={open} onClose={() => setOpen(false)} />
            </>
        );
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="group flex items-center gap-3 px-6 py-4 rounded-2xl
                   bg-gradient-to-r from-gold/10 to-gold/5
                   border border-gold/30 hover:border-gold/60
                   transition-all duration-300 hover:shadow-gold/10 hover:shadow-lg w-full"
            >
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0 group-hover:bg-gold/30 transition-colors">
                    <FileText className="text-gold" size={18} />
                </div>
                <div className="flex-1 text-left">
                    <div className="text-xs font-bold uppercase tracking-widest text-gold">Free PDF Report</div>
                    <div className="text-[11px] text-white/40 mt-0.5">6-page Investment Passport · Instant Download</div>
                </div>
                <Download size={16} className="text-gold/50 group-hover:text-gold transition-colors" />
            </button>
            <InvestmentPassportModal property={property} isOpen={open} onClose={() => setOpen(false)} />
        </>
    );
};
