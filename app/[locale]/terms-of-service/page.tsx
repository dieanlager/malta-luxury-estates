import { getTranslations } from 'next-intl/server';
import { Scale } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  return {
    title: t('seo.terms.title', { defaultValue: 'Terms of Service' }),
    robots: { index: false },
  };
}

export default async function TermsOfServicePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  const sections = ['nature', 'liability', 'ip', 'law'] as const;

  return (
    <main className="min-h-screen bg-luxury-black pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold/30 mb-6">
            <Scale size={28} className="text-gold" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">
            {t('terms.nature.title')}
          </h1>
          <div className="w-24 h-px bg-gold/40 mx-auto" />
        </div>

        <div className="space-y-6">
          {sections.map((key) => (
            <div key={key} className="rounded-[2.5rem] p-8 md:p-12 bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <h2 className="font-serif text-xl text-gold mb-4">
                {t(`terms.${key}.title`)}
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                {t(`terms.${key}.content`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}