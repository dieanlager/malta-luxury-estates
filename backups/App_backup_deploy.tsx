/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
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
  Heart
} from 'lucide-react';
import { PROPERTIES, AGENCIES, ARTICLES } from './constants';
import { Property } from './types';
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


const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { count: favCount } = useFavorites();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || location.pathname !== '/' ? 'bg-luxury-black/90 backdrop-blur-lg py-4 shadow-2xl' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2" aria-label="Malta Luxury Real Estate Home">
          <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center shadow-lg" aria-hidden="true">
            <span className="text-luxury-black font-serif font-bold text-xl">M</span>
          </div>
          <span className="font-serif text-2xl tracking-widest uppercase hidden sm:block">
            Malta <span className="text-gold">Luxury Estates</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-12">
          <Link to="/properties/all" className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">
            Properties
          </Link>
          <Link to="/insights" className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">
            Insights
          </Link>
          <Link to="/market/live" className="flex items-center gap-2 text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium group">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Market
          </Link>
          <Link to="/about" className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium">
            About
          </Link>
          <button aria-label="List your luxury property" className="px-6 py-2 border border-gold/30 rounded-full text-xs uppercase tracking-widest hover:bg-gold hover:text-luxury-black transition-all duration-300">
            List Property
          </button>
        </div>

        <button
          className="md:hidden text-white w-12 h-12 flex items-center justify-center -mr-2"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={28} />
        </button>
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
              <Link to="/properties/all" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif hover:text-gold transition-colors">
                Properties
              </Link>
              <Link to="/insights" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif hover:text-gold transition-colors">
                Insights
              </Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif hover:text-gold transition-colors">
                About
              </Link>
              <Link to="/market/live" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif hover:text-gold transition-colors flex items-center gap-4">
                Market Pulse <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
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
  const featured = PROPERTIES.filter(p => p.type === 'sale').slice(0, 6);

  // Popular locations for the grid
  const popularLocations = [
    { slug: 'sliema', name: 'Sliema', count: 245, image: '/assets/images/locations/sliema.png' },
    { slug: 'st-julians', name: "St. Julian's", count: 180, image: '/assets/images/locations/st-julians.png' },
    { slug: 'valletta', name: 'Valletta', count: 95, image: '/assets/images/locations/valletta.png' },
    { slug: 'three-cities', name: 'Three Cities', count: 65, image: '/assets/images/locations/three-cities.png' },
    { slug: 'mellieha', name: 'Mellieħa', count: 110, image: '/assets/images/locations/mellieha.png' },
    { slug: 'victoria', name: 'Gozo', count: 120, image: '/assets/images/locations/gozo.png' },
  ];

  usePageMeta({
    title: 'Malta Luxury Real Estate | Premium Real Estate Marketplace',
    description: 'Discover the finest properties across the Maltese islands. Curated luxury listings for international buyers, HNWIs, and residency seekers.',
    canonicalPath: '/',
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
                Malta's #1 Premium Real Estate Marketplace
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-6 leading-[1.1]">
              The Finest Properties <br />
              <span className="italic text-gold-gradient">Across the Islands</span>
            </h1>

            <p className="text-white/60 max-w-2xl mx-auto text-lg md:text-xl mb-12 font-light leading-relaxed">
              Curated listings from Malta's leading agencies for international buyers, HNWIs, and residency seekers.
            </p>

            <div className="flex justify-center">
              <SearchFilter />
            </div>

            {/* Quick Stats */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-serif text-gold">{PROPERTIES.length * 40}+</span>
                <span className="text-[9px] uppercase tracking-widest font-bold">Luxury Listings</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-serif text-gold">{LOCATIONS.length}+</span>
                <span className="text-[9px] uppercase tracking-widest font-bold">Locations</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-serif text-gold">€2.5M</span>
                <span className="text-[9px] uppercase tracking-widest font-bold">Avg. Price Range</span>
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
              <span className="text-gold uppercase tracking-widest text-xs font-bold">Exclusive Portfolio</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif mb-4">Curated Selection</h2>
            <p className="text-white/50 max-w-md">Hand-picked premium properties across the Maltese islands, vetted for quality and investment potential.</p>
          </div>
          <Link to="/properties/all" className="gold-gradient text-luxury-black px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform">
            View All <ArrowRight size={14} />
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
              <span className="text-gold text-[10px] font-bold uppercase tracking-widest">Geographic Exploration</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif mb-4">Explore the Archipelago</h2>
            <p className="text-white/50 max-w-2xl mx-auto">From the historic streets of Valletta to the serene farmhouses of Gozo, find your perfect location on the map.</p>
          </div>

          <DynamicMap />
        </div>
      </section>

      {/* Market Snapshot Demo */}
      <section className="py-32 bg-luxury-black">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif mb-4 uppercase tracking-widest">Real-Time Market Intelligence</h2>
            <p className="text-white/40 text-sm">Our programmatic engine aggregates data from across the islands to provide you with accurate investment benchmarks.</p>
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
            <h2 className="text-4xl font-serif mb-4">Explore by Location</h2>
            <p className="text-white/40">Discover the unique character of Malta's most prestigious areas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularLocations.map((loc, i) => (
              <Link
                key={i}
                to={`/properties/${loc.slug}`}
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
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gold">{loc.count} Properties</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="agencies" className="py-32 bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-gold uppercase tracking-widest text-xs font-bold mb-6 block">Industry Leaders</span>
          <h2 className="text-3xl md:text-4xl font-serif mb-16">Trusted by Malta's Leading Agencies</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            {AGENCIES.map((agency) => (
              <div key={agency.id} className="flex flex-col items-center gap-4 group cursor-pointer">
                <div className="h-16 flex items-center justify-center">
                  <span className="text-xl md:text-2xl font-serif italic group-hover:text-gold transition-colors">{agency.name}</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-white/30">{agency.propertyCount} Listings</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-4 group cursor-pointer">
              <div className="h-16 flex items-center justify-center">
                <span className="text-xl md:text-2xl font-serif italic group-hover:text-gold transition-colors">Sara Grech</span>
              </div>
              <span className="text-[9px] uppercase tracking-widest font-bold text-white/30">850+ Listings</span>
            </div>
            <div className="flex flex-col items-center gap-4 group cursor-pointer">
              <div className="h-16 flex items-center justify-center">
                <span className="text-xl md:text-2xl font-serif italic group-hover:text-gold transition-colors">Belair Real Estate</span>
              </div>
              <span className="text-[9px] uppercase tracking-widest font-bold text-white/30">620+ Listings</span>
            </div>
          </div>
        </div>
      </section>

      {/* For Agencies Section */}
      <section className="py-32 bg-luxury-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-card rounded-[3rem] p-12 md:p-20 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-block px-4 py-1 bg-gold/10 border border-gold/20 rounded-full mb-6">
                <span className="text-gold text-[10px] font-bold uppercase tracking-widest">For Agencies & Developers</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight">Reach the World's Most <br /> <span className="text-gold">Exclusive Buyers</span></h2>
              <p className="text-white/50 text-lg mb-10 leading-relaxed">
                Join our curated luxury marketplace and showcase your portfolio to high-net-worth individuals, international investors, and residency seekers.
              </p>
              <ul className="space-y-4 mb-12">
                {[
                  'Automated XML/JSON Feed Integrations',
                  'High-Intent International Audience',
                  'Detailed Performance Analytics',
                  'Concierge-Style Support'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium">
                    <ShieldCheck className="text-gold" size={18} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                aria-label="Become a founding partner"
                className="gold-gradient text-luxury-black px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
              >
                Become a Founding Partner
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
          <h2 className="text-4xl md:text-5xl font-serif mb-4">Investment Insights</h2>
          <p className="text-white/50 max-w-2xl mx-auto">Strategic advice for international investors, residency seekers, and high-net-worth individuals looking at the Maltese market.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {ARTICLES.slice(0, 3).map((article) => (
            <Link
              key={article.slug}
              to={`/insights/${article.slug}`}
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
                  Read Guide <ChevronRight size={14} />
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
            <h2 className="text-4xl md:text-6xl font-serif mb-8">Ready to find your <br /> dream estate?</h2>
            <p className="text-luxury-black/70 mb-12 max-w-lg mx-auto font-medium text-lg">Connect with our luxury specialists today for a private consultation and exclusive access to off-market listings.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onContact('', '')}
                className="bg-luxury-black text-white px-12 py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
              >
                Contact a Specialist
              </button>
              <Link to="/properties/all" className="border-2 border-luxury-black text-luxury-black px-12 py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-luxury-black hover:text-white transition-all">
                Explore Listings
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
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
          <Routes>
            <Route path="/" element={
              <HomePage
                favorites={fav.favorites}
                onToggleFavorite={fav.toggle}
                onContact={handleContact}
              />
            } />
            <Route path="/properties/all" element={
              <PropertiesPage
                favorites={fav.favorites}
                onToggleFavorite={fav.toggle}
                onContact={handleContact}
              />
            } />
            <Route path="/properties/:citySlug" element={
              <CityPage
                favorites={fav.favorites}
                onToggleFavorite={fav.toggle}
                onContact={handleContact}
              />
            } />
            <Route path="/properties/:citySlug/:filterSlug" element={
              <FilteredPropertiesPage
                favorites={fav.favorites}
                onToggleFavorite={fav.toggle}
                onContact={handleContact}
              />
            } />
            <Route path="/insights" element={<InsightsHub />} />
            <Route path="/insights/:slug" element={<ArticlePage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage onContact={handleContact} />} />
            <Route path="/market/live" element={<MarketLive />} />
            <Route path="/insights/gozo-bridge-effect" element={<GozoBridgeTrackerPage />} />
            <Route path="/tools/property-valuation" element={<PropertyPriceOracle />} />
            <Route path="/tools/property-quiz" element={<MaltaPropertyQuiz />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Agency Auth Routes */}
            <Route path="/agency/login" element={<AgencyLogin />} />
            <Route path="/agency/register" element={<AgencyRegister />} />
            <Route path="/agency/forgot-password" element={<ForgotPassword />} />
            <Route path="/agency/reset-password" element={<ResetPassword />} />

            <Route path="/agency/portal" element={
              <AuthGuard>
                <AgencyPortal />
              </AuthGuard>
            } />
            <Route path="/agency/upgrade" element={
              <AuthGuard>
                <UpgradePage />
              </AuthGuard>
            } />
            <Route path="/agency/analytics-pro" element={
              <AuthGuard requirePlan="pro">
                <div className="pt-32 pb-20 text-center">
                  <h1 className="text-4xl font-serif text-white mb-4">Pro Analytics</h1>
                  <p className="text-white/40">This feature is reserved for Pro members.</p>
                </div>
              </AuthGuard>
            } />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
          </Routes>
          <Footer />
          <ScrollToTopButton />

          {/* Global Modals */}
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

const Footer = () => (
  <footer className="bg-luxury-black border-t border-white/5 pt-24 pb-12">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
        <div className="col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-8" aria-label="Malta Luxury Real Estate Home">
            <div className="w-8 h-8 gold-gradient rounded-full flex items-center justify-center" aria-hidden="true">
              <span className="text-luxury-black font-serif font-bold">M</span>
            </div>
            <span className="font-serif text-xl tracking-widest uppercase">
              Malta <span className="text-gold">Luxury Estates</span>
            </span>
          </Link>
          <p className="text-white/40 text-sm leading-relaxed">
            The definitive portal for high-end real estate in the Maltese islands. Curating excellence for international buyers since 2026.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-8">Market Intelligence</h4>
          <ul className="space-y-4 text-sm text-white/40">
            <li><Link to="/market/live" className="hover:text-gold transition-colors flex items-center gap-2">Live Pulse <span className="w-1 h-1 rounded-full bg-red-500" /></Link></li>
            <li><Link to="/insights/gozo-bridge-effect" className="hover:text-gold transition-colors italic text-gold/80">Gozo Bridge Tracker</Link></li>
            <li><Link to="/tools/property-quiz" className="hover:text-gold transition-colors font-bold text-white">Property Quiz 🎯</Link></li>
            <li><Link to="/tools/property-valuation" className="hover:text-gold transition-colors">Price Oracle (AI)</Link></li>
            <li><Link to="/tools/neighbourhood-intelligence" className="hover:text-gold transition-colors">Neighbourhood Score</Link></li>
            <li><Link to="/agency/portal" className="text-gold hover:text-white transition-colors flex items-center gap-2">Portal For Agencies <ArrowUpRight size={14} /></Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-8">Company</h4>
          <ul className="space-y-4 text-sm text-white/40">
            <li><Link to="/about" className="hover:text-gold transition-colors">About Us</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-gold transition-colors">Terms of Service</Link></li>
            <li><Link to="/cookie-policy" className="hover:text-gold transition-colors">Cookie Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-8">Knowledge Hub</h4>
          <ul className="space-y-4 text-sm text-white/40">
            <li><Link to="/insights/buying-property-in-malta-as-a-foreigner-2026" className="hover:text-gold transition-colors">Buying Guide</Link></li>
            <li><Link to="/insights/special-designated-areas-malta-guide" className="hover:text-gold transition-colors">SDA Guide</Link></li>
            <li><Link to="/insights/rental-yields-malta-2026" className="hover:text-gold transition-colors">Rental Yields</Link></li>
            <li><Link to="/insights/property-taxes-malta-2026" className="hover:text-gold transition-colors">Property Taxes</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-8">Newsletter</h4>
          <p className="text-sm text-white/40 mb-6">Receive exclusive off-market opportunities and market reports.</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/20">
        <p>© 2026 Malta Luxury Real Estate. All rights reserved. <span className="mx-2 opacity-20">|</span> Design by <a href="https://brandhouse.com.pl" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors font-medium">Brand House</a></p>
        <div className="flex gap-8 mt-4 md:mt-0">
          <Link to="/privacy-policy" className="hover:text-gold transition-colors">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-gold transition-colors">Terms of Service</Link>
          <Link to="/cookie-policy" className="hover:text-gold transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </div>
  </footer>
);
