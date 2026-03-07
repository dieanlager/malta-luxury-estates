import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Info, Euro, Percent, Building } from 'lucide-react';
import { calculateSellingProceeds, SellingResult } from '../../lib/calculators/property-math';

export const SalesTaxCalculator = () => {
    const { t, i18n } = useTranslation();
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
                        <h3 className="text-2xl font-serif text-white">{t('sales_tax.title')}</h3>
                        <p className="text-white/40 text-xs uppercase tracking-widest font-bold">{t('sales_tax.subtitle')}</p>
                    </div>
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-10">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('sales_tax.labels.selling_price')}</label>
                            <span className="text-amber-400 font-serif text-xl">€{sellingPrice.toLocaleString(i18n.language)}</span>
                        </div>
                        <input
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
                            { id: 'standard', label: t('sales_tax.options.standard'), rate: '8%' },
                            { id: 'pre2004', label: t('sales_tax.options.pre2004'), rate: '5%' },
                            { id: 'aip', label: t('sales_tax.options.aip'), rate: '12%' }
                        ].map(type => (
                            <button
                                key={type.id}
                                onClick={() => setAcquisitionType(type.id as any)}
                                className={`p-4 rounded-xl border text-left transition-all ${acquisitionType === type.id ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-white/5 border-white/10 text-white/40'}`}
                            >
                                <div className="text-[10px] font-bold uppercase tracking-widest mb-1">{type.label}</div>
                                <div className="text-lg font-serif">{type.rate}</div>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setIsSoleResidence(!isSoleResidence)}
                            className={`p-6 rounded-2xl border transition-all text-left ${isSoleResidence ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                        >
                            <div className="text-[10px] font-bold uppercase tracking-widest mb-1">{t('sales_tax.labels.sole_residence')}</div>
                            <div className="text-xs">{isSoleResidence ? t('sales_tax.labels.tax_exempt') : t('sales_tax.labels.taxable')}</div>
                        </button>

                        <button
                            onClick={() => setAgentFee(agentFee === 5 ? 3.5 : 5)}
                            className={`p-6 rounded-2xl border transition-all text-left ${agentFee === 3.5 ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                        >
                            <div className="text-[10px] font-bold uppercase tracking-widest mb-1">{t('sales_tax.labels.agent_fee')}</div>
                            <div className="text-xs">{t('sales_tax.labels.commission', { percent: agentFee })}</div>
                        </button>
                    </div>
                </div>

                <div>
                    <div className="bg-luxury-black/40 rounded-3xl p-8 border border-white/10 relative overflow-hidden h-full">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-8">{t('sales_tax.labels.financial_summary')}</h4>

                        <div className="space-y-6 mb-12">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white/60">{t('sales_tax.labels.fwt')}</span>
                                <span className="text-lg font-serif text-amber-400">€{result?.fwtTax.toLocaleString(i18n.language)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white/60">{t('sales_tax.labels.agency_commission')}</span>
                                <span className="text-lg font-serif">€{result?.agentFee.toLocaleString(i18n.language)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white/60">{t('sales_tax.labels.notary_epc')}</span>
                                <span className="text-lg font-serif">€{(1500).toLocaleString(i18n.language)}</span>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <div className="flex justify-between items-end mb-12">
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">{t('sales_tax.labels.net_proceeds')}</div>
                                    <div className="text-xs text-white/40">{t('sales_tax.labels.after_taxes')}</div>
                                </div>
                                <div className="text-4xl font-serif text-amber-400">€{result?.netProceeds.toLocaleString(i18n.language)}</div>
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex gap-4 mt-auto">
                            <Info className="text-amber-500 shrink-0" size={20} />
                            <p className="text-[10px] text-white/40 leading-relaxed">
                                {t('sales_tax.disclaimer')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
