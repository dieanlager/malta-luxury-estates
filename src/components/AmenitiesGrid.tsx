import type { LucideIcon } from 'lucide-react';
import {
  Waves, Car, Trees, Sun, ArrowUpDown, Sofa,
  Wind, Eye, ShieldCheck, Dumbbell, Check, Home,
} from 'lucide-react';

interface Props {
  features: string[];
  heading: string;
}

const KEYWORD_MAP: Record<string, LucideIcon> = {
  pool: Waves,
  sea: Waves,
  seafront: Waves,
  'sea view': Waves,
  garage: Car,
  parking: Car,
  garden: Trees,
  terrace: Sun,
  balcony: Sun,
  lift: ArrowUpDown,
  elevator: ArrowUpDown,
  furnished: Sofa,
  air: Wind,
  ac: Wind,
  aircon: Wind,
  'air conditioning': Wind,
  view: Eye,
  security: ShieldCheck,
  alarm: ShieldCheck,
  gym: Dumbbell,
  fitness: Dumbbell,
};

function getIcon(feature: string): LucideIcon {
  const lower = feature.toLowerCase();
  for (const [keyword, icon] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) return icon;
  }
  return Check;
}

export function AmenitiesGrid({ features, heading }: Props) {
  if (features.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="font-serif text-xl text-white mb-6">{heading}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((feature, i) => {
          const Icon = getIcon(feature);
          return (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <Icon size={14} className="text-gold" />
              </div>
              <span className="text-white/80 text-sm">{feature}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}