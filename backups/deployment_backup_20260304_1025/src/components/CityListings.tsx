import React, { useState, useEffect } from 'react';
import { PropertyCard } from './PropertyCard';
import { getPropertiesByLocation } from '../lib/data';
import { Property } from '../types';
import { motion } from 'motion/react';

interface CityListingsProps {
  locationId: number;
  listingType?: 'sale' | 'rent' | 'both';
  limit?: number;
}

export const CityListings: React.FC<CityListingsProps> = ({
  locationId,
  listingType = 'both',
  limit = 12
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const data = await getPropertiesByLocation(locationId);
        // Filter by listing type if not 'both'
        const filtered = listingType === 'both' 
          ? data 
          : data.filter(p => p.type === listingType);
        
        setProperties(filtered.slice(0, limit));
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [locationId, listingType, limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-96 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
        <h3 className="text-xl font-serif mb-2">No Active Listings</h3>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          We are currently curating new exclusive properties for this location. 
          Please check back soon or explore nearby areas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif">Featured Properties</h2>
        <div className="text-[10px] uppercase tracking-widest font-bold text-gold">
          {properties.length} Results Found
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <PropertyCard property={p} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
