// Weryfikuje webhook Supabase → wysyła email agencji przez Resend
// Edge runtime = zero cold start, <50ms response
import { Resend } from 'resend';

export const config = { runtime: 'edge' };

const resend = new Resend(process.env.RESEND_API_KEY);

// Supabase podpisuje webhook tym samym sekretem co Stripe
async function verifySupabaseWebhook(req: Request): Promise<boolean> {
    const secret = process.env.SUPABASE_WEBHOOK_SECRET;
    if (!secret) return true; // dev bypass

    const signature = req.headers.get('x-supabase-signature');
    if (!signature) return false;

    const body = await req.clone().text();
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    );
    const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const bodyBytes = new TextEncoder().encode(body);
    return crypto.subtle.verify('HMAC', key, sigBytes, bodyBytes);
}

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    // Weryfikuj podpis w produkcji
    const isValid = await verifySupabaseWebhook(req);
    if (!isValid) return new Response('Unauthorized', { status: 401 });

    const payload = await req.json();

    // Supabase wysyła: { type: 'INSERT', table: 'leads', record: {...} }
    if (payload.type !== 'INSERT' || payload.table !== 'leads') {
        return new Response('Ignored', { status: 200 });
    }

    const lead = payload.record;

    // Pobierz dane agencji i nieruchomości
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
        process.env.VITE_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! // service role — pełny dostęp
    );

    const [{ data: agency }, { data: property }] = await Promise.all([
        supabase.from('agencies').select('name, email').eq('id', lead.agency_id).single(),
        supabase.from('properties').select('title, location_text, price').eq('id', lead.property_id).single(),
    ]);

    if (!agency?.email) return new Response('No agency email', { status: 200 });

    // Email do agencji
    await resend.emails.send({
        from: `Malta Luxury Estates <${process.env.RESEND_FROM_EMAIL}>`,
        to: agency.email,
        subject: `🏠 Nowy lead: ${lead.name} → ${property?.title ?? 'Twoja oferta'}`,
        html: buildLeadEmail({ lead, agency, property }),
    });

    // Potwierdzenie do potencjalnego kupca
    if (lead.email) {
        await resend.emails.send({
            from: `Malta Luxury Estates <${process.env.RESEND_FROM_EMAIL}>`,
            to: lead.email,
            subject: `Your enquiry about ${property?.title ?? 'the property'} has been received`,
            html: buildBuyerEmail({ lead, property, agency }),
        });
    }

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

// ── EMAIL TEMPLATES ──────────────────────────────────────────────────────────

function buildLeadEmail({ lead, agency, property }: any) {
    const price = property?.price
        ? `€${Number(property.price).toLocaleString('en-MT')}`
        : 'N/A';

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #1a1a2e; color: #c9a84c; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 20px; }
    .body { padding: 32px; }
    .badge { display: inline-block; background: #e8f5e9; color: #1b5e20; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 20px; }
    .card { background: #f9f9f9; border-left: 4px solid #c9a84c; padding: 16px 20px; border-radius: 4px; margin: 20px 0; }
    .card h3 { margin: 0 0 8px; color: #1a1a2e; font-size: 14px; }
    .card p { margin: 0; color: #555; font-size: 14px; }
    .btn { display: inline-block; background: #1a1a2e; color: #fff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .footer { background: #f4f4f4; padding: 16px 32px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏠 Malta Luxury Estates</h1>
      <p style="margin:4px 0 0; color:#fff; font-size:14px;">New Lead Notification</p>
    </div>
    <div class="body">
      <div class="badge">NEW ENQUIRY</div>
      <h2 style="color:#1a1a2e; margin:0 0 8px;">Hi ${agency?.name ?? 'there'},</h2>
      <p style="color:#555;">You have a new lead from <strong>${lead.name}</strong> enquiring about:</p>
      
      <div class="card">
        <h3>🏡 Property</h3>
        <p><strong>${property?.title ?? 'N/A'}</strong><br>
        📍 ${property?.location_text ?? 'N/A'} &nbsp;|&nbsp; 💰 ${price}</p>
      </div>
      
      <div class="card">
        <h3>👤 Lead Details</h3>
        <p>
          <strong>Name:</strong> ${lead.name}<br>
          <strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a><br>
          ${lead.phone ? `<strong>Phone:</strong> <a href="tel:${lead.phone}">${lead.phone}</a><br>` : ''}
          ${lead.message ? `<strong>Message:</strong> "${lead.message}"` : ''}
        </p>
      </div>
      
      <a href="${process.env.VITE_URL}/agency/portal" class="btn">Open Agency Portal →</a>
    </div>
    <div class="footer">
      Malta Luxury Estates · maltaluxuryrealestate.com · You're receiving this because you're a registered agency partner.
    </div>
  </div>
</body>
</html>`;
}

function buildBuyerEmail({ lead, property, agency }: any) {
    return `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif; max-width:600px; margin:32px auto; color:#333;">
  <div style="background:#1a1a2e; padding:24px 32px; border-radius:8px 8px 0 0;">
    <h1 style="color:#c9a84c; margin:0; font-size:20px;">Malta Luxury Estates</h1>
  </div>
  <div style="padding:32px; background:#fff; border:1px solid #eee; border-radius:0 0 8px 8px;">
    <h2>Thank you, ${lead.name}!</h2>
    <p>We've received your enquiry about <strong>${property?.title ?? 'the property'}</strong> and forwarded it to <strong>${agency?.name ?? 'the agency'}</strong>.</p>
    <p>They will be in touch with you within <strong>24 hours</strong>.</p>
    <p style="color:#888; font-size:13px;">While you wait, explore more properties at <a href="${process.env.VITE_URL || 'https://www.maltaluxuryrealestate.com'}">maltaluxuryrealestate.com</a></p>
  </div>
</body>
</html>`;
}
