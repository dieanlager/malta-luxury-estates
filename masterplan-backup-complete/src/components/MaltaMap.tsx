import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Home, TrendingUp, ArrowUpRight } from 'lucide-react';

interface City {
  id: string;
  slug: string;
  name: string;
  x: number;
  y: number;
  count: number;
  avgPrice: string;
  description: string;
  image: string;
}

const CITIES: City[] = [
  {
    id: 'valletta',
    slug: 'valletta',
    name: 'Valletta',
    x: 635,
    y: 415,
    count: 95,
    avgPrice: '€1.2M',
    description: 'The historic capital city, a UNESCO World Heritage site known for its grand palazzos and baroque architecture.',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'sliema',
    slug: 'sliema',
    name: 'Sliema',
    x: 620,
    y: 390,
    count: 245,
    avgPrice: '€1.8M',
    description: 'The commercial hub of Malta, offering luxury seafront apartments and high-end shopping.',
    image: 'https://images.unsplash.com/photo-1529280600423-6231993a00cc?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'stjulians',
    slug: 'st-julians',
    name: 'St. Julians',
    x: 600,
    y: 375,
    count: 180,
    avgPrice: '€2.4M',
    description: 'Home to the prestigious Portomaso and Pendergardens developments, offering the ultimate in modern luxury.',
    image: 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'mdina',
    slug: 'mdina',
    name: 'Mdina',
    x: 480,
    y: 430,
    count: 12,
    avgPrice: '€4.5M',
    description: 'The "Silent City", offering exclusive historic noble residences and unparalleled privacy.',
    image: 'https://images.unsplash.com/photo-1590059002624-6677c8e527b1?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'mellieha',
    slug: 'mellieha',
    name: 'Mellieha',
    x: 410,
    y: 280,
    count: 110,
    avgPrice: '€2.1M',
    description: 'Famous for its stunning villas perched on the cliffs overlooking the northern bays.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'victoria',
    slug: 'victoria',
    name: 'Victoria (Gozo)',
    x: 180,
    y: 130,
    count: 120,
    avgPrice: '€850k',
    description: 'The heart of Gozo, offering charming farmhouses and luxury retreats in a serene environment.',
    image: 'https://images.unsplash.com/photo-1506929197327-2e4b4d388279?auto=format&fit=crop&q=80&w=400'
  }
];

export const MaltaMap = () => {
  const [activeCity, setActiveCity] = useState<City | null>(null);
  const navigate = useNavigate();

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-[4/3] bg-luxury-black/40 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl group/map">
      {/* Map Background SVG - More detailed paths */}
      <svg 
        viewBox="0 0 800 600" 
        className="w-full h-full fill-white/5 stroke-white/20 stroke-[0.5] transition-all duration-700"
      >
        <defs>
          <radialGradient id="mapGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="rgba(197, 160, 89, 0.1)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Gozo */}
        <motion.path 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          d="M110,120 C130,100 160,80 200,85 C240,90 260,110 270,140 C280,170 260,200 230,220 C200,240 150,230 120,210 C90,190 80,150 110,120 Z" 
          className="hover:fill-gold/10 transition-colors cursor-default"
        />
        {/* Comino */}
        <motion.path 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          d="M315,215 C325,210 340,215 335,230 C330,245 315,240 315,225 Z" 
          className="fill-gold/20"
        />
        {/* Malta */}
        <motion.path 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          d="M360,260 C400,230 460,210 520,220 C580,230 640,260 680,300 C720,340 750,400 730,460 C710,520 650,560 580,570 C510,580 440,560 380,520 C320,480 300,420 310,360 C320,300 330,280 360,260 Z" 
          className="hover:fill-gold/10 transition-colors cursor-default"
        />

        {/* City Markers */}
        {CITIES.map((city) => (
          <g 
            key={city.id} 
            className="cursor-pointer group/marker"
            onMouseEnter={() => setActiveCity(city)}
            onMouseLeave={() => setActiveCity(null)}
            onClick={() => navigate(`/properties/${city.slug}`)}
          >
            <motion.circle
              cx={city.x}
              cy={city.y}
              r="6"
              className="fill-gold shadow-lg group-hover/marker:fill-white transition-colors"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.5 }}
            />
            <motion.circle
              cx={city.x}
              cy={city.y}
              r="12"
              className="fill-gold/20 stroke-gold/40 stroke-1"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <text 
              x={city.x + 15} 
              y={city.y + 5} 
              className="fill-white/60 text-[10px] font-bold uppercase tracking-widest pointer-events-none hidden md:block group-hover/marker:fill-gold transition-colors"
            >
              {city.name}
            </text>
          </g>
        ))}
      </svg>

      {/* Overlay Info Card */}
      <AnimatePresence>
        {activeCity && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: 20 }}
            className="absolute bottom-8 right-8 w-80 glass-card rounded-3xl p-6 border border-gold/30 shadow-2xl z-20 cursor-pointer"
            onClick={() => navigate(`/properties/${activeCity.slug}`)}
          >
            <div className="aspect-video rounded-xl overflow-hidden mb-4 border border-white/10 relative group/card">
              <img 
                src={activeCity.image} 
                alt={activeCity.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-luxury-black/20 group-hover/card:bg-transparent transition-colors" />
            </div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-2xl font-serif text-gold">{activeCity.name}</h3>
              <ArrowUpRight className="text-gold/40 group-hover/card:text-gold transition-colors" size={20} />
            </div>
            <p className="text-xs text-white/50 leading-relaxed mb-6 line-clamp-2">{activeCity.description}</p>
            
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 mb-4">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest font-bold text-white/30 mb-1 flex items-center gap-1">
                  <Home size={10} /> Listings
                </span>
                <span className="text-lg font-serif">{activeCity.count}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest font-bold text-white/30 mb-1 flex items-center gap-1">
                  <TrendingUp size={10} /> Avg. Price
                </span>
                <span className="text-lg font-serif text-gold">{activeCity.avgPrice}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gold hover:underline">
                View Listings
              </span>
              <Link 
                to="/insights/malta-real-estate-investment-guide-2026"
                className="text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Investment Guide
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Legend/Title */}
      <div className="absolute top-12 left-12">
        <div className="flex items-center gap-3 mb-2">
          <Navigation className="text-gold" size={18} />
          <h2 className="text-3xl font-serif">Island Hubs</h2>
        </div>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Click a marker to view local listings</p>
      </div>

      {/* Decorative Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
        style={{ backgroundImage: 'radial-gradient(circle, #C5A059 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
    </div>
  );
};
