'use client';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Bed, Bath, Maximize, ExternalLink, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation';
import type { Property } from '../types';
import { formatPrice } from '../lib/seo/schemas';
import { FavoriteButton } from '@/src/components/FavoriteButton';

interface PropertyCardProps {
  property: Property;
  priority?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onContact?: (id: string, title: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  priority: imagePriority = false,
  isFavorite = false,
  onToggleFavorite,
  onContact,
}) => {
  const t = useTranslations('common');

  const propertyUrl = `/properties/${property.slug ?? property.id}` as any;

  return (
    <motion.div
      className="group bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden hover:border-gold/30 transition-all duration-500 shadow-xl flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={propertyUrl} className="block h-full">
          <Image
            src={property.images?.[0] ?? 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
            priority={imagePriority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 via-transparent to-transparent opacity-60" />
        </Link>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {property.isSeafront && (
            <span className="bg-gold text-luxury-black px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg">
              {t('badges.seafront', { defaultValue: 'Seafront' })}
            </span>
          )}
          {property.propertyType === 'Penthouse' && (
            <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
              {t('search.types.penthouse', { defaultValue: 'Penthouse' })}
            </span>
          )}
        </div>

        {/* Favourite */}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton
            propertyId={property.id || property.slug || ""}
            isFavorite={isFavorite}
            onToggle={(id) => onToggleFavorite?.(id)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-gold/60 mb-2">
            <MapPin size={12} />
            <span className="text-[10px] uppercase font-bold tracking-widest">{property.locationName}</span>
          </div>

          <Link href={propertyUrl}>
            <h3 className="text-xl font-serif text-white mb-4 group-hover:text-gold transition-colors line-clamp-2 min-h-[3.5rem]">
              {property.title}
            </h3>
          </Link>

          <div className="mt-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gold font-bold text-lg">
                {formatPrice(property.price)}
                {property.type === 'rent' && (
                  <span className="text-[10px] text-white/40 ml-1">{t('common.per_month', { defaultValue: '/mo' })}</span>
                )}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/30">
                {property.type === 'rent' ? t('market.forRent', { defaultValue: 'For Rent' }) : t('market.forSale', { defaultValue: 'For Sale' })}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-6">
              {[
                { icon: Bed, label: t('common.beds_short', { defaultValue: 'Beds' }), value: property.beds },
                { icon: Bath, label: t('common.baths_short', { defaultValue: 'Baths' }), value: property.baths },
                { icon: Maximize, label: 'm²', value: property.sqm },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Icon size={14} className="text-gold/80" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase font-bold">{label}</span>
                    <span className="text-xs font-bold">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Link
          href={propertyUrl}
          className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-luxury-black hover:border-gold transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          {t('common.view_listing')}
          <ExternalLink size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};
