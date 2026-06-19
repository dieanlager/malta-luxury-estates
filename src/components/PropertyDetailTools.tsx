'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Property } from '@/src/types';
import { ROICalculator } from '@/src/components/ROICalculator';
import { InvestmentPassportButton } from '@/src/components/InvestmentPassport';
import { PriceHistoryButton } from '@/src/components/PriceHistory';
import { EPCButton } from '@/src/components/EPCCalculator';
import { NoiseAnalysisButton } from '@/src/components/NoiseAnalysis';
import { TrendingUp, MapPin } from 'lucide-react';

const DynamicMap = dynamic(
  () => import('@/src/components/DynamicMap').then(m => m.DynamicMap),
  { ssr: false, loading: () => <div className="h-[400px] rounded-2xl bg-white/5 animate-pulse" /> }
);

interface Props {
  property: Property;
}

type ActiveTool = 'roi' | 'passport' | 'history' | 'epc' | 'noise';

const TABS: { id: ActiveTool; label: string }[] = [
  { id: 'roi', label: 'ROI Calculator' },
  { id: 'passport', label: 'Investment Report' },
  { id: 'history', label: 'Price History' },
  { id: 'epc', label: 'Energy Rating' },
  { id: 'noise', label: 'Noise Analysis' },
];

export default function PropertyDetailTools({ property }: Props) {
  const [active, setActive] = useState<ActiveTool>('roi');

  return (
    <>
      {/* ── Investment Tools ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
            <TrendingUp size={14} className="text-gold" aria-hidden="true" />
          </div>
          <h2 className="font-serif text-2xl text-white">Investment Tools</h2>
        </div>

        {/* Tab bar — scrollable on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-8">
          <div className="flex gap-1 min-w-max sm:min-w-0 border-b border-white/10 pb-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active === tab.id}
                onClick={() => setActive(tab.id)}
                className={`px-5 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${
                  active === tab.id
                    ? 'border-gold text-gold'
                    : 'border-transparent text-white/50 hover:text-white/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab panels */}
        <div className="glass-card border border-white/10 rounded-2xl p-6 md:p-8">
          {active === 'roi' && <ROICalculator property={property} />}
          {active === 'passport' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-white/50 text-sm mb-2">Generate a comprehensive investment report for this property.</p>
              <InvestmentPassportButton property={property} variant="page" />
            </div>
          )}
          {active === 'history' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-white/50 text-sm mb-2">View historical price trends for this property and area.</p>
              <PriceHistoryButton property={property} variant="page" />
            </div>
          )}
          {active === 'epc' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-white/50 text-sm mb-2">Check the energy performance certificate rating.</p>
              <EPCButton property={property} variant="page" />
            </div>
          )}
          {active === 'noise' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-white/50 text-sm mb-2">Analyse ambient noise levels in the surrounding area.</p>
              <NoiseAnalysisButton property={property} variant="page" />
            </div>
          )}
        </div>
      </section>

      {/* ── Location ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
            <MapPin size={14} className="text-gold" aria-hidden="true" />
          </div>
          <h2 className="font-serif text-2xl text-white">Location</h2>
        </div>
        <div className="glass-card border border-white/10 rounded-2xl overflow-hidden h-[400px]">
          <DynamicMap properties={[property]} />
        </div>
      </section>
    </>
  );
}