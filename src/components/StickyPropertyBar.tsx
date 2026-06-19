'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation';
import { formatPrice } from '@/src/lib/seo/schemas';

interface Props {
  title: string;
  price: number | undefined;
  image: string | undefined;
  slug: string;
  statusLabel: string;
  sentinelId: string;
}

export function StickyPropertyBar({ title, price, image, slug, statusLabel, sentinelId }: Props) {
  const t = useTranslations('property_detail');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: '-64px 0px 0px 0px', threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelId]);

  return (
    <>
      {/* Desktop top bar — slides in from top after scrolling past sentinel */}
      <div
        className={`fixed top-0 inset-x-0 z-50 hidden lg:flex items-center gap-5 px-8 h-16 bg-luxury-black/90 backdrop-blur-md border-b border-gold/20 transition-transform duration-300 ease-in-out ${visible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        {image && (
          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
            <Image src={image} alt={title} fill unoptimized className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{title}</p>
          <p className="text-white/35 text-[9px] uppercase tracking-[0.15em]">{statusLabel}</p>
        </div>
        {price && (
          <p className="font-serif text-xl text-gold shrink-0">{formatPrice(price)}</p>
        )}
        <Link
          href={`/contact?property=${slug}` as any}
          className="shrink-0 px-5 py-2 gold-gradient text-luxury-black font-bold text-[10px] uppercase tracking-widest rounded-full hover:opacity-90 transition-opacity"
        >
          {t('contact.request_viewing')}
        </Link>
      </div>

      {/* Mobile bottom bar — always visible on small screens */}
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden flex items-center justify-between gap-4 px-5 py-4 bg-luxury-black/95 backdrop-blur-md border-t border-white/10"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div>
          <p className="font-serif text-xl text-gold font-bold">{price ? formatPrice(price) : '—'}</p>
          <p className="text-white/30 text-[9px] uppercase tracking-widest">{statusLabel}</p>
        </div>
        <Link
          href={`/contact?property=${slug}` as any}
          className="px-6 py-3 gold-gradient text-luxury-black font-bold text-[10px] uppercase tracking-widest rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          {t('contact.request_viewing')}
        </Link>
      </div>
    </>
  );
}