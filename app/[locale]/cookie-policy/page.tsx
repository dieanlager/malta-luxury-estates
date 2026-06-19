import { getTranslations } from 'next-intl/server';
import { Globe } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  return {
    title: t('seo.cookies.title', { defaultValue: 'Cookie Policy' }),
    robots: { index: false },
  };
}

export default async function CookiePolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  const cookiePointKeys: Record<string, string[]> = {
    third_party: ['mapbox', 'analytics'],
  };

  const sections = [
    { key: 'definition', type: 'content' },
    { key: 'essential', type: 'content' },
    { key: 'third_party', type: 'points' },
    { key: 'preferences', type: 'content' },
  ] as const;

  return (
    <main className="min-h-screen bg-luxury-black pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold/30 mb-6">
            <Globe size={28} className="text-gold" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">
            {t('cookies.definition.title')}
          </h1>
          <div className="w-24 h-px bg-gold/40 mx-auto" />
        </div>

        <div className="space-y-6">
          {sections.map(({ key, type }) => (
            <div key={key} className="rounded-[2.5rem] p-8 md:p-12 bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <h2 className="font-serif text-xl text-gold mb-4">
                {t(`cookies.${key}.title`)}
              </h2>
              {type === 'content' && (
                <p className="text-white/60 text-sm leading-relaxed">
                  {t(`cookies.${key}.content`)}
                </p>
              )}
              {type === 'points' && (
                <>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">
                    {t(`cookies.${key}.intro`)}
                  </p>
                  <ul className="space-y-2">
                    {(cookiePointKeys[key] ?? []).map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm text-white/50">
                        <span className="text-gold mt-0.5">--</span>
                        <span>{t(`cookies.${key}.points.${point}`)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}