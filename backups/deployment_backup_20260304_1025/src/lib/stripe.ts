export type Plan = 'basic' | 'pro' | 'featured'

// ── Redirect do Stripe Checkout ───────────────────────────────
export async function startCheckout(agencyId: string, plan: Plan = 'pro') {
    const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId, plan }),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Checkout failed')
    }

    const { url } = await res.json()
    window.location.href = url
}

// ── Redirect do Stripe Customer Portal (manage billing) ───────
export async function openBillingPortal(agencyId: string) {
    const res = await fetch('/api/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId }),
    })

    if (!res.ok) throw new Error('Portal redirect failed')

    const { url } = await res.json()
    window.location.href = url
}
