import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import {
    Upload, FileText, CheckCircle, XCircle, AlertTriangle,
    Download, ChevronRight, Loader2, Eye, LayoutGrid,
    Euro, MapPin, Home, ArrowUpRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { parseCSV, downloadTemplate, ImportResult, CSV_COLUMNS } from '../../lib/csvImport';

type Step = 'upload' | 'preview' | 'importing' | 'done';

const G = {
    gold: "#C5A059",
    green: "#4ade80",
    red: "#f87171",
    blue: "#60a5fa",
};

export function CSVImport({ onComplete }: { onComplete: () => void }) {
    const { agency } = useAuth();
    const [step, setStep] = useState<Step>('upload');
    const [result, setResult] = useState<ImportResult | null>(null);
    const [importProgress, setImportProgress] = useState(0);
    const [importStats, setImportStats] = useState({ success: 0, failed: 0 });

    // ── Step 1: File drop ──────────────────────────────────────────────────
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file || !agency) return;

        // Fetch existing external_refs for deduplication
        const { data: existing } = await supabase
            .from('properties')
            .select('external_ref')
            .eq('agency_id', agency.id)
            .not('external_ref', 'is', null);

        const existingRefs = (existing ?? []).map((r: any) => r.external_ref).filter(Boolean);

        try {
            const parsed = await parseCSV(file, existingRefs);
            setResult(parsed);
            setStep('preview');
        } catch (err: any) {
            alert(err.message);
        }
    }, [agency]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.csv'] },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 5MB
    });

    // ── Step 3: Import valid rows ──────────────────────────────────────────
    const handleImport = async () => {
        if (!result || !agency) return;
        setStep('importing');

        const validRows = result.rows.filter(r => r.errors.length === 0 && !r.isDuplicate);
        let success = 0;
        let failed = 0;

        const BATCH_SIZE = 50;
        for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
            const batch = validRows.slice(i, i + BATCH_SIZE).map(row => ({
                ...row.mapped,
                agency_id: agency.id,
            }));

            const { error } = await (supabase as any).from('properties').insert(batch as any[]);

            if (error) {
                console.error('Batch error:', error);
                failed += batch.length;
            } else {
                success += batch.length;
            }

            setImportProgress(Math.round((Math.min(i + BATCH_SIZE, validRows.length) / validRows.length) * 100));
            setImportStats({ success, failed });

            if (i + BATCH_SIZE < validRows.length) {
                await new Promise(r => setTimeout(r, 200));
            }
        }

        setStep('done');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">

            {/* Indicator */}
            <div className="flex items-center justify-center gap-4">
                {[
                    { id: 'upload', label: 'Upload' },
                    { id: 'preview', label: 'Preview' },
                    { id: 'done', label: 'Import' },
                ].map((s, i) => {
                    const state = step === s.id ? 'active' : (step === 'importing' && s.id === 'done' ? 'active' : 'idle');
                    const isPast = (step === 'preview' && s.id === 'upload') || (step === 'done' && s.id !== 'done');

                    return (
                        <React.Fragment key={s.id}>
                            <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all ${state === 'active' ? 'bg-gold/10 border-gold text-gold' :
                                isPast ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                    'bg-white/5 border-white/5 text-white/20'
                                }`}>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${state === 'active' ? 'bg-gold text-luxury-black' :
                                    isPast ? 'bg-emerald-400 text-luxury-black' :
                                        'bg-white/5 text-white/20'
                                    }`}>
                                    {isPast ? '✓' : i + 1}
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-widest">{s.label}</span>
                            </div>
                            {i < 2 && <ChevronRight size={14} className="text-white/10" />}
                        </React.Fragment>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {step === 'upload' && (
                    <motion.div key="u" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div className="p-8 rounded-[2.5rem] border border-gold/20 bg-gold/[0.03] flex items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-2xl">
                                    <FileText size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-serif text-white">Download CSV Template</h3>
                                    <p className="text-[11px] text-white/40 font-mono uppercase tracking-wide">Standardized format for bulk listings</p>
                                </div>
                            </div>
                            <button onClick={downloadTemplate} className="flex items-center gap-3 px-8 py-4 bg-gold text-luxury-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gold/20">
                                <Download size={14} /> Download Template
                            </button>
                        </div>

                        <div {...getRootProps()} className={`relative group p-16 rounded-[3rem] border-2 border-dashed transition-all cursor-pointer text-center ${isDragActive ? 'border-gold bg-gold/5' : 'border-white/5 hover:border-gold/30 hover:bg-white/1'}`}>
                            <input {...getInputProps()} />
                            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/10 mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Upload size={32} />
                            </div>
                            <h4 className="text-xl font-serif text-white/80 mb-2">Drag & Drop Listing Data</h4>
                            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20">Maximum 500 records per file • .CSV format only</p>

                            {isDragActive && (
                                <div className="absolute inset-0 bg-luxury-black/80 backdrop-blur-sm rounded-[3rem] flex items-center justify-center">
                                    <p className="text-gold font-serif text-2xl italic">Release to Process Intel</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {CSV_COLUMNS.filter(c => c.required).map(c => (
                                <div key={c.key} className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-gold/40" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">{c.label}*</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 'preview' && result && (
                    <motion.div key="p" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div className="grid grid-cols-4 gap-6">
                            {[
                                { label: 'Total Scanned', value: result.total, icon: FileText, color: 'text-white' },
                                { label: 'Verified Ready', value: result.valid, icon: CheckCircle, color: 'text-emerald-400' },
                                { label: 'Duplicate Keys', value: result.duplicates, icon: AlertTriangle, color: 'text-gold' },
                                { label: 'Critical Errors', value: result.invalid, icon: XCircle, color: 'text-red-400' },
                            ].map(stat => (
                                <div key={stat.label} className="p-6 rounded-[2rem] border border-white/5 bg-white/1">
                                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 mb-4 flex justify-between">
                                        {stat.label}
                                        <stat.icon size={12} className={stat.color} />
                                    </div>
                                    <div className={`text-3xl font-mono ${stat.color}`}>{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="glass-card rounded-[2.5rem] border border-white/5 bg-white/1 overflow-hidden">
                            <div className="px-8 py-5 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Ready for Intel Injection</span>
                                <span className="text-[9px] text-white/20 uppercase font-mono italic">Showing top 5 valid entries</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">
                                            <th className="px-8 py-4">Title & Context</th>
                                            <th className="px-8 py-4">Financials</th>
                                            <th className="px-8 py-4">Asset Type</th>
                                            <th className="px-8 py-4">Validity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {result.rows.filter(r => r.errors.length === 0 && !r.isDuplicate).slice(0, 5).map(row => (
                                            <tr key={row.rowIndex} className="text-white/60">
                                                <td className="px-8 py-4">
                                                    <div className="text-xs font-medium text-white mb-1">{row.mapped.title}</div>
                                                    <div className="text-[9px] font-mono text-white/20 uppercase flex items-center gap-1">
                                                        <MapPin size={8} /> {row.mapped.location_text}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 font-mono text-xs">€{row.mapped.price?.toLocaleString()}</td>
                                                <td className="px-8 py-4">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-gold/60">{row.mapped.property_type}</span>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-2 text-emerald-400 text-[9px] font-bold tracking-widest uppercase">
                                                        <CheckCircle size={10} /> Verified
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {result.invalid > 0 && (
                            <div className="p-6 rounded-[2rem] border border-red-500/20 bg-red-500/[0.03]">
                                <div className="flex items-center gap-3 mb-4">
                                    <XCircle size={16} className="text-red-400" />
                                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-red-400">Validation Faults Detected ({result.invalid})</h5>
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-4">
                                    {result.rows.filter(r => r.errors.length > 0).map(r => (
                                        <div key={r.rowIndex} className="text-[10px] font-mono text-white/40">
                                            <span className="text-red-400/60 font-bold mr-2">Row {r.rowIndex}:</span>
                                            {r.errors.join(' • ')}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button onClick={() => setStep('upload')} className="px-10 py-4 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/5 transition-all">
                                ← Back to Selection
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={result.valid === 0}
                                className="flex-1 flex items-center justify-center gap-3 px-10 py-4 bg-gold text-luxury-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gold/20 disabled:opacity-30 disabled:grayscale"
                            >
                                <ArrowUpRight size={14} /> Inject {result.valid} Verified Records
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 'importing' && (
                    <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center space-y-8">
                        <div className="relative w-32 h-32 mx-auto">
                            <Loader2 className="w-full h-full text-gold animate-spin" strokeWidth={1} />
                            <div className="absolute inset-0 flex items-center justify-center font-mono text-xl text-white">
                                {importProgress}%
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-serif text-white italic">Synchronizing Assets</h3>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mt-2">Uploading Batch {importStats.success} of {result?.valid}</p>
                        </div>
                    </motion.div>
                )}

                {step === 'done' && (
                    <motion.div key="d" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-20 text-center space-y-8">
                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto shadow-2xl">
                            <CheckCircle size={40} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-serif text-white">Sync Complete</h3>
                            <p className="max-w-md mx-auto text-white/40 text-sm mt-3">{importStats.success} premium listings have been injected into the global Malta Luxury database.</p>
                        </div>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => { setStep('upload'); setResult(null); }} className="px-10 py-4 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/5 transition-all">
                                Import More
                            </button>
                            <button onClick={onComplete} className="px-10 py-4 bg-gold text-luxury-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
                                View Listings Center →
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
