import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const bytes = new Uint8Array(await req.arrayBuffer());
  const storagePath = `properties/${slug}/${filename}`;

  const { error } = await supabase.storage
    .from('site-images')
    .upload(storagePath, bytes, { contentType: 'image/webp', upsert: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from('site-images').getPublicUrl(storagePath);
  return NextResponse.json({ url: data.publicUrl });
}
