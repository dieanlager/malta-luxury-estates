import { getTranslations } from 'next-intl/server';
import { LegalLayout, ScaleIcon } from '@/src/components/LegalLayout';
import { routing } from '@/src/i18n/routing';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata = {
  robots: { index: false, follow: true },
};

export default async function TermsOfServicePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  const sections = ['nature', 'liability', 'ip', 'law'] as const;

  return (
    <LegalLayout
      title={t('terms.pageTitle')}
      subtitle={t('terms.pageSubtitle')}
      icon={<ScaleIcon />}
    >
      {sections.map((key) => (
        <section key={key}>
          <h2>{t(`terms.${key}.title`)}</h2>
          <p>{t(`terms.${key}.content`)}</p>
        </section>
      ))}
    </LegalLayout>
  );
}