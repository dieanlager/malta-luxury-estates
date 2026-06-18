'use client';
import React from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { SearchFilter } from '@/src/components/SearchFilter';
import { LOCATIONS } from '@/src/lib/data';

export const HeroSection = () => {
  const t = useTranslations('common');

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
        <img src="/assets/images/hero_malta.png" className="w-full h-full object-cover opacity-40 scale-105" alt="Malta Coast" />
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/60 via-luxury-black/30 to-luxury-black" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-gold uppercase tracking-[0.2em] text-[10px] font-bold">{t('hero.eyebrow')}</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-6 leading-[1.1] text-white">
            {t('hero.title')} <br />
            <span className="italic text-gold-gradient">{t('hero.title_italic')}</span>
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg md:text-xl mb-12 font-light leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="flex justify-center"><SearchFilter /></div>
          <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-serif text-gold">500+</span>
              <span className="text-[9px] uppercase tracking-widest font-bold text-white">{t('hero.stats_properties')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-serif text-gold">{LOCATIONS.length}+</span>
              <span className="text-[9px] uppercase tracking-widest font-bold text-white">{t('hero.stats_locations')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-serif text-gold">€2.5M</span>
              <span className="text-[9px] uppercase tracking-widest font-bold text-white">{t('hero.stats_price')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
