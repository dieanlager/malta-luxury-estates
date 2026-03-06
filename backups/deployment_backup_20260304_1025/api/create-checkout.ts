import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20' as any,
})

// Service-role client — bypasses RLS dla server-side operacji
const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const PLAN_PRICES: Record<string, string> = {
    pro: process.env.STRIPE_PRICE_PRO!,      // €149/mies
    featured: process.env.STRIPE_PRICE_FEATURED!, // €299/mies
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).end()

    const { agencyId, plan = 'pro' } = req.body as {
        agencyId: string
        plan?: 'pro' | 'featured'
    }

    if (!agencyId || !PLAN_PRICES[plan]) {
        return res.status(400).json({ error: 'Invalid agencyId or plan' })
    }

    // 1. Pobierz agencję z Supabase
    const { data: agency, error } = await supabase
        .from('agencies')
        .select('id, name, email, stripe_customer_id')
        .eq('id', agencyId)
        .single()

    if (error || !agency) {
        return res.status(404).json({ error: 'Agency not found' })
    }

    // 2. Utwórz lub pobierz Stripe Customer
    let customerId = agency.stripe_customer_id

    if (!customerId) {
        const customer = await stripe.customers.create({
            email: agency.email,
            name: agency.name,
            metadata: { supabase_agency_id: agencyId },
        })
        customerId = customer.id

        // Zapisz customer ID w Supabase
        await supabase
            .from('agencies')
            .update({ stripe_customer_id: customerId })
            .eq('id', agencyId)
    }

    // 3. Utwórz Checkout Session
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
            price: PLAN_PRICES[plan],
            quantity: 1,
        }],
        // 30-day free trial na Pro Plan
        subscription_data: {
            trial_period_days: 30,
            metadata: {
                supabase_agency_id: agencyId,
                plan,
            },
        } as any,
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        success_url: `${process.env.VITE_URL || process.env.VERCEL_URL}/agency/portal?upgraded=${plan}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.VITE_URL || process.env.VERCEL_URL}/agency/upgrade?cancelled=true`,
        metadata: {
            supabase_agency_id: agencyId,
            plan,
        },
    })

    return res.status(200).json({ url: session.url })
}
