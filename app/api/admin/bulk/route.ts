import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/src/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type BulkAction = 'delete' | 'activate' | 'pause';

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const body = await req.json() as { action: BulkAction; ids: string[] };
  const { action, ids } = body;

  if (!action || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'action and ids[] required' }, { status: 400 });
  }
  if (ids.length > 200) {
    return NextResponse.json({ error: 'Max 200 ids per request' }, { status: 400 });
  }

  const sb = getSupabase();

  if (action === 'delete') {
    const { error } = await sb.from('properties').delete().in('id', ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, deleted: ids.length });
  }

  if (action === 'activate' || action === 'pause') {
    const next = action === 'activate' ? 'active' : 'paused';
    const { error } = await sb.from('properties')
      .update({ status: next, listing_status: next })
      .in('id', ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, updated: ids.length });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
