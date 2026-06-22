'use client';
import { useEffect } from 'react';
import { Link } from '@/src/navigation';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-luxury-black flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-6 block">Error</span>
        <h1 className="font-serif text-4xl text-white mb-4">Something went wrong</h1>
        <p className="text-white/50 mb-8 text-sm">
          We encountered an unexpected error. Please try again or return to the homepage.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 gold-gradient text-luxury-black font-bold text-[11px] uppercase tracking-widest rounded-full"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-white/20 text-white text-[11px] uppercase tracking-widest rounded-full hover:border-gold/40 hover:text-gold transition-all"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
