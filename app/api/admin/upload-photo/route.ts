import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';
import { requireAdmin } from '@/src/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const filename = searchParams.get('filename');
  if (!slug || !filename) return NextResponse.json({ error: 'slug and filename required' }, { status: 400 });

  const bytes = new Uint8Array(await req.arrayBuffer());
  const storagePath = `properties/${slug}/${filename}`;

  const { error } = await supabaseAdmin.storage
    .from('site-images')
    .upload(storagePath, bytes, { contentType: 'image/webp', upsert: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabaseAdmin.storage.from('site-images').getPublicUrl(storagePath);
  return NextResponse.json({ url: data.publicUrl });
}