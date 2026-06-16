'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function AgencyRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '', agencyName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (authError) { setError(authError.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from('agencies').insert({ user_id: data.user.id, name: form.agencyName, email: form.email, plan: 'basic', active: true });
    }
    router.push('/agency/portal');
  };

  return (
    <main className="min-h-screen bg-luxury-black flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl text-white mb-2">Register Agency</h1>
          <p className="text-white/40 text-sm">Join Malta Luxury Real Estate portal</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card p-10 rounded-3xl border border-white/10 space-y-5">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-sm">{error}</div>}
          {[['agencyName','Agency Name','Malta Properties Ltd'],['name','Contact Name','Your name'],['email','Email','agency@example.com']].map(([key, label, ph]) => (
            <div key={key}>
              <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">{label}</label>
              <input type={key === 'email' ? 'email' : 'text'} value={(form as any)[key]} onChange={e => setForm({...form, [key]: e.target.value})} required placeholder={ph} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-gold/40" />
            </div>
          ))}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required placeholder="min. 8 characters" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-gold/40" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 gold-gradient text-luxury-black font-bold text-[11px] uppercase tracking-widest rounded-2xl">{loading ? 'Creating account...' : 'Create Account'}</button>
          <p className="text-center text-xs text-white/30">Already registered? <Link href="/agency/login" className="text-gold">Sign in</Link></p>
        </form>
      </div>
    </main>
  );
}
