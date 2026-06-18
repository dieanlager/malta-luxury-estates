import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function requireAdmin(req: NextRequest) {
  return req.headers.get('x-admin-key') === (process.env.ADMIN_KEY || 'malta2026admin');
}

export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const p = await req.json();
  if (!p.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const featuresStr = Array.isArray(p.features) && p.features.length
    ? `[FEATURES:${p.features.join(',')}]\n` : '';
  const desc = (p.affiliate_url ? `[AFFILIATE_URL:${p.affiliate_url}]\n` : '') + featuresStr + (p.description || '');

  const { data, error } = await getSupabase().from('properties').update({
    title: p.title,
    price: Number(p.price),
    bedrooms: Number(p.beds) || null,
    bathrooms: Number(p.baths) || null,
    area_sqm: Number(p.sqm) || null,
    location_text: p.location_text,
    listing_type: p.listing_type || 'sale',
    status: p.status || 'active',
    listing_status: p.status || 'active',
    is_seafront: Boolean(p.is_seafront),
    has_pool: Boolean(p.has_pool),
    has_garage: Boolean(p.has_garage),
    description: desc,
    seo_title: p.seo_title || null,
    seo_description: p.seo_description || null,
    featured: p.featured || false,
    featured_position: p.featured_position || null,
    featured_badge: p.featured_badge || null,
    images: p.images || [],
  }).eq('id', p.id).select('id').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
