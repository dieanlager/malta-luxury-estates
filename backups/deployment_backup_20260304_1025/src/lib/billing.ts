import type { Plan } from './stripe'

// ── Plan definitions ──────────────────────────────────────────
export const PLANS = {
    basic: {
        name: 'Basic',
        price: 0,
        priceLabel: 'Free',
        description: 'Get started — perfect for small agencies',
        color: 'rgba(255,255,255,0.4)',
        limits: {
            listings: 10,
            photos: 5,  // per listing
            leadsPerMonth: 20,
            analytics: false,
            featuredSlots: 0,
            apiAccess: false,
            whiteLabel: false,
        },
        features: [
            '10 active listings',
            'Lead notifications via email',
            'Basic analytics dashboard',
            'Neighbourhood Intelligence cards',
        ],
    },

    pro: {
        name: 'Pro',
        price: 149,
        priceLabel: '€149 / month',
        description: 'For growing agencies — most popular',
        color: '#C5A059',
        trial: 30,  // days
        limits: {
            listings: Infinity,
            photos: 30,
            leadsPerMonth: Infinity,
            analytics: true,
            featuredSlots: 3,
            apiAccess: false,
            whiteLabel: false,
        },
        features: [
            'Unlimited listings',
            'Priority lead routing',
            'Full analytics + conversion tracking',
            '3 featured slots on homepage',
            'Investment PDF reports (branded)',
            'Price History Timeline',
            'Property Twin Finder (AI)',
            '30-day free trial',
        ],
    },

    featured: {
        name: 'Featured',
        price: 299,
        priceLabel: '€299 / month',
        description: 'Maximum visibility — for market leaders',
        color: '#E8D2A6',
        limits: {
            listings: Infinity,
            photos: 50,
            leadsPerMonth: Infinity,
            analytics: true,
            featuredSlots: 10,
            apiAccess: true,
            whiteLabel: true,
        },
        features: [
            'Everything in Pro',
            '10 featured slots (homepage + city pages)',
            'White-label Investment PDF reports',
            'API access for XML feed sync',
            'Dedicated account manager',
            'Priority support (4h response)',
            'Custom agency profile page',
        ],
    },
} as const satisfies Record<Plan, object>

// ── Feature gate helper ───────────────────────────────────────
// Użycie: canUse(agency.plan, 'analytics')
export function canUse(plan: Plan, feature: keyof typeof PLANS.pro.limits): boolean {
    const limit: any = PLANS[plan]?.limits[feature];
    if (typeof limit === 'boolean') return limit
    if (typeof limit === 'number') return limit > 0
    return false
}

// ── Listing limit check ───────────────────────────────────────
export function withinListingLimit(plan: Plan, currentCount: number): boolean {
    const limit = PLANS[plan].limits.listings
    return limit === Infinity || currentCount < limit
}

// ── Plan rank (for upgrade checks) ───────────────────────────
export const PLAN_RANK: Record<Plan, number> = {
    basic: 0, pro: 1, featured: 2,
}

export function isAtLeast(current: Plan, required: Plan): boolean {
    return PLAN_RANK[current] >= PLAN_RANK[required]
}
