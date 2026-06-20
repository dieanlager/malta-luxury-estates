import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';

interface Props { params: Promise<{ locale: string }> }

const BASE = 'https://www.maltaluxuryrealestate.com';

const CONTACT_PATHS: Record<string, string> = {
  en: '/contact',
  de: '/de/kontakt',
  fr: '/fr/contact',
  it: '/it/contatti',
  pl: '/pl/kontakt',
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
    title: t('seo.contact.title', { defaultValue: 'Contact Us | Malta Luxury Real Estate' }),
    description: t('seo.contact.description', { defaultValue: 'Get in touch with our Malta real estate experts for property inquiries, valuations, and investment advice.' }),
    alternates: {
      canonical: `${BASE}${prefix}/contact`,
      languages: Object.fromEntries(
        routing.locales.map(l => [l, `${BASE}${CONTACT_PATHS[l]}`])
      ),
    },
    openGraph: {
      locale: ogLocaleMap[locale] ?? 'en_US',
      images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`${BASE}/og-image.png`],
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const prefix = locale === 'en' ? '' : `/${locale}`;

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: `${BASE}${prefix}/contact`,
    name: 'Contact Malta Luxury Real Estate',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@maltaluxuryrealestate.com',
      contactType: 'customer support',
      availableLanguage: ['English', 'German', 'French', 'Italian', 'Polish'],
      areaServed: 'MT',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <main className="min-h-screen bg-luxury-black pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-8 block">
            {t('contact.eyebrow', { defaultValue: 'Get in Touch' })}
          </span>
          <h1 className="font-serif text-5xl text-white mb-6">
            {t('seo.contact.title', { defaultValue: 'Contact Us' })}
          </h1>
          <p className="text-white/50 text-lg mb-12 leading-relaxed">
            {t('contact.subtitle', { defaultValue: 'Our Malta property experts are available to answer your questions and assist with your property search.' })}
          </p>
          <form
            action="https://formspree.io/f/maltaluxury"
            method="POST"
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">{t('contact.name', { defaultValue: 'Full Name' })}</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-gold/40"
                  placeholder={t('contact.name_placeholder', { defaultValue: 'Your name' })}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">{t('contact.email', { defaultValue: 'Email Address' })}</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-gold/40"
                  placeholder={t('contact.email_placeholder', { defaultValue: 'your@email.com' })}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">{t('contact.message', { defaultValue: 'Message' })}</label>
              <textarea
                name="message"
                required
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-gold/40 resize-none"
                placeholder={t('contact.message_placeholder', { defaultValue: 'Tell us about your property requirements...' })}
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 gold-gradient text-luxury-black font-bold text-[11px] uppercase tracking-widest rounded-2xl hover:opacity-90 transition-opacity"
            >
              {t('contact.submit', { defaultValue: 'Send Message' })}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}