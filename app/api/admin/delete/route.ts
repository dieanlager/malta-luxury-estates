import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function requireAdmin(req: NextRequest) {
  return req.headers.get('x-admin-key') === (process.env.ADMIN_KEY || 'malta2026admin');
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { data: property, error: fetchError } = await getSupabase()
    .from('properties').select('title, images').eq('id', id).single();
  if (fetchError || !property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

  const { error: deleteError } = await getSupabase().from('properties').delete().eq('id', id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  if (Array.isArray(property.images)) {
    property.images.forEach((imgUrl: string) => {
      try {
        const match = imgUrl.match(/\/uploads\/(.+)$/);
        if (match) {
          const filePath = path.join(process.cwd(), 'public', 'uploads', match[1]);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      } catch (e) { console.error('Image delete error:', e); }
    });
  }
  return NextResponse.json({ ok: true, deleted: property.title });
}
