import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bed, Bath, Maximize, MapPin, ChevronRight, Heart } from 'lucide-react';
import { Property } from '../types';

interface PropertyGridProps {
  properties: Property[];
  locationName: string;
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({ properties, locationName }) => {
  const [filter, setFilter] = useState<'all' | 'sale' | 'rent'>('all');

  const filteredProperties = properties.filter(p => {
    if (filter === 'all') return true;
    return p.type === filter;
  });

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-serif mb-2">Available Listings</h2>
          <p className="text-white/40 text-sm">Discover {filteredProperties.length} curated properties in {locationName}</p>
        </div>
        
        <div className="flex p-1 bg-white/5 rounded-full border border-white/10">
          {(['all', 'sale', 'rent'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-8 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                filter === type 
                  ? 'gold-gradient text-luxury-black shadow-lg' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All' : type === 'sale' ? 'For Sale' : 'To Rent'}
            </button>
          ))}
        </div>
      </div>

      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group glass-card rounded-3xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-500 shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={property.images[0]} 
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-luxury-black/80 backdrop-blur-md text-gold text-[10px] font-bold uppercase tracking-widest rounded-full border border-gold/20">
                      {property.type === 'sale' ? 'For Sale' : 'To Rent'}
                    </span>
                    {property.isSeafront && (
                      <span className="px-3 py-1 bg-blue-500/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                        Seafront
                      </span>
                    )}
                  </div>
                  <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-luxury-black/40 backdrop-blur-md flex items-center justify-center text-white hover:text-red-500 transition-colors">
                    <Heart size={18} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-luxury-black to-transparent">
                    <div className="text-2xl font-serif text-white">
                      €{property.price.toLocaleString()}
                      {property.type === 'rent' && <span className="text-sm font-sans text-white/60 ml-1">/mo</span>}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-gold/60 text-[10px] font-bold uppercase tracking-widest mb-3">
                    <MapPin size={12} /> {property.locationName}
                  </div>
                  <h3 className="text-xl font-serif mb-4 group-hover:text-gold transition-colors line-clamp-1">{property.title}</h3>
                  
                  <div className="flex items-center justify-between py-4 border-y border-white/5 mb-6">
                    <div className="flex items-center gap-2">
                      <Bed size={16} className="text-white/40" />
                      <span className="text-xs font-medium">{property.beds} Beds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath size={16} className="text-white/40" />
                      <span className="text-xs font-medium">{property.baths} Baths</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Maximize size={16} className="text-white/40" />
                      <span className="text-xs font-medium">{property.sqm} m²</span>
                    </div>
                  </div>

                  <button className="w-full py-3 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest group-hover:bg-gold group-hover:text-luxury-black transition-all flex items-center justify-center gap-2">
                    View Details <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-20 text-center glass-card rounded-3xl border border-white/5">
          <p className="text-white/40 italic">No properties currently matching this criteria in {locationName}.</p>
        </div>
      )}
    </div>
  );
};
