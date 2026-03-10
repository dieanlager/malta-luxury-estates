import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    LayoutDashboard,
    List,
    Users,
    BarChart3,
    Settings,
    Plus,
    Search,
    Bell,
    User,
    MoreHorizontal,
    Pencil,
    Pause,
    Trash2,
    Play,
    ChevronRight,
    Upload,
    CheckCircle2,
    X,
    Mail,
    Phone,
    Euro,
    MapPin,
    Home,
    Clock,
    ArrowUpRight,
    TrendingUp,
    TrendingDown,
    Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { usePageMeta } from "../lib/seo/meta";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { LOCATIONS } from "../lib/data";

// --- Types ---
interface DBProperty {
    id: string;
    agency_id: string;
    title: string;
    location_text: string;
    location_id: number;
    property_type: string;
    bedrooms: number;
    bathrooms: number;
    area_sqm: number;
    price: number;
    listing_type: string;
    status: string;
    description: string;
    images: string[];
    views_count?: number;
    leads_count?: number;
    is_seafront: boolean;
    has_pool: boolean;
    has_garage: boolean;
    is_sda: boolean;
    is_uca: boolean;
    created_at?: string;
}

const MALTA_LOCATIONS = ["Sliema", "St. Julian's", "Valletta", "Gżira", "Msida", "Swieqi", "Mellieħa", "St. Paul's Bay", "Naxxar", "Marsaxlokk", "Marsascala", "Gozo – Victoria", "Gozo – Xlendi", "Gozo – Sannat", "Kalkara (SDA)", "Portomaso (SDA)", "Tigné Point (SDA)", "Mdina", "Rabat", "Attard", "Balzan", "Lija"];
const PROPERTY_TYPES = ["Apartment", "Penthouse", "Villa", "Townhouse", "House of Character", "Palazzo", "Maisonette", "Farmhouse", "Duplex", "Studio", "Ground Floor"];

// ─── Primitives ───────────────────────────────────────────────────────────────
const G = {
    bg: "#080808", surface: "rgba(255,255,255,0.025)", border: "rgba(255,255,255,0.07)",
    gold: "#C5A059", goldDim: "#9A7A35", goldPale: "rgba(197,160,89,0.08)",
    goldBorder: "rgba(197,160,89,0.2)", text: "rgba(255,255,255,0.8)",
    muted: "rgba(255,255,255,0.3)", faint: "rgba(255,255,255,0.1)",
    green: "#4ade80", red: "#f87171", blue: "#60a5fa",
    mono: "'DM Mono', monospace", serif: "'Cormorant Garamond', serif", sans: "'DM Sans', sans-serif",
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, trend, icon: Icon }: any) {
    const trendColor = trend > 0 ? G.green : trend < 0 ? G.red : G.muted;
    return (
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/2">
            <div className="flex justify-between items-start mb-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</div>
                <div className="text-gold/40">
                    <Icon size={18} />
                </div>
            </div>
            <div className="text-3xl font-mono text-white mb-2">{value}</div>
            <div className="flex items-center gap-2">
                {trend !== undefined && trend !== 0 && (
                    <span className={`flex items-center gap-1 text-[10px] font-mono ${trendColor}`}>
                        {trend > 0 ? <TrendingUp size={10} /> : trend < 0 ? <TrendingDown size={10} /> : '→'}
                        {Math.abs(trend)}%
                    </span>
                )}
                <span className="text-[10px] text-white/20 uppercase tracking-wider">{sub}</span>
            </div>
        </div>
    );
}

// ─── Listing Row ───────────────────────────────────────────────────────────────
function ListingRow({ listing, onEdit, onToggle, onDelete }: any) {
    const statusConfig: any = {
        active: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
        paused: { label: "Paused", color: "text-gold", bg: "bg-gold/10", border: "border-gold/20" },
        draft: { label: "Draft", color: "text-white/40", bg: "bg-white/5", border: "border-white/10" },
    };
    const sc = statusConfig[listing.status] || statusConfig.draft;
    const isRent = listing.listing_type === "rent";

    return (
        <div className="group flex items-center gap-6 p-4 border-b border-white/5 hover:bg-white/2 transition-all">
            {/* Thumb */}
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                <img src={listing.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80"} alt="" className={`w-full h-full object-cover ${listing.status === 'draft' ? 'opacity-30' : 'opacity-70'}`} />
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-white truncate">{listing.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${sc.bg} ${sc.color} ${sc.border}`}>
                        {sc.label}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-white/30 font-mono">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {listing.location_text}</span>
                    <span>{listing.property_type}</span>
                    <span>{listing.bedrooms === 0 ? "Studio" : listing.bedrooms + " bed"}</span>
                    <span>{listing.area_sqm} m²</span>
                </div>
            </div>

            {/* Metrics */}
            <div className="hidden lg:flex items-center gap-12 text-center flex-shrink-0">
                <div>
                    <div className="text-sm font-mono text-white">{listing.views_count || 0}</div>
                    <div className="text-[8px] uppercase tracking-widest text-white/20">Views</div>
                </div>
                <div>
                    <div className="text-sm font-mono text-white">{listing.leads_count || 0}</div>
                    <div className="text-[8px] uppercase tracking-widest text-white/20">Leads</div>
                </div>
            </div>

            {/* Price */}
            <div className="text-right min-w-[100px] flex-shrink-0">
                <div className="text-sm font-mono text-gold font-bold">€{listing.price.toLocaleString()}</div>
                <div className="text-[9px] text-white/20 uppercase tracking-widest">{isRent ? "/month" : "sale"}</div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(listing)} className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-gold hover:bg-gold/10 transition-all">
                    <Pencil size={14} />
                </button>
                <button onClick={() => onToggle(listing.id, listing.status)} className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                    {listing.status === "active" ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button onClick={() => onDelete(listing.id)} className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}

// ─── Add / Edit Listing Modal ──────────────────────────────────────────────────
function ListingModal({ listing, onSave, onClose }: any) {
    const isEdit = Boolean(listing?.id && !listing.id.startsWith('new_'));
    const empty = { title: "", location: "", type: "", bedrooms: "2", bathrooms: "1", sqm: "", floor: "", price: "", listingType: "sale", condition: "Good", hasSeaView: false, hasPool: false, hasGarage: false, hasTerrace: false, isSDA: false, isUCA: false, description: "", status: "active", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80" };

    // Map DB fields back to form state if editing
    const initialForm = listing ? {
        ...empty,
        ...listing,
        location: listing.location_text || "",
        type: listing.property_type || "",
        price: String(listing.price || ""),
        sqm: String(listing.area_sqm || ""),
        listingType: listing.listing_type || "sale",
        hasSeaView: listing.is_seafront || false,
        hasPool: listing.has_pool || false,
        hasGarage: listing.has_garage || false,
        hasTerrace: listing.has_terrace || false,
        isSDA: listing.is_sda || false,
        isUCA: listing.is_uca || false,
        image: listing.images?.[0] || empty.image
    } : empty;

    const [form, setForm] = useState(initialForm);
    const [step, setStep] = useState(0);

    const steps = ["Basic Info", "Details & Features", "Pricing & Status"];
    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
    const isValid = form.title && form.location && form.type && form.price;

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold/50 transition-all placeholder:text-white/10 font-mono";
    const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2";

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-luxury-black border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-1">{isEdit ? "Edit Listing" : "New Listing"}</div>
                        <h3 className="text-xl font-serif text-white">{form.title || (isEdit ? "Edit Property" : "Add Property")}</h3>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Step tabs */}
                <div className="flex border-b border-white/5">
                    {steps.map((s, i) => (
                        <button key={s} onClick={() => setStep(i)} className={`flex-1 py-4 text-[9px] font-bold uppercase tracking-widest transition-all border-b-2 ${i === step ? 'text-gold border-gold' : 'text-white/20 border-transparent hover:text-white/40'}`}>
                            {i + 1}. {s}
                        </button>
                    ))}
                </div>

                {/* Form Body */}
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div key="step0" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                <div>
                                    <label className={labelClass}>Listing Title *</label>
                                    <input className={inputClass} placeholder="e.g. Spacious 3-Bed Penthouse, Sea Views" value={form.title} onChange={e => set("title", e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Location *</label>
                                        <select className={inputClass} value={form.location} onChange={e => set("location", e.target.value)}>
                                            <option value="">Select Location</option>
                                            {MALTA_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Property Type *</label>
                                        <select className={inputClass} value={form.type} onChange={e => set("type", e.target.value)}>
                                            <option value="">Select Type</option>
                                            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Description</label>
                                    <textarea className={`${inputClass} min-h-[120px] resize-none leading-relaxed`} placeholder="Describe the property highlights..." value={form.description} onChange={e => set("description", e.target.value)} />
                                </div>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>Beds</label>
                                        <select className={inputClass} value={form.bedrooms} onChange={e => set("bedrooms", e.target.value)}>
                                            {["Studio", "1", "2", "3", "4", "5+"].map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Baths</label>
                                        <select className={inputClass} value={form.bathrooms} onChange={e => set("bathrooms", e.target.value)}>
                                            {["1", "2", "3", "4+"].map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Sqm</label>
                                        <input type="number" className={inputClass} placeholder="120" value={form.sqm} onChange={e => set("sqm", e.target.value)} />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Environmental Toggles</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: "hasSeaView", label: "Sea View", Icon: MapPin },
                                            { id: "hasPool", label: "Pool", Icon: Home },
                                            { id: "hasGarage", label: "Garage", Icon: Home },
                                            { id: "hasTerrace", label: "Terrace", Icon: Home },
                                            { id: "isSDA", label: "SDA Status", Icon: CheckCircle2 },
                                            { id: "isUCA", label: "UCA / Tax Free", Icon: Home },
                                        ].map(({ id, label, Icon }) => (
                                            <button key={id} onClick={() => set(id, !form[id as keyof typeof form])} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${(form as any)[id] ? 'bg-gold/10 border-gold text-gold' : 'border-white/10 text-white/30 hover:border-white/20'}`}>
                                                {Icon && <Icon size={12} />}
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Listing Purpose</label>
                                        <div className="flex gap-2">
                                            {["sale", "rent"].map(t => (
                                                <button key={t} onClick={() => set("listingType", t)} className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${form.listingType === t ? 'bg-gold/10 border-gold text-gold' : 'border-white/10 text-white/20'}`}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Price (EUR) *</label>
                                        <input type="number" className={inputClass} placeholder="895000" value={form.price} onChange={e => set("price", e.target.value)} />
                                    </div>
                                </div>

                                <div className="p-6 rounded-[2rem] border border-dashed border-white/10 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 mx-auto mb-4">
                                        <Upload size={24} />
                                    </div>
                                    <div className="text-xs font-medium text-white mb-1">Upload Property Photos</div>
                                    <div className="text-[10px] text-white/20 uppercase tracking-widest">Max 30 high-res images</div>
                                </div>

                                <div>
                                    <label className={labelClass}>Visibility Status</label>
                                    <div className="flex gap-2">
                                        {[["active", "Live", "text-emerald-400"], ["draft", "Draft", "text-white/40"], ["paused", "Paused", "text-gold"]].map(([val, lbl, color]) => (
                                            <button key={val} onClick={() => set("status", val)} className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${form.status === val ? `bg-white/5 border-white/20 ${color}` : 'border-white/5 text-white/20'}`}>
                                                {lbl}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-white/5 flex gap-4 justify-between bg-white/[0.01]">
                    <button onClick={onClose} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all">Cancel</button>
                    <div className="flex gap-2">
                        {step > 0 && <button onClick={() => setStep(s => s - 1)} className="px-8 py-3 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/5 transition-all">Back</button>}
                        <button
                            onClick={() => {
                                if (step < 2) setStep(s => s + 1);
                                else if (isValid) onSave(form);
                            }}
                            disabled={step === 2 && !isValid}
                            className={`px-8 py-3 rounded-xl bg-gold text-luxury-black text-[10px] font-bold uppercase tracking-widest transition-all ${step === 2 && !isValid ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                        >
                            {step < 2 ? "Next Step" : (isEdit ? "Update Property" : "Publish Listing")}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Lead Row ─────────────────────────────────────────────────────────────────
function LeadRow({ lead, onUpdateStatus }: any) {
    const statusConfig: any = {
        new: { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", label: "New" },
        contacted: { color: "text-gold", bg: "bg-gold/10", border: "border-gold/20", label: "Contacted" },
        qualified: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", label: "Qualified" },
        closed: { color: "text-white/20", bg: "bg-white/5", border: "border-white/10", label: "Closed" },
    };
    const sc = statusConfig[lead.status] || statusConfig.new;
    const nextStatus: any = { new: "contacted", contacted: "qualified", qualified: "closed" };

    return (
        <div className="group flex items-center gap-6 p-4 border-b border-white/5 hover:bg-white/2 transition-all">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                {lead.flag || "🇲🇹"}
            </div>
            <div className="flex-1">
                <div className="text-sm font-medium text-white">{lead.name}</div>
                <div className="text-[10px] font-mono text-white/30">{lead.email}</div>
            </div>
            <div className="flex-1 hidden md:block">
                <div className="text-[11px] text-white/60 mb-1 truncate">{lead.property_title || "General Inquiry"}</div>
                <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${lead.intent === 'Buy' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-blue-400/10 text-blue-400 border-blue-400/20'}`}>
                        {lead.intent}
                    </span>
                    <span className="text-[10px] font-mono text-white/20">€{lead.budget_max?.toLocaleString() || "–"}</span>
                </div>
            </div>
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest flex-shrink-0">
                <Clock size={10} className="inline mr-1" /> {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "Today"}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${sc.bg} ${sc.color} ${sc.border}`}>
                    {sc.label}
                </span>
                {nextStatus[lead.status] && (
                    <button onClick={() => onUpdateStatus(lead.id, nextStatus[lead.status])} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:text-gold hover:bg-gold/10 transition-all">
                        <ArrowUpRight size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── MAIN PORTAL ───────────────────────────────────────────────────────────────
export const AgencyPortal: React.FC = () => {
    usePageMeta({
        title: 'Agency Portal | Malta Luxury Real Estate Control Center',
        description: 'Exclusive portal for Malta real estate agencies. Manage listings, track leads, and analyze market performance with real-time data.',
        canonicalPath: '/agency/portal'
    });

    const { agency, signOut, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState("dashboard");
    const [listings, setListings] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modal, setModal] = useState<any>(null); // null | "new" | listing object
    const [listingFilter, setListingFilter] = useState("all");
    const [notification, setNotification] = useState<any>(null);

    // Fetch initial data
    useEffect(() => {
        if (!authLoading && !agency) {
            navigate('/agency/login');
            return;
        }

        if (agency) {
            fetchData();
        }
    }, [agency, authLoading]);

    async function fetchData() {
        if (!agency || !supabase) return;
        setIsLoading(true);
        try {
            // Fetch Listings
            const { data: props, error: pErr } = await supabase
                .from('properties')
                .select('*')
                .eq('agency_id', agency.id)
                .order('created_at', { ascending: false });

            if (pErr) throw pErr;
            setListings(props || []);

            // Fetch Leads
            const { data: lds, error: lErr } = await supabase
                .from('leads')
                .select('*, properties(title)')
                .eq('agency_id', agency.id)
                .order('created_at', { ascending: false });

            if (lErr) throw lErr;

            // Flatten property title for LeadRow
            const formattedLeads = (lds || []).map(l => ({
                ...l,
                property_title: (l as any).properties?.title
            }));
            setLeads(formattedLeads);

        } catch (err: any) {
            console.error("Error fetching portal data:", err.message);
            notify("Error connecting to database", "error");
        } finally {
            setIsLoading(false);
        }
    }

    const handleSignOut = async () => {
        await signOut();
        navigate('/agency/login');
    };

    const notify = (msg: string, type: "success" | "error" = "success") => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const saveListing = async (formData: any) => {
        if (!agency || !supabase) return;

        const dbData: any = {
            id: formData.id?.startsWith('new_') ? undefined : formData.id,
            agency_id: agency.id,
            title: formData.title,
            location_text: formData.location,
            location_id: LOCATIONS.find(l => l.nameEn === formData.location)?.id,
            property_type: formData.type,
            bedrooms: formData.bedrooms === "Studio" ? 0 : parseInt(formData.bedrooms) || 0,
            bathrooms: parseInt(formData.bathrooms) || 0,
            area_sqm: parseFloat(formData.sqm) || 0,
            price: parseFloat(formData.price),
            listing_type: formData.listingType,
            status: formData.status,
            description: formData.description,
            is_seafront: formData.hasSeaView,
            has_pool: formData.hasPool,
            has_garage: formData.hasGarage,
            is_sda: formData.isSDA,
            is_uca: formData.isUCA,
            images: [formData.image], // Simplification for demo
        };

        try {
            const { error } = await supabase.from('properties').upsert(dbData).select();
            if (error) throw error;

            await fetchData(); // Refresh
            setModal(null);
            notify(dbData.id ? "Property updated" : "Listing published 🚀");
        } catch (err: any) {
            notify(err.message, "error");
        }
    };

    const toggleListing = async (id: string, currentStatus: string) => {
        if (!supabase) return;
        const nextStatus = currentStatus === "active" ? "paused" : "active";
        try {
            const { error } = await supabase
                .from('properties')
                .update({ status: nextStatus })
                .eq('id', id);

            if (error) throw error;
            setListings(ls => ls.map(l => l.id === id ? { ...l, status: nextStatus } : l));
            notify(`Listing ${nextStatus}`);
        } catch (err: any) {
            notify(err.message, "error");
        }
    };

    const deleteListing = async (id: string) => {
        if (!window.confirm("Are you sure? This cannot be undone.")) return;
        if (!supabase) return;
        try {
            const { error } = await supabase.from('properties').delete().eq('id', id);
            if (error) throw error;
            setListings(ls => ls.filter(l => l.id !== id));
            notify("Listing removed permanently", "error");
        } catch (err: any) {
            notify(err.message, "error");
        }
    };

    const updateLeadStatus = async (id: string, status: string) => {
        if (!supabase) return;
        try {
            const { error } = await supabase
                .from('leads')
                .update({ status: status })
                .eq('id', id);

            if (error) throw error;
            setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l));
            notify(`Lead moved to ${status}`);
        } catch (err: any) {
            notify(err.message, "error");
        }
    };

    // Stats
    const active = listings.filter(l => l.status === "active");
    const totalViews = active.reduce((s, l) => s + (l.views_count || 0), 0);
    const totalLeadsCount = active.reduce((s, l) => s + (l.leads_count || 0), 0);
    const newLeadsCount = leads.filter(l => l.status === "new").length;
    const filteredListings = listingFilter === "all" ? listings : listings.filter(l => l.status === listingFilter);

    const navItems = [
        { id: "dashboard", icon: LayoutDashboard, label: "Overview" },
        { id: "listings", icon: List, label: "Listings", badge: listings.length },
        { id: "leads", icon: Users, label: "Lead Pipeline", badge: newLeadsCount, badgeColor: "text-blue-400" },
        { id: "analytics", icon: BarChart3, label: "Market Insights" },
        { id: "settings", icon: Settings, label: "Settings" },
    ];

    if (isLoading && authLoading) {
        return (
            <div className="min-h-screen bg-luxury-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto" />
                    <p className="text-gold font-mono text-[10px] uppercase tracking-widest">Accessing Secure Vault...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-luxury-black font-sans text-white/80 selection:bg-gold/30">

            {/* ── Notification Toast ── */}
            <AnimatePresence>
                {notification && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`fixed top-8 right-8 z-[300] px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest ${notification.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                        {notification.type === 'error' ? <Trash2 size={14} /> : <CheckCircle2 size={14} />}
                        {notification.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Modal ── */}
            <AnimatePresence>
                {modal && (
                    <ListingModal
                        listing={modal === "new" ? null : modal}
                        onSave={saveListing}
                        onClose={() => setModal(null)}
                    />
                )}
            </AnimatePresence>

            <div className="flex min-h-screen">

                {/* ── Sidebar ── */}
                <aside className="w-64 border-r border-white/5 bg-white/[0.01] flex flex-col sticky top-0 h-screen">
                    <div className="p-8 border-b border-white/5 mb-4">
                        <Link to="/" className="group block">
                            <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold mb-1 group-hover:text-white transition-colors">Agency Portal</div>
                            <div className="text-sm font-serif text-white tracking-widest">MALTA <span className="text-gold italic">LUXURY</span></div>
                        </Link>
                    </div>

                    <div className="px-6 mb-8">
                        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-mono text-xs font-bold shadow-inner uppercase">
                                {agency?.name?.substring(0, 2) || 'LE'}
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">{agency?.name || 'Loading...'}</div>
                                <div className="text-[9px] font-mono text-gold flex items-center gap-1 uppercase tracking-wide">
                                    {(agency as any)?.plan || 'Basic'} Plan <ArrowUpRight size={10} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-1">
                        {navItems.map(item => {
                            const isActive = view === item.id;
                            return (
                                <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${isActive ? 'bg-gold/10 text-gold shadow-sm' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                                    <item.icon size={16} className={`${isActive ? 'text-gold' : 'text-white/20 group-hover:text-white/60'}`} />
                                    <span className="text-xs font-medium flex-1 text-left">{item.label}</span>
                                    {item.badge !== undefined && (
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${isActive ? 'bg-gold/10 border-gold/20 text-gold' : 'bg-white/5 border-white/10 text-white/30'}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="p-6 border-t border-white/5">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-400/5 transition-all text-xs font-medium"
                        >
                            <X size={16} /> Sign Out
                        </button>
                    </div>
                </aside>

                {/* ── Main Dashboard ── */}
                <main className="flex-1 min-w-0 overflow-y-auto">

                    {/* Header */}
                    <header className="px-10 py-8 border-b border-white/5 flex justify-between items-center sticky top-0 bg-luxury-black/90 backdrop-blur-xl z-50">
                        <div>
                            <h1 className="text-3xl font-serif text-white tracking-wide">
                                {navItems.find(n => n.id === view)?.label}
                            </h1>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 mt-1">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>

                        <div className="flex items-center gap-6">
                            {(view === "dashboard" || view === "listings") && (
                                <button onClick={() => setModal({ id: `new_${Date.now()}`, title: '', status: 'active' })} className="flex items-center gap-2 px-6 py-3 bg-gold text-luxury-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gold/10">
                                    <Plus size={14} /> New Listing
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="p-10 space-y-10">

                        {/* ── VIEW: DASHBOARD ── */}
                        {view === "dashboard" && (
                            <div className="space-y-12">
                                {/* Metrics Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard label="Active Portfolio" value={active.length} sub="Listings Live" trend={0} icon={Home} />
                                    <StatCard label="Pipeline Leads" value={leads.length} sub="Agency Total" trend={0} icon={Users} />
                                    <StatCard label="Average Days" value="–" sub="Market Velocity" trend={0} icon={Clock} />
                                    <StatCard label="Portfolio Value" value={`€${(active.reduce((s, l) => s + l.price, 0) / 1000000).toFixed(1)}M`} sub="Active Equity" trend={0} icon={Euro} />
                                </div>

                                {/* Rows Grid */}
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <h3 className="text-xl font-serif text-white">Recent Listings</h3>
                                            <button onClick={() => setView('listings')} className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-gold transition-all">
                                                Manage All <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                        <div className="glass-card rounded-[2.5rem] border border-white/5 bg-white/1 overflow-hidden">
                                            {listings.slice(0, 4).map(l => (
                                                <ListingRow key={l.id} listing={l} onEdit={setModal} onToggle={toggleListing} onDelete={deleteListing} />
                                            ))}
                                            {listings.length === 0 && <div className="p-8 text-center text-white/20 text-xs font-mono">No listings yet</div>}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <h3 className="text-xl font-serif text-white">Latest Enquiries</h3>
                                            <button onClick={() => setView('leads')} className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-gold transition-all">
                                                Full Pipeline <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                        <div className="glass-card rounded-[2.5rem] border border-white/5 bg-white/1 overflow-hidden">
                                            {leads.slice(0, 4).map(l => (
                                                <LeadRow key={l.id} lead={l} onUpdateStatus={updateLeadStatus} />
                                            ))}
                                            {leads.length === 0 && <div className="p-8 text-center text-white/20 text-xs font-mono">No leads received</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── VIEW: LISTINGS ── */}
                        {view === "listings" && (
                            <div className="space-y-8">
                                {/* Filter Toolbar */}
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 rounded-[2rem] bg-white/2 border border-white/5">
                                    <div className="flex gap-2">
                                        {[["all", "All"], ["active", "Active"], ["paused", "Paused"], ["draft", "Drafts"]].map(([val, lbl]) => (
                                            <button key={val} onClick={() => setListingFilter(val)} className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${listingFilter === val ? 'bg-gold/10 border-gold/50 text-gold' : 'border-white/5 text-white/20 hover:text-white/40'}`}>
                                                {lbl} <span className="text-[8px] opacity-40 ml-1">({val === 'all' ? listings.length : listings.filter(l => l.status === val).length})</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                        <input className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-[11px] font-mono text-white/60 placeholder:text-white/10" placeholder="Search Listings..." />
                                    </div>
                                </div>

                                <div className="glass-card rounded-[2.5rem] border border-white/5 bg-white/1 overflow-hidden">
                                    {filteredListings.length > 0 ? (
                                        filteredListings.map(l => (
                                            <ListingRow key={l.id} listing={l} onEdit={setModal} onToggle={toggleListing} onDelete={deleteListing} />
                                        ))
                                    ) : (
                                        <div className="py-32 text-center space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-white/2 flex items-center justify-center text-white/10 mx-auto">
                                                <Home size={32} />
                                            </div>
                                            <div>
                                                <p className="text-white/40 font-serif text-xl">No properties found.</p>
                                                <button onClick={() => setListingFilter('all')} className="text-gold text-[10px] font-bold uppercase tracking-widest hover:underline mt-2">Show all listings</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── VIEW: LEADS ── */}
                        {view === "leads" && (
                            <div className="space-y-10">
                                {/* Summary Row */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: "Inbox", count: leads.filter(l => l.status === 'new').length, color: "text-blue-400" },
                                        { label: "In Contact", count: leads.filter(l => l.status === 'contacted').length, color: "text-gold" },
                                        { label: "Qualified", count: leads.filter(l => l.status === 'qualified').length, color: "text-emerald-400" },
                                        { label: "Closed", count: leads.filter(l => l.status === 'closed').length, color: "text-white/20" }
                                    ].map(s => (
                                        <div key={s.label} className="p-6 rounded-3xl bg-white/2 border border-white/5">
                                            <div className={`text-2xl font-mono ${s.color} mb-1`}>{s.count}</div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/20">{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="glass-card rounded-[2.5rem] border border-white/5 bg-white/1 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-white/5 bg-white/[0.01]">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Real-time Interest Pipeline</h3>
                                    </div>
                                    {leads.map(l => (
                                        <LeadRow key={l.id} lead={l} onUpdateStatus={updateLeadStatus} />
                                    ))}
                                    {leads.length === 0 && <div className="p-20 text-center text-white/10 italic">No incoming leads yet.</div>}
                                </div>
                            </div>
                        )}

                        {/* ANALYTICS & SETTINGS placeholder logic remains ... */}
                        {view === "analytics" && <div className="glass-card p-20 rounded-[4rem] text-center bg-white/[0.01] border border-white/5 border-dashed">
                            <div className="w-20 h-20 rounded-[2rem] bg-gold/5 border border-gold/10 flex items-center justify-center text-gold mx-auto mb-8 shadow-2xl">
                                <BarChart3 size={40} />
                            </div>
                            <h2 className="text-4xl font-serif text-white mb-4">Deep Market Intelligence</h2>
                            <p className="max-w-xl mx-auto text-white/30 text-lg leading-relaxed mb-10">Comparative market analysis and heatmaps are coming in the next version.</p>
                        </div>}

                        {view === "settings" && <div className="max-w-2xl space-y-10">
                            <div className="glass-card p-10 rounded-[3rem] border border-white/5 bg-white/1 space-y-8">
                                <div className="flex items-center gap-4 border-b border-white/5 pb-8 mb-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-2xl font-mono font-bold uppercase">
                                        {agency?.name?.substring(0, 2) || 'AG'}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-serif text-white">{agency?.name || 'Agency Name'}</h3>
                                        <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Plan: {(agency as any)?.plan || 'Basic'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-full space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-4">Management Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10" size={16} />
                                            <input className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm text-white font-mono" defaultValue={agency?.email || ""} readOnly />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/agency/upgrade')} className="w-full py-4 bg-gold/10 hover:bg-gold/20 border border-gold/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gold transition-all">
                                    Manage Subscription & Plan
                                </button>
                            </div>
                        </div>}
                    </div>
                </main>
            </div>
        </div>
    );
};
