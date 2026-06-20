import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';
import { PropertyQuiz } from '@/src/components/tools/PropertyQuiz';

interface Props { params: Promise<{ locale: string }> }

const BASE = 'https://www.maltaluxuryrealestate.com';

const ogLocaleMap: Record<string, string> = {
  en: 'en_US', de: 'de_DE', fr: 'fr_FR', it: 'it_IT', pl: 'pl_PL',
};

export async function generateStaticParams() { return routing.locales.map(locale => ({ locale })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return {
    title: t('seo.tools.quiz.title', { defaultValue: 'Property Finder Quiz | Malta Luxury Real Estate' }),
    description: t('seo.tools.quiz.description', { defaultValue: 'Answer 5 questions to discover the perfect Malta property type and location for your lifestyle and budget.' }),
    alternates: { canonical: `${BASE}${prefix}/tools/quiz` },
    openGraph: {
      locale: ogLocaleMap[locale] ?? 'en_US',
      images: [{ url: `${BASE}/og-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: [`${BASE}/og-image.jpg`] },
  };
}

export default async function QuizPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Find Your Ideal Malta Property',
    description: 'Take our property quiz to find the best Malta neighbourhoods and property types for your lifestyle.',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Answer lifestyle questions', text: 'Tell us about your lifestyle, budget, and priorities for living in Malta.' },
      { '@type': 'HowToStep', position: 2, name: 'Receive personalised matches', text: 'Our algorithm matches your profile to the best Malta locations and property types.' },
      { '@type': 'HowToStep', position: 3, name: 'Browse matched listings', text: 'View curated property listings that match your quiz results.' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Which area of Malta is best for expats?', acceptedAnswer: { '@type': 'Answer', text: "Sliema and St Julian's are most popular with expats for their international community, restaurants, and nightlife. Mellieha and Gozo suit families wanting quiet coastal living. Valletta suits those wanting culture and history." } },
      { '@type': 'Question', name: 'Is Malta good for property investment?', acceptedAnswer: { '@type': 'Answer', text: 'Malta offers gross rental yields of 4-6.5% and strong capital appreciation due to limited land, strong tourism, and growing expat community. Special Designated Areas (SDAs) allow unrestricted foreign ownership.' } },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="min-h-screen bg-luxury-black pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-6 block">
              {t('quiz.eyebrow', { defaultValue: 'Property Matcher' })}
            </span>
            <h1 className="font-serif text-5xl text-white mb-4">
              {t('seo.tools.quiz.title', { defaultValue: 'Find Your Perfect Malta Property' })}
            </h1>
            <p className="text-white/50 text-lg leading-relaxed">
              {t('quiz.subtitle', { defaultValue: "Answer a few questions and we'll match you with the ideal property type and location." })}
            </p>
          </div>
          <PropertyQuiz />
        </div>
      </main>
    </>
  );
}