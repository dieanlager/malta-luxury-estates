import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getResend = () => new Resend(process.env.RESEND_API_KEY);

async function verifySupabaseWebhook(req: NextRequest, bodyText: string): Promise<boolean> {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (!secret) return true;

  const signature = req.headers.get('x-supabase-signature');
  if (!signature) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
  const bodyBytes = new TextEncoder().encode(bodyText);
  return crypto.subtle.verify('HMAC', key, sigBytes, bodyBytes);
}

export async function POST(req: NextRequest) {
  const bodyText = await req.text();

  const isValid = await verifySupabaseWebhook(req, bodyText);
  if (!isValid) return new NextResponse('Unauthorized', { status: 401 });

  const payload = JSON.parse(bodyText);
  if (payload.type !== 'INSERT' || payload.table !== 'leads') {
    return NextResponse.json({ ignored: true });
  }

  const lead = payload.record;
  const supabase = createServerSupabaseClient() as any;

  const [{ data: agency }, { data: property }] = await Promise.all([
    supabase.from('agencies').select('name, email').eq('id', lead.agency_id).single(),
    lead.property_id
      ? supabase.from('properties').select('title, location_text, price').eq('id', lead.property_id).single()
      : { data: null },
  ]);

  if (!agency || !agency.email) return NextResponse.json({ ok: true });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.maltaluxuryrealestate.com';
  const price = property?.price ? `€${Number(property.price).toLocaleString('en-MT')}` : 'N/A';

  await getResend().emails.send({
    from: `Malta Luxury Estates <${process.env.RESEND_FROM_EMAIL ?? 'leads@maltaluxuryrealestate.com'}>`,
    to: agency.email,
    subject: `New Lead: ${lead.name} â†’ ${property?.title ?? 'Your Listing'}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
<h2 style="color:#C5A059">New Lead ”” Malta Luxury Real Estate</h2>
<p>Hi ${agency.name}, you have a new enquiry for <strong>${property?.title ?? 'your listing'}</strong>.</p>
<table style="background:#f9f9f9;padding:20px;border-radius:8px;width:100%">
<tr><td><strong>Name</strong></td><td>${lead.name}</td></tr>
<tr><td><strong>Email</strong></td><td><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
${lead.phone ? `<tr><td><strong>Phone</strong></td><td><a href="tel:${lead.phone}">${lead.phone}</a></td></tr>` : ''}
${lead.message ? `<tr><td><strong>Message</strong></td><td>${lead.message}</td></tr>` : ''}
<tr><td><strong>Property</strong></td><td>${property?.title ?? '””'} · ${price}</td></tr>
</table>
<p><a href="${siteUrl}/agency/portal" style="background:#C5A059;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;margin-top:20px;font-weight:bold">View in Agency Portal â†’</a></p>
</div>`,
  });

  if (lead.email) {
    await getResend().emails.send({
      from: `Malta Luxury Estates <${process.env.RESEND_FROM_EMAIL ?? 'noreply@maltaluxuryrealestate.com'}>`,
      to: lead.email,
      subject: `Your enquiry about ${property?.title ?? 'the property'} has been received`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
<h2 style="color:#C5A059">Thank you, ${lead.name}!</h2>
<p>We've forwarded your enquiry to <strong>${agency.name}</strong>. They'll be in touch within 24 hours.</p>
<p style="color:#888;font-size:13px">Explore more at <a href="${siteUrl}">${siteUrl}</a></p>
</div>`,
    });
  }

  return NextResponse.json({ ok: true });
}
