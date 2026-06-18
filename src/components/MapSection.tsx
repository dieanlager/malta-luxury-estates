'use client';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./DynamicMap').then(m => m.DynamicMap), { ssr: false });

export const MapSection = () => (
  <section className="py-16 px-6">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 mb-4">
          <span className="text-gold text-[10px] uppercase tracking-[0.2em] font-bold">Interactive Map</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Explore Malta by Location</h2>
        <p className="text-white/50 max-w-xl mx-auto text-sm">Browse properties across Malta's most sought-after areas.</p>
      </div>
      <div className="rounded-3xl overflow-hidden border border-white/10 h-[500px]">
        <DynamicMap />
      </div>
    </div>
  </section>
);
