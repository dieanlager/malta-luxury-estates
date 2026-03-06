import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calculator, Info, Euro, Percent, FileText } from 'lucide-react';
import { calculateBuyingCosts, BuyingResult } from '../lib/calculators/property-math';

export const BuyingCostsCalculator = () => {
  const [price, setPrice] = useState<number>(500000);
  const [isFirstBuy, setIsFirstBuy] = useState(false);
  const [isPrimaryResidence, setIsPrimaryResidence] = useState(true);
  const [isUCA, setIsUCA] = useState(false);
  const [isGozo, setIsGozo] = useState(false);
  const [needsAIP, setNeedsAIP] = useState(false);
  const [result, setResult] = useState<BuyingResult | null>(null);

  useEffect(() => {
    const res = calculateBuyingCosts({
      price,
      isFirstTimeBuyer: isFirstBuy,
      isPrimaryResidence,
      isUCA,
      isGozo,
      needsAIP
    });
    setResult(res);
  }, [price, isFirstBuy, isPrimaryResidence, isUCA, isGozo, needsAIP]);

  return (
    <div className="glass-card rounded-[2.5rem] border border-gold/20 overflow-hidden bg-white/5 backdrop-blur-3xl">
      <div className="p-8 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gold/20 flex items-center justify-center">
            <Calculator className="text-gold" size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-serif text-white">Purchase Cost Intelligence</h3>
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Buyer Analytics 2026</p>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* INPUTS */}
        <div className="space-y-10">
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Acquisition Price</label>
              <span className="text-gold font-serif text-xl">€{price.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="100000"
              max="10000000"
              step="50000"
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setIsFirstBuy(!isFirstBuy);
                if (!isFirstBuy) {
                  setIsPrimaryResidence(true);
                  setIsUCA(false);
                  setIsGozo(false);
                }
              }}
              className={`p-5 rounded-2xl border transition-all text-left ${isFirstBuy ? 'bg-gold/10 border-gold text-gold' : 'bg-white/5 border-white/10 text-white/40'}`}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1">First Time Buyer</div>
              <div className="text-xs">{isFirstBuy ? '0% Stamp (up to €200k)' : 'Standard Rate'}</div>
            </button>

            <button
              onClick={() => {
                setIsUCA(!isUCA);
                if (!isUCA) {
                  setIsFirstBuy(false);
                  setIsGozo(false);
                }
              }}
              className={`p-5 rounded-2xl border transition-all text-left ${isUCA ? 'bg-gold/10 border-gold text-gold' : 'bg-white/5 border-white/10 text-white/40'}`}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1">UCA / Village Core</div>
              <div className="text-xs">{isUCA ? '0% Stamp (up to 750k)' : 'Heritage Grant Possible'}</div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setIsGozo(!isGozo);
                if (!isGozo) setIsUCA(false);
              }}
              className={`p-4 rounded-xl border text-center transition-all ${isGozo ? 'bg-gold/10 border-gold text-gold' : 'bg-white/5 border-white/10 text-white/40'}`}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-left">Gozo Scheme</div>
              <div className="text-lg font-serif">2%</div>
            </button>

            <button
              onClick={() => setIsPrimaryResidence(!isPrimaryResidence)}
              className={`p-4 rounded-xl border text-center transition-all ${isPrimaryResidence && !isFirstBuy ? 'bg-gold/10 border-gold text-gold' : 'bg-white/5 border-white/10 text-white/40'}`}
              disabled={isFirstBuy}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-left">Primary Home</div>
              <div className="text-lg font-serif">3.5%</div>
            </button>

            <button
              onClick={() => setNeedsAIP(!needsAIP)}
              className={`p-4 rounded-xl border text-center transition-all ${needsAIP ? 'bg-gold/10 border-gold text-gold' : 'bg-white/5 border-white/10 text-white/40'}`}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-left">AIP Required</div>
              <div className="text-lg font-serif">€233</div>
            </button>
          </div>
        </div>

        {/* RESULTS */}
        <div className="bg-luxury-black/40 rounded-3xl p-8 border border-white/10 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-8">Cost Breakdown</h4>

            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60 flex items-center gap-2">
                <Percent size={14} className="text-gold/40" /> Net Stamp Duty
              </span>
              <span className="text-lg font-serif text-gold">€{result?.stampDuty.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60 flex items-center gap-2">
                <FileText size={14} className="text-gold/40" /> Notary & Searches (+VAT)
              </span>
              <span className="text-lg font-serif text-white">€{result?.notaryFees.toLocaleString()}</span>
            </div>

            {needsAIP && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">AIP Permit Administration</span>
                <span className="text-lg font-serif">€233</span>
              </div>
            )}
          </div>

          <div className="pt-8 mt-12 border-t border-white/10">
            <div className="flex justify-between items-end mb-8">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gold">Total Extra Costs</div>
                <div className="text-xs text-white/20 uppercase tracking-widest font-bold">Approx {result?.costPercentage.toFixed(2)}% of price</div>
              </div>
              <div className="text-4xl font-serif text-gold">€{result?.totalAcquisitionCosts.toLocaleString()}</div>
            </div>

            <div className="p-6 bg-gold text-luxury-black rounded-3xl flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Capital Investment</div>
                <div className="text-2xl font-serif font-bold">€{result?.totalInvestment.toLocaleString()}</div>
              </div>
              <div className="w-12 h-12 bg-luxury-black/10 rounded-full flex items-center justify-center">
                <Euro size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
