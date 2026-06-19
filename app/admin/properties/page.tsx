'use client';
import { useState, useEffect } from 'react';
import { PropertiesTable } from '@/src/components/admin/PropertiesTable';
import { Lock, Loader2, LayoutList, Plus, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminPropertiesPage() {
  const [adminKey, setAdminKey] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('mlre_admin_key') ?? '';
    setAdminKey(stored);
    setHydrated(true);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/properties', {
        headers: { 'x-admin-key': inputKey },
      });
      if (res.ok) {
        sessionStorage.setItem('mlre_admin_key', inputKey);
        setAdminKey(inputKey);
      } else {
        setLoginError('Invalid admin key. Please try again.');
      }
    } catch {
      setLoginError('Connection error. Please try again.');
    }
    setLoginLoading(false);
  }

  function handleLogout() {
    sessionStorage.removeItem('mlre_admin_key');
    setAdminKey('');
    setInputKey('');
  }

  if (!hydrated) return null;

  if (!adminKey) {
    return (
      <main className="min-h-screen bg-luxury-black flex items-center justify-center px-4">
        <div className="glass-card border border-white/10 rounded-2xl p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Lock size={14} className="text-gold" />
            </div>
            <div>
              <h1 className="font-serif text-xl text-white">Admin Access</h1>
              <p className="text-white/30 text-xs mt-0.5">Properties Dashboard</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              placeholder="Admin key"
              autoFocus
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 transition-colors"
            />
            {loginError && <p className="text-red-400 text-xs">{loginError}</p>}
            <button
              type="submit"
              disabled={!inputKey || loginLoading}
              className="w-full py-3 bg-gold text-luxury-black font-bold rounded-xl hover:bg-white disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              {loginLoading && <Loader2 size={14} className="animate-spin" />}
              Sign In
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-luxury-black pb-24">
      <div className="border-b border-white/10 bg-luxury-black/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 mr-2">
              <div className="w-7 h-7 gold-gradient rounded-full flex items-center justify-center">
                <span className="text-luxury-black font-serif font-bold text-sm">M</span>
              </div>
              <span className="font-serif text-sm tracking-widest uppercase hidden sm:block">
                Malta <span className="text-gold">Admin</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-wider">
                <LayoutList size={13} /> Properties
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin"
              className="flex items-center gap-2 px-4 py-2 bg-gold text-luxury-black text-xs font-bold rounded-lg hover:bg-white transition-colors">
              <Plus size={13} /> New Listing
            </Link>
            <button onClick={handleLogout} title="Sign out"
              className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-6">
          <h1 className="font-serif text-3xl text-white">Properties</h1>
          <p className="text-white/30 text-sm mt-1">Manage all property listings</p>
        </div>
        <PropertiesTable adminKey={adminKey} />
      </div>
    </main>
  );
}
