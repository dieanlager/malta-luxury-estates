'use client';
import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
import Lightbox from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const t = useTranslations('property_detail');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentSlide(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const slides = images.map((src, i) => ({
    src,
    alt: t('gallery.photo_alt', { title, index: i + 1 }),
  }));

  if (images.length === 0) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-white/5 border border-gold/20">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full border-2 border-gold/30 flex items-center justify-center mx-auto mb-6 text-gold">
            <Camera size={32} />
          </div>
          <p className="text-white/40 font-serif text-xl">{t('gallery.no_images')}</p>
        </div>
      </div>
    );
  }

  const gridImages = images.slice(1, 5);
  const hasRightGrid = gridImages.length > 0;
  const hiddenCount = images.length - 5;

  return (
    <>
      {/* ── Desktop mosaic ─────────────────────────────────────────── */}
      <div className="relative hidden md:block h-[70vh]">
        <div className={`grid h-full gap-0.5 ${hasRightGrid ? 'grid-cols-[65%_35%]' : 'grid-cols-1'}`}>

          {/* Hero */}
          <div
            className="relative overflow-hidden group cursor-pointer w-full h-full"
            onClick={() => openLightbox(0)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openLightbox(0)}
          >
            <Image
              src={images[0]}
              alt={t('gallery.photo_alt', { title, index: 1 })}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 65vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Right 2x2 grid */}
          {hasRightGrid && (
            <div className={`grid gap-0.5 h-full ${gridImages.length > 2 ? 'grid-rows-2' : 'grid-rows-1'}`}>
              {gridImages.map((src, i) => {
                const isLast = i === gridImages.length - 1;
                return (
                  <div
                    key={i}
                    className="relative overflow-hidden group cursor-pointer w-full h-full"
                    onClick={() => openLightbox(i + 1)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openLightbox(i + 1)}
                  >
                    <Image
                      src={src}
                      alt={t('gallery.photo_alt', { title, index: i + 2 })}
                      fill
                      sizes="35vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                    {isLast && hiddenCount > 0 && (
                      <div className="absolute inset-0 bg-luxury-black/65 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2">
                        <Camera size={22} className="text-gold" />
                        <span className="text-white text-xs font-bold uppercase tracking-widest text-center px-3 leading-tight">
                          {t('gallery.view_all', { count: images.length })}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-luxury-black/0 group-hover:bg-luxury-black/10 transition-colors" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* View-all pill */}
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="absolute bottom-5 right-5 z-10 flex items-center gap-2 bg-luxury-black/80 backdrop-blur-sm text-white text-[10px] uppercase tracking-widest font-bold px-5 py-3 rounded-full border border-white/20 hover:bg-white hover:text-luxury-black transition-all shadow-xl"
        >
          <Camera size={13} />
          {t('gallery.view_all', { count: images.length })}
        </button>
      </div>

      {/* ── Mobile Embla slider ────────────────────────────────────── */}
      <div className="relative md:hidden">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {images.map((src, i) => (
              <div
                key={i}
                className="relative flex-[0_0_100%] aspect-[4/3] overflow-hidden cursor-pointer"
                onClick={() => openLightbox(i)}
              >
                <Image
                  src={src}
                  alt={t('gallery.photo_alt', { title, index: i + 1 })}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-luxury-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-gold hover:text-luxury-black transition-all"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-luxury-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-gold hover:text-luxury-black transition-all"
        >
          <ChevronRight size={18} />
        </button>

        <div className="absolute bottom-4 right-4 bg-luxury-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
          {t('gallery.counter', { current: currentSlide + 1, total: images.length })}
        </div>
      </div>

      {/* ── Lightbox ───────────────────────────────────────────────── */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={lightboxIndex}
        plugins={[Thumbnails, Zoom]}
        carousel={{ finite: false }}
        zoom={{ maxZoomPixelRatio: 3 }}
        styles={{ container: { backgroundColor: 'rgba(10,10,10,0.97)' } }}
      />
    </>
  );
}