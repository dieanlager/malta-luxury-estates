import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_HOSTNAMES = new Set([
  'alliance.com.mt',
  'www.alliance.com.mt',
  'frankysalt.com',
  'www.frankysalt.com',
  'remax.com.mt',
  'www.remax.com.mt',
  'dhalia.com',
  'www.dhalia.com',
  'maltapark.com',
  'www.maltapark.com',
  'propertynetwork.net',
  'www.propertynetwork.net',
]);

const PRIVATE_IP_RE = /^(10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|fc00:|fe80:)/;

export async function GET(req: NextRequest) {
  const rawUrl = new URL(req.url).searchParams.get('url');
  if (!rawUrl) return NextResponse.json({ error: 'url required' }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return NextResponse.json({ error: 'Only http/https allowed' }, { status: 400 });
  }

  if (PRIVATE_IP_RE.test(parsed.hostname)) {
    return NextResponse.json({ error: 'Private addresses not allowed' }, { status: 400 });
  }

  if (!ALLOWED_HOSTNAMES.has(parsed.hostname)) {
    return NextResponse.json({ error: 'Host not in allowlist' }, { status: 400 });
  }

  try {
    const res = await fetch(rawUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': parsed.origin,
      },
    });
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}