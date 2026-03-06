import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Filter, ArrowLeft, Home, SlidersHorizontal } from 'lucide-react';
import { PROPERTIES } from '../constants';
import { PropertyCard } from '../components/PropertyCard';
import { Property } from '../types';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMeta } from '../lib/seo/meta';

interface PropertiesPageProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onContact: (propertyId: string, propertyTitle: string) => void;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({
  favorites,
  onToggleFavorite,
  onContact,
}) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || '';
  const featureFilter = searchParams.get('feature') || '';
  const epcFilter = searchParams.get('epc') || '';

  usePageMeta({
    title: 'All Properties for Sale & Rent in Malta | Malta Luxury Real Estate',
    description: 'Browse our full portfolio of luxury properties across the Maltese islands. Apartments, villas, penthouses, and historic palazzos from Malta\'s leading agencies.',
    canonicalPath: '/properties/all',
  });

  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTypeFilters, setActiveTypeFilters] = useState<string[]>([]);
  const [activeFeatureFilters, setActiveFeatureFilters] = useState<string[]>([]);
  const [activeEPCFilters, setActiveEPCFilters] = useState<string[]>([]);

  useEffect(() => {
    let results = [...PROPERTIES];

    if (query) {
      results = results.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.locationName.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (typeFilter) {
      const types = typeFilter.split(',');
      results = results.filter(p => types.includes(p.propertyType.toLowerCase().replace(/ /g, '-')));
    }

    if (featureFilter) {
      if (featureFilter === 'seafront') {
        results = results.filter(p => p.isSeafront);
      }
      if (featureFilter === 'pool') {
        results = results.filter(p => p.features.some(f => f.toLowerCase().includes('pool')));
      }
    }

    if (epcFilter) {
      const epcs = epcFilter.split(',');
      results = results.filter(p => p.epcRating && epcs.includes(p.epcRating));
    }

    // Apply interactive filters
    if (activeTypeFilters.length > 0) {
      results = results.filter(p => activeTypeFilters.includes(p.propertyType));
    }
    if (activeFeatureFilters.includes('Seafront')) {
      results = results.filter(p => p.isSeafront);
    }
    if (activeFeatureFilters.includes('Pool')) {
      results = results.filter(p => p.features.some(f => f.toLowerCase().includes('pool')));
    }
    if (activeEPCFilters.length > 0) {
      results = results.filter(p => p.epcRating && activeEPCFilters.includes(p.epcRating));
    }

    setFilteredProperties(results);
    window.scrollTo(0, 0);
  }, [query, typeFilter, featureFilter, activeTypeFilters, activeFeatureFilters]);

  const toggleTypeFilter = (type: string) => {
    setActiveTypeFilters(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleFeatureFilter = (feature: string) => {
    setActiveFeatureFilters(prev =>
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  const toggleEPCFilter = (epc: string) => {
    setActiveEPCFilters(prev =>
      prev.includes(epc) ? prev.filter(e => e !== epc) : [...prev, epc]
    );
  };

  return (
    <main className="min-h-screen bg-luxury-black pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: query ? `Search: "${query}"` : 'All Properties' },
          ]} />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-serif mb-2">
              {query ? `Search results for "${query}"` : 'Exclusive Properties'}
            </h1>
            <p className="text-white/40 text-sm">
              Showing {filteredProperties.length} premium listings matching your criteria.
            </p>
          </div>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-3 px-6 py-3 border rounded-full text-xs uppercase tracking-widest font-bold transition-all ${isFilterOpen
              ? 'bg-gold text-luxury-black border-gold'
              : 'bg-white/5 border-white/10 hover:border-gold'
              }`}
          >
            <SlidersHorizontal size={16} />
            {isFilterOpen ? 'Hide Filters' : 'Filters'}
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">Property Type</label>
                  <div className="flex flex-wrap gap-2">
                    {['Villa', 'Apartment', 'Penthouse', 'Palazzo', 'House of Character', 'Maisonette'].map(t => (
                      <button
                        key={t}
                        onClick={() => toggleTypeFilter(t)}
                        className={`px-4 py-2 rounded-lg text-xs transition-all ${activeTypeFilters.includes(t)
                          ? 'bg-gold text-luxury-black font-bold border border-gold'
                          : 'bg-white/5 border border-white/10 hover:border-gold'
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">Features</label>
                  <div className="flex flex-wrap gap-2">
                    {['Seafront', 'Pool', 'Garden', 'Garage', 'Furnished'].map(f => (
                      <button
                        key={f}
                        onClick={() => toggleFeatureFilter(f)}
                        className={`px-4 py-2 rounded-lg text-xs transition-all ${activeFeatureFilters.includes(f)
                          ? 'bg-gold text-luxury-black font-bold border border-gold'
                          : 'bg-white/5 border border-white/10 hover:border-gold'
                          }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">Energy Rating (EPC 2026)</label>
                  <div className="flex flex-wrap gap-2">
                    {['A', 'B', 'C', 'D'].map(e => (
                      <button
                        key={e}
                        onClick={() => toggleEPCFilter(e)}
                        className={`px-4 py-2 rounded-lg text-xs transition-all ${activeEPCFilters.includes(e)
                          ? 'bg-emerald-500 text-luxury-black font-bold border border-emerald-500'
                          : 'bg-white/5 border-white/10 hover:border-emerald-500/50'
                          }`}
                      >
                        Rating {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property, i) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PropertyCard
                  property={property}
                  isFavorite={favorites.includes(property.id)}
                  onToggleFavorite={onToggleFavorite}
                  onContact={onContact}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8">
              <Search size={32} className="text-white/20" />
            </div>
            <h2 className="text-2xl font-serif mb-4">No matching properties found</h2>
            <p className="text-white/40 max-w-md mx-auto mb-12">
              We couldn't find any listings matching your search. Try adjusting your filters or exploring our most popular locations.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link to="/properties/sliema" className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-gold transition-all">
                Explore Sliema
              </Link>
              <Link to="/properties/valletta" className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-gold transition-all">
                Explore Valletta
              </Link>
              <Link to="/properties/st-julians" className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-gold transition-all">
                Explore St. Julian's
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

