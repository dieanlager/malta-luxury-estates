'use client';
import dynamic from 'next/dynamic';
import { Property } from '@/src/types';
import { ROICalculator } from '@/src/components/ROICalculator';
import { InvestmentPassportButton } from '@/src/components/InvestmentPassport';
import { PriceHistoryButton } from '@/src/components/PriceHistory';
import { EPCButton } from '@/src/components/EPCCalculator';
import { NoiseAnalysisButton } from '@/src/components/NoiseAnalysis';

const DynamicMap = dynamic(
  () => import('@/src/components/DynamicMap').then(m => m.DynamicMap),
  { ssr: false, loading: () => <div className="h-[400px] rounded-2xl bg-white/5 animate-pulse" /> }
);

interface Props {
  property: Property;
}

export default function PropertyDetailTools({ property }: Props) {
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-white/10">
        <h2 className="font-serif text-2xl text-gold mb-8">Investment Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <InvestmentPassportButton property={property} variant="page" />
          <PriceHistoryButton property={property} variant="page" />
          <EPCButton property={property} variant="page" />
          <NoiseAnalysisButton property={property} variant="page" />
        </div>
        <ROICalculator property={property} />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-white/10">
        <h2 className="font-serif text-2xl text-gold mb-6">Location</h2>
        <div className="h-[400px] rounded-2xl overflow-hidden">
          <DynamicMap properties={[property]} />
        </div>
      </section>
    </>
  );
}
