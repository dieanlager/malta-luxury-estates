import type { Metadata } from 'next';
import { MortgageCalculator } from '@/src/components/calculators/MortgageCalculator';
import { MortgagePreQualifier } from '@/src/components/calculators/MortgagePreQualifier';

export const metadata: Metadata = {
  title: 'Malta Mortgage Calculator 2026 | Malta Luxury Real Estate',
  description: 'Calculate your mortgage payments, LTV ratio, and pre-qualify for a Malta property loan. Free tool.',
};

export default function MortgagePage() {
  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-serif text-4xl md:text-5xl text-gold mb-4">Malta Mortgage Calculator</h1>
        <p className="text-white/60 mb-12 max-w-2xl">Calculate your monthly payments and check if you pre-qualify for financing in Malta.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MortgageCalculator />
          <MortgagePreQualifier />
        </div>
      </div>
    </main>
  );
}