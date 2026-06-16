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
    onError(error) {
      if (error.code === 'MISSING_MESSAGE') {
        // Log missing keys without crashing the render — better a visible key name than a 500
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[i18n] Missing message:', error.message);
        }
      } else {
        throw error;
      }
    },
    getMessageFallback({ namespace, key }) {
      // Show the key path in UI instead of crashing — visible to devs, not a 500
      return `${namespace}.${key}`;
    },
  };
});