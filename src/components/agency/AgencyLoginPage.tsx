'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function AgencyLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/agency/portal');
    }
  };

  return (
    <main className="min-h-screen bg-luxury-black flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-luxury-black font-serif font-bold text-2xl">M</span>
          </div>
          <h1 className="font-serif text-3xl text-white mb-2">Agency Login</h1>
          <p className="text-white/40 text-sm">Malta Luxury Real Estate Agency Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-10 rounded-3xl border border-white/10 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-gold/40"
              placeholder="agency@example.com"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-gold/40"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 gold-gradient text-luxury-black font-bold text-[11px] uppercase tracking-widest rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <div className="flex justify-between text-xs text-white/30">
            <Link href="/agency/forgot-password" className="hover:text-gold transition-colors">Forgot password?</Link>
            <Link href="/agency/register" className="hover:text-gold transition-colors">Register agency</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
