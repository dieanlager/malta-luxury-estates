import type { Metadata } from 'next';
import { SalesTaxCalculator } from '@/src/components/calculators/SalesTaxCalculator';
import { BuyingCostsCalculator } from '@/src/components/BuyingCostsCalculator';

export const metadata: Metadata = {
  title: 'Malta Property Tax & Buying Costs Calculator 2026 | Malta Luxury Real Estate',
  description: 'Calculate stamp duty, transfer tax, notary fees, and total buying costs for Malta property.',
};

export default function SalesTaxPage() {
  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-serif text-4xl md:text-5xl text-gold mb-4">Malta Property Tax & Costs</h1>
        <p className="text-white/60 mb-12 max-w-2xl">Calculate stamp duty, transfer tax, and all buying costs before you commit.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SalesTaxCalculator />
          <BuyingCostsCalculator />
        </div>
      </div>
    </main>
  );
}