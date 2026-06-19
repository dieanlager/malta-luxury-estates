import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/src/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_FIELDS = new Set(['status', 'listing_status', 'featured', 'featured_position', 'featured_badge']);

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const body = await req.json() as { id: string; updates: Record<string, unknown> };
  const { id, updates } = body;

  if (!id || typeof updates !== 'object' || updates === null) {
    return NextResponse.json({ error: 'id and updates required' }, { status: 400 });
  }

  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(updates)) {
    if (ALLOWED_FIELDS.has(k)) safe[k] = v;
  }

  if (Object.keys(safe).length === 0) {
    return NextResponse.json({ error: 'No allowed fields in updates' }, { status: 400 });
  }

  const { error } = await getSupabase().from('properties').update(safe).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
