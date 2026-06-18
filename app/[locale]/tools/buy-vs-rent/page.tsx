import type { Metadata } from 'next';
import { BuyVsRentCalculator } from '@/src/components/calculators/BuyVsRentCalculator';

export const metadata: Metadata = {
  title: 'Buy vs Rent Calculator Malta 2026 | Malta Luxury Real Estate',
  description: 'Compare buying vs renting property in Malta — net worth projections over 1 to 30 years.',
};

export default function BuyVsRentPage() {
  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-serif text-4xl md:text-5xl text-gold mb-4">Buy vs Rent Calculator</h1>
        <p className="text-white/60 mb-12 max-w-2xl">See how buying compares to renting in Malta over 1 to 30 years, including net worth projections.</p>
        <BuyVsRentCalculator />
      </div>
    </main>
  );
}