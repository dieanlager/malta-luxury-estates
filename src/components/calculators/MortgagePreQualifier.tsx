import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
    ShieldCheck, Banknote, User, Briefcase,
    AlertCircle, CheckCircle2, ChevronRight,
    ChevronLeft, Calculator, Building, Landmark,
    ArrowRight, Info, Building2, Globe, Home, TrendingUp
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'status' | 'employment' | 'income' | 'debts' | 'result';

interface FunnelData {
    residency: 'resident' | 'non-resident';
    buyerType: 'first' | 'second' | 'buy-to-let';
    employment: 'full-time' | 'self-employed' | 'other';
    monthlyIncome: number;
    monthlyDebts: number;
    savings: number;
    age: number;
}

// ─── Constants (Malta Specific) ───────────────────────────────────────────────
const RETIREMENT_AGE = 65;
const MAX_LOAN_RATIO = 0.90; // Resident LTV
const NON_RESIDENT_LTV = 0.75;
const DSR_LIMIT = 0.35; // Debt Service Ratio limit 35%
const STRESS_RATE = 0.0575; // 5.75% for stress testing capacity

export const MortgagePreQualifier: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [step, setStep] = useState<Step>('status');
    const [data, setData] = useState<FunnelData>({
        residency: 'resident',
        buyerType: 'first',
        employment: 'full-time',
        monthlyIncome: 3500,
        monthlyDebts: 200,
        savings: 30000,
        age: 30,
    });

    // ─── Calculations ───────────────────────────────────────────────────────────
    const results = useMemo(() => {
        const loanDuration = Math.min(40, RETIREMENT_AGE - data.age);
        const monthlyCapacity = (data.monthlyIncome * DSR_LIMIT) - data.monthlyDebts;

        // Standard formula for loan amount based on monthly payment, rate, duration
        const monthlyRate = STRESS_RATE / 12;
        const numPayments = loanDuration * 12;

        let maxLoan = monthlyCapacity * ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate);

        // LTV Cap
        const ltv = data.residency === 'resident' ? MAX_LOAN_RATIO : NON_RESIDENT_LTV;
        // maxLoan is the loan part, property price would be maxLoan + deposit
        // Usually people start with "How much can I borrow?"
        maxLoan = Math.max(0, Math.round(maxLoan / 1000) * 1000);

        const maxPropertyPrice = Math.round(maxLoan / ltv);
        const minDeposit = maxPropertyPrice - maxLoan;

        // Confidence Score (arbitrary)
        let score = 0;
        if (data.employment === 'full-time') score += 40;
        if (data.monthlyIncome > 4000) score += 30;
        if (data.monthlyDebts < 300) score += 20;
        if (data.savings > 50000) score += 10;

        return { maxLoan, maxPropertyPrice, minDeposit, loanDuration, score };
    }, [data]);

    // ─── Handlers ───────────────────────────────────────────────────────────────
    const updateData = (fields: Partial<FunnelData>) => setData(prev => ({ ...prev, ...fields }));

    const nextStep = () => {
        if (step === 'status') setStep('employment');
        else if (step === 'employment') setStep('income');
        else if (step === 'income') setStep('debts');
        else if (step === 'debts') setStep('result');
    };

    const prevStep = () => {
        if (step === 'employment') setStep('status');
        else if (step === 'income') setStep('employment');
        else if (step === 'debts') setStep('income');
        else if (step === 'result') setStep('debts');
    };

    // ─── UI Parts ───────────────────────────────────────────────────────────────
    const ProgressBar = () => {
        const steps: Step[] = ['status', 'employment', 'income', 'debts', 'result'];
        const idx = steps.indexOf(step);
        return (
            <div className="flex gap-2 mb-10">
                {steps.map((s, i) => (
                    <div
                        key={s}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= idx ? 'bg-gold' : 'bg-white/10'
                            }`}
                    />
                ))}
            </div>
        );
    };

    const OptionCard = ({
        active, label, icon: Icon, onClick, desc
    }: { active: boolean; label: string; icon: any; onClick: () => void; desc?: string }) => (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all ${active
                ? 'bg-gold/10 border-gold shadow-lg shadow-gold/5'
                : 'bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10'
                }`}
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${active ? 'bg-gold text-luxury-black' : 'bg-white/5 text-white/40'}`}>
                <Icon size={20} />
            </div>
            <div>
                <div className={`text-sm font-bold tracking-widest uppercase ${active ? 'text-white' : 'text-white/40'}`}>{label}</div>
                {desc && <div className="text-[10px] text-white/30 mt-1">{desc}</div>}
            </div>
        </button>
    );

    return (
        <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">

                {/* ── Left Sidebar: Progress / Real-time Estimate ── */}
                <div className="lg:col-span-4 bg-black/40 border-r border-white/5 p-10 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-gold mb-6">
                            <Landmark size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('pre_qualifier.subtitle')}</span>
                        </div>
                        <h2 className="text-2xl font-serif text-white mb-4">
                            {t('pre_qualifier.title')}
                        </h2>
                        <p className="text-sm text-white/40 leading-relaxed mb-10">
                            {t('pre_qualifier.intro')}
                        </p>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={results.maxLoan}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-6 bg-gold/5 border border-gold/20 rounded-2xl"
                            >
                                <div className="text-[9px] font-bold uppercase tracking-widest text-gold mb-2">{t('pre_qualifier.estimated_cap')}</div>
                                <div className="text-3xl font-serif text-white mb-2">€{results.maxLoan.toLocaleString(i18n.language)}</div>
                                <div className="text-[10px] text-white/30 leading-relaxed">
                                    {t('pre_qualifier.max_potential_loan', { years: results.loanDuration })}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] text-white/20 uppercase tracking-widest">
                            <ShieldCheck size={12} className="text-emerald-500" />
                            {t('pre_qualifier.bank_criteria')}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-white/20 uppercase tracking-widest">
                            <ShieldCheck size={12} className="text-emerald-500" />
                            {t('pre_qualifier.stress_test')}
                        </div>
                    </div>
                </div>

                {/* ── Right Content: Questions ── */}
                <div className="lg:col-span-8 p-10 md:p-16 flex flex-col justify-between bg-black/20">
                    <div>
                        <ProgressBar />

                        <AnimatePresence mode="wait">
                            {/* STEP: Status */}
                            {step === 'status' && (
                                <motion.div
                                    key="step-status"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-4 block">{t('pre_qualifier.steps.status')}</label>
                                    <h3 className="text-2xl font-serif text-white mb-10">{t('pre_qualifier.questions.residency')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                        <OptionCard
                                            active={data.residency === 'resident'}
                                            label={t('pre_qualifier.options.resident')}
                                            icon={User}
                                            onClick={() => updateData({ residency: 'resident' })}
                                            desc={t('pre_qualifier.options.resident_desc')}
                                        />
                                        <OptionCard
                                            active={data.residency === 'non-resident'}
                                            label={t('pre_qualifier.options.non_resident')}
                                            icon={Globe}
                                            onClick={() => updateData({ residency: 'non-resident' })}
                                            desc={t('pre_qualifier.options.non_resident_desc')}
                                        />
                                    </div>
                                    <h3 className="text-xl font-serif text-white mb-8">{t('pre_qualifier.questions.buyer_type')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <OptionCard
                                            active={data.buyerType === 'first'}
                                            label={t('pre_qualifier.options.first_time')}
                                            icon={Home}
                                            onClick={() => updateData({ buyerType: 'first' })}
                                        />
                                        <OptionCard
                                            active={data.buyerType === 'second'}
                                            label={t('pre_qualifier.options.second_time')}
                                            icon={Building2}
                                            onClick={() => updateData({ buyerType: 'second' })}
                                        />
                                        <OptionCard
                                            active={data.buyerType === 'buy-to-let'}
                                            label={t('pre_qualifier.options.investor')}
                                            icon={TrendingUp}
                                            onClick={() => updateData({ buyerType: 'buy-to-let' })}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP: Employment */}
                            {step === 'employment' && (
                                <motion.div
                                    key="step-emp"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-4 block">{t('pre_qualifier.steps.employment')}</label>
                                    <h3 className="text-2xl font-serif text-white mb-10">{t('pre_qualifier.questions.employment')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                                        <OptionCard
                                            active={data.employment === 'full-time'}
                                            label={t('pre_qualifier.options.full_time')}
                                            icon={Briefcase}
                                            onClick={() => updateData({ employment: 'full-time' })}
                                        />
                                        <OptionCard
                                            active={data.employment === 'self-employed'}
                                            label={t('pre_qualifier.options.self_employed')}
                                            icon={Calculator}
                                            onClick={() => updateData({ employment: 'self-employed' })}
                                        />
                                        <OptionCard
                                            active={data.employment === 'other'}
                                            label={t('pre_qualifier.options.other_employment')}
                                            icon={User}
                                            onClick={() => updateData({ employment: 'other' })}
                                        />
                                    </div>
                                    <div className="max-w-xs">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">{t('pre_qualifier.questions.age')}</label>
                                            <span className="text-lg font-serif text-white">{t('pre_qualifier.years', { count: data.age })}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="18"
                                            max="64"
                                            value={data.age}
                                            onChange={(e) => updateData({ age: parseInt(e.target.value) })}
                                            className="w-full accent-gold bg-white/10 rounded-lg cursor-pointer h-1.5"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP: Income */}
                            {step === 'income' && (
                                <motion.div
                                    key="step-income"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-4 block">{t('pre_qualifier.steps.income')}</label>
                                    <h3 className="text-2xl font-serif text-white mb-10">{t('pre_qualifier.questions.income')}</h3>

                                    <div className="space-y-12 max-w-md">
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">{t('pre_qualifier.labels.monthly_income')}</label>
                                                <span className="text-xl font-serif text-white">€{data.monthlyIncome.toLocaleString(i18n.language)}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1000"
                                                max="15000"
                                                step="100"
                                                value={data.monthlyIncome}
                                                onChange={(e) => updateData({ monthlyIncome: parseInt(e.target.value) })}
                                                className="w-full accent-gold bg-white/10 rounded-lg cursor-pointer h-1.5"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">{t('pre_qualifier.labels.savings')}</label>
                                                <span className="text-xl font-serif text-white">€{data.savings.toLocaleString(i18n.language)}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="5000"
                                                max="500000"
                                                step="5000"
                                                value={data.savings}
                                                onChange={(e) => updateData({ savings: parseInt(e.target.value) })}
                                                className="w-full accent-gold bg-white/10 rounded-lg cursor-pointer h-1.5"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP: Result */}
                            {step === 'result' && (
                                <motion.div
                                    key="step-result"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <CheckCircle2 className="text-emerald-400" size={24} />
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">{t('pre_qualifier.results.complete')}</label>
                                    </div>
                                    <h3 className="text-3xl font-serif text-white mb-10">{t('pre_qualifier.results.assessment')}</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                        <div className="p-8 bg-white/3 border border-white/5 rounded-3xl">
                                            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4">{t('pre_qualifier.results.max_value')}</div>
                                            <div className="text-4xl font-serif text-white mb-2">€{results.maxPropertyPrice.toLocaleString(i18n.language)}</div>
                                            <div className="text-[10px] text-white/40">{t('pre_qualifier.results.includes_deposit', { amount: `€${data.savings.toLocaleString(i18n.language)}` })}</div>
                                        </div>
                                        <div className="p-8 bg-gold/5 border border-gold/20 rounded-3xl">
                                            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold mb-4">{t('pre_qualifier.results.recommended_loan')}</div>
                                            <div className="text-4xl font-serif text-gold mb-2">€{results.maxLoan.toLocaleString(i18n.language)}</div>
                                            <div className="text-[10px] text-gold/40">{t('pre_qualifier.results.loan_term', { years: results.loanDuration })}</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4">
                                        <button className="flex-1 py-5 rounded-2xl bg-gold text-luxury-black text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 group">
                                            {t('pre_qualifier.results.official_quotation')}
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                        <button
                                            onClick={() => setStep('status')}
                                            className="px-10 py-5 rounded-2xl border border-white/10 text-white/40 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
                                        >
                                            {t('pre_qualifier.results.recalculate')}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP: Debts */}
                            {step === 'debts' && (
                                <motion.div
                                    key="step-debts"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-4 block">{t('pre_qualifier.steps.debts')}</label>
                                    <h3 className="text-2xl font-serif text-white mb-10">{t('pre_qualifier.questions.debts')}</h3>
                                    <p className="text-white/40 text-sm mb-12">{t('pre_qualifier.labels.debt_desc')}</p>

                                    <div className="max-w-md">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">{t('pre_qualifier.labels.monthly_debts')}</label>
                                            <span className="text-xl font-serif text-white">€{data.monthlyDebts.toLocaleString(i18n.language)}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="5000"
                                            step="50"
                                            value={data.monthlyDebts}
                                            onChange={(e) => updateData({ monthlyDebts: parseInt(e.target.value) })}
                                            className="w-full accent-gold bg-white/10 rounded-lg cursor-pointer h-1.5"
                                        />
                                        <div className="mt-12 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex gap-3">
                                            <AlertCircle className="text-amber-400 shrink-0" size={16} />
                                            <p className="text-[11px] text-amber-200/50 leading-relaxed uppercase tracking-wider font-bold">
                                                {t('pre_qualifier.labels.stress_test_warning')}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Nav Buttons */}
                    {step !== 'result' && (
                        <div className="flex items-center gap-4 pt-10 border-t border-white/5">
                            {step !== 'status' && (
                                <button
                                    onClick={prevStep}
                                    className="p-4 rounded-xl border border-white/10 text-white/40 hover:bg-white/5 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            <button
                                onClick={nextStep}
                                className="flex-1 py-4 bg-gold text-luxury-black rounded-xl text-xs font-bold uppercase tracking-widest
                           flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-gold/20 transition-all"
                            >
                                {t('pre_qualifier.next_step')}
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
