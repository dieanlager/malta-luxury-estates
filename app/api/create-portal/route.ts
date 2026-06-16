import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20' as any });

export async function POST(req: NextRequest) {
  try {
    const { agencyId } = await req.json() as { agencyId: string };
    const supabase = createServerSupabaseClient();

    const { data: agency } = await supabase
      .from('agencies')
      .select('stripe_customer_id')
      .eq('id', agencyId)
      .single();

    if (!agency?.stripe_customer_id) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.maltaluxuryrealestate.com';
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: agency.stripe_customer_id,
      return_url: `${siteUrl}/agency/portal`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
