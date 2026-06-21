'use client';
import { useState } from 'react';
import { LOCATIONS } from '@/src/lib/locations';

interface ValuationForm {
  location: string;
  propertyType: string;
  sqm: string;
  beds: string;
  condition: string;
}

interface ValuationResult {
  low: number;
  mid: number;
  high: number;
  pricePerSqm: number;
}

const BASE_PRICES: Record<string, number> = {
  'sliema': 6500,
  'st-julians': 7200,
  'valletta': 8000,
  'ta-xbiex': 7500,
  'marsaskala': 4200,
  'mellieha': 4800,
  'mdina': 6000,
  'gozo': 3800,
};

const TYPE_MULTIPLIERS: Record<string, number> = {
  'Villa': 1.4,
  'Penthouse': 1.5,
  'Palazzo': 1.6,
  'Apartment': 1.0,
  'House of Character': 1.3,
  'Maisonette': 0.95,
};

const CONDITION_MULTIPLIERS: Record<string, number> = {
  'new': 1.2,
  'excellent': 1.05,
  'good': 1.0,
  'needs-work': 0.82,
};

export function PropertyValuation() {
  const [form, setForm] = useState<ValuationForm>({
    location: '',
    propertyType: 'Apartment',
    sqm: '',
    beds: '',
    condition: 'good',
  });
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    const basePerSqm = BASE_PRICES[form.location] ?? 5000;
    const typeMulti = TYPE_MULTIPLIERS[form.propertyType] ?? 1;
    const condMulti = CONDITION_MULTIPLIERS[form.condition] ?? 1;
    const sqm = parseInt(form.sqm) || 80;

    const pricePerSqm = Math.round(basePerSqm * typeMulti * condMulti);
    const mid = pricePerSqm * sqm;

    setResult({
      low: Math.round(mid * 0.88),
      mid: Math.round(mid),
      high: Math.round(mid * 1.14),
      pricePerSqm,
    });
    setLoading(false);
  };

  const popularLocations = LOCATIONS.filter(l => l.isPopular);

  if (result) {
    return (
      <div className="glass-card p-10 rounded-3xl border border-gold/20">
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-widest text-gold mb-4">Estimated Value Range</p>
          <div className="font-serif text-6xl text-gold mb-2">
            â‚¬{(result.mid / 1000).toFixed(0)}K
          </div>
          <p className="text-white/60 text-sm">
            â‚¬{result.low.toLocaleString('en-GB')} â€“ â‚¬{result.high.toLocaleString('en-GB')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 rounded-2xl p-5">
            <div className="text-white font-semibold">â‚¬{result.pricePerSqm.toLocaleString('en-GB')}/mÂ²</div>
            <div className="text-white/60 text-xs mt-1">Estimated price per sqm</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-5">
            <div className="text-white font-semibold">{form.location || 'â€”'}</div>
            <div className="text-white/60 text-xs mt-1">Location</div>
          </div>
        </div>
        <p className="text-white/60 text-xs text-center mb-6">
          * Indicative estimate based on market data. For an accurate valuation, consult a licensed Malta agent.
        </p>
        <button
          onClick={() => setResult(null)}
          className="w-full py-3 border border-white/10 rounded-2xl text-white/50 text-sm hover:text-white transition-colors"
        >
          Try Another Property
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-10 rounded-3xl border border-white/10 space-y-6">
      <div>
        <label className="text-[10px] uppercase tracking-widest text-white/60 mb-2 block">Location</label>
        <select
          value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })}
          required
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-gold/40"
        >
          <option value="">Select location...</option>
          {popularLocations.map(l => (
            <option key={l.slug} value={l.slug}>{l.nameEn}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-widest text-white/60 mb-2 block">Property Type</label>
        <select
          value={form.propertyType}
          onChange={e => setForm({ ...form, propertyType: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-gold/40"
        >
          {['Villa', 'Penthouse', 'Apartment', 'Palazzo', 'House of Character', 'Maisonette'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/60 mb-2 block">Size (mÂ²)</label>
          <input
            type="number"
            value={form.sqm}
            onChange={e => setForm({ ...form, sqm: e.target.value })}
            required
            min="20"
            max="2000"
            placeholder="e.g. 120"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-gold/40"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/60 mb-2 block">Bedrooms</label>
          <select
            value={form.beds}
            onChange={e => setForm({ ...form, beds: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-gold/40"
          >
            <option value="">Select</option>
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-widest text-white/60 mb-2 block">Condition</label>
        <select
          value={form.condition}
          onChange={e => setForm({ ...form, condition: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-gold/40"
        >
          <option value="new">New / Off-plan</option>
          <option value="excellent">Excellent / Recently renovated</option>
          <option value="good">Good condition</option>
          <option value="needs-work">Needs renovation</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 gold-gradient text-luxury-black font-bold text-[11px] uppercase tracking-widest rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? 'Calculating...' : 'Get Valuation'}
      </button>
    </form>
  );
}
