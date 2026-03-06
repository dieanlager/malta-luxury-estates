import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, DollarSign, Percent, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../types';

interface ROICalculatorProps {
    property: Property;
}

export const ROICalculator: React.FC<ROICalculatorProps> = ({ property }) => {
    const [monthlyRent, setMonthlyRent] = useState<number>(Math.round(property.price * 0.0035));
    const [managementFeePercent, setManagementFeePercent] = useState<number>(10);
    const [maintenancePercent, setMaintenancePercent] = useState<number>(1);
    const [isTaxResidencyMalta, setIsTaxResidencyMalta] = useState<boolean>(true);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const calculations = useMemo(() => {
        const yearlyGrossRent = monthlyRent * 12;
        const managementFees = yearlyGrossRent * (managementFeePercent / 100);
        const maintenanceFees = property.price * (maintenancePercent / 100);
        const insurance = 350; // Average annual insurance

        const operatingExpenses = managementFees + maintenanceFees + insurance;
        const netIncomeBeforeTax = yearlyGrossRent - operatingExpenses;

        // Malta 15% flat rate on gross rent
        const tax = yearlyGrossRent * 0.15;
        const netIncomeAfterTax = netIncomeBeforeTax - tax;

        const grossYield = (yearlyGrossRent / property.price) * 100;
        const netYield = (netIncomeAfterTax / property.price) * 100;

        return {
            yearlyGrossRent,
            operatingExpenses,
            netIncomeAfterTax,
            grossYield,
            netYield,
            monthlyNet: netIncomeAfterTax / 12
        };
    }, [monthlyRent, property.price, managementFeePercent, maintenancePercent]);

    return (
        <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-black/20">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-8 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                aria-expanded={isExpanded}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-serif text-white">Investment <span className="text-gold italic">ROI Calculator</span></h3>
                        <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-1">Estimate your yields & returns</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Expected Net Yield</span>
                        <span className="text-2xl font-serif text-emerald-400">{calculations.netYield.toFixed(2)}%</span>
                    </div>
                    {isExpanded ? <ChevronUp size={24} className="text-white/20" /> : <ChevronDown size={24} className="text-white/20" />}
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="p-8 border-t border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Inputs */}
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Expected Monthly Rent</label>
                                        <span className="text-gold font-serif text-lg">€{monthlyRent.toLocaleString()}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={Math.round(property.price * 0.001)}
                                        max={Math.round(property.price * 0.01)}
                                        step={100}
                                        value={monthlyRent}
                                        onChange={(e) => setMonthlyRent(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-gold"
                                    />
                                    <div className="flex justify-between text-[10px] text-white/20">
                                        <span>Conservative</span>
                                        <span>Aggressive (Short-let)</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Management Fee (%)</label>
                                        <div className="relative">
                                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                            <input
                                                type="number"
                                                value={managementFeePercent}
                                                onChange={(e) => setManagementFeePercent(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-9 py-3 text-sm focus:border-gold outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Maintenance (%)</label>
                                        <div className="relative">
                                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                            <input
                                                type="number"
                                                value={maintenancePercent}
                                                onChange={(e) => setMaintenancePercent(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-9 py-3 text-sm focus:border-gold outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                        <DollarSign size={16} />
                                    </div>
                                    <div className="text-[11px] leading-relaxed text-emerald-400/80">
                                        <p className="font-bold mb-1">Malta Tax Optimization Enabled</p>
                                        <p>Calculated using the 15% flat rate on gross rental income. No annual wealth tax exists in Malta.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10">
                                    <TrendingUp className="text-gold mb-3" size={20} />
                                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Gross Yield</p>
                                    <p className="text-3xl font-serif text-white">{calculations.grossYield.toFixed(2)}%</p>
                                </div>
                                <div className="bg-emerald-500/5 rounded-[2rem] p-6 border border-emerald-500/10">
                                    <Percent className="text-emerald-400 mb-3" size={20} />
                                    <p className="text-[10px] text-emerald-400/60 uppercase font-bold tracking-widest mb-1">Net Yield</p>
                                    <p className="text-3xl font-serif text-emerald-400">{calculations.netYield.toFixed(2)}%</p>
                                </div>
                                <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 lg:col-span-2">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Estimated Monthly Net</p>
                                            <p className="text-4xl font-serif text-gold-gradient italic">€{Math.round(calculations.monthlyNet).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Yearly Net Cashflow</p>
                                            <p className="text-xl font-serif text-white">€{Math.round(calculations.netIncomeAfterTax).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-white/5 flex items-center gap-3">
                                        <Info className="text-white/20" size={14} />
                                        <p className="text-[10px] text-white/20 italic font-medium leading-relaxed">
                                            Estimates based on current 2026 market data. Includes 15% TA24 rental tax and operating reservations.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
