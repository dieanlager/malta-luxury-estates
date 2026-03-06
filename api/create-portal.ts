import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20' as any })
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).end()

    const { agencyId } = req.body as { agencyId: string }

    const { data: agency } = await supabase
        .from('agencies')
        .select('stripe_customer_id')
        .eq('id', agencyId)
        .single()

    if (!agency?.stripe_customer_id) {
        return res.status(404).json({ error: 'No Stripe customer found' })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: agency.stripe_customer_id,
        return_url: `${process.env.VITE_URL || process.env.VERCEL_URL}/agency/portal`,
    })

    return res.status(200).json({ url: portalSession.url })
}
