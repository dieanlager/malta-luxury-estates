import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function requireAdmin(req: NextRequest) {
  return req.headers.get('x-admin-key') === (process.env.ADMIN_KEY || 'malta2026admin');
}

function generateCleanSlug(title: string, location: string): string {
  const combined = (location ? location + '-' : '') + title;
  return combined.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function fmtPrice(v: number) {
  if (v >= 1000000) return `€${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `€${(v / 1000).toFixed(0)}k`;
  return `€${v.toLocaleString()}`;
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const p = await req.json();

  let baseSlug = p.slug
    ? p.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    : generateCleanSlug(p.title || '', p.location_text || '');

  let slug = baseSlug;
  let counter = 2;
  while (true) {
    const { data: existing } = await supabase.from('properties').select('id').eq('slug', slug).maybeSingle();
    if (!existing) break;
    slug = baseSlug + '-' + counter++;
  }

  const featuresStr = Array.isArray(p.features) && p.features.length
    ? `[FEATURES:${p.features.join(',')}]\n` : '';
  const desc = (p.affiliate_url ? `[AFFILIATE_URL:${p.affiliate_url}]\n` : '') + featuresStr + (p.description || '');

  const { data, error } = await supabase.from('properties').insert([{
    title: p.title, slug,
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
  }]).select('id').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.maltaluxuryrealestate.com';
    const thumb = p.images?.[0] ? `<img src="${p.images[0]}" style="max-width:200px;border-radius:4px;margin-top:12px" />` : '';
    await resend.emails.send({
      from: `Malta Luxury Estates <${process.env.RESEND_FROM_EMAIL || 'noreply@maltaluxuryrealestate.com'}>`,
      to: 'info@maltaluxuryrealestate.com',
      subject: `New Property: ${p.title} - ${fmtPrice(Number(p.price))}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1a1a2e;padding:24px;border-radius:8px 8px 0 0"><h1 style="color:#c9a84c;margin:0">Malta Luxury Estates</h1></div><div style="padding:32px;background:#fff;border:1px solid #eee;border-radius:0 0 8px 8px"><h2>${p.title}</h2><p>Price: <strong>${fmtPrice(Number(p.price))}</strong> | Location: ${p.location_text}</p>${thumb}<p style="margin-top:20px"><a href="${baseUrl}/properties/${slug}" style="background:#1a1a2e;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none">View Listing</a></p></div></div>`,
    });
  } catch (err: any) { console.error('Admin email error:', err); }

  return NextResponse.json({ id: data.id, slug });
}
