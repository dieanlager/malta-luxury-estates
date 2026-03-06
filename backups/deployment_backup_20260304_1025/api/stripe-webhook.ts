import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20' as any,
})

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Wyłącz body parser — Stripe wymaga raw body dla weryfikacji podpisu
export const config = { api: { bodyParser: false } }

async function getRawBody(req: VercelRequest): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer) => chunks.push(chunk))
        req.on('end', () => resolve(Buffer.concat(chunks)))
        req.on('error', reject)
    })
}

// ── Plan mapping: Stripe Price ID → nasza nazwa planu ─────────
const PRICE_TO_PLAN: Record<string, string> = {
    [process.env.STRIPE_PRICE_PRO!]: 'pro',
    [process.env.STRIPE_PRICE_FEATURED!]: 'featured',
}

async function updateAgencyPlan(
    customerId: string,
    plan: string,
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'basic'
) {
    const finalPlan = status === 'canceled' ? 'basic' : plan

    // Mapuj Stripe status → czy agencja jest aktywna
    const active = !['canceled'].includes(status)

    await supabase
        .from('agencies')
        .update({
            plan: finalPlan,
            active,
            subscription_status: status,
            plan_updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).end()

    const rawBody = await getRawBody(req)
    const sig = req.headers['stripe-signature'] as string

    let event: Stripe.Event

    // Weryfikuj podpis — odrzuca fałszywe requesty
    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err: any) {
        console.error('Webhook signature failed:', err.message)
        return res.status(400).json({ error: `Webhook Error: ${err.message}` })
    }

    // ── Event handlers ────────────────────────────────────────
    try {
        switch (event.type) {

            // Trial started / subscription activated
            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const sub = event.data.object as Stripe.Subscription
                const priceId = sub.items.data[0]?.price.id
                const plan = PRICE_TO_PLAN[priceId] ?? 'pro'
                const status = sub.status as any

                await updateAgencyPlan(sub.customer as string, plan, status)

                // Zapisz subscription ID dla customer portal
                await supabase
                    .from('agencies')
                    .update({ stripe_subscription_id: sub.id })
                    .eq('stripe_customer_id', sub.customer as string)

                console.log(`✓ Subscription ${sub.status}: ${sub.customer} → ${plan}`)
                break
            }

            // Płatność nieudana — graceful degradation, nie blokujemy od razu
            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice
                const customerId = invoice.customer as string

                await supabase
                    .from('agencies')
                    .update({ subscription_status: 'past_due' })
                    .eq('stripe_customer_id', customerId)

                console.log(`⚠ Payment failed: ${customerId}`)
                break
            }

            // Anulowanie subskrypcji
            case 'customer.subscription.deleted': {
                const sub = event.data.object as Stripe.Subscription
                await updateAgencyPlan(sub.customer as string, 'basic', 'canceled')
                console.log(`✓ Subscription canceled: ${sub.customer}`)
                break
            }

            // Udana płatność (log dla rozliczeń)
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice
                console.log(`✓ Payment succeeded: ${invoice.customer} — €${(invoice.amount_paid / 100).toFixed(2)}`)
                break
            }

            default:
            // Ignoruj nieobsługiwane eventy
        }
    } catch (err: any) {
        console.error('Webhook handler error:', err)
        return res.status(500).json({ error: err.message })
    }

    // Stripe wymaga 200 żeby nie ponawiać eventu
    return res.status(200).json({ received: true })
}
