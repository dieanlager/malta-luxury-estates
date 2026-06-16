'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function AgencyPortal() {
  const [loading, setLoading] = useState(true);
  const [agency, setAgency] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/agency/login'); return; }
      const { data } = await supabase.from('agencies').select('*').eq('user_id', session.user.id).single();
      setAgency(data);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-luxury-black pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="font-serif text-4xl text-white mb-2">Agency Portal</h1>
          {agency && <p className="text-white/50">{agency.name} · {agency.plan} plan</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 rounded-3xl border border-white/10">
            <h2 className="font-serif text-xl text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/agency/upgrade" className="block w-full text-center py-3 border border-gold/30 text-gold rounded-2xl text-sm hover:bg-gold/5 transition-all">Upgrade Plan</Link>
              <button onClick={() => supabase.auth.signOut().then(() => router.push('/agency/login'))} className="block w-full text-center py-3 border border-white/10 text-white/50 rounded-2xl text-sm hover:text-white transition-all">Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
