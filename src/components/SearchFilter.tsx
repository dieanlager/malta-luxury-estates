import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Home, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LOCATIONS } from '../lib/data';
import { Location } from '../types';

export const SearchFilter: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all_types');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Location[]>([]);

  const propertyTypes = ['all_types', 'villa', 'apartment', 'penthouse', 'palazzo', 'house_of_character', 'maisonette'];

  const logEvent = (name: string, params: any) => {
    console.log(`[Analytics] ${name}:`, params);
  };

  useEffect(() => {
    if (query.length > 1) {
      const filtered = LOCATIONS.filter(loc =>
        loc.nameEn.toLowerCase().includes(query.toLowerCase()) ||
        (loc.nameMt && loc.nameMt.toLowerCase().includes(query.toLowerCase()))
      );
      setSuggestions(filtered);
      setIsLocationOpen(true);
    } else {
      setSuggestions([]);
      setIsLocationOpen(false);
    }
  }, [query]);

  const handleSearch = () => {
    const match = LOCATIONS.find(loc => loc.nameEn.toLowerCase() === query.toLowerCase()) || suggestions[0];

    logEvent('search_submit', {
      query,
      selectedType,
      matchedSlug: match?.slug || 'none'
    });

    if (match) {
      const typeParam = selectedType !== 'all_types' ? `?type=${selectedType.toLowerCase().replace(/ /g, '-')}` : '';
      navigate(`/properties/${match.slug}${typeParam}`);
    } else {
      navigate(`/properties/all?q=${encodeURIComponent(query)}`);
    }
  };

  const handleQuickFilter = (tag: string) => {
    logEvent('quick_filter_click', { tag });

    let filterParams = '';
    if (tag === 'seafront') filterParams = '?feature=seafront';
    if (tag === 'with_pool') filterParams = '?feature=pool';
    if (tag === 'historic') filterParams = '?type=palazzo,house-of-character';
    if (tag === 'modern') filterParams = '?style=modern';
    if (tag === 'high_efficiency') filterParams = '?epc=A,B';

    navigate(`/properties/all${filterParams}`);
  };

  return (
    <div className="w-full max-w-5xl relative z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="bg-white/10 backdrop-blur-2xl p-2 rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row gap-2"
      >
        {/* LOCATION INPUT */}
        <div className="flex-1 relative">
          <div className="flex items-center px-6 py-4 gap-4 border-b lg:border-b-0 lg:border-r border-white/10 group">
            <MapPin className="text-gold group-focus-within:scale-110 transition-transform" size={22} />
            <div className="flex-1">
              <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">{t('search.location')}</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length > 1 && setIsLocationOpen(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('search.placeholder')}
                aria-label="Search by location in Malta"
                className="bg-transparent border-none outline-none text-white placeholder:text-white/20 w-full text-sm font-medium"
              />
            </div>
            {query && (
              <button onClick={() => setQuery('')} className="text-white/20 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {isLocationOpen && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-3 bg-luxury-black/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[60]"
              >
                {suggestions.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      logEvent('autocomplete_select', { slug: loc.slug });
                      setQuery(loc.nameEn);
                      setIsLocationOpen(false);
                      navigate(`/properties/${loc.slug}${selectedType !== 'all_types' ? `?type=${selectedType.toLowerCase().replace(/ /g, '-')}` : ''}`);
                    }}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 text-left transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                      <MapPin size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{loc.nameEn}</div>
                      <div className="text-[10px] uppercase tracking-wider text-white/40">{loc.island} • {loc.locationType}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PROPERTY TYPE SELECT */}
        <div className="flex-1 relative">
          <button
            onClick={() => setIsTypeOpen(!isTypeOpen)}
            className="w-full flex items-center px-6 py-4 gap-4 border-b lg:border-b-0 lg:border-r border-white/10 group text-left"
          >
            <Home className="text-gold group-hover:scale-110 transition-transform" size={22} />
            <div className="flex-1">
              <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">{t('search.property_type')}</label>
              <div className="text-sm font-medium text-white flex items-center justify-between">
                {selectedType === 'all_types' ? t('search.all_types') : t(`search.types.${selectedType}`)}
                <ChevronDown size={16} className={`transition-transform duration-300 ${isTypeOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>

          <AnimatePresence>
            {isTypeOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-3 bg-luxury-black/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[60] grid grid-cols-1 p-2"
              >
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      setIsTypeOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-left text-sm transition-all ${selectedType === type ? 'bg-gold text-luxury-black font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    {type === 'all_types' ? t('search.all_types') : t(`search.types.${type}`)}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SEARCH BUTTON */}
        <div className="p-2 lg:w-48">
          <button
            onClick={handleSearch}
            aria-label="Search properties"
            className="w-full h-full gold-gradient text-luxury-black px-8 py-4 lg:py-0 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3 group"
          >
            <Search size={18} className="group-hover:rotate-12 transition-transform" />
            <span>{t('search.search_button')}</span>
          </button>
        </div>
      </motion.div>

      {/* Quick Filters / Tags */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { id: 'seafront', label: t('search.filters.seafront') },
            { id: 'with_pool', label: t('search.filters.with_pool') },
            { id: 'historic', label: t('search.filters.historic') },
            { id: 'modern', label: t('search.filters.modern') },
            { id: 'high_efficiency', label: t('search.filters.high_efficiency') }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleQuickFilter(filter.id)}
              className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:border-gold/50 hover:text-gold transition-all"
            >
              {filter.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
          {t('search.try_suggest')} <span className="text-white/40">"Sliema"</span>, <span className="text-white/40">"St. Julian's"</span>, or <span className="text-white/40">"Valletta"</span>
        </p>
      </div>
    </div>
  );
};
