import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function requireAdmin(req: NextRequest) {
  return req.headers.get('x-admin-key') === (process.env.ADMIN_KEY || 'malta2026admin');
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const filename = searchParams.get('filename');
  if (!slug || !filename) return NextResponse.json({ error: 'slug and filename required' }, { status: 400 });

  const buffer = Buffer.from(await req.arrayBuffer());
  const dir = path.join(process.cwd(), 'public', 'uploads', 'properties', slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), buffer);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.maltaluxuryrealestate.com';
  return NextResponse.json({ url: `${baseUrl}/uploads/properties/${slug}/${filename}` });
}
