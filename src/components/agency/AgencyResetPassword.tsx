'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
export function AgencyResetPassword() {
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.auth.updateUser({ password });
    setDone(true);
    setTimeout(() => router.push('/agency/login'), 2000);
  };
  return (
    <main className="min-h-screen bg-luxury-black flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="font-serif text-3xl text-white mb-8 text-center">Set New Password</h1>
        {done ? (
          <div className="glass-card p-10 rounded-3xl border border-gold/20 text-center text-white/70">Password updated. Redirecting...</div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-10 rounded-3xl border border-white/10 space-y-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/60 mb-2 block">New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-gold/40" />
            </div>
            <button type="submit" className="w-full py-4 gold-gradient text-luxury-black font-bold text-[11px] uppercase tracking-widest rounded-2xl">Update Password</button>
          </form>
        )}
      </div>
    </main>
  );
}
