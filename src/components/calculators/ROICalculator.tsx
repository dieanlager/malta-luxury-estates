import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Euro, PieChart, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { calculateROI, ROIResult } from '../../lib/calculators/property-math';

export const ROICalculator = () => {
    const { t, i18n } = useTranslation();
    const [purchasePrice, setPurchasePrice] = useState(500000);
    const [buyingCostsPercent, setBuyingCostsPercent] = useState(6.5);
    const [monthlyRent, setMonthlyRent] = useState(2500);
    const [monthlyExp, setMonthlyExp] = useState(200);
    const [managementFee, setManagementFee] = useState(10);
    const [result, setResult] = useState<ROIResult | null>(null);

    useEffect(() => {
        const buyingCosts = purchasePrice * (buyingCostsPercent / 100);
        const res = calculateROI({
            purchasePrice,
            buyingCosts,
            monthlyRent,
            monthlyExpenses: monthlyExp,
            managementFeePercent: managementFee
        });
        setResult(res);
    }, [purchasePrice, buyingCostsPercent, monthlyRent, monthlyExp, managementFee]);

    const locale = i18n.language === 'en' ? 'en-EU' : i18n.language;
    const fmtItems = (n: number) => Math.round(n).toLocaleString(locale);

    return (
        <div className="glass-card rounded-[2.5rem] border border-emerald-500/20 overflow-hidden bg-emerald-500/5 backdrop-blur-3xl">
            <div className="p-8 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                        <TrendingUp className="text-emerald-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-serif text-white">{t('roi.title')}</h3>
                        <p className="text-white/40 text-xs uppercase tracking-widest font-bold">{t('roi.subtitle')}</p>
                    </div>
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* INPUTS */}
                <div className="space-y-10">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('roi.total_investment')}</label>
                            <span className="text-emerald-400 font-serif text-xl">€{fmtItems(purchasePrice)}</span>
                        </div>
                        <input
                            type="range"
                            min="100000"
                            max="5000000"
                            step="50000"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-4">{t('roi.monthly_rent')}</label>
                            <div className="relative">
                                <Euro className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                <input
                                    type="number"
                                    value={monthlyRent}
                                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-serif focus:border-emerald-500 outline-none transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-4">{t('roi.monthly_expenses')}</label>
                            <div className="relative">
                                <Euro className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                <input
                                    type="number"
                                    value={monthlyExp}
                                    onChange={(e) => setMonthlyExp(Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-serif focus:border-emerald-500 outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-4">{t('roi.management_fee')}</label>
                        <div className="flex gap-4">
                            {[0, 5, 8, 10, 15].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setManagementFee(v)}
                                    className={`flex-1 py-3 rounded-xl border text-[10px] font-bold transition-all ${managementFee === v ? 'bg-emerald-500 text-luxury-black border-emerald-500' : 'bg-white/5 border-white/10 text-white/40'}`}
                                >
                                    {v}%
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RESULTS */}
                <div className="relative">
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 border-b-emerald-500/50">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{t('roi.net_yearly_profit')}</div>
                            <div className="text-3xl font-serif text-emerald-400">€{fmtItems(result?.netYearlyRent ?? 0)}</div>
                        </div>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 border-b-blue-500/50">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{t('roi.rental_tax')}</div>
                            <div className="text-3xl font-serif text-blue-400 text-right">€{fmtItems(result?.rentalTax ?? 0)}</div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-end p-6 bg-white/5 rounded-3xl border border-white/10">
                            <div className="flex items-center gap-3">
                                <Activity className="text-emerald-400" size={24} />
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">{t('roi.net_yield')}</div>
                                    <div className="text-sm text-emerald-400/60 font-serif">{t('roi.reality_check')}</div>
                                </div>
                            </div>
                            <div className="text-4xl font-serif text-emerald-400">{result?.netYield.toFixed(2)}%</div>
                        </div>

                        <div className="flex justify-between items-center p-4 px-6 border border-white/5 rounded-2xl">
                            <span className="text-xs text-white/40">{t('roi.gross_yield')}</span>
                            <span className="text-lg font-serif">{result?.grossYield.toFixed(2)}%</span>
                        </div>

                        <div className="flex justify-between items-center p-4 px-6 border border-white/5 rounded-2xl">
                            <span className="text-xs text-white/40">{t('roi.capital_repayment')}</span>
                            <span className="text-lg font-serif">{t('roi.years', { count: Number(result?.paybackPeriodYears.toFixed(1)) })}</span>
                        </div>
                    </div>

                    <div className="mt-8 p-6 glass-card rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
                        <div className="flex gap-4">
                            <PieChart className="text-emerald-400 shrink-0" size={20} />
                            <div>
                                <h4 className="text-sm font-serif mb-1">{t('roi.investor_insight.title')}</h4>
                                <p className="text-[11px] text-white/50 leading-relaxed">
                                    {t('roi.investor_insight.description')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
