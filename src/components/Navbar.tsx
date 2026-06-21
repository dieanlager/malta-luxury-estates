'use client';
import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/src/navigation';
import { Menu, X, Globe, Heart } from 'lucide-react';
import { useFavorites } from '@/src/hooks/useFavorites';

const LanguageSelector = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'it', label: 'Italiano', flag: 'IT' },
    { code: 'de', label: 'Deutsch', flag: 'DE' },
    { code: 'fr', label: 'Francais', flag: 'FR' },
    { code: 'pl', label: 'Polski', flag: 'PL' },
  ] as const;

  const handleLocaleChange = (newLocale: string) => {
    setIsOpen(false);
    router.replace(pathname as any, { locale: newLocale });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-gold/30 transition-all text-[10px] font-bold uppercase tracking-widest bg-white/5"
      >
        <Globe size={13} />
        <span>{locale.toUpperCase().slice(0, 2)}</span>
      </button>

      {/* Language dropdown — CSS transition, stays in DOM */}
      <>
        {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
        <div
          className={`absolute right-0 mt-2 w-40 bg-luxury-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden transition-all duration-200 ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'}`}
        >
          <div className="text-[8px] uppercase tracking-widest text-white/60 px-3 py-2 border-b border-white/5 mb-1">
            Select Language
          </div>
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLocaleChange(lang.code)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${locale === lang.code ? 'bg-gold/10 text-gold' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
            >
              <span className="text-[10px] font-bold">{lang.flag}</span>
              <span className="font-medium">{lang.label}</span>
            </button>
          ))}
        </div>
      </>
    </div>
  );
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('common');
  const { count: favCount } = useFavorites();

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const isHome = pathname === '/';
  const transparent = isHome && !isScrolled;

  const navLinks = [
    { href: '/properties/all' as const, label: t('nav.properties') },
    { href: '/insights' as const, label: t('nav.insights') },
    { href: '/about' as const, label: t('nav.about') },
    { href: '/contact' as const, label: t('nav.contact') },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${transparent ? 'bg-transparent py-8' : 'bg-luxury-black/90 backdrop-blur-lg py-4 shadow-2xl'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2" aria-label="Malta Luxury Real Estate Home">
          <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center shadow-lg" aria-hidden="true">
            <span className="text-luxury-black font-serif font-bold text-xl">M</span>
          </div>
          <span className="font-serif text-2xl tracking-widest uppercase hidden sm:block">
            Malta <span className="text-gold">Luxury Real Estate</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/market/live"
            className="flex items-center gap-2 text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            {t('nav.market')}
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <LanguageSelector />
          {favCount > 0 && (
            <span className="relative">
              <Heart size={18} className="text-gold" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-luxury-black rounded-full text-[8px] font-bold flex items-center justify-center">
                {favCount}
              </span>
            </span>
          )}
        </div>

        <div className="flex md:hidden items-center gap-4">
          <LanguageSelector />
          <button onClick={() => setIsMobileOpen(true)} aria-label="Open menu" className="w-12 h-12 flex items-center justify-center text-white">
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Mobile menu — CSS slide-in from right, stays in DOM */}
      <div
        className={`fixed inset-0 bg-luxury-black z-[60] flex flex-col p-8 transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isMobileOpen}
      >
        <div className="flex justify-end">
          <button onClick={() => setIsMobileOpen(false)} aria-label="Close menu" className="w-12 h-12 flex items-center justify-center text-white">
            <X size={32} />
          </button>
        </div>
        <div className="flex flex-col gap-8 mt-12">
          {[...navLinks, { href: '/market/live' as const, label: t('nav.market') }].map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className="text-3xl font-serif hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-8 pt-8 border-t border-white/10">
            <Link href={"/agency/login" as any} onClick={() => setIsMobileOpen(false)} className="text-sm uppercase tracking-widest text-gold hover:text-white transition-colors">
              {t('nav.agency_login', { defaultValue: 'Agency Login' })}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}