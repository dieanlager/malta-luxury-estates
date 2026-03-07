import React, { useState, useMemo } from 'react';
import { TrendingUp, Home, Key, Scale, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface YearlySnapshot {
    year: number;
    buyNetWorth: number;
    rentNetWorth: number;
    cumulativeRent: number;
    cumulativeMortgage: number;
    propertyValue: number;
    remainingLoan: number;
    investmentPortfolio: number;
}

// ─── Core Math ─────────────────────────────────────────────────────────────────
function runScenarios(
    propertyPrice: number,
    deposit: number,
    mortgageRate: number,
    mortgageTerm: number,
    monthlyRent: number,
    annualPropertyGrowth: number,
    investmentReturn: number,
    horizonYears: number,
    stampDuty: number,
    notaryFees: number,
    maintenancePct: number
): YearlySnapshot[] {
    const loanAmount = propertyPrice - deposit;
    const monthlyRate = mortgageRate / 100 / 12;
    const nPayments = mortgageTerm * 12;

    // Monthly mortgage payment
    const monthlyMortgage = monthlyRate === 0
        ? loanAmount / nPayments
        : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, nPayments)) /
        (Math.pow(1 + monthlyRate, nPayments) - 1);

    // Buying scenario: upfront costs deducted from investable capital
    const buyUpfrontCosts = deposit + stampDuty + notaryFees;
    // Renting scenario: invest equivalent capital
    const rentStartingInvestment = buyUpfrontCosts;

    const snapshots: YearlySnapshot[] = [];

    let currentLoan = loanAmount;
    let propertyValue = propertyPrice;
    let investmentPortfolio = rentStartingInvestment;
    let cumulativeRent = 0;
    let cumulativeMortgage = 0;

    for (let y = 1; y <= horizonYears; y++) {
        // ── BUY SCENARIO ──
        let newLoan = currentLoan;
        let yearMortgage = 0;
        for (let m = 0; m < 12; m++) {
            const interestPayment = newLoan * monthlyRate;
            const principalPayment = monthlyMortgage - interestPayment;
            newLoan = Math.max(0, newLoan - principalPayment);
            yearMortgage += monthlyMortgage;
        }
        currentLoan = newLoan;
        cumulativeMortgage += yearMortgage;
        propertyValue *= (1 + annualPropertyGrowth / 100);

        // Annual maintenance cost (reduces buy wealth)
        const maintenanceCost = propertyPrice * (maintenancePct / 100);

        // Buy net worth = property equity - outstanding loan - accumulated maintenance
        const equity = propertyValue - currentLoan;
        const buyNetWorth = equity - (maintenanceCost * y);

        // ── RENT SCENARIO ──
        cumulativeRent += monthlyRent * 12;
        // Rent savings vs mortgage: invest the difference if mortgage > rent
        const annualMortgageVsRent = Math.max(0, (monthlyMortgage - monthlyRent) * 12);
        // Also invest maintenance savings
        const annualMaintSaving = maintenanceCost;
        investmentPortfolio *= (1 + investmentReturn / 100);
        investmentPortfolio += annualMortgageVsRent + annualMaintSaving;

        const rentNetWorth = investmentPortfolio - cumulativeRent;

        snapshots.push({
            year: y,
            buyNetWorth,
            rentNetWorth,
            cumulativeRent,
            cumulativeMortgage,
            propertyValue,
            remainingLoan: currentLoan,
            investmentPortfolio,
        });
    }

    return snapshots;
}

// ─── Sliders ───────────────────────────────────────────────────────────────────
const Slider = ({
    label, value, min, max, step, onChange, format, color = 'gold',
}: {
    label: string; value: number; min: number; max: number; step: number;
    onChange: (v: number) => void; format: (v: number) => string; color?: string;
}) => {
    const colors: Record<string, string> = {
        gold: 'accent-yellow-500',
        violet: 'accent-violet-500',
        emerald: 'accent-emerald-500',
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</label>
                <span className={`font-serif text-lg ${color === 'gold' ? 'text-gold' : color === 'violet' ? 'text-violet-400' : 'text-emerald-400'}`}>
                    {format(value)}
                </span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(+e.target.value)}
                className={`w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer ${colors[color]}`}
            />
        </div>
    );
};

// ─── Timeline Bar Chart ────────────────────────────────────────────────────────
const TimelineChart = ({ snapshots, horizonYears }: { snapshots: YearlySnapshot[]; horizonYears: number }) => {
    const { t } = useTranslation();
    const allValues = snapshots.flatMap(s => [s.buyNetWorth, s.rentNetWorth]);
    const maxVal = Math.max(...allValues, 1);
    const minVal = Math.min(...allValues, 0);
    const range = maxVal - minVal;

    const toPercent = (v: number) => Math.max(0, ((v - minVal) / range) * 100);

    const milestone = 5;
    const years = snapshots.filter(s => s.year % milestone === 0 || s.year === 1 || s.year === horizonYears);

    return (
        <div className="relative">
            {/* Y-axis labels */}
            <div className="flex gap-3 items-end">
                <div className="flex flex-col justify-between h-48 text-right pr-1" style={{ minWidth: 64 }}>
                    {[maxVal, maxVal / 2, 0, minVal < 0 ? minVal : null].filter(Boolean).map((v, i) => (
                        <span key={i} className="text-[9px] text-white/20 font-mono">
                            {v! >= 1000000 ? `€${(v! / 1000000).toFixed(1)}M` : `€${Math.round(v! / 1000)}k`}
                        </span>
                    ))}
                </div>

                {/* Chart area */}
                <div className="flex-1 relative h-48">
                    {/* Zero line */}
                    {minVal < 0 && (
                        <div
                            className="absolute left-0 right-0 border-t border-white/10 border-dashed"
                            style={{ top: `${100 - toPercent(0)}%` }}
                        />
                    )}

                    {/* Bars */}
                    <div className="flex items-end h-full gap-1">
                        {snapshots.map(snap => {
                            const buyH = Math.abs(snap.buyNetWorth / range) * 100;
                            const rentH = Math.abs(snap.rentNetWorth / range) * 100;
                            const buyPos = snap.buyNetWorth >= 0;
                            const rentPos = snap.rentNetWorth >= 0;

                            return (
                                <div key={snap.year} className="flex-1 flex gap-px items-end h-full relative group">
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-max">
                                        <div className="bg-black/90 border border-white/10 rounded-xl p-3 text-[10px] space-y-1">
                                            <div className="text-white/40 text-center mb-1">{t('buy_vs_rent.years_full', { count: snap.year })}</div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-gold" />
                                                <span className="text-white/70">{t('buy_vs_rent.buy_path')}:</span>
                                                <span className="text-gold font-bold">
                                                    {snap.buyNetWorth >= 0 ? '+' : ''}€{Math.round(snap.buyNetWorth / 1000)}k
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-violet-400" />
                                                <span className="text-white/70">{t('buy_vs_rent.rent_path')}:</span>
                                                <span className="text-violet-400 font-bold">
                                                    {snap.rentNetWorth >= 0 ? '+' : ''}€{Math.round(snap.rentNetWorth / 1000)}k
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Buy bar */}
                                    <motion.div
                                        className={`flex-1 rounded-t-sm ${snap.buyNetWorth > snap.rentNetWorth ? 'bg-gold/80' : 'bg-gold/30'}`}
                                        style={{ height: `${Math.max(buyH, 1)}%` }}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(buyH, 1)}%` }}
                                        transition={{ duration: 0.8, delay: snap.year * 0.02, ease: 'easeOut' }}
                                    />
                                    {/* Rent bar */}
                                    <motion.div
                                        className={`flex-1 rounded-t-sm ${snap.rentNetWorth > snap.buyNetWorth ? 'bg-violet-500/80' : 'bg-violet-500/30'}`}
                                        style={{ height: `${Math.max(rentH, 1)}%` }}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(rentH, 1)}%` }}
                                        transition={{ duration: 0.8, delay: snap.year * 0.02 + 0.05, ease: 'easeOut' }}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Year labels */}
                    <div className="flex mt-2">
                        <div style={{ minWidth: 0 }} />
                        {snapshots.map(snap => (
                            <div key={snap.year} className="flex-1 text-center text-[9px] text-white/20">
                                {snap.year % milestone === 0 || snap.year === 1 ? snap.year : ''}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-gold/80" />
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t('buy_vs_rent.buy_path')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-violet-500/80" />
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t('buy_vs_rent.rent_path')}</span>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
export const BuyVsRentCalculator = () => {
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'en' ? 'en-EU' : i18n.language;
    const fmt = (n: number) => Math.round(n).toLocaleString(locale);
    const fmtEur = (n: number) => `€${fmt(n)}`;

    // ── Inputs ──
    const [propertyPrice, setPropertyPrice] = useState(450000);
    const [depositPct, setDepositPct] = useState(25);
    const [mortgageRate, setMortgageRate] = useState(4.25);
    const [mortgageTerm, setMortgageTerm] = useState(25);
    const [monthlyRent, setMonthlyRent] = useState(1800);
    const [horizonYears, setHorizonYears] = useState(10);
    const [propertyGrowth, setPropertyGrowth] = useState(3.5);
    const [investReturn, setInvestReturn] = useState(6.0);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [maintenancePct, setMaintenancePct] = useState(1.0);

    // Derived
    const deposit = Math.round(propertyPrice * (depositPct / 100));
    // Malta stamp duty estimate (5% first-time buyer rate simplified)
    const stampDuty = Math.round(propertyPrice * 0.05);
    const notaryFees = Math.round(propertyPrice * 0.011);

    // ── Calculate ──
    const snapshots = useMemo(() => runScenarios(
        propertyPrice, deposit, mortgageRate, mortgageTerm,
        monthlyRent, propertyGrowth, investReturn, horizonYears,
        stampDuty, notaryFees, maintenancePct
    ), [propertyPrice, deposit, mortgageRate, mortgageTerm,
        monthlyRent, propertyGrowth, investReturn, horizonYears,
        stampDuty, notaryFees, maintenancePct]);

    const final = snapshots[snapshots.length - 1];
    const buyWins = final ? final.buyNetWorth > final.rentNetWorth : false;
    const diff = final ? Math.abs(final.buyNetWorth - final.rentNetWorth) : 0;
    const breakEvenYear = snapshots.find(s => s.buyNetWorth >= s.rentNetWorth)?.year;

    const monthlyMortgagePmt = useMemo(() => {
        const l = propertyPrice - deposit;
        const r = mortgageRate / 100 / 12;
        const n = mortgageTerm * 12;
        return r === 0 ? l / n : (l * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }, [propertyPrice, deposit, mortgageRate, mortgageTerm]);

    return (
        <div className="glass-card rounded-[2.5rem] border border-violet-500/20 overflow-hidden bg-violet-500/5 backdrop-blur-3xl">

            {/* ── Header ── */}
            <div className="p-8 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center">
                        <Scale className="text-violet-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-serif text-white">{t('buy_vs_rent.title')}</h3>
                        <p className="text-white/40 text-xs uppercase tracking-widest font-bold">{t('buy_vs_rent.subtitle')}</p>
                    </div>
                </div>
                <p className="text-white/40 text-sm mt-3 max-w-2xl">
                    {t('buy_vs_rent.intro')}
                </p>
            </div>

            <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-12">

                {/* ── LEFT: INPUTS ── */}
                <div className="space-y-8">

                    {/* Property Cost */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Home size={14} className="text-gold" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gold">{t('buy_vs_rent.buying_scenario')}</span>
                        </div>

                        <Slider label={t('buy_vs_rent.property_price')} value={propertyPrice} min={100000} max={3000000} step={25000}
                            onChange={setPropertyPrice} format={fmtEur} color="gold" />

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('buy_vs_rent.deposit')}</label>
                                <div className="text-right">
                                    <span className="font-serif text-lg text-gold">{fmtEur(deposit)}</span>
                                    <span className="text-white/30 text-xs ml-2">({depositPct}%)</span>
                                </div>
                            </div>
                            <input type="range" min="20" max="80" step="5" value={depositPct}
                                onChange={e => setDepositPct(+e.target.value)}
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                        </div>

                        <Slider label={t('buy_vs_rent.mortgage_rate')} value={mortgageRate} min={2.5} max={7.0} step={0.05}
                            onChange={setMortgageRate} format={v => `${v.toFixed(2)}%`} color="gold" />

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 block">{t('buy_vs_rent.mortgage_term')}</label>
                            <div className="flex gap-2">
                                {[15, 20, 25, 30].map(y => (
                                    <button key={y} onClick={() => setMortgageTerm(y)}
                                        className={`flex-1 py-3 rounded-xl border text-[11px] font-bold transition-all ${mortgageTerm === y
                                            ? 'bg-gold text-luxury-black border-gold'
                                            : 'bg-white/5 border-white/10 text-white/40'}`}>
                                        {t('buy_vs_rent.years', { count: y })}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    {/* Renting + Investing */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Key size={14} className="text-violet-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">{t('buy_vs_rent.renting_scenario')}</span>
                        </div>

                        <Slider label={t('buy_vs_rent.monthly_rent')} value={monthlyRent} min={500} max={8000} step={50}
                            onChange={setMonthlyRent} format={fmtEur} color="violet" />

                        <Slider label={t('buy_vs_rent.investment_return')} value={investReturn}
                            min={2} max={12} step={0.25} onChange={setInvestReturn}
                            format={v => `${v.toFixed(2)}%`} color="violet" />
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    {/* Horizon + Market */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={14} className="text-emerald-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{t('buy_vs_rent.market_assumptions')}</span>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 block">{t('buy_vs_rent.time_horizon')}</label>
                            <div className="flex gap-2">
                                {[5, 7, 10, 15, 20].map(y => (
                                    <button key={y} onClick={() => setHorizonYears(y)}
                                        className={`flex-1 py-3 rounded-xl border text-[11px] font-bold transition-all ${horizonYears === y
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                            : 'bg-white/5 border-white/10 text-white/40'}`}>
                                        {t('buy_vs_rent.years_full', { count: y })}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Slider label={t('buy_vs_rent.property_appreciation')} value={propertyGrowth}
                            min={0} max={10} step={0.25} onChange={setPropertyGrowth}
                            format={v => `${v.toFixed(2)}%`} color="emerald" />

                        {/* Advanced Toggle */}
                        <button onClick={() => setShowAdvanced(v => !v)}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors">
                            <Info size={12} />
                            {showAdvanced ? t('buy_vs_rent.hide_advanced') : t('buy_vs_rent.show_advanced')}
                        </button>

                        <AnimatePresence>
                            {showAdvanced && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                                    <Slider label={t('buy_vs_rent.maintenance_costs')} value={maintenancePct}
                                        min={0.25} max={3} step={0.25} onChange={setMaintenancePct}
                                        format={v => `${v.toFixed(2)}%`} color="gold" />
                                    <div className="mt-4 p-4 rounded-2xl bg-white/3 border border-white/5 text-[10px] text-white/30 leading-relaxed">
                                        <strong className="text-white/50">{t('buy_vs_rent.stamp_duty_info')}</strong><br />
                                        <strong className="text-white/50">{t('buy_vs_rent.notary_fees_info')}</strong><br />
                                        {t('buy_vs_rent.upfront_costs_deduction')}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── RIGHT: RESULTS ── */}
                <div className="flex flex-col gap-6">

                    {/* ── VERDICT ── */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${buyWins}-${horizonYears}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className={`p-8 rounded-3xl border text-center relative overflow-hidden ${buyWins
                                ? 'bg-gold/10 border-gold/30'
                                : 'bg-violet-500/10 border-violet-500/30'}`}
                        >
                            <div className="absolute inset-0 opacity-10"
                                style={{ background: buyWins ? 'radial-gradient(circle at top right, #C5A059, transparent 70%)' : 'radial-gradient(circle at top right, #8b5cf6, transparent 70%)' }} />
                            <div className="relative z-10">
                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4 ${buyWins ? 'bg-gold/10 border-gold/30' : 'bg-violet-500/10 border-violet-500/30'}`}>
                                    {buyWins ? <Home size={12} className="text-gold" /> : <Key size={12} className="text-violet-400" />}
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${buyWins ? 'text-gold' : 'text-violet-400'}`}>
                                        {buyWins ? t('buy_vs_rent.buying_wins') : t('buy_vs_rent.renting_wins')}
                                    </span>
                                </div>
                                <div className={`text-4xl font-serif mb-2 ${buyWins ? 'text-gold' : 'text-violet-400'}`}>
                                    {fmtEur(diff)}
                                </div>
                                <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
                                    {buyWins
                                        ? t('buy_vs_rent.buying_better_off', { amount: fmtEur(diff), years: horizonYears })
                                        : t('buy_vs_rent.renting_better_off', { amount: fmtEur(diff), years: horizonYears })}
                                </p>
                                {breakEvenYear && !buyWins && (
                                    <div className="mt-4 text-[11px] text-white/40">
                                        {t('buy_vs_rent.outperform_info', { year: breakEvenYear })}
                                    </div>
                                )}
                                {buyWins && (
                                    <div className="mt-4 text-[11px] text-white/40">
                                        {t('buy_vs_rent.key_driver', { rate: propertyGrowth })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* ── DUAL SCENARIO NUMBERS ── */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* BUY */}
                        <div className="p-5 bg-gold/5 border border-gold/20 rounded-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-gold" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gold">{t('buy_vs_rent.buy_path')}</span>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-[10px] text-white/30 mb-0.5">{t('buy_vs_rent.net_worth_at', { year: horizonYears })}</div>
                                    <div className="font-serif text-xl text-white">{final ? fmtEur(final.buyNetWorth) : '—'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/30 mb-0.5">{t('buy_vs_rent.property_value')}</div>
                                    <div className="font-mono text-sm text-gold/80">{final ? fmtEur(final.propertyValue) : '—'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/30 mb-0.5">{t('buy_vs_rent.monthly_mortgage')}</div>
                                    <div className="font-mono text-sm text-white/70">{fmtEur(monthlyMortgagePmt)}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/30 mb-0.5">{t('buy_vs_rent.upfront_costs')}</div>
                                    <div className="font-mono text-sm text-red-400/70">{fmtEur(deposit + stampDuty + notaryFees)}</div>
                                </div>
                            </div>
                        </div>

                        {/* RENT */}
                        <div className="p-5 bg-violet-500/5 border border-violet-500/20 rounded-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-violet-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">{t('buy_vs_rent.rent_path')}</span>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-[10px] text-white/30 mb-0.5">{t('buy_vs_rent.net_worth_at', { year: horizonYears })}</div>
                                    <div className="font-serif text-xl text-white">{final ? fmtEur(final.rentNetWorth) : '—'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/30 mb-0.5">{t('buy_vs_rent.investment_portfolio')}</div>
                                    <div className="font-mono text-sm text-violet-400/80">{final ? fmtEur(final.investmentPortfolio) : '—'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/30 mb-0.5">{t('buy_vs_rent.monthly_rent')}</div>
                                    <div className="font-mono text-sm text-white/70">{fmtEur(monthlyRent)}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/30 mb-0.5">{t('buy_vs_rent.total_rent_paid')}</div>
                                    <div className="font-mono text-sm text-red-400/70">{final ? fmtEur(final.cumulativeRent) : '—'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── CHART ── */}
                    <div className="p-6 bg-white/3 border border-white/5 rounded-2xl">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp size={14} className="text-white/40" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                {t('buy_vs_rent.net_worth_over', { years: horizonYears })}
                            </span>
                        </div>
                        <TimelineChart snapshots={snapshots} horizonYears={horizonYears} />
                    </div>

                    {/* ── KEY INPUTS RECAP ── */}
                    <div className="p-5 bg-white/3 border border-white/5 rounded-2xl">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
                            <Info size={12} /> {t('buy_vs_rent.key_assumptions_title')}
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                            {[
                                [t('buy_vs_rent.property_price'), fmtEur(propertyPrice)],
                                [t('buy_vs_rent.deposit'), `${fmtEur(deposit)} (${depositPct}%)`],
                                [t('buy_vs_rent.mortgage_rate'), `${mortgageRate.toFixed(2)}%`],
                                [t('buy_vs_rent.mortgage_term'), t('buy_vs_rent.years_full', { count: mortgageTerm })],
                                [t('buy_vs_rent.monthly_rent'), fmtEur(monthlyRent)],
                                [t('buy_vs_rent.investment_return'), `${investReturn.toFixed(2)}%`],
                                [t('buy_vs_rent.property_appreciation'), `${propertyGrowth.toFixed(2)}%/yr`],
                                [t('buy_vs_rent.malta_stamp_duty'), fmtEur(stampDuty)],
                            ].map(([label, val]) => (
                                <div key={label} className="flex justify-between text-[11px]">
                                    <span className="text-white/25">{label}</span>
                                    <span className="text-white/60 font-mono">{val}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-white/20 mt-4 leading-relaxed">
                            {t('buy_vs_rent.disclaimer')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
