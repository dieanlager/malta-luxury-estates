'use client';
import Link from 'next/link';
export function AgencyUpgrade() {
  return (
    <main className="min-h-screen bg-luxury-black flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="font-serif text-4xl text-white mb-6">Upgrade Your Plan</h1>
        <p className="text-white/50 mb-10">Get more visibility with Pro or Featured plan.</p>
        <Link href="/agency/portal" className="px-8 py-4 gold-gradient text-luxury-black font-bold text-[11px] uppercase tracking-widest rounded-full inline-block">Manage Subscription</Link>
      </div>
    </main>
  );
}
