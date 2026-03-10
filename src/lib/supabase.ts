import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// --- Supabase Configuration ---
// SETUP GUIDE:
// 1. Go to supabase.com → New Project
// 2. Copy your project URL and anon key
// 3. Create a .env file in the project root:
//    VITE_SUPABASE_URL=https://your-project.supabase.co
//    VITE_SUPABASE_ANON_KEY=your-anon-key
// 4. Run the SQL schema from supabase/schema.sql in the SQL editor

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Create client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to check connection
export async function testConnection(): Promise<boolean> {
    if (!supabase) return false;
    try {
        const { error } = await supabase.from('locations').select('id').limit(1);
        return !error;
    } catch {
        return false;
    }
}
