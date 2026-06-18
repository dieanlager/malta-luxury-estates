import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !email.includes('@')) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set ? newsletter subscription logged but email not sent');
    return NextResponse.json({ success: true });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'leads@maltaluxuryrealestate.com',
      to: process.env.CONTACT_EMAIL || 'info@maltaluxuryrealestate.com',
      subject: 'New Newsletter Subscription ? Malta Luxury RE',
      html: `<p>New newsletter subscriber: <strong>${email}</strong></p>`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
