import { getTranslations } from 'next-intl/server';
import { Lock } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  return {
    title: t('seo.privacy.title', { defaultValue: 'Privacy Policy' }),
    robots: { index: false },
  };
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  const sections = [
    { key: 'intro', type: 'content' },
    { key: 'controller', type: 'details' },
    { key: 'collect', type: 'points' },
    { key: 'use', type: 'points' },
    { key: 'rights', type: 'points' },
    { key: 'contact', type: 'contact' },
  ] as const;

  const pointKeys: Record<string, string[]> = {
    collect: ['contact', 'preferences', 'technical'],
    use: ['communication', 'improvement', 'legal'],
    rights: ['access', 'rectification', 'erasure', 'object'],
  };

  return (
    <main className="min-h-screen bg-luxury-black pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold/30 mb-6">
            <Lock size={28} className="text-gold" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">
            {t('privacy.intro.title')}
          </h1>
          <div className="w-24 h-px bg-gold/40 mx-auto" />
        </div>

        <div className="space-y-6">
          {sections.map(({ key, type }) => (
            <div key={key} className="rounded-[2.5rem] p-8 md:p-12 bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <h2 className="font-serif text-xl text-gold mb-4">
                {t(`privacy.${key}.title`)}
              </h2>
              {type === 'details' && (
                <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
                  {t(`privacy.${key}.details`)}
                </p>
              )}
              {type === 'content' && (
                <p className="text-white/60 text-sm leading-relaxed">
                  {t(`privacy.${key}.content`)}
                </p>
              )}
              {type === 'points' && (
                <>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">
                    {t(`privacy.${key}.intro`)}
                  </p>
                  <ul className="space-y-2">
                    {(pointKeys[key] ?? []).map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm text-white/50">
                        <span className="text-gold mt-0.5">--</span>
                        <span>{t(`privacy.${key}.points.${point}`)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {type === 'contact' && (
                <>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {t(`privacy.${key}.content`)}
                  </p>
                  <p className="text-gold text-sm mt-3">info@maltaluxuryrealestate.com</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}