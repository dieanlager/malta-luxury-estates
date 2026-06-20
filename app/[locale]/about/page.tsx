import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';
import { Link } from '@/src/navigation';

interface Props { params: Promise<{ locale: string }> }

const BASE = 'https://www.maltaluxuryrealestate.com';

const ABOUT_PATHS: Record<string, string> = {
  en: '/about',
  de: '/de/ueber-uns',
  fr: '/fr/a-propos',
  it: '/it/chi-siamo',
  pl: '/pl/o-nas',
};

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const ogLocaleMap: Record<string, string> = {
    en: 'en_US', de: 'de_DE', fr: 'fr_FR', it: 'it_IT', pl: 'pl_PL',
  };
  return {
    title: t('seo.about.title', { defaultValue: 'About Us | Malta Luxury Real Estate' }),
    description: t('seo.about.description', { defaultValue: "Malta's leading luxury property portal, connecting discerning buyers with premium real estate." }),
    alternates: {
      canonical: `${BASE}${prefix}/about`,
      languages: Object.fromEntries(
        routing.locales.map(l => [l, `${BASE}${ABOUT_PATHS[l]}`])
      ),
    },
    openGraph: {
      locale: ogLocaleMap[locale] ?? 'en_US',
      images: [{ url: `${BASE}/og-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`${BASE}/og-image.jpg`],
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const prefix = locale === 'en' ? '' : `/${locale}`;

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: `${BASE}${prefix}/about`,
    name: 'About Malta Luxury Real Estate',
    description: 'Premier luxury real estate portal for Malta and Gozo. Connecting international buyers with exclusive properties.',
    publisher: {
      '@type': 'Organization',
      name: 'Malta Luxury Real Estate',
      url: BASE,
      email: 'info@maltaluxuryrealestate.com',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <main className="min-h-screen bg-luxury-black pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-8 block">
            {t('about.eyebrow', { defaultValue: 'Our Story' })}
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-10">
            {t('seo.about.title', { defaultValue: 'About Malta Luxury Real Estate' })}
          </h1>
          <div className="space-y-8 text-white/60 text-lg leading-relaxed">
            <p>{t('about.p1', { defaultValue: "Malta Luxury Real Estate is the Mediterranean island's premier destination for high-end property. We curate the finest villas, penthouses, and investment properties across Malta and Gozo." })}</p>
            <p>{t('about.p2', { defaultValue: 'Our mission is to provide transparent, expert guidance to international buyers, investors, and expats seeking to own a piece of this exceptional island nation.' })}</p>
          </div>
          <div className="mt-16 flex gap-6 flex-wrap">
            <Link href="/properties/all" className="px-8 py-4 gold-gradient text-luxury-black font-bold text-[11px] uppercase tracking-widest rounded-full">
              {t('common.browse_properties', { defaultValue: 'Browse Properties' })}
            </Link>
            <Link href="/contact" className="px-8 py-4 border border-white/20 text-white text-[11px] uppercase tracking-widest rounded-full hover:border-gold/40 hover:text-gold transition-all">
              {t('nav.contact', { defaultValue: 'Contact Us' })}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}