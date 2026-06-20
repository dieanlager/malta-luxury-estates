import type { MetadataRoute } from 'next';

const BASE = 'https://www.maltaluxuryrealestate.com';
const LOCALES = ['en', 'de', 'fr', 'it', 'pl'] as const;
type Locale = (typeof LOCALES)[number];

const prefix = (l: Locale) => (l === 'en' ? '' : `/${l}`);

const LOCALIZED: Record<string, Record<Locale, string>> = {
  '/': { en: '/', de: '/de', fr: '/fr', it: '/it', pl: '/pl' },
  '/properties/all': {
    en: '/properties/all',
    de: '/de/immobilien/alle',
    fr: '/fr/proprietes/toutes',
    it: '/it/immobiliare/tutti',
    pl: '/pl/nieruchomosci/wszystkie',
  },
  '/insights': {
    en: '/insights',
    de: '/de/einblicke',
    fr: '/fr/conseils',
    it: '/it/approfondimenti',
    pl: '/pl/wiedza',
  },
  '/about': {
    en: '/about',
    de: '/de/ueber-uns',
    fr: '/fr/a-propos',
    it: '/it/chi-siamo',
    pl: '/pl/o-nas',
  },
  '/contact': {
    en: '/contact',
    de: '/de/kontakt',
    fr: '/fr/contact',
    it: '/it/contatti',
    pl: '/pl/kontakt',
  },
  '/tools': {
    en: '/tools',
    de: '/de/outils',
    fr: '/fr/outils',
    it: '/it/strumenti',
    pl: '/pl/narzedzia',
  },
  '/market/live': {
    en: '/market/live',
    de: '/de/markt/live-ticker',
    fr: '/fr/marche/en-direct',
    it: '/it/mercato/in-diretta',
    pl: '/pl/rynek/na-zywo',
  },
};

function staticEntry(
  path: string,
  priority: number,
  changeFreq: MetadataRoute.Sitemap[0]['changeFrequency'] = 'weekly',
): MetadataRoute.Sitemap {
  const paths = LOCALIZED[path];
  if (!paths) return [];
  return [
    {
      url: `${BASE}${paths.en}`,
      lastModified: new Date(),
      changeFrequency: changeFreq,
      priority,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, `${BASE}${paths[l]}`])) as Record<string, string>,
      },
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  entries.push(...staticEntry('/', 1.0, 'daily'));
  entries.push(...staticEntry('/properties/all', 0.9, 'daily'));
  entries.push(...staticEntry('/insights', 0.8, 'weekly'));
  entries.push(...staticEntry('/about', 0.6, 'monthly'));
  entries.push(...staticEntry('/contact', 0.6, 'monthly'));
  entries.push(...staticEntry('/tools', 0.7, 'monthly'));
  entries.push(...staticEntry('/market/live', 0.7, 'daily'));

  try {
    const { getAllProperties } = await import('@/src/lib/data');
    const properties = await getAllProperties();
    for (const prop of properties) {
      const slug = prop.slug ?? String(prop.id);
      entries.push({
        url: `${BASE}/properties/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE}${prefix(l)}/properties/${slug}`]),
          ) as Record<string, string>,
        },
      });
    }
  } catch {
    // Supabase not available at build time
  }

  try {
    const { ARTICLES } = await import('@/src/constants');
    for (const article of ARTICLES) {
      const slug = article.slug;
      if (!slug) continue;
      entries.push({
        url: `${BASE}/insights/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE}${prefix(l)}/insights/${slug}`]),
          ) as Record<string, string>,
        },
      });
    }
  } catch {
    // fallback
  }

  return entries;
}
