// ============================================================
// MALTA LUXURY ESTATES — PLAN LIMITS ENGINE
// ============================================================

import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export type PlanId = 'basic' | 'pro' | 'featured';

export interface PlanConfig {
    id: PlanId;
    name: string;
    price: number;
    listingLimit: number;      // -1 = unlimited
    featuredListings: number;
    csvImport: boolean;
    aiAssist: boolean;
    analyticsAccess: boolean;
    supportLevel: 'community' | 'email' | 'priority';
    badge?: string;
}

export const PLANS: Record<PlanId, PlanConfig> = {
    basic: {
        id: 'basic',
        name: 'Basic',
        price: 0,
        listingLimit: 10,
        featuredListings: 0,
        csvImport: false,
        aiAssist: false,
        analyticsAccess: false,
        supportLevel: 'community',
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: 149,
        listingLimit: 100,
        featuredListings: 5,
        csvImport: true,
        aiAssist: true,
        analyticsAccess: true,
        supportLevel: 'email',
        badge: 'Most Popular',
    },
    featured: {
        id: 'featured',
        name: 'Featured',
        price: 299,
        listingLimit: -1,
        featuredListings: -1,
        csvImport: true,
        aiAssist: true,
        analyticsAccess: true,
        supportLevel: 'priority',
        badge: 'Best Value',
    },
};

export interface PlanStatus {
    plan: PlanConfig;
    currentCount: number;
    limit: number;
    isAtLimit: boolean;
    isNearLimit: boolean;      // >80% usage
    remainingSlots: number;
    usagePercent: number;
    canAddListing: boolean;
    canUseCSV: boolean;
    canUseAI: boolean;
}

export function usePlanStatus(agencyId: string | undefined, planId: PlanId = 'basic'): PlanStatus {
    const [currentCount, setCurrentCount] = useState(0);

    const fetchCount = async () => {
        if (!agencyId) return;
        const { count } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('agency_id', agencyId)
            .in('status', ['active', 'paused', 'draft']);
        setCurrentCount(count ?? 0);
    };

    useEffect(() => {
        if (!agencyId) return;
        fetchCount();

        // Realtime updates
        const channel = supabase
            .channel(`plan-updates-${agencyId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'properties',
                filter: `agency_id=eq.${agencyId}`
            }, () => fetchCount())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [agencyId]);

    const plan = PLANS[planId] || PLANS.basic;
    const limit = plan.listingLimit;
    const isUnlimited = limit === -1;

    const remainingSlots = isUnlimited ? 999 : Math.max(0, limit - currentCount);
    const usagePercent = isUnlimited ? 0 : Math.round((currentCount / Math.max(1, limit)) * 100);

    return {
        plan,
        currentCount,
        limit,
        isAtLimit: !isUnlimited && currentCount >= limit,
        isNearLimit: !isUnlimited && usagePercent >= 80,
        remainingSlots,
        usagePercent,
        canAddListing: isUnlimited || currentCount < limit,
        canUseCSV: plan.csvImport,
        canUseAI: plan.aiAssist,
    };
}
