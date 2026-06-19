import { getTranslations } from 'next-intl/server';
import { LegalLayout, LockIcon } from '@/src/components/LegalLayout';
import { routing } from '@/src/i18n/routing';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata = {
  robots: { index: false, follow: true },
};

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  const collectPoints = ['contact', 'preferences', 'technical'] as const;
  const usePoints = ['communication', 'improvement', 'legal'] as const;
  const rightsPoints = ['access', 'rectification', 'erasure', 'object'] as const;

  return (
    <LegalLayout
      title={t('privacy.pageTitle')}
      subtitle={t('privacy.pageSubtitle')}
      icon={<LockIcon />}
    >
      <section>
        <h2>{t('privacy.intro.title')}</h2>
        <p>{t('privacy.intro.content')}</p>
      </section>

      <section>
        <h2>{t('privacy.controller.title')}</h2>
        <pre className="whitespace-pre-wrap font-light text-sm">{t('privacy.controller.details')}</pre>
      </section>

      <section>
        <h2>{t('privacy.collect.title')}</h2>
        <p>{t('privacy.collect.intro')}</p>
        <ul>
          {collectPoints.map((k) => (
            <li key={k}>{t(`privacy.collect.points.${k}`)}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{t('privacy.use.title')}</h2>
        <p>{t('privacy.use.intro')}</p>
        <ul>
          {usePoints.map((k) => (
            <li key={k}>{t(`privacy.use.points.${k}`)}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{t('privacy.rights.title')}</h2>
        <p>{t('privacy.rights.intro')}</p>
        <ul>
          {rightsPoints.map((k) => (
            <li key={k}>{t(`privacy.rights.points.${k}`)}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{t('privacy.contact.title')}</h2>
        <p>{t('privacy.contact.content')}</p>
        <p>
          <a href={`mailto:${t('privacy.contact.email')}`} className="text-gold hover:underline">
            {t('privacy.contact.email')}
          </a>
        </p>
      </section>
    </LegalLayout>
  );
}