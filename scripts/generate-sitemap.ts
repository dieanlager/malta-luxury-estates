import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://www.maltaluxuryrealestate.com';
const locales = ['en', 'it', 'de', 'fr', 'pl'];

// next-intl localePrefix: 'as-needed' — EN has no prefix
const prefix = (lang: string) => (lang === 'en' ? '' : `/${lang}`);

// Localized path segments matching routing.ts pathnames
const localizedPaths: Record<string, Record<string, string>> = {
  '/properties/all': { en: '/properties/all', it: '/immobiliare/tutti', de: '/immobilien/alle', fr: '/proprietes/toutes', pl: '/nieruchomosci/wszystkie' },
  '/insights':       { en: '/insights', it: '/approfondimenti', de: '/einblicke', fr: '/conseils', pl: '/wiedza' },
  '/insights/[slug]':{ en: '/insights', it: '/approfondimenti', de: '/einblicke', fr: '/conseils', pl: '/wiedza' },
  '/about':          { en: '/about', it: '/chi-siamo', de: '/ueber-uns', fr: '/a-propos', pl: '/o-nas' },
  '/market/live':    { en: '/market/live', it: '/mercato/in-diretta', de: '/markt/live-ticker', fr: '/marche/en-direct', pl: '/rynek/na-zywo' },
  '/tools/valuation':{ en: '/tools/valuation', it: '/strumenti/valutazione-immobiliare', de: '/outils/immobilienbewertung', fr: '/outils/estimation-immobiliere', pl: '/narzedzia/wycena-nieruchomosci' },
  '/tools/quiz':     { en: '/tools/quiz', it: '/strumenti/quiz-immobiliare', de: '/outils/immobilien-quiz', fr: '/outils/quiz-immobilier', pl: '/narzedzia/quiz-nieruchomosci' },
  '/contact':        { en: '/contact', it: '/contact', de: '/contact', fr: '/contact', pl: '/contact' },
};

const citySlugs = [
  'sliema', 'st-julians', 'valletta', 'mdina', 'mellieha', 'senglea', 'cospicua', 'vittoriosa',
  'gzira', 'msida', 'swieqi', 'pembroke', 'san-gwann', 'st-pauls-bay', 'qawra', 'bugibba',
  'naxxar', 'gharghur', 'madliena', 'iklin', 'lija', 'balzan', 'attard', 'mosta', 'rabat',
  'marsaxlokk', 'marsascala', 'birzebbuga', 'zejtun', 'qormi', 'zebbug', 'siggiewi',
  'dingli', 'mgarr', 'bahrija', 'zurrieq', 'qrendi', 'mqabba', 'kirkop', 'safi', 'luqa', 'gudja',
  'ghaxaq', 'tarxien', 'paola', 'fgura', 'santa-lucija', 'kalkara', 'xghajra', 'floriana',
  'gozo-victoria', 'gozo-xlendi', 'gozo-marsalforn', 'gozo-nadur', 'gozo-xaghra',
  'gozo-ghajnsielem', 'gozo-qala', 'gozo-sannat', 'gozo-munxar', 'gozo-zebbug',
  'gozo-gharb', 'gozo-ghasri', 'gozo-san-lawrenz',
];

function buildUrl(path: string, lang: string) {
  return `${BASE_URL}${prefix(lang)}${path}`;
}

function addEntry(xml: string[], url: string, alternates: Array<{lang: string, url: string}>, priority: string, changefreq: string) {
  xml.push('  <url>');
  xml.push(`    <loc>${url}</loc>`);
  for (const alt of alternates) {
    xml.push(`    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.url}"/>`);
  }
  xml.push(`    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`);
  xml.push(`    <changefreq>${changefreq}</changefreq>`);
  xml.push(`    <priority>${priority}</priority>`);
  xml.push('  </url>');
}

function generateSitemap() {
  const articleDir = path.join(process.cwd(), 'src/content/articles/en');
  const articleSlugs = fs.readdirSync(articleDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));

  const articleSlugsMap = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'src/lib/article-slugs.json'), 'utf-8')
  );

  const xml: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  // --- 1. Homepage ---
  for (const lang of locales) {
    const url = buildUrl('', lang);
    const alts = [
      ...locales.map(l => ({ lang: l, url: buildUrl('', l) })),
      { lang: 'x-default', url: buildUrl('', 'en') },
    ];
    addEntry(xml, url, alts, '1.0', 'daily');
  }

  // --- 2. Static pages ---
  const staticRoutes = ['/properties/all', '/insights', '/about', '/market/live', '/tools/valuation', '/tools/quiz', '/contact'];
  for (const route of staticRoutes) {
    const paths = localizedPaths[route];
    for (const lang of locales) {
      const url = buildUrl(paths[lang], lang);
      const alts = [
        ...locales.map(l => ({ lang: l, url: buildUrl(paths[l], l) })),
        { lang: 'x-default', url: buildUrl(paths['en'], 'en') },
      ];
      addEntry(xml, url, alts, '0.8', 'weekly');
    }
  }

  // --- 3. Articles ---
  for (const slug of articleSlugs) {
    const slugForLang = (lang: string) => {
      const seg = localizedPaths['/insights/[slug]'][lang];
      const localSlug = articleSlugsMap[lang]?.[slug] ?? slug;
      return `${seg}/${localSlug}`;
    };
    for (const lang of locales) {
      const url = buildUrl(slugForLang(lang), lang);
      const alts = [
        ...locales.map(l => ({ lang: l, url: buildUrl(slugForLang(l), l) })),
        { lang: 'x-default', url: buildUrl(slugForLang('en'), 'en') },
      ];
      addEntry(xml, url, alts, '0.9', 'monthly');
    }
  }

  // --- 4. City pages (real /properties/city/[slug] route) ---
  for (const city of citySlugs) {
    for (const lang of locales) {
      const url = buildUrl(`/properties/city/${city}`, lang);
      const alts = [
        ...locales.map(l => ({ lang: l, url: buildUrl(`/properties/city/${city}`, l) })),
        { lang: 'x-default', url: buildUrl(`/properties/city/${city}`, 'en') },
      ];
      addEntry(xml, url, alts, '0.7', 'weekly');
    }
  }

  xml.push('</urlset>');

  const outPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml.join('\n'));
  const count = xml.filter(l => l.trim() === '<url>').length;
  console.log(`Sitemap generated: ${count} URLs → public/sitemap.xml`);
}

generateSitemap();