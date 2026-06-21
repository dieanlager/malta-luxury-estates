import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalLayout, ScaleIcon } from '@/src/components/LegalLayout';
import { routing } from '@/src/i18n/routing';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const base = 'https://www.maltaluxuryrealestate.com';
const path = '/terms-of-service';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const prefix = locale === 'en' ? '' : `/${locale}`;

  return {
    title: 'Terms of Service | Malta Luxury Real Estate',
    description: 'Read the terms of service for maltaluxuryrealestate.com.',
    robots: { index: false, follow: true },
    alternates: {
      canonical: `${base}${prefix}${path}`,
      languages: {
        'x-default': `${base}${path}`,
        ...Object.fromEntries(
          routing.locales.map(l => [l, `${base}${l === 'en' ? '' : `/${l}`}${path}`])
        ),
      },
    },
  };
}

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