'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation';
import { Heart, Share2 } from 'lucide-react';
import { formatPrice } from '@/src/lib/seo/schemas';

interface Props {
  price: number | undefined;
  slug: string;
  statusLabel: string;
  agencyName?: string;
  agencyLogo?: string;
}

export function PropertyContactCard({ price, slug, statusLabel, agencyName, agencyLogo }: Props) {
  const t = useTranslations('property_detail');

  const [saved, setSaved] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const list: string[] = JSON.parse(localStorage.getItem('mlre_saved') ?? '[]');
      return list.includes(slug);
    } catch { return false; }
  });

  const toggleSave = () => {
    setSaved(prev => {
      try {
        const list: string[] = JSON.parse(localStorage.getItem('mlre_saved') ?? '[]');
        const next = prev ? list.filter(s => s !== slug) : [...list, slug];
        localStorage.setItem('mlre_saved', JSON.stringify(next));
      } catch {}
      return !prev;
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: document.title, url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); } catch {}
    }
  };

  return (
    <div className="glass-card p-8 rounded-3xl border border-white/10 sticky top-28 space-y-6">
      {/* Price */}
      <div>
        <div className="font-serif text-3xl text-gold">{price ? formatPrice(price) : '—'}</div>
        <div className="text-white/30 text-[10px] uppercase tracking-widest mt-1">{statusLabel}</div>
      </div>

      {/* Primary CTA */}
      <Link
        href={`/contact?property=${slug}` as any}
        className="w-full block text-center py-4 gold-gradient text-luxury-black font-bold text-sm uppercase tracking-widest rounded-2xl hover:opacity-90 transition-opacity"
      >
        {t('contact.request_viewing')}
      </Link>

      {/* Secondary CTA */}
      <Link
        href="/contact"
        className="w-full block text-center py-3.5 border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-bold text-sm uppercase tracking-widest rounded-2xl transition-colors"
      >
        {t('contact.contact_agent')}
      </Link>

      {/* Agent mini-card */}
      {agencyName && (
        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
          {agencyLogo ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0">
              <Image src={agencyLogo} alt={agencyName} fill sizes="40px" className="object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
              <span className="text-gold text-sm font-bold">{agencyName[0]}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{agencyName}</p>
            <p className="text-white/30 text-[10px] uppercase tracking-widest">{t('contact.listed_by')}</p>
          </div>
        </div>
      )}

      {/* Save / Share */}
      <div className="flex gap-3 pt-4 border-t border-white/5">
        <button
          type="button"
          onClick={toggleSave}
          className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl text-xs uppercase tracking-widest font-bold transition-colors ${saved ? 'border-gold text-gold' : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white/80'}`}
        >
          <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
          {t('contact.save')}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/15 text-white/50 hover:border-white/30 hover:text-white/80 rounded-xl text-xs uppercase tracking-widest font-bold transition-colors"
        >
          <Share2 size={14} />
          {t('contact.share')}
        </button>
      </div>
    </div>
  );
}