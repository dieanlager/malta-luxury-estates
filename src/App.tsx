import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import {
  Search,
  Menu,
  X,
  ChevronRight,
  MapPin,
  Bed,
  Bath,
  Maximize,
  ArrowRight,
  ArrowUpRight,
  Filter,
  Globe,
  Award,
  ShieldCheck,
  TrendingUp,
  Home,
  Heart,
  MessageSquare
} from 'lucide-react';
import { PROPERTIES, AGENCIES, ARTICLES } from './constants';
import { Property } from './types';
import { resolveArticleLang, getLocalizedArticleLink } from './lib/markdown';
import articleSlugs from './lib/article-slugs.json';
import { usePageMeta } from './lib/seo/meta';
import { DynamicMap } from './components/DynamicMap';
import { MarketSnapshot } from './components/MarketSnapshot';
import { CityPage } from './pages/CityPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { InsightsHub } from './pages/InsightsHub';
import { ArticlePage } from './pages/ArticlePage';
import { FilteredPropertiesPage } from './pages/FilteredPropertiesPage';
import { SearchFilter } from './components/SearchFilter';
import { PropertyCard } from './components/PropertyCard';
import { ContactModal } from './components/ContactModal';
import { EmailCaptureModal } from './components/EmailCaptureModal';
import { useFavorites } from './hooks/useFavorites';
import { useContactForm } from './hooks/useContactForm';
import { LOCATIONS } from './lib/data';
import { InteractiveTools } from './components/InteractiveTools';
import { PrivacyPolicy, TermsOfService, CookiePolicy } from './pages/legal/LegalPages';
import { MarketLive } from './pages/MarketLive';
import { PropertyPriceOracle } from './pages/PropertyPriceOracle';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { GozoBridgeTrackerPage } from './pages/GozoBridgeTracker';
import { MaltaPropertyQuiz } from './pages/PropertyQuiz';
import { AgencyPortal } from './pages/AgencyPortal';
import { AuthProvider } from './lib/auth';
import { ImgWithPlaceholder } from './components/ImgWithPlaceholder';
import { AuthGuard } from './components/AuthGuard';
import AgencyLogin from './pages/agency/Login';
import AgencyRegister from './pages/agency/Register';
import ForgotPassword from './pages/agency/ForgotPassword';
import ResetPassword from './pages/agency/ResetPassword';
import UpgradePage from './pages/agency/Upgrade';
import { AboutPage } from './pages/AboutPage';
import { NewsletterForm } from './components/NewsletterForm';
import { AIChatbot } from './components/AIChatbot';

// ─── Scroll To Top Button ─────────────────────────────────────────────────────
const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-top"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          onClick={scrollUp}
          aria-label="Scroll to top"
          className="fixed bottom-8 right-8 z-50 group"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full animate-ping bg-gold/20 pointer-events-none" />
          {/* Main button */}
          <span className="relative flex items-center justify-center w-12 h-12 rounded-full gold-gradient shadow-xl shadow-gold/20 group-hover:scale-110 group-hover:shadow-gold/40 transition-all duration-300">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-luxury-black -translate-y-px"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};


// Language Wrapper to handle URL-based language switching
const LanguageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { lng } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const supportedLngs = ['en', 'it', 'de', 'fr', 'pl'];
    const pathParts = location.pathname.split('/').filter(Boolean);
    const pathLng = pathParts[0];

    if (pathLng && supportedLngs.includes(pathLng)) {
      if (i18n.language !== pathLng) {
        i18n.changeLanguage(pathLng);
      }
    } else if (location.pathname === '/' || !supportedLngs.includes(pathLng)) {
      // Force English on root or if no valid lang prefix is present
      if (i18n.language !== 'en') {
        i18n.changeLanguage('en');
      }
    }
  }, [location.pathname, i18n]);

  return <>{children}</>;
};

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  ];

  const currentLang = languages.find(l => l.code === (i18n.language || 'en'));

  const handleLanguageChange = (langCode: string) => {
    setIsOpen(false);

    // If we're on root path, just switch language and redirect to standard root
    if (location.pathname === '/' || location.pathname === `/${i18n.language}`) {
      i18n.changeLanguage(langCode);
      const rootPath = langCode === 'en' ? '/' : `/${langCode}`;
      navigate(rootPath);
      return;
    }

    const pathParts = location.pathname.split('/').filter(Boolean);
    const supportedLngs = ['it', 'de', 'fr', 'pl'];

    // Map current path to English core path
    let internalParts = [...pathParts];
    if (supportedLngs.includes(pathParts[0])) {
      const currentLng = pathParts[0];
      const translatedSlugs = pathParts.slice(1);

      const slugReverseMap: Record<string, string> = {
        'nieruchomosci': 'properties', 'immobiliare': 'properties', 'immobilien': 'properties', 'proprietes': 'properties',
        'wiedza': 'insights', 'approfondimenti': 'insights', 'einblicke': 'insights', 'conseils': 'insights',
        'o-nas': 'about', 'chi-siamo': 'about', 'ueber-uns': 'about', 'a-propos': 'about',
        'rynek': 'market', 'mercato': 'market', 'markt': 'market', 'marche': 'market',
        'na-zywo': 'live', 'in-diretta': 'live', 'live-ticker': 'live', 'en-direct': 'live',
        'narzedzia': 'tools', 'strumenti': 'tools', 'outils': 'tools',
        'wycena-nieruchomosci': 'valuation', 'valutazione-immobiliare': 'valuation', 'immobilienbewertung': 'valuation', 'estimation-immobiliere': 'valuation',
        'quiz-nieruchomosci': 'quiz', 'quiz-immobiliare': 'quiz', 'immobilien-quiz': 'quiz', 'quiz-immobilier': 'quiz'
      };

      internalParts = translatedSlugs.map(s => {
        if (slugReverseMap[s]) return slugReverseMap[s];
        const langMap = (articleSlugs as any)[currentLng] || {};
        const enSlug = Object.keys(langMap).find(key => langMap[key] === s);
        return enSlug || s;
      });
    }

    // Switch lang and navigate to new path
    i18n.changeLanguage(langCode);

    const targetT = i18n.getFixedT(langCode, 'common');
    const newTranslatedParts = internalParts.map(p => targetT(`slugs.${p}`, { defaultValue: p }));

    const isArticle = internalParts.includes('insights') && internalParts.length > 1;
    let finalPath = '';

    if (langCode === 'en') {
      finalPath = '/' + internalParts.join('/');
    } else if (isArticle) {
      finalPath = getLocalizedArticleLink(internalParts[internalParts.length - 1], langCode);
    } else {
      finalPath = `/${langCode}/${newTranslatedParts.join('/')}`;
    }

    navigate(finalPath);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-gold/30 transition-all text-[10px] font-bold uppercase tracking-widest bg-white/5"
      >
        <span>{currentLang?.flag}</span>
        <span className="hidden lg:block">{currentLang?.code}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 mt-2 w-40 bg-luxury-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden"
            >
              <div className="text-[8px] uppercase tracking-widest text-white/30 px-3 py-2 border-b border-white/5 mb-1">Select Language</div>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${i18n.language === lang.code ? 'bg-gold/10 text-gold' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
                >
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span className="font-medium">{lang.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};


const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { i18n, t } = useTranslation();
  const { count: favCount } = useFavorites();

  const getLocalizedPath = (path: string) => {
    if (i18n.language === 'en') return path;

    const parts = path.split('/').filter(Boolean);
    const translatedParts = parts.map(part => {
      // For property detail or specific city, keep slug but translate prefix
      if (parts[0] === 'properties' && part !== 'properties' && part !== 'all') {
        return part;
      }

      const translated = t(`slugs.${part}`, { defaultValue: part });
      return translated;
    });

    return `/${i18n.language}/${translatedParts.join('/')}`;
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || location.pathname !== '/' ? 'bg-luxury-black/90 backdrop-blur-lg py-4 shadow-2xl' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to={getLocalizedPath('/')} className="flex items-center gap-2" aria-label="Malta Luxury Real Estate Home">
          <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center shadow-lg" aria-hidden="true">
            <span className="text-luxury-black font-serif font-bold text-xl">M</span>
          </div>
          <span className="font-serif text-2xl tracking-widest uppercase hidden sm:block">
            Malta <span className="text-gold">Luxury Real Estate</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link to={getLocalizedPath('/properties/all')} className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">
            {t('nav.properties')}
          </Link>
          <Link to={getLocalizedPath('/insights')} className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">
            {t('nav.insights')}
          </Link>
          <Link to={getLocalizedPath('/market/live')} className="flex items-center gap-2 text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium group">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            {t('nav.market')}
          </Link>
          <Link to={getLocalizedPath('/about')} className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">
            {t('nav.about')}
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <LanguageSelector />
          <button aria-label="List your luxury property" className="px-6 py-2 border border-gold/30 rounded-full text-xs uppercase tracking-widest hover:bg-gold hover:text-luxury-black transition-all duration-300">
            {t('nav.list_property')}
          </button>
        </div>

        <div className="flex md:hidden items-center gap-4">
          <LanguageSelector />
          <button
            className="text-white w-12 h-12 flex items-center justify-center -mr-2"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-luxury-black z-[60] flex flex-col p-8"
          >
            <div className="flex justify-end">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="w-12 h-12 flex items-center justify-center -mr-2 text-white"
              >
                <X size={32} />
              </button>
            </div>
            <div className="flex flex-col gap-8 mt-12">
              <Link to={getLocalizedPath('/properties/all')} onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif hover:text-gold transition-colors">
                {t('nav.properties')}
              </Link>
              <Link to={getLocalizedPath('/insights')} onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif hover:text-gold transition-colors">
                {t('nav.insights')}
              </Link>
              <Link to={getLocalizedPath('/about')} onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif hover:text-gold transition-colors">
                {t('nav.about')}
              </Link>
              <Link to={getLocalizedPath('/market/live')} onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif hover:text-gold transition-colors flex items-center gap-4">
                {t('nav.market_pulse')} <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};


const HomePage = ({ favorites, onToggleFavorite, onContact }: {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onContact: (propertyId: string, propertyTitle: string) => void;
}) => {
  const { t, i18n } = useTranslation();
  const featured = PROPERTIES.filter(p => p.type === 'sale').slice(0, 6);

  // Popular locations for the grid
  const popularLocations = [
    { slug: 'sliema', name: t('locations.sliema', 'Sliema'), count: 245, image: '/assets/images/locations/sliema.png' },
    { slug: 'st-julians', name: t('locations.st_julians', "St. Julian's"), count: 180, image: '/assets/images/locations/st-julians.png' },
    { slug: 'valletta', name: t('locations.valletta', 'Valletta'), count: 95, image: '/assets/images/locations/valletta.png' },
    { slug: 'three-cities', name: t('locations.three_cities', 'Three Cities'), count: 65, image: '/assets/images/locations/three-cities.png' },
    { slug: 'mellieha', name: t('locations.mellieha', 'Mellieħa'), count: 110, image: '/assets/images/locations/mellieha.png' },
    { slug: 'victoria', name: t('locations.gozo', 'Gozo'), count: 120, image: '/assets/images/locations/gozo.png' },
  ];

  const getLocalizedPath = (path: string) => {
    if (i18n.language === 'en') return path;

    const parts = path.split('/').filter(Boolean);
    const translatedParts = parts.map(part => {
      // Specific logic for properties link in the grid
      if (parts[0] === 'properties' && part !== 'properties' && part !== 'all') {
        return part;
      }

      const translated = t(`slugs.${part}`, { defaultValue: part });
      return translated;
    });

    return `/${i18n.language}/${translatedParts.join('/')}`;
  };

  usePageMeta({
    title: t('seo:home.title'),
    description: t('seo:home.description'),
    canonicalPath: '/',
    currentLang: i18n.language,
  });

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <ImgWithPlaceholder
            src="/assets/images/hero_malta.png"
            className="w-full h-full object-cover opacity-40 scale-105"
            alt="Malta Coast"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/60 via-luxury-black/30 to-luxury-black" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-gold uppercase tracking-[0.2em] text-[10px] font-bold">
                {t('hero.badge')}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-6 leading-[1.1]">
              {t('hero.title_part1')} <br />
              <span className="italic text-gold-gradient">{t('hero.title_part2')}</span>
            </h1>

            <p className="text-white/60 max-w-2xl mx-auto text-lg md:text-xl mb-12 font-light leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="flex justify-center">
              <SearchFilter />
            </div>

            {/* Quick Stats */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-serif text-gold">{PROPERTIES.length * 40}+</span>
                <span className="text-[9px] uppercase tracking-widest font-bold">{t('hero.stats.properties')}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-serif text-gold">{LOCATIONS.length}+</span>
                <span className="text-[9px] uppercase tracking-widest font-bold">{t('hero.stats.locations')}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-serif text-gold">€2.5M</span>
                <span className="text-[9px] uppercase tracking-widest font-bold">{t('hero.stats.avg_price')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties */}
      <section id="properties" className="py-32 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-px bg-gold" />
              <span className="text-gold uppercase tracking-widest text-xs font-bold">{t('sections.featured.badge')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif mb-4">{t('sections.featured.title')}</h2>
            <p className="text-white/50 max-w-md">{t('sections.featured.subtitle')}</p>
          </div>
          <Link to={getLocalizedPath('/properties/all')} className="gold-gradient text-luxury-black px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform">
            {t('sections.featured.view_all')} <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isFavorite={favorites.includes(property.id)}
              onToggleFavorite={onToggleFavorite}
              onContact={onContact}
            />
          ))}
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-32 bg-luxury-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1 bg-gold/10 border border-gold/20 rounded-full mb-6">
              <span className="text-gold text-[10px] font-bold uppercase tracking-widest">{t('sections.map.badge')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif mb-4">{t('sections.map.title')}</h2>
            <p className="text-white/50 max-w-2xl mx-auto">{t('sections.map.subtitle')}</p>
          </div>

          <div className="h-[600px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <DynamicMap />
          </div>
        </div>
      </section>

      {/* Market Snapshot Demo */}
      <section className="py-32 bg-luxury-black">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif mb-4 uppercase tracking-widest">{t('sections.market_snapshot.title')}</h2>
            <p className="text-white/40 text-sm">{t('sections.market_snapshot.subtitle')}</p>
          </div>
          <MarketSnapshot
            location={{
              id: 1,
              slug: 'sliema',
              nameEn: 'Sliema',
              island: 'malta',
              locationType: 'city',
              isPopular: true,
              isLuxuryHub: true
            }}
            stats={{
              locationId: 1,
              listingsSaleCount: 245,
              listingsRentCount: 120,
              medianPriceSale: 1850000,
              medianPriceRent: 3500,
              avgPriceSale: 2100000,
              avgPriceRent: 4200,
              lastCalculatedAt: new Date().toISOString()
            }}
          />
        </div>
      </section>

      {/* Featured Locations */}
      <section className="py-32 bg-luxury-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-serif mb-4">{t('sections.locations_grid.title')}</h2>
            <p className="text-white/40">{t('sections.locations_grid.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularLocations.map((loc, i) => (
              <Link
                key={i}
                to={getLocalizedPath(`/properties/${loc.slug}`)}
                className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer border border-white/5 block"
              >
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-serif mb-1">{loc.name}</h3>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gold">{loc.count} {t('common.properties', 'Properties')}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="agencies" className="py-32 bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-gold uppercase tracking-widest text-xs font-bold mb-6 block">{t('sections.partners.badge')}</span>
          <h2 className="text-3xl md:text-4xl font-serif mb-16">{t('sections.partners.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            {AGENCIES.map((agency) => (
              <div key={agency.id} className="flex flex-col items-center gap-4 group cursor-pointer">
                <div className="h-16 flex items-center justify-center">
                  <span className="text-xl md:text-2xl font-serif italic group-hover:text-gold transition-colors">{agency.name}</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-white/30">{agency.propertyCount} {t('common.listings', 'Listings')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Agencies Section */}
      <section className="py-32 bg-luxury-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-card rounded-[3rem] p-12 md:p-20 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-block px-4 py-1 bg-gold/10 border border-gold/20 rounded-full mb-6">
                <span className="text-gold text-[10px] font-bold uppercase tracking-widest">{t('sections.agencies.badge')}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight">{t('sections.agencies.title_part1')} <br /> <span className="text-gold">{t('sections.agencies.title_part2')}</span></h2>
              <p className="text-white/50 text-lg mb-10 leading-relaxed">
                {t('sections.agencies.subtitle')}
              </p>
              <ul className="space-y-4 mb-12">
                {Object.values(t('sections.agencies.features', { returnObjects: true }) as Record<string, string>).map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium">
                    <ShieldCheck className="text-gold" size={18} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                aria-label={t('sections.agencies.cta')}
                className="gold-gradient text-luxury-black px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
              >
                {t('sections.agencies.cta')}
              </button>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-square rounded-3xl overflow-hidden border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000"
                  className="w-full h-full object-cover opacity-60"
                  alt="Modern Office"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-luxury-black via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-8 -left-8 glass-card p-8 rounded-2xl border border-gold/20 shadow-2xl max-w-xs">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center">
                    <TrendingUp className="text-luxury-black" size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-serif">150k+</div>
                    <div className="text-[9px] uppercase tracking-widest font-bold text-white/40">Monthly Reach</div>
                  </div>
                </div>
                <p className="text-xs text-white/50 italic">"The highest conversion rate for luxury leads we've seen on the island."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InteractiveTools />

      {/* Investment Guides */}
      <section id="investment" className="py-32 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Expert Knowledge</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif mb-4">{t('sections.insights.title', 'Investment Insights')}</h2>
          <p className="text-white/50 max-w-2xl mx-auto">{t('sections.insights.subtitle', 'Strategic advice for international investors, residency seekers, and high-net-worth individuals looking at the Maltese market.')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {ARTICLES.slice(0, 3).map((article) => (
            <Link
              key={article.slug}
              to={getLocalizedArticleLink(article.slug, i18n.language)}
              className="group block"
            >
              <motion.div
                whileHover={{ y: -5 }}
                className="cursor-pointer"
              >
                <div className="aspect-video overflow-hidden rounded-2xl mb-6 relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-gold text-luxury-black text-[10px] font-bold uppercase tracking-widest rounded-full">
                      {article.category}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-serif mb-3 group-hover:text-gold transition-colors leading-tight">{article.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-4">{article.excerpt}</p>
                <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold">
                  {t('article.read_guide', 'Read Guide')} <ChevronRight size={14} />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto gold-gradient rounded-[3rem] p-12 md:p-24 text-center text-luxury-black relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-serif mb-8">{t('cta.title', 'Ready to find your dream estate?')}</h2>
            <p className="text-luxury-black/70 mb-12 max-w-lg mx-auto font-medium text-lg">{t('cta.subtitle', 'Connect with our luxury specialists today for a private consultation and exclusive access to off-market listings.')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onContact('', '')}
                className="bg-luxury-black text-white px-12 py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
              >
                {t('cta.contact_button', 'Contact a Specialist')}
              </button>
              <Link to={getLocalizedPath('/properties/all')} className="border-2 border-luxury-black text-luxury-black px-12 py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-luxury-black hover:text-white transition-all">
                {t('cta.explore_button', 'Explore Malta Property')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const AppRoutes = ({ handleContact, favCount }: { handleContact: any, favCount: number }) => {
  const fav = useFavorites();
  const contact = useContactForm();

  return (
    <Routes>
      <Route path="/" element={<HomePage favorites={fav.favorites} onToggleFavorite={fav.toggle} onContact={handleContact} />} />
      <Route path="/:lng" element={<LanguageWrapper><HomePage favorites={fav.favorites} onToggleFavorite={fav.toggle} onContact={handleContact} /></LanguageWrapper>} />

      {/* Property Routes */}
      {['properties', 'nieruchomosci', 'immobiliare', 'immobilien', 'proprietes'].map(p => (
        <React.Fragment key={p}>
          <Route path={`/${p}/all`} element={<PropertiesPage favorites={fav.favorites} onToggleFavorite={fav.toggle} onContact={handleContact} />} />
          <Route path={`/:lng/${p}/all`} element={<LanguageWrapper><PropertiesPage favorites={fav.favorites} onToggleFavorite={fav.toggle} onContact={handleContact} /></LanguageWrapper>} />
          <Route path={`/:lng/${p}/wszystkie`} element={<LanguageWrapper><PropertiesPage favorites={fav.favorites} onToggleFavorite={fav.toggle} onContact={handleContact} /></LanguageWrapper>} />
          <Route path={`/:lng/${p}/tutti`} element={<LanguageWrapper><PropertiesPage favorites={fav.favorites} onToggleFavorite={fav.toggle} onContact={handleContact} /></LanguageWrapper>} />
          <Route path={`/:lng/${p}/alle`} element={<LanguageWrapper><PropertiesPage favorites={fav.favorites} onToggleFavorite={fav.toggle} onContact={handleContact} /></LanguageWrapper>} />
          <Route path={`/:lng/${p}/toutes`} element={<LanguageWrapper><PropertiesPage favorites={fav.favorites} onToggleFavorite={fav.toggle} onContact={handleContact} /></LanguageWrapper>} />

          <Route path={`/${p}/:citySlug`} element={<CityPage favorites={fav.favorites} onToggleFavorite={fav.toggle} onContact={handleContact} />} />
          <Route path={`/:lng/${p}/:citySlug`} element={<LanguageWrapper><CityPage favorites={fav.favorites} onToggleFavorite={fav.toggle} onContact={handleContact} /></LanguageWrapper>} />

          <Route path={`/${p}/:id`} element={<PropertyDetailPage onContact={handleContact} />} />
          <Route path={`/:lng/${p}/:id`} element={<LanguageWrapper><PropertyDetailPage onContact={handleContact} /></LanguageWrapper>} />
        </React.Fragment>
      ))}

      {/* Insight Routes */}
      {['insights', 'wiedza', 'approfondimenti', 'einblicke', 'conseils'].map(p => (
        <React.Fragment key={p}>
          <Route path={`/${p}`} element={<InsightsHub />} />
          <Route path={`/:lng/${p}`} element={<LanguageWrapper><InsightsHub /></LanguageWrapper>} />
          <Route path={`/${p}/:slug`} element={<ArticlePage />} />
          <Route path={`/:lng/${p}/:slug`} element={<LanguageWrapper><ArticlePage /></LanguageWrapper>} />
        </React.Fragment>
      ))}

      {/* Market & Tools */}
      {['market', 'rynek', 'mercato', 'markt', 'marche'].map(p => (
        <React.Fragment key={p}>
          <Route path={`/${p}/live`} element={<MarketLive />} />
          <Route path={`/:lng/${p}/live`} element={<LanguageWrapper><MarketLive /></LanguageWrapper>} />
          <Route path={`/:lng/${p}/na-zywo`} element={<LanguageWrapper><MarketLive /></LanguageWrapper>} />
          <Route path={`/:lng/${p}/in-diretta`} element={<LanguageWrapper><MarketLive /></LanguageWrapper>} />
          <Route path={`/:lng/${p}/live-ticker`} element={<LanguageWrapper><MarketLive /></LanguageWrapper>} />
          <Route path={`/:lng/${p}/en-direct`} element={<LanguageWrapper><MarketLive /></LanguageWrapper>} />
        </React.Fragment>
      ))}

      {['about', 'o-nas', 'chi-siamo', 'ueber-uns', 'a-propos'].map(p => (
        <React.Fragment key={p}>
          <Route path={`/${p}`} element={<AboutPage />} />
          <Route path={`/:lng/${p}`} element={<LanguageWrapper><AboutPage /></LanguageWrapper>} />
        </React.Fragment>
      ))}

      {['tools', 'narzedzia', 'strumenti', 'outils'].map(p => (
        <React.Fragment key={p}>
          <Route path={`/:lng/${p}/valuation`} element={<LanguageWrapper><PropertyPriceOracle /></LanguageWrapper>} />
          <Route path={`/:lng/${p}/wycena-nieruchomosci`} element={<LanguageWrapper><PropertyPriceOracle /></LanguageWrapper>} />
          <Route path={`/:lng/${p}/valutazione-immobiliare`} element={<LanguageWrapper><PropertyPriceOracle /></LanguageWrapper>} />
          <Route path={`/:lng/${p}/immobilienbewertung`} element={<LanguageWrapper><PropertyPriceOracle /></LanguageWrapper>} />
          <Route path={`/:lng/${p}/estimation-immobiliere`} element={<LanguageWrapper><PropertyPriceOracle /></LanguageWrapper>} />

          <Route path={`/:lng/${p}/quiz`} element={<LanguageWrapper><MaltaPropertyQuiz /></LanguageWrapper>} />
          <Route path={`/:lng/${p}/quiz-nieruchomosci`} element={<LanguageWrapper><MaltaPropertyQuiz /></LanguageWrapper>} />
          <Route path={`/:lng/${p}/quiz-immobiliare`} element={<LanguageWrapper><MaltaPropertyQuiz /></LanguageWrapper>} />
          <Route path={`/:lng/${p}/immobilien-quiz`} element={<LanguageWrapper><MaltaPropertyQuiz /></LanguageWrapper>} />
          <Route path={`/:lng/${p}/quiz-immobilier`} element={<LanguageWrapper><MaltaPropertyQuiz /></LanguageWrapper>} />
        </React.Fragment>
      ))}

      {/* Base English Routes as fallback */}
      <Route path="/insights" element={<InsightsHub />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/market/live" element={<MarketLive />} />

      {/* Legal & Auth */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/:lng/privacy-policy" element={<LanguageWrapper><PrivacyPolicy /></LanguageWrapper>} />

      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/:lng/terms-of-service" element={<LanguageWrapper><TermsOfService /></LanguageWrapper>} />

      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/:lng/cookie-policy" element={<LanguageWrapper><CookiePolicy /></LanguageWrapper>} />

      <Route path="/agency/login" element={<AgencyLogin />} />
      <Route path="/agency/register" element={<AgencyRegister />} />
      <Route path="/agency/portal" element={<AuthGuard><AgencyPortal /></AuthGuard>} />
    </Routes>
  );
};

const WeChatButton = () => {
  const { t } = useTranslation();
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="fixed bottom-32 right-8 z-50 flex flex-col items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="bg-white p-4 rounded-2xl shadow-2xl border border-luxury-black/5 pointer-events-auto"
          >
            <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded-lg mb-2">
              <MessageSquare className="text-luxury-black/20" size={48} />
            </div>
            <p className="text-[9px] text-center font-bold uppercase tracking-widest text-luxury-black">{t('common:scan_to_connect')}</p>
            <p className="text-[8px] text-center text-luxury-black/40">{t('common:official_support')}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onMouseEnter={() => setShowQR(true)}
        onMouseLeave={() => setShowQR(false)}
        className="w-14 h-14 bg-[#07C160] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform pointer-events-auto"
        aria-label={t('common:official_support')}
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
};

export default function App() {
  const fav = useFavorites();
  const contact = useContactForm();

  const handleContact = (propertyId: string, propertyTitle: string) => {
    contact.open(propertyId, propertyTitle || undefined);
  };

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen">
          <Navbar />
          <AppRoutes handleContact={handleContact} favCount={fav.count} />
          <Footer />
          <ScrollToTopButton />
          <WeChatButton />

          <ContactModal
            isOpen={contact.isOpen}
            isSubmitting={contact.isSubmitting}
            isSuccess={contact.isSuccess}
            error={contact.error}
            formData={contact.formData}
            onClose={contact.close}
            onUpdateField={contact.updateField}
            onSubmit={contact.submit}
          />
          <EmailCaptureModal
            isOpen={fav.showEmailCapture}
            onClose={fav.dismissEmailCapture}
            favoritesCount={fav.count}
          />
          <AIChatbot />
        </div>
      </AuthProvider>
    </Router>
  );
}

const Footer = () => {
  const { i18n, t } = useTranslation();

  const getLocalizedPath = (path: string) => {
    if (i18n.language === 'en') return path;

    const parts = path.split('/').filter(Boolean);
    const translatedParts = parts.map(part => {
      // For property detail or specific city, keep slug but translate prefix
      if (parts[0] === 'properties' && part !== 'properties' && part !== 'all') {
        return part;
      }

      const translated = t(`slugs.${part}`, { defaultValue: part });
      return translated;
    });

    return `/${i18n.language}/${translatedParts.join('/')}`;
  };

  return (
    <footer className="bg-luxury-black border-t border-white/5 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24 pb-24 border-b border-white/5">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-px bg-gold/50" />
            <span className="text-gold uppercase tracking-widest text-[10px] font-bold">{t('footer.premier_destinations')}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-8">
            {LOCATIONS.filter(l => l.isPopular).slice(0, 10).map(city => (
              <Link
                key={city.slug}
                to={getLocalizedPath(`/properties/${city.slug}`)}
                className="group block"
              >
                <h4 className="text-white group-hover:text-gold transition-colors font-serif text-lg mb-1">{city.nameEn}</h4>
                <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold block">{t('common:estate_in', { location: city.nameEn })}</span>
                <div className="h-0.5 w-0 group-hover:w-12 bg-gold mt-4 transition-all duration-300" />
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
          <div className="col-span-1">
            <Link to={getLocalizedPath('/')} className="flex items-center gap-2 mb-8" aria-label="Malta Luxury Real Estate Home">
              <div className="w-8 h-8 gold-gradient rounded-full flex items-center justify-center" aria-hidden="true">
                <span className="text-luxury-black font-serif font-bold">M</span>
              </div>
              <span className="font-serif text-xl tracking-widest uppercase">
                Malta <span className="text-gold">Luxury Real Estate</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-8">{t('footer.quick_links')}</h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li><Link to={getLocalizedPath('/market/live')} className="hover:text-gold transition-colors flex items-center gap-2">{t('nav.market_pulse')} <span className="w-1 h-1 rounded-full bg-red-500" /></Link></li>
              <li><Link to={getLocalizedPath('/tools/quiz')} className="hover:text-gold transition-colors font-bold text-white">{t('footer.quiz')}</Link></li>
              <li><Link to={getLocalizedPath('/tools/valuation')} className="hover:text-gold transition-colors">{t('seo:tools.valuation.title')}</Link></li>
              <li><Link to={getLocalizedPath('/agency/portal')} className="text-gold hover:text-white transition-colors flex items-center gap-2">{t('footer.portal_for_agencies')} <ArrowUpRight size={14} /></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-8">{t('footer.legal')}</h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li><Link to={getLocalizedPath('/about')} className="hover:text-gold transition-colors">{t('nav.about')}</Link></li>
              <li><Link to={getLocalizedPath('/privacy-policy')} className="hover:text-gold transition-colors">{t('seo:privacy.title')}</Link></li>
              <li><Link to={getLocalizedPath('/terms-of-service')} className="hover:text-gold transition-colors">{t('seo:terms.title')}</Link></li>
              <li><Link to={getLocalizedPath('/cookie-policy')} className="hover:text-gold transition-colors">{t('seo:cookies.title')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-8">{t('footer.knowledge_hub')}</h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li><Link to={getLocalizedArticleLink('buying-property-in-malta-as-a-foreigner-2026', i18n.language)} className="hover:text-gold transition-colors">{t('seo:insights.title_buying')}</Link></li>
              <li><Link to={getLocalizedArticleLink('special-designated-areas-malta-guide', i18n.language)} className="hover:text-gold transition-colors">{t('seo:insights.title_sda')}</Link></li>
              <li><Link to={getLocalizedArticleLink('rental-yields-malta-2026', i18n.language)} className="hover:text-gold transition-colors">{t('seo:insights.title_yields')}</Link></li>
              <li><Link to={getLocalizedArticleLink('property-taxes-malta-2026', i18n.language)} className="hover:text-gold transition-colors">{t('seo:insights.title_taxes')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-8">Newsletter</h4>
            <p className="text-sm text-white/40 mb-6">{t('footer.newsletter.subtitle')}</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/20">
          <p>© 2026 Malta Luxury Real Estate. All rights reserved. <span className="mx-2 opacity-20">|</span> {t('common:design_by')} <a href="https://brandhouse.com.pl" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors font-medium">Brand House</a></p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <Link to={getLocalizedPath('/privacy-policy')} className="hover:text-gold transition-colors">{t('seo:privacy.title')}</Link>
            <Link to={getLocalizedPath('/terms-of-service')} className="hover:text-gold transition-colors">{t('seo:terms.title')}</Link>
            <Link to={getLocalizedPath('/cookie-policy')} className="hover:text-gold transition-colors">{t('seo:cookies.title')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
