import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';
import { PropertyQuiz } from '@/src/components/tools/PropertyQuiz';

interface Props { params: Promise<{ locale: string }> }
export async function generateStaticParams() { return routing.locales.map(locale => ({ locale })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const base = 'https://www.maltaluxuryrealestate.com';
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return {
    title: t('seo.tools.quiz.title', { defaultValue: 'Property Finder Quiz | Malta Luxury Real Estate' }),
    description: t('seo.tools.quiz.description', { defaultValue: 'Answer 5 questions to discover the perfect Malta property type and location for your lifestyle and budget.' }),
    alternates: { canonical: `${base}${prefix}/tools/quiz` },
  };
}

export default async function QuizPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  return (
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
            {t('quiz.subtitle', { defaultValue: 'Answer a few questions and we\'ll match you with the ideal property type and location.' })}
          </p>
        </div>
        <PropertyQuiz />
      </div>
    </main>
  );
}
