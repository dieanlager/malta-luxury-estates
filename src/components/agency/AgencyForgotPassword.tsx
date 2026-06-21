'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
export function AgencyForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/agency/reset-password` });
    setSent(true);
  };
  return (
    <main className="min-h-screen bg-luxury-black flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="font-serif text-3xl text-white mb-8 text-center">Reset Password</h1>
        {sent ? (
          <div className="glass-card p-10 rounded-3xl border border-gold/20 text-center">
            <p className="text-white/70">Check your email for a password reset link.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-10 rounded-3xl border border-white/10 space-y-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/60 mb-2 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-gold/40" />
            </div>
            <button type="submit" className="w-full py-4 gold-gradient text-luxury-black font-bold text-[11px] uppercase tracking-widest rounded-2xl">Send Reset Link</button>
          </form>
        )}
      </div>
    </main>
  );
}
