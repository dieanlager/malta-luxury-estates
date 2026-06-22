import { routing } from '@/src/i18n/routing';

const BASE = 'https://www.maltaluxuryrealestate.com';

type RoutePath = keyof typeof routing.pathnames;

export function getLocalizedUrl(route: RoutePath, locale: string, params?: Record<string, string>): string {
  const pathDef = routing.pathnames[route];
  const pathTemplate =
    typeof pathDef === 'string'
      ? pathDef
      : ((pathDef as Record<string, string>)[locale] ?? (pathDef as Record<string, string>)['en']);

  let path = pathTemplate;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`[${key}]`, value);
    }
  }

  const localePrefix = locale === 'en' ? '' : `/${locale}`;
  return `${BASE}${localePrefix}${path}`;
}

export function getHreflangAlternates(route: RoutePath, params?: Record<string, string>): Record<string, string> {
  return {
    'x-default': getLocalizedUrl(route, 'en', params),
    ...Object.fromEntries(routing.locales.map(l => [l, getLocalizedUrl(route, l, params)])),
  };
}
