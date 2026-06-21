import type { ReactNode } from 'react';

export function LegalLayout({ title, subtitle, icon, children }: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-luxury-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mb-6 border border-gold/20 text-gold">
            {icon}
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">{title}</h1>
          <p className="text-white/60 uppercase tracking-widest text-xs font-bold">{subtitle}</p>
        </div>
        <div className="glass-card rounded-[2.5rem] p-8 md:p-16 border border-white/5 bg-white/5 backdrop-blur-3xl text-white/70 leading-relaxed font-light article-prose">
          {children}
        </div>
      </div>
    </div>
  );
}

export function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function ScaleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="21" />
      <path d="M3 6l9-3 9 3" />
      <path d="M3 6l4.5 9a4.5 4.5 0 0 1-9 0L3 6z" />
      <path d="M21 6l-4.5 9a4.5 4.5 0 0 0 9 0L21 6z" />
    </svg>
  );
}

export function CookieIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="16" cy="10" r="1" fill="currentColor" />
      <circle cx="10" cy="15" r="1" fill="currentColor" />
      <circle cx="15" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}