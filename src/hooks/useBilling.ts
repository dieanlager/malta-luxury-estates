import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { startCheckout, openBillingPortal, type Plan } from '../lib/stripe'
import { canUse, isAtLeast, withinListingLimit, PLANS } from '../lib/billing'

export function useBilling() {
    const { agency } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const plan = (agency?.plan ?? 'basic') as Plan
    const planDetails = PLANS[plan]

    async function upgrade(targetPlan: 'pro' | 'featured' = 'pro') {
        if (!agency) return
        setError(null)
        setLoading(true)
        try {
            await startCheckout(agency.id, targetPlan)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function manageBilling() {
        if (!agency) return
        setLoading(true)
        try {
            await openBillingPortal(agency.id)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return {
        plan,
        planDetails,
        isPro: isAtLeast(plan, 'pro'),
        isFeatured: isAtLeast(plan, 'featured'),

        // Feature checks
        can: (feature: keyof typeof PLANS.pro.limits) => canUse(plan, feature),
        withinListingLimit: (count: number) => withinListingLimit(plan, count),

        // Actions
        upgrade,
        manageBilling,
        loading,
        error,
    }
}
