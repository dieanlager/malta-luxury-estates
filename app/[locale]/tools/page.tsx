import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';
import { getLocalizedUrl, getHreflangAlternates } from '@/src/lib/canonical';
import { Link } from '@/src/navigation';
import { Calculator, Home, TrendingUp, Scale, FileText } from 'lucide-react';

interface Props { params: Promise<{ locale: string }> }

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Malta Property Tools | Malta Luxury Real Estate',
    description: 'Free property tools for Malta buyers: mortgage calculator, property valuation, buying costs, buy vs rent analysis, and more.',
    robots: { index: true, follow: true },
    alternates: {
      canonical: getLocalizedUrl('/tools', locale),
      languages: getHreflangAlternates('/tools'),
    },
  };
}

const TOOLS = [
  { href: '/tools/mortgage' as const, icon: Calculator, title: 'Mortgage Calculator', desc: 'Calculate monthly payments, LTV ratio and pre-qualify for a Malta property loan.' },
  { href: '/tools/valuation' as const, icon: Home, title: 'Property Valuation', desc: 'AI-powered instant valuation for Malta real estate — free and accurate.' },
  { href: '/tools/sales-tax' as const, icon: FileText, title: 'Tax & Buying Costs', desc: 'Calculate stamp duty, transfer tax, notary fees and total acquisition costs.' },
  { href: '/tools/buy-vs-rent' as const, icon: Scale, title: 'Buy vs Rent', desc: 'Compare buying versus renting with net-worth projections over 1–30 years.' },
  { href: '/tools/quiz' as const, icon: TrendingUp, title: 'Property Finder Quiz', desc: 'Answer 5 questions to discover the perfect Malta property type for your lifestyle.' },
];

export default async function ToolsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <main className="min-h-screen bg-luxury-black pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-8 block">
          {t('nav.tools', { defaultValue: 'Property Tools' })}
        </span>
        <h1 className="font-serif text-5xl md:text-6xl text-white mb-6">
          Malta Property Tools
        </h1>
        <p className="text-white/60 text-lg mb-16 max-w-2xl">
          Free calculators and tools to help you make smarter property decisions in Malta.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map(({ href, icon: Icon, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="group p-6 border border-white/10 rounded-2xl hover:border-gold/40 transition-all duration-300 bg-white/5 hover:bg-white/8"
            >
              <Icon className="w-6 h-6 text-gold mb-4" />
              <h2 className="font-serif text-xl text-white mb-2 group-hover:text-gold transition-colors">{title}</h2>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
