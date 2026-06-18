// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Crown, Zap, Flame, ArrowRight } from 'lucide-react';
import { Property } from '../types';
import { getFeaturedProperties } from '../lib/data';
import Link from 'next/link';
import { ImgWithPlaceholder } from './ImgWithPlaceholder';
import { getImageUrl } from '../lib/imageUtils';

const badgeIcons = {
  exclusive: { icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-900' },
  premium: { icon: Crown, color: 'text-purple-400', bg: 'bg-purple-900' },
  'new': { icon: Zap, color: 'text-blue-400', bg: 'bg-blue-900' },
  'hot-deal': { icon: Flame, color: 'text-red-400', bg: 'bg-red-900' },
};

export const FeaturedPropertiesSection: React.FC = () => {
  const [featured, setFeatured] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await getFeaturedProperties();
      setFeatured(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading || featured.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-slate-900 via-amber-900/10 to-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-900/30 rounded-full border border-amber-700/50 mb-4"
          >
            <Sparkles size={16} className="text-amber-400" />
            <span className="text-amber-300 text-sm font-semibold">CURATED FOR YOU</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
            Featured Properties
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Malta's most exclusive and sought-after listings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((prop, i) => {
            const badge = badgeIcons[(prop as any).featured_badge || 'exclusive'] || badgeIcons.exclusive;
            const BadgeIcon = badge.icon;

            return (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-xl bg-slate-800 hover:shadow-2xl transition-shadow"
              >
                <Link href={`/properties/${prop.id}`} className="block">
                  <div className="relative h-64 overflow-hidden bg-slate-700">
                    {prop.images?.[0] && (
                      <ImgWithPlaceholder
                        src={getImageUrl(prop.images[0], 'card')}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full ${badge.bg} border border-amber-500/50 flex items-center gap-1`}>
                      <BadgeIcon size={14} className={badge.color} />
                      <span className={`text-xs font-bold ${badge.color}`}>
                        {(prop as any).featured_badge?.toUpperCase() || 'EXCLUSIVE'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-amber-300 transition">
                      {prop.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">{prop.locationName}</p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-amber-300">
                        €{(prop.price / 1000000).toFixed(1)}M+
                      </span>
                    </div>

                    <div className="flex gap-4 text-sm text-slate-400 mb-4">
                      {prop.bedrooms && <span>🛏️ {prop.bedrooms} beds</span>}
                      {prop.bathrooms && <span>🚿 {prop.bathrooms} baths</span>}
                      {prop.area_sqm && <span>📐 {prop.area_sqm}m²</span>}
                    </div>

                    <div className="flex items-center gap-2 text-amber-300 font-semibold group-hover:gap-3 transition-all">
                      View Details
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
