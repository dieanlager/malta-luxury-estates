import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20' as any });

const PLAN_PRICES: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO!,
  featured: process.env.STRIPE_PRICE_FEATURED!,
};

export async function POST(req: NextRequest) {
  try {
    const { agencyId, plan = 'pro' } = await req.json() as { agencyId: string; plan?: 'pro' | 'featured' };

    if (!agencyId || !PLAN_PRICES[plan]) {
      return NextResponse.json({ error: 'Invalid agencyId or plan' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient() as any;
    const { data: agency, error } = await supabase
      .from('agencies')
      .select('id, name, email, stripe_customer_id')
      .eq('id', agencyId)
      .single();

    if (error || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    const stripe = getStripe();
    let customerId = agency.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: agency.email,
        name: agency.name,
        metadata: { supabase_agency_id: agencyId },
      });
      customerId = customer.id;
      await supabase.from('agencies').update({ stripe_customer_id: customerId }).eq('id', agencyId);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.maltaluxuryrealestate.com';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PLAN_PRICES[plan], quantity: 1 }],
      subscription_data: {
        trial_period_days: 30,
        metadata: { supabase_agency_id: agencyId, plan },
      } as any,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      success_url: `${siteUrl}/agency/portal?upgraded=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/agency/upgrade?cancelled=true`,
      metadata: { supabase_agency_id: agencyId, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}