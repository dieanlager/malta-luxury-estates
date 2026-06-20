import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/src/i18n/routing';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { AIChatbot } from '@/src/components/AIChatbot';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/src/lib/seo/schemas';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) notFound();
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebSiteSchema(locale)) }}
        />
        <Navbar />
        {children}
        <Footer />
        <AIChatbot />
      </div>
    </NextIntlClientProvider>
  );
}