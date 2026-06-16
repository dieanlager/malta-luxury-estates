import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export function createServerSupabaseClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase server credentials (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)');
  return createClient<Database>(url, key, { auth: { persistSession: false } });
}
