import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { name, email, phone, message, propertyTitle, affiliateUrl } = await req.json();
  if (!name || !email) return NextResponse.json({ error: 'name and email required' }, { status: 400 });

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set ? contact enquiry logged but email not sent');
    return NextResponse.json({ success: true });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const affiliateSection = affiliateUrl
      ? `<p>Affiliate URL: <a href="${affiliateUrl}">${affiliateUrl}</a></p>` : '';
    await resend.emails.send({
      from: `Malta Luxury Estates <${process.env.RESEND_FROM_EMAIL || 'leads@maltaluxuryrealestate.com'}>`,
      to: process.env.CONTACT_EMAIL || 'info@maltaluxuryrealestate.com',
      replyTo: email,
      subject: `Enquiry: ${name} - ${propertyTitle || 'General'}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2>New Enquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        ${propertyTitle ? `<p><strong>Property:</strong> ${propertyTitle}</p>` : ''}
        ${message ? `<p><strong>Message:</strong><br>${message}</p>` : ''}
        ${affiliateSection}
      </div>`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
