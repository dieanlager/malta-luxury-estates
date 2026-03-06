import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Bed, Bath, Maximize, ArrowUpRight, Phone } from 'lucide-react';
import { Property } from '../types';
import { FavoriteButton } from './FavoriteButton';
import { InvestmentPassportButton } from './InvestmentPassport';
import { PriceHistoryButton } from './PriceHistory';
import { PropertyTwinButton } from './PropertyTwinFinder';
import { EPCButton } from './EPCCalculator';
import { NoiseAnalysisButton } from './NoiseAnalysis';

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onContact?: (propertyId: string, propertyTitle: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavorite = false,
  onToggleFavorite,
  onContact,
}) => {
  const formatPrice = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    return `€${value.toLocaleString()}`;
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "image": property.images[0],
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.locationName.split(',')[0],
      "addressCountry": "MT"
    },
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": property.sqm,
      "unitCode": "MTK"
    }
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -10 }}
        className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 transition-all duration-500 hover:border-gold/30 shadow-xl flex flex-col h-full"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-luxury-black/80 backdrop-blur-md text-[9px] font-bold uppercase tracking-widest rounded-full border border-white/10 text-gold">
              {property.propertyType}
            </span>
            {property.isSeafront && (
              <span className="px-3 py-1 bg-gold text-luxury-black text-[9px] font-bold uppercase tracking-widest rounded-full">
                Seafront
              </span>
            )}
            <PriceHistoryButton property={property} />
          </div>

          {/* Favorite Button */}
          {onToggleFavorite && (
            <div className="absolute top-4 right-4">
              <FavoriteButton
                propertyId={property.id}
                isFavorite={isFavorite}
                onToggle={onToggleFavorite}
                size="sm"
              />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-60" />

          {/* Quick Contact + PDF on hover */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex gap-2">
            {onContact && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onContact(property.id, property.title);
                }}
                className="flex-1 py-2.5 bg-gold/90 backdrop-blur-md text-luxury-black rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gold transition-colors"
              >
                <Phone size={12} />
                Enquire Now
              </button>
            )}
            <InvestmentPassportButton property={property} variant="card" />
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-serif group-hover:text-gold transition-colors leading-tight line-clamp-2">{property.title}</h3>
            <ArrowUpRight className="text-gold/40 group-hover:text-gold transition-colors shrink-0" size={20} />
          </div>

          <div className="flex items-center gap-1 text-white/60 text-xs mb-6 font-medium">
            <MapPin size={12} className="text-gold" />
            <span>{property.locationName}</span>
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gold font-bold text-lg">
                {formatPrice(property.price)}
                {property.type === 'rent' && <span className="text-[10px] text-white/40 ml-1">/ month</span>}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/30">
                For {property.type}
              </span>
            </div>

            <div className="flex gap-2">
              <PropertyTwinButton property={property} />
              <EPCButton property={property} />
              <NoiseAnalysisButton property={property} />
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Bed size={14} className="text-gold/80" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase font-bold">Beds</span>
                  <span className="text-xs font-bold">{property.beds}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Bath size={14} className="text-gold/80" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase font-bold">Baths</span>
                  <span className="text-xs font-bold">{property.baths}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Maximize size={14} className="text-gold/80" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase font-bold">Area</span>
                  <span className="text-xs font-bold">{property.sqm}m²</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
