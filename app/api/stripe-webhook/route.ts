import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20' as any });

const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_PRO!]: 'pro',
  [process.env.STRIPE_PRICE_FEATURED!]: 'featured',
};

async function updateAgencyPlan(
  customerId: string,
  plan: string,
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'basic'
) {
  const supabase = createServerSupabaseClient() as any;
  const finalPlan = status === 'canceled' ? 'basic' : plan;
  await supabase
    .from('agencies')
    .update({
      plan: finalPlan,
      active: status !== 'canceled',
      subscription_status: status,
      plan_updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = createServerSupabaseClient() as any;

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price.id;
        const plan = PRICE_TO_PLAN[priceId] ?? 'pro';
        await updateAgencyPlan(sub.customer as string, plan, sub.status as any);
        await supabase
          .from('agencies')
          .update({ stripe_subscription_id: sub.id })
          .eq('stripe_customer_id', sub.customer as string);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await supabase
          .from('agencies')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', invoice.customer as string);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await updateAgencyPlan(sub.customer as string, 'basic', 'canceled');
        break;
      }
    }
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}