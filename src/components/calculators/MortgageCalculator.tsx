import React, { useState, useEffect } from 'react';
import { Home, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MortgageResult {
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
    loanAmount: number;
    ltv: number;
    monthlyBreakdown: {
        principal: number;
        interest: number;
    };
}

export interface MortgageInput {
    propertyPrice: number;
    deposit: number;
    interestRate: number;
    termYears: number;
    isResident: boolean;
}

function calculateMortgage(params: MortgageInput): MortgageResult {
    const loanAmount = params.propertyPrice - params.deposit;
    const monthlyRate = params.interestRate / 100 / 12;
    const nPayments = params.termYears * 12;
    const ltv = (loanAmount / params.propertyPrice) * 100;

    const monthlyPayment = monthlyRate === 0
        ? loanAmount / nPayments
        : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, nPayments))
        / (Math.pow(1 + monthlyRate, nPayments) - 1);

    const totalPayment = monthlyPayment * nPayments;
    const totalInterest = totalPayment - loanAmount;
    const firstMonthInterest = loanAmount * monthlyRate;
    const firstMonthPrincipal = monthlyPayment - firstMonthInterest;

    return {
        monthlyPayment,
        totalPayment,
        totalInterest,
        loanAmount,
        ltv,
        monthlyBreakdown: { principal: firstMonthPrincipal, interest: firstMonthInterest },
    };
}

export const MortgageCalculator = () => {
    const { t, i18n } = useTranslation();
    const [propertyPrice, setPropertyPrice] = useState(600000);
    const [depositPct, setDepositPct] = useState(30);
    const [interestRate, setInterestRate] = useState(4.75);
    const [termYears, setTermYears] = useState(25);
    const [isResident, setIsResident] = useState(false);
    const [result, setResult] = useState<MortgageResult | null>(null);

    const deposit = Math.round(propertyPrice * (depositPct / 100));
    const maxLTV = isResident ? 90 : 70;

    useEffect(() => {
        const effectiveDeposit = Math.max(deposit, propertyPrice * (1 - maxLTV / 100));
        const res = calculateMortgage({
            propertyPrice,
            deposit: effectiveDeposit,
            interestRate,
            termYears,
            isResident,
        });
        setResult(res);
    }, [propertyPrice, depositPct, interestRate, termYears, isResident, maxLTV]);

    const locale = i18n.language === 'en' ? 'en-EU' : i18n.language;
    const fmtItems = (n: number) => Math.round(n).toLocaleString(locale);

    // LTV bar colour
    const ltvColor = result
        ? result.ltv > 80 ? 'bg-red-500' : result.ltv > 65 ? 'bg-amber-500' : 'bg-emerald-500'
        : 'bg-gold';

    const banks = [
        { name: 'BOV', rate: '3.50% – 4.25%', note: isResident ? t('mortgage.bank_notes.variable_resident') : t('mortgage.bank_notes.variable_non_resident') },
        { name: 'HSBC Malta', rate: '3.80% – 4.60%', note: isResident ? t('mortgage.bank_notes.variable_resident') : t('mortgage.bank_notes.variable_non_resident') },
        { name: 'APS Bank', rate: '4.10% – 4.85%', note: t('mortgage.bank_notes.fixed_5y') },
        { name: 'MFC', rate: '4.50% – 5.25%', note: t('mortgage.bank_notes.non_resident_btl') },
    ];

    return (
        <div className="glass-card rounded-[2.5rem] border border-blue-500/20 overflow-hidden bg-blue-500/5 backdrop-blur-3xl">
            {/* Header */}
            <div className="p-8 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                        <Home className="text-blue-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-serif text-white">{t('mortgage.title')}</h3>
                        <p className="text-white/40 text-xs uppercase tracking-widest font-bold">{t('mortgage.subtitle')}</p>
                    </div>
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* INPUTS */}
                <div className="space-y-9">

                    {/* Resident toggle */}
                    <div className="flex gap-3">
                        {[
                            { val: false, label: t('mortgage.non_resident'), sub: t('mortgage.max_ltv', { ltv: 70 }), color: 'border-amber-500 bg-amber-500/10 text-amber-400' },
                            { val: true, label: t('mortgage.tax_resident'), sub: t('mortgage.max_ltv', { ltv: 90 }), color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
                        ].map(opt => (
                            <button key={String(opt.val)} onClick={() => setIsResident(opt.val)}
                                className={`flex-1 p-4 rounded-2xl border text-left transition-all ${isResident === opt.val ? opt.color : 'border-white/10 bg-white/5 text-white/40'}`}>
                                <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5">{opt.label}</div>
                                <div className="text-xs">{opt.sub}</div>
                            </button>
                        ))}
                    </div>

                    {/* Property Price */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('mortgage.property_price')}</label>
                            <span className="text-blue-400 font-serif text-xl">€{fmtItems(propertyPrice)}</span>
                        </div>
                        <input type="range" min="100000" max="5000000" step="25000" value={propertyPrice}
                            onChange={e => setPropertyPrice(+e.target.value)}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        <div className="flex justify-between text-[10px] text-white/20 mt-1">
                            <span>€100k</span><span>€5M</span>
                        </div>
                    </div>

                    {/* Deposit */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('mortgage.deposit')}</label>
                            <div className="text-right">
                                <span className="text-blue-400 font-serif text-xl">€{fmtItems(deposit)}</span>
                                <span className="text-white/30 text-xs ml-2">({depositPct}%)</span>
                            </div>
                        </div>
                        <input type="range" min={isResident ? 10 : 30} max={80} step="5" value={depositPct}
                            onChange={e => setDepositPct(+e.target.value)}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        <div className="flex justify-between text-[10px] text-white/20 mt-1">
                            <span>{isResident ? '10%' : '30%'} min</span><span>80%</span>
                        </div>
                    </div>

                    {/* Interest Rate */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('mortgage.interest_rate')}</label>
                            <span className="text-blue-400 font-serif text-xl">{interestRate.toFixed(2)}%</span>
                        </div>
                        <input type="range" min="2.5" max="7" step="0.05" value={interestRate}
                            onChange={e => setInterestRate(+e.target.value)}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        <div className="flex justify-between text-[10px] text-white/20 mt-1">
                            <span>2.5%</span><span>7.0%</span>
                        </div>
                    </div>

                    {/* Term */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('mortgage.loan_term')}</label>
                            <span className="text-blue-400 font-serif text-xl">{t('mortgage.years', { count: termYears })}</span>
                        </div>
                        <div className="flex gap-2">
                            {[10, 15, 20, 25, 30].map(y => (
                                <button key={y} onClick={() => setTermYears(y)}
                                    className={`flex-1 py-3 rounded-xl border text-[11px] font-bold transition-all ${termYears === y ? 'bg-blue-500 text-white border-blue-500' : 'bg-white/5 border-white/10 text-white/40'}`}>
                                    {t('mortgage.years_short', { count: y })}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RESULTS */}
                <div className="space-y-5">

                    {/* Monthly Payment — Hero */}
                    <div className="p-8 rounded-3xl bg-blue-500/10 border border-blue-500/30 text-center">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400/60 mb-2">{t('mortgage.monthly_repayment')}</div>
                        <div className="text-5xl font-serif text-blue-400 mb-1">€{fmtItems(result?.monthlyPayment ?? 0)}</div>
                        <div className="text-xs text-white/30">{t('mortgage.breakdown')}</div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{t('mortgage.loan_amount')}</div>
                            <div className="text-xl font-serif">€{fmtItems(result?.loanAmount ?? 0)}</div>
                        </div>
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{t('mortgage.total_interest')}</div>
                            <div className="text-xl font-serif text-red-400/80">€{fmtItems(result?.totalInterest ?? 0)}</div>
                        </div>
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{t('mortgage.total_repayment')}</div>
                            <div className="text-xl font-serif">€{fmtItems(result?.totalPayment ?? 0)}</div>
                        </div>
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{t('mortgage.ltv_ratio')}</div>
                            <div className={`text-xl font-serif ${(result?.ltv ?? 0) > maxLTV ? 'text-red-400' : 'text-emerald-400'}`}>
                                {result?.ltv.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* LTV Bar */}
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">
                            <span>{t('mortgage.ltv_ratio')}</span>
                            <span>{t('mortgage.ltv_max_info', { ltv: maxLTV, type: isResident ? t('mortgage.residents') : t('mortgage.non_residents') })}</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${ltvColor}`}
                                style={{ width: `${Math.min(result?.ltv ?? 0, 100)}%` }} />
                        </div>
                    </div>

                    {/* 2026 Bank Rates */}
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
                            <Info size={12} className="text-blue-400" /> {t('mortgage.bank_rates')}
                        </div>
                        <div className="space-y-2">
                            {banks.map(b => (
                                <div key={b.name} className="flex justify-between items-center">
                                    <span className="text-xs font-serif text-white/60">{b.name}</span>
                                    <div className="text-right">
                                        <span className="text-xs text-blue-400 font-bold">{b.rate}</span>
                                        <span className="text-[10px] text-white/25 ml-2">{b.note}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Warning if LTV too high */}
                    {(result?.ltv ?? 0) > maxLTV && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-[11px] text-red-400 leading-relaxed">
                            {t('mortgage.ltv_warning', { min: isResident ? 10 : 30, type: isResident ? t('mortgage.residents') : t('mortgage.non_residents'), max: maxLTV })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
