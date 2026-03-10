import React from 'react';
import { PlanStatus, PLANS, PlanId } from '../../lib/planLimits';
import { Lock, Zap, Crown, AlertTriangle, CheckCircle } from 'lucide-react';

// --- Feature Gate: For specific features (AI Assist, CSV Import) ---
export function FeatureGate({
    status,
    requiredPlan = 'pro',
    featureLabel,
    children,
    onUpgrade,
}: {
    status: PlanStatus;
    requiredPlan?: PlanId;
    featureLabel?: string;
    children: React.ReactNode;
    onUpgrade: () => void;
}) {
    const planOrder: PlanId[] = ['basic', 'pro', 'featured'];
    const hasAccess = planOrder.indexOf(status.plan.id) >= planOrder.indexOf(requiredPlan);
    if (hasAccess) return <>{children}</>;

    const req = PLANS[requiredPlan];
    return (
        <div className="relative">
            <div className="opacity-20 pointer-events-none grayscale select-none">{children}</div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <button
                    onClick={onUpgrade}
                    className="group flex flex-col items-center gap-3 p-6 rounded-3xl bg-gold/10 border border-gold/20 backdrop-blur-md shadow-2xl transition-all hover:bg-gold/20 hover:scale-105"
                >
                    <div className="w-12 h-12 rounded-2xl bg-gold/20 flex items-center justify-center text-gold">
                        <Lock size={20} />
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">{featureLabel || 'Premium Feature'}</p>
                        <p className="text-xs text-white/60 font-medium">Upgrade to {req.name} (€{req.price}/mo)</p>
                    </div>
                    <Zap size={14} className="text-gold" />
                </button>
            </div>
        </div>
    );
}

// --- Listing Limit Gate: For the "Add New Listing" action ---
export function ListingLimitGate({
    status,
    children,
    onUpgrade,
}: {
    status: PlanStatus;
    children: React.ReactNode;
    onUpgrade: () => void;
}) {
    return (
        <div className="space-y-6 w-full">
            {!status.isAtLimit && (
                <>
                    {children}
                    {status.isNearLimit && <WarningBanner status={status} onUpgrade={onUpgrade} />}
                </>
            )}
            {status.isAtLimit && <LimitReachedBlock status={status} onUpgrade={onUpgrade} />}
        </div>
    );
}

function WarningBanner({ status, onUpgrade }: { status: PlanStatus; onUpgrade: () => void }) {
    return (
        <div className="flex items-center gap-5 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 flex-shrink-0">
                <AlertTriangle size={24} />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-serif text-white italic">Approaching Asset Limit</h4>
                <p className="text-xs text-white/40 mb-3">{status.currentCount} of {status.limit} slots utilized.</p>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${status.usagePercent}%` }} />
                </div>
            </div>
            <button
                onClick={onUpgrade}
                className="px-6 py-3 bg-amber-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-700 transition-all flex-shrink-0"
            >
                Expand Capacity
            </button>
        </div>
    );
}

function LimitReachedBlock({ status, onUpgrade }: { status: PlanStatus; onUpgrade: () => void }) {
    const nextPlan = status.plan.id === 'basic' ? PLANS.pro : PLANS.featured;
    return (
        <div className="p-12 text-center rounded-[3rem] border border-white/5 bg-white/[0.02] space-y-8">
            <div className="w-20 h-20 rounded-[2rem] bg-gold/5 border border-gold/10 flex items-center justify-center text-gold mx-auto shadow-2xl">
                <Crown size={40} />
            </div>
            <div className="max-w-md mx-auto">
                <h3 className="text-3xl font-serif text-white mb-3 italic">Vault Capacity Reached</h3>
                <p className="text-white/30 text-sm leading-relaxed">
                    Your current {status.plan.name} plan includes a limit of {status.limit} premium listings.
                    To broadcast more exclusive properties to our global audience, an upgrade is required.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
                <div className="flex-1 p-6 rounded-3xl border border-gold/40 bg-gold/5 text-left transition-all hover:scale-105">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gold">{nextPlan.name} Plan</span>
                        <span className="text-[9px] font-mono text-white/20">€{nextPlan.price}/mo</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                        {[
                            `Limit: ${nextPlan.listingLimit === -1 ? 'Unlimited' : nextPlan.listingLimit} Listings`,
                            'Bulk CSV Synchronization',
                            'AI Intelligence for Listings',
                            'Advanced Performance Data'
                        ].map(benefit => (
                            <li key={benefit} className="flex items-center gap-2 text-[10px] text-white/60">
                                <CheckCircle size={10} className="text-gold" /> {benefit}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={onUpgrade}
                        className="w-full py-3 bg-gold text-luxury-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Request Upgrade →
                    </button>
                </div>
            </div>

            <p className="text-[10px] font-mono text-white/10 uppercase tracking-widest">Instant Activation • Cancel Anytime • Expert Support</p>
        </div>
    );
}
