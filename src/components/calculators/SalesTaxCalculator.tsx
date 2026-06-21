'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLocale } from 'next-intl';
import { ShieldCheck, Info, Euro, Percent, Building } from 'lucide-react';
import { calculateSellingProceeds, SellingResult } from '../../lib/calculators/property-math';

export const SalesTaxCalculator = () => {
    const locale = useLocale();
    const [sellingPrice, setSellingPrice] = useState(750000);
    const [acquisitionType, setAcquisitionType] = useState<'standard' | 'pre2004' | 'aip'>('standard');
    const [isSoleResidence, setIsSoleResidence] = useState(false);
    const [agentFee, setAgentFee] = useState(5);
    const [result, setResult] = useState<SellingResult | null>(null);

    useEffect(() => {
        const res = calculateSellingProceeds({
            price: sellingPrice,
            acquisitionSystem: acquisitionType,
            isSoleResidence,
            agentFeePercent: agentFee
        });
        setResult(res);
    }, [sellingPrice, acquisitionType, isSoleResidence, agentFee]);

    return (
        <div className="glass-card rounded-[2.5rem] border border-amber-500/20 overflow-hidden bg-amber-500/5 backdrop-blur-3xl">
            <div className="p-8 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                        <ShieldCheck className="text-amber-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-serif text-white">{'Malta Property Sale Calculator'}</h3>
                        <p className="text-white/60 text-xs uppercase tracking-widest font-bold">{'FINAL WITHHOLDING TAX & NET PROCEEDS'}</p>
                    </div>
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-10">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">{'Selling Price'}</label>
                            <span className="text-amber-400 font-serif text-xl">€{sellingPrice.toLocaleString(locale)}</span>
                        </div>
                        <input
                            aria-label="Adjust value"

                            type="range"
                            min="100000"
                            max="10000000"
                            step="50000"
                            value={sellingPrice}
                            onChange={(e) => setSellingPrice(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'standard', label: 'Standard (post-2004)', rate: '8%' },
                            { id: 'pre2004', label: 'Pre-2004 Purchase', rate: '5%' },
                            { id: 'aip', label: 'AIP Property', rate: '12%' }
                        ].map(type => (
                            <button
                                key={type.id}
                                onClick={() => setAcquisitionType(type.id as any)}
                                className={`p-4 rounded-xl border text-left transition-all ${acquisitionType === type.id ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-white/5 border-white/10 text-white/60'}`}
                            >
                                <div className="text-[10px] font-bold uppercase tracking-widest mb-1">{type.label}</div>
                                <div className="text-lg font-serif">{type.rate}</div>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setIsSoleResidence(!isSoleResidence)}
                            className={`p-6 rounded-2xl border transition-all text-left ${isSoleResidence ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}
                        >
                            <div className="text-[10px] font-bold uppercase tracking-widest mb-1">{'Sole Residence Exemption'}</div>
                            <div className="text-xs">{isSoleResidence ? 'Tax Exempt' : 'Taxable'}</div>
                        </button>

                        <button
                            onClick={() => setAgentFee(agentFee === 5 ? 3.5 : 5)}
                            className={`p-6 rounded-2xl border transition-all text-left ${agentFee === 3.5 ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}
                        >
                            <div className="text-[10px] font-bold uppercase tracking-widest mb-1">{'Agent Fee'}</div>
                            <div className="text-xs">{`${agentFee}% commission`}</div>
                        </button>
                    </div>
                </div>

                <div>
                    <div className="bg-luxury-black/40 rounded-3xl p-8 border border-white/10 relative overflow-hidden h-full">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-8">{'FINANCIAL SUMMARY'}</h4>

                        <div className="space-y-6 mb-12">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white/60">{'Final Withholding Tax'}</span>
                                <span className="text-lg font-serif text-amber-400">€{result?.fwtTax.toLocaleString(locale)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white/60">{'Agency Commission'}</span>
                                <span className="text-lg font-serif">€{result?.agentFee.toLocaleString(locale)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white/60">{'Notary + EPC'}</span>
                                <span className="text-lg font-serif">€{(1500).toLocaleString(locale)}</span>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <div className="flex justify-between items-end mb-12">
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">{'NET PROCEEDS'}</div>
                                    <div className="text-xs text-white/60">{'After all taxes & fees'}</div>
                                </div>
                                <div className="text-4xl font-serif text-amber-400">€{result?.netProceeds.toLocaleString(locale)}</div>
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex gap-4 mt-auto">
                            <Info className="text-amber-500 shrink-0" size={20} />
                            <p className="text-[10px] text-white/60 leading-relaxed">
                                {'Figures are indicative. Consult a notary for exact calculations. Sole residence exemption conditions apply.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

