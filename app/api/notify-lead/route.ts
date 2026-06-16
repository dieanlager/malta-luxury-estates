import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';

export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const record = await req.json();
    if (!record?.agency_id) return NextResponse.json({ error: 'No lead record' }, { status: 400 });

    const supabase = createServerSupabaseClient();
    const { data: agency } = await supabase.from('agencies').select('name, email').eq('id', record.agency_id).single();
    if (!agency?.email) return NextResponse.json({ error: 'Agency not found' }, { status: 404 });

    let propertyTitle = 'General Inquiry';
    if (record.property_id) {
      const { data: property } = await supabase.from('properties').select('title').eq('id', record.property_id).single();
      if (property) propertyTitle = property.title;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.maltaluxuryrealestate.com';
    await resend.emails.send({
      from: `Malta Luxury Estates <${process.env.RESEND_FROM_EMAIL ?? 'leads@maltaluxuryrealestate.com'}>`,
      to: agency.email,
      subject: `New Lead: ${propertyTitle}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
<h2 style="color:#C5A059">New Lead — ${propertyTitle}</h2>
<p>Hi ${agency.name},</p>
<table style="background:#f9f9f9;padding:20px;border-radius:8px;width:100%">
<tr><td><strong>Name</strong></td><td>${record.name}</td></tr>
<tr><td><strong>Email</strong></td><td>${record.email}</td></tr>
${record.phone ? `<tr><td><strong>Phone</strong></td><td>${record.phone}</td></tr>` : ''}
${record.budget_max ? `<tr><td><strong>Budget</strong></td><td>Up to €${Number(record.budget_max).toLocaleString()}</td></tr>` : ''}
</table>
<a href="${siteUrl}/agency/portal" style="background:#C5A059;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;margin-top:20px;font-weight:bold">View in Portal →</a>
</div>`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
