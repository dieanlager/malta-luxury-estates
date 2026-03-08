import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Filter, ArrowLeft, Home, SlidersHorizontal } from 'lucide-react';
import { PROPERTIES } from '../constants';
import { PropertyCard } from '../components/PropertyCard';
import { Property } from '../types';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMeta } from '../lib/seo/meta';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || '';
  const featureFilter = searchParams.get('feature') || '';
  const epcFilter = searchParams.get('epc') || '';

  const getLocalizedPath = (path: string) => {
    const lng = i18n.language === 'en' ? '' : `/${i18n.language}`;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${lng}${cleanPath === '/' ? '' : cleanPath}`;
  };

  usePageMeta({
    title: t('seo:properties.title'),
    description: t('seo:properties.description'),
    canonicalPath: '/properties/all',
    currentLang: i18n.language,
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
    if (activeFeatureFilters.includes('Furnished')) {
      results = results.filter(p => p.features.some(f => f.toLowerCase().includes('furnished')));
    }
    if (activeEPCFilters.length > 0) {
      results = results.filter(p => p.epcRating && activeEPCFilters.includes(p.epcRating));
    }

    setFilteredProperties(results);
    window.scrollTo(0, 0);
  }, [query, typeFilter, featureFilter, epcFilter, activeTypeFilters, activeFeatureFilters, activeEPCFilters]);

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

  const propertyTypes = [
    { key: 'villa', label: 'Villa' },
    { key: 'apartment', label: 'Apartment' },
    { key: 'penthouse', label: 'Penthouse' },
    { key: 'palazzo', label: 'Palazzo' },
    { key: 'house_of_character', label: 'House of Character' },
    { key: 'maisonette', label: 'Maisonette' }
  ];

  const features = [
    { key: 'seafront', label: 'Seafront' },
    { key: 'with_pool', label: 'Pool' },
    { key: 'furnished', label: 'Furnished' }
  ];

  return (
    <main className="min-h-screen bg-luxury-black pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb items={[
            { label: t('common.home'), href: i18n.language === 'en' ? '/' : `/${i18n.language}` },
            { label: query ? t('properties.search_results', { query }) : t('properties.all_listings') },
          ]} />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-serif mb-2">
              {query ? t('properties.search_results', { query }) : t('properties.exclusive_title')}
            </h1>
            <p className="text-white/40 text-sm">
              {t('properties.showing_count', { count: filteredProperties.length })}
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
            {isFilterOpen ? t('properties.hide_filters') : t('properties.filters_button')}
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
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">{t('properties.filter_panel.property_type')}</label>
                  <div className="flex flex-wrap gap-2">
                    {propertyTypes.map(pt => (
                      <button
                        key={pt.key}
                        onClick={() => toggleTypeFilter(pt.label)}
                        className={`px-4 py-2 rounded-lg text-xs transition-all ${activeTypeFilters.includes(pt.label)
                          ? 'bg-gold text-luxury-black font-bold border border-gold'
                          : 'bg-white/5 border border-white/10 hover:border-gold'
                          }`}
                      >
                        {t(`search.types.${pt.key}`, pt.label)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">{t('properties.filter_panel.features')}</label>
                  <div className="flex flex-wrap gap-2">
                    {features.map(f => (
                      <button
                        key={f.key}
                        onClick={() => toggleFeatureFilter(f.label)}
                        className={`px-4 py-2 rounded-lg text-xs transition-all ${activeFeatureFilters.includes(f.label)
                          ? 'bg-gold text-luxury-black font-bold border border-gold'
                          : 'bg-white/5 border border-white/10 hover:border-gold'
                          }`}
                      >
                        {t(`search.filters.${f.key}`, f.label)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">{t('properties.filter_panel.energy_rating')}</label>
                  <div className="flex flex-wrap gap-2">
                    {['A', 'B', 'C', 'D'].map(e => (
                      <button
                        key={e}
                        onClick={() => toggleEPCFilter(e)}
                        className={`px-4 py-2 rounded-lg text-xs transition-all ${activeEPCFilters.includes(e)
                          ? 'bg-emerald-500 text-luxury-black font-bold border border-emerald-500'
                          : 'bg-white/5 border border-white/10 hover:border-emerald-500/50'
                          }`}
                      >
                        {t('properties.filter_panel.rating_label', { grade: e })}
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
            <h2 className="text-2xl font-serif mb-4">{t('properties.no_results.title')}</h2>
            <p className="text-white/40 max-w-md mx-auto mb-12">
              {t('properties.no_results.desc')}
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link to={getLocalizedPath('/properties/sliema')} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-gold transition-all">
                {t('properties.no_results.explore', { location: 'Sliema' })}
              </Link>
              <Link to={getLocalizedPath('/properties/valletta')} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-gold transition-all">
                {t('properties.no_results.explore', { location: 'Valletta' })}
              </Link>
              <Link to={getLocalizedPath('/properties/st-julians')} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-gold transition-all">
                {t('properties.no_results.explore', { location: "St. Julian's" })}
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
