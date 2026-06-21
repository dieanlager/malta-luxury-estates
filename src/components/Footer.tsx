'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation';
import { ArrowUpRight } from 'lucide-react';
import { LOCATIONS } from '@/src/lib/locations';
import { NewsletterForm } from './NewsletterForm';

export function Footer() {
  const t = useTranslations('common');

  const articleLinks = [
    { slug: 'buying-property-in-malta-as-a-foreigner-2026', label: t('seo.insights.title_buying', { defaultValue: 'Buying Property as a Foreigner' }) },
    { slug: 'gozo-property-investment-guide-2026', label: t('footer.gozo_investment', { defaultValue: 'Gozo Investment Guide' }) },
    { slug: 'rental-yields-malta-2026', label: t('footer.rental_yields', { defaultValue: 'Rental Yields 2026' }) },
    { slug: 'malta-property-market-forecast-2026-2030', label: t('footer.market_forecast', { defaultValue: 'Market Forecast 2026-2030' }) },
    { slug: 'property-taxes-malta-2026', label: t('seo.insights.title_taxes', { defaultValue: 'Property Taxes Malta' }) },
  ];

  return (
    <footer className="bg-luxury-black border-t border-white/5 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24 pb-24 border-b border-white/5">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-px bg-gold/50" />
            <span className="text-gold uppercase tracking-widest text-[10px] font-bold">{t('footer.premier_destinations', { defaultValue: 'Premier Destinations' })}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-8">
            {LOCATIONS.filter(l => l.isPopular).slice(0, 10).map(city => (
              <Link key={city.slug} href={`/properties/${city.slug}` as any} className="group block">
                <p className="text-white group-hover:text-gold transition-colors font-serif text-lg mb-1">{city.nameEn}</p>
                <span className="text-[9px] uppercase tracking-widest text-white/70 font-bold block">{t('common.estate_in', { location: city.nameEn, defaultValue: `Estate in ${city.nameEn}` })}</span>
                <div className="h-0.5 w-0 group-hover:w-12 bg-gold mt-4 transition-all duration-300" />
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 gold-gradient rounded-full flex items-center justify-center">
                <span className="text-luxury-black font-serif font-bold">M</span>
              </div>
              <span className="font-serif text-xl tracking-widest uppercase">
                Malta <span className="text-gold">Luxury</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">{t('footer.description', { defaultValue: 'Malta\'s premier luxury real estate portal.' })}</p>
          </div>

          <div>
            <p className="font-serif text-lg mb-8 font-semibold">{t('footer.quick_links', { defaultValue: 'Quick Links' })}</p>
            <ul className="space-y-4 text-sm text-white/60">
              <li><Link href="/market/live" className="hover:text-gold transition-colors flex items-center gap-2">{t('nav.market_pulse', { defaultValue: 'Market Pulse' })} <span className="w-1 h-1 rounded-full bg-red-500" /></Link></li>
              <li><Link href="/tools/quiz" className="hover:text-gold transition-colors font-bold text-white">{t('footer.quiz', { defaultValue: 'Property Quiz' })}</Link></li>
              <li><Link href="/tools/valuation" className="hover:text-gold transition-colors">{t('seo.tools.valuation.title', { defaultValue: 'Property Valuation' })}</Link></li>
              <li>
                <Link href={"/agency/portal" as any} className="text-gold hover:text-white transition-colors flex items-center gap-2">
                  {t('footer.portal_for_agencies', { defaultValue: 'Agency Portal' })} <ArrowUpRight size={14} />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-serif text-lg mb-8 font-semibold">{t('footer.legal', { defaultValue: 'Legal' })}</p>
            <ul className="space-y-4 text-sm text-white/60">
              <li><Link href="/about" className="hover:text-gold transition-colors">{t('nav.about', { defaultValue: 'About Us' })}</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors">{t('nav.contact', { defaultValue: 'Contact' })}</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-gold transition-colors">{t('seo.privacy.title', { defaultValue: 'Privacy Policy' })}</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-gold transition-colors">{t('seo.terms.title', { defaultValue: 'Terms of Service' })}</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-gold transition-colors">{t('seo.cookies.title', { defaultValue: 'Cookie Policy' })}</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-serif text-lg mb-8 font-semibold">{t('footer.knowledge_hub', { defaultValue: 'Knowledge Hub' })}</p>
            <ul className="space-y-4 text-sm text-white/60">
              {articleLinks.map(a => (
                <li key={a.slug}>
                  <Link href={`/insights/${a.slug}` as any} className="hover:text-gold transition-colors">{a.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-serif text-lg mb-8 font-semibold">{t('footer.newsletter.title', { defaultValue: 'Newsletter' })}</p>
            <p className="text-sm text-white/60 mb-6">{t('footer.newsletter.subtitle', { defaultValue: 'Get exclusive market insights.' })}</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/70">
          <p>
            © {new Date().getFullYear()} Malta Luxury Real Estate. All rights reserved.
            <span className="mx-2 opacity-20">|</span>
            {t('footer.design_by', { defaultValue: 'Design by' })}{' '}
            <a href="https://brandhouse.com.pl" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors font-medium normal-case">Brand House</a>
          </p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-gold transition-colors">{t('seo.privacy.title', { defaultValue: 'Privacy' })}</Link>
            <Link href="/terms-of-service" className="hover:text-gold transition-colors">{t('seo.terms.title', { defaultValue: 'Terms' })}</Link>
            <Link href="/cookie-policy" className="hover:text-gold transition-colors">{t('seo.cookies.title', { defaultValue: 'Cookies' })}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


