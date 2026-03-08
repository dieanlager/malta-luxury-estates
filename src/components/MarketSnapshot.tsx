import React from 'react';
import { Location, LocationStats } from '../types';
import { TrendingUp, Home, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  location: Location;
  stats: LocationStats | null;
  listingType?: 'sale' | 'rent' | 'both';
}

const formatPrice = (value: number | null) => {
  if (value == null) return 'N/A';
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `€${(value / 1000).toFixed(1)}K`;
  }
  return `€${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

export const MarketSnapshot: React.FC<Props> = ({
  location,
  stats,
  listingType = 'both'
}) => {
  const { t, i18n } = useTranslation();

  const locationName = i18n.language === 'en'
    ? location.nameEn
    : (() => {
      const key = `locations.${location.nameEn.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`;
      const translated = t(key, { defaultValue: '' });
      return translated || location.nameEn;
    })();

  if (!stats) {
    return (
      <section className="glass-card rounded-[2rem] p-8 border border-white/10">
        <h2 className="text-2xl font-serif mb-2">
          {t('sections.market_snapshot.title')} – {locationName}
        </h2>
        <p className="text-sm text-white/40">
          {t('states.noResults')}
        </p>
      </section>
    );
  }

  const showSale = listingType === 'sale' || listingType === 'both';
  const showRent = listingType === 'rent' || listingType === 'both';

  return (
    <section className="glass-card rounded-[2rem] p-8 border border-gold/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <TrendingUp size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-1">
          <TrendingUp className="text-gold" size={20} />
          <h2 className="text-2xl font-serif">
            {t('sections.market_snapshot.title')} – {locationName}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/30 mb-8 font-bold">
          <Calendar size={12} />
          <span>{t('common.live_feed')} · {new Date(stats.lastCalculatedAt).toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {showSale && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold/60">
                <Home size={14} />
                <span>{t('market.forSale')}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-serif text-white">
                  {formatPrice(stats.medianPriceSale)}
                </span>
                <span className="text-xs text-white/40 uppercase tracking-wider">
                  {t('search.filters.price_range')}
                </span>
              </div>
              <div className="flex gap-6 pt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase font-bold">{t('common.listings', 'Listings')}</span>
                  <span className="text-sm font-bold">{stats.listingsSaleCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase font-bold">{t('common.avg_price')}</span>
                  <span className="text-sm font-bold">{formatPrice(stats.avgPriceSale)}</span>
                </div>
              </div>
            </div>
          )}

          {showRent && (
            <div className="space-y-4 border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-12">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold/60">
                <Calendar size={14} />
                <span>{t('market.forRent')}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-serif text-white">
                  {formatPrice(stats.medianPriceRent)}
                </span>
                <span className="text-xs text-white/40 uppercase tracking-wider">
                  {t('common.per_month')}
                </span>
              </div>
              <div className="flex gap-6 pt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase font-bold">{t('common.listings', 'Listings')}</span>
                  <span className="text-sm font-bold">{stats.listingsRentCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase font-bold">{t('common.avg_price')}</span>
                  <span className="text-sm font-bold">{formatPrice(stats.avgPriceRent)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
