import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bed, Bath, Maximize, Heart, ExternalLink, MapPin, Sparkles, Leaf, Volume2 } from 'lucide-react';
import { Property } from '../types';
import { formatPrice } from '../lib/seo/schemas';
import { generatePropertySchema } from '../lib/seo/schemas';
import { SchemaScript } from './SchemaScript';
import { useTranslation } from 'react-i18next';
import { EPCButton } from './EPCCalculator';
import { NoiseAnalysisButton } from './NoiseAnalysis';
import { PropertyTwinButton } from './PropertyTwinFinder';

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onContact?: (id: string, title: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavorite = false,
  onToggleFavorite,
  onContact,
}) => {
  const { t, i18n } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const schema = generatePropertySchema(property);

  const getLocalizedLink = () => {
    if (i18n.language === 'en') return `/properties/${property.id}`;
    const prefix = t('slugs.properties', 'properties');
    return `/${i18n.language}/${prefix}/${property.id}`;
  };

  return (
    <motion.div
      className="group bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden hover:border-gold/30 transition-all duration-500 shadow-xl flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <SchemaScript data={schema} />

      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link to={getLocalizedLink()} className="block h-full">
          <motion.img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 via-transparent to-transparent opacity-60" />
        </Link>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {property.isSeafront && (
            <span className="bg-gold text-luxury-black px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg">
              {t('badges.seafront')}
            </span>
          )}
          {property.propertyType === 'Penthouse' && (
            <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
              {t('search.types.penthouse')}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => onToggleFavorite?.(property.id)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isFavorite
              ? 'bg-gold text-luxury-black'
              : 'bg-luxury-black/40 backdrop-blur-md text-white hover:bg-gold hover:text-luxury-black border border-white/10'
              }`}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Agency Tag */}
        {property.agency && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-luxury-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center p-1 overflow-hidden">
              <img src={property.agency.logo} alt={property.agency.name} className="w-full h-full object-contain" />
            </div>
            <span className="text-[9px] font-bold text-white/80 uppercase tracking-tighter">{property.agency.name}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-gold/60 mb-2">
            <MapPin size={12} />
            <span className="text-[10px] uppercase font-bold tracking-widest">{property.locationName}</span>
          </div>

          <Link to={getLocalizedLink()}>
            <h3 className="text-xl font-serif text-white mb-4 group-hover:text-gold transition-colors line-clamp-2 min-h-[3.5rem]">
              {property.title}
            </h3>
          </Link>

          <div className="mt-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gold font-bold text-lg">
                {formatPrice(property.price)}
                {property.type === 'rent' && <span className="text-[10px] text-white/40 ml-1">{t('common.per_month')}</span>}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/30">
                {t('common.for')} {property.type === 'rent' ? t('market.forRent') : t('market.forSale')}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-6">
              <PropertyTwinButton property={property} />
              <EPCButton property={property} />
              <NoiseAnalysisButton property={property} />
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Bed size={14} className="text-gold/80" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase font-bold">{t('common.beds_short')}</span>
                  <span className="text-xs font-bold">{property.beds}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Bath size={14} className="text-gold/80" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase font-bold">{t('common.baths_short')}</span>
                  <span className="text-xs font-bold">{property.baths}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Maximize size={14} className="text-gold/80" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase font-bold">m²</span>
                  <span className="text-xs font-bold">{property.sqm}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => onContact?.(property.id, property.title)}
          className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-luxury-black hover:border-gold transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          {t('common.enquire')}
          <ExternalLink size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
