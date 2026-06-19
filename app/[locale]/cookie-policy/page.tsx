import { getTranslations } from 'next-intl/server';
import { LegalLayout, CookieIcon } from '@/src/components/LegalLayout';
import { routing } from '@/src/i18n/routing';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata = {
  robots: { index: false, follow: true },
};

export default async function CookiePolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  const thirdPartyKeys = ['mapbox', 'analytics'] as const;

  return (
    <LegalLayout
      title={t('cookies.pageTitle')}
      subtitle={t('cookies.pageSubtitle')}
      icon={<CookieIcon />}
    >
      <section>
        <h2>{t('cookies.definition.title')}</h2>
        <p>{t('cookies.definition.content')}</p>
      </section>

      <section>
        <h2>{t('cookies.essential.title')}</h2>
        <p>{t('cookies.essential.content')}</p>
      </section>

      <section>
        <h2>{t('cookies.third_party.title')}</h2>
        <p>{t('cookies.third_party.intro')}</p>
        <ul>
          {thirdPartyKeys.map((k) => (
            <li key={k}>{t(`cookies.third_party.points.${k}`)}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{t('cookies.preferences.title')}</h2>
        <p>{t('cookies.preferences.content')}</p>
      </section>
    </LegalLayout>
  );
}