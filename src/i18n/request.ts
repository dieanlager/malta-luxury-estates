import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const loadJson = async (path: string) => {
    try {
      return (await import(`../../public/locales/${locale}/${path}.json`)).default;
    } catch {
      return {};
    }
  };

  const [common, seo, propertyDetail] = await Promise.all([
    loadJson('common'),
    loadJson('seo'),
    loadJson('property_detail'),
  ]);

  return {
    locale,
    messages: { common, seo, property_detail: propertyDetail },
  };
});
