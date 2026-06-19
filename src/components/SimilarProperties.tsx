'use client';
import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/src/navigation';
import { PropertyCard } from '@/src/components/PropertyCard';
import type { Property } from '@/src/types';

interface Props {
  properties: Property[];
  heading: string;
  viewAllLabel: string;
}

export function SimilarProperties({ properties, heading, viewAllLabel }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (properties.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif text-2xl md:text-3xl text-white">{heading}</h2>
        <div className="flex items-center gap-3">
          <Link
            href="/properties/all"
            className="text-[10px] uppercase tracking-widest text-gold hover:text-white transition-colors hidden sm:block"
          >
            {viewAllLabel} →
          </Link>
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous"
            className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:border-gold hover:text-gold transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next"
            className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:border-gold hover:text-gold transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {properties.map(property => (
            <div
              key={property.id}
              className="flex-[0_0_100%] sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]"
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}