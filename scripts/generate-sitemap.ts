import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://www.maltaluxuryrealestate.com';

const staticPages = [
  '/',
  '/about',
  '/insights',
  '/properties/all',
  '/market/live',
  '/tools/valuation',
  '/tools/quiz',
  '/insights/gozo-bridge-effect',
];

const citySlugs = [
  'sliema', 'st-julians', 'valletta', 'mdina', 'mellieha',
  'victoria', 'swieqi', 'attard', 'madliena', 'san-pawl-il-bahar',
  'naxxar', 'marsascala', 'three-cities', 'xlendi', 'gharghur'
];

const filterSlugs = [
  'apartments', 'villas', 'penthouses', 'houses-of-character', 'maisonettes', 'palazzos',
  'under-500k', 'under-1m', '500k-1m', 'over-1m', 'over-3m',
  'sea-view', 'with-pool', 'new-build', 'furnished'
];

// Languages
const languages = ['', 'it', 'de', 'fr', 'pl'];
const hreflangs = ['en', 'it', 'de', 'fr', 'pl'];

const slugTranslations: Record<string, Record<string, string>> = {
  pl: { properties: 'nieruchomosci', all: 'wszystkie', insights: 'wiedza', about: 'o-nas', market: 'rynek', live: 'na-zywo', tools: 'narzedzia', valuation: 'wycena-nieruchomosci', quiz: 'quiz-nieruchomosci' },
  fr: { properties: 'proprietes', all: 'toutes', insights: 'conseils', about: 'a-propos', market: 'marche', live: 'en-direct', tools: 'outils', valuation: 'estimation-immobiliere', quiz: 'quiz-immobilier' },
  it: { properties: 'immobiliare', all: 'tutti', insights: 'approfondimenti', about: 'chi-siamo', market: 'mercato', live: 'in-diretta', tools: 'strumenti', valuation: 'valutazione-immobiliare', quiz: 'quiz-immobiliare' },
  de: { properties: 'immobilien', all: 'alle', insights: 'einblicke', about: 'ueber-uns', market: 'markt', live: 'live-ticker', tools: 'tools', valuation: 'immobilienbewertung', quiz: 'immobilien-quiz' }
};

// Load article slug map
const articleSlugsMap = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/lib/article-slugs.json'), 'utf-8'));

function generateSitemap() {
  const articleDir = path.join(process.cwd(), 'src/content/articles/en');
  const articleSlugs = fs.readdirSync(articleDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  const getLocalizedUrl = (originalPath: string, lang: string) => {
    const langPrefix = lang ? `/${lang}` : '';
    if (!lang) return `${BASE_URL}${originalPath === '/' ? '' : originalPath}`;

    const parts = originalPath.split('/').filter(Boolean);
    const isArticle = parts[0] === 'insights' && parts.length > 1;

    const localizedParts = parts.map((part, i) => {
      // If it's an article slug (second part of /insights/slug)
      if (isArticle && i === 1) {
        return articleSlugsMap[lang]?.[part] || part;
      }
      return slugTranslations[lang]?.[part] || part;
    });

    const localizedPath = localizedParts.length > 0 ? `/${localizedParts.join('/')}` : '';
    return `${BASE_URL}${langPrefix}${localizedPath === '/' ? '' : localizedPath}`;
  };

  const addUrl = (path: string, priority = '0.5', changefreq = 'weekly') => {
    // path is something like "/insights/my-article" or "/"

    languages.forEach((lang, langIdx) => {
      const fullUrl = getLocalizedUrl(path, lang);

      xml += '  <url>\n';
      xml += `    <loc>${fullUrl}</loc>\n`;

      // Hreflang alternates
      hreflangs.forEach((hl, i) => {
        const altLang = languages[i] || ''; // handle '' for en
        const altUrl = getLocalizedUrl(path, altLang);
        xml += `    <xhtml:link rel="alternate" hreflang="${hl}" href="${altUrl}"/>\n`;
      });

      // x-default (English)
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${getLocalizedUrl(path, '')}"/>\n`;

      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += '  </url>\n';
    });
  };

  // 1. Static Pages
  staticPages.forEach(p => addUrl(p, p === '/' ? '1.0' : '0.8', 'daily'));

  // 2. Articles
  articleSlugs.forEach(slug => addUrl(`/insights/${slug}`, '0.9', 'monthly'));

  // 3. City & Filter Pages
  citySlugs.forEach(slug => {
    addUrl(`/properties/${slug}`, '0.7', 'weekly');
    filterSlugs.forEach(f => {
      addUrl(`/properties/${slug}/${f}`, '0.6', 'weekly');
    });
  });

  // 4. Property Detail Pages (Sample range or dynamic if we had a DB)
  // For now we'll do 1-100 as in the previous script
  for (let i = 1; i <= 100; i++) {
    addUrl(`/properties/${i}`, '0.8', 'daily');
  }

  xml += '</urlset>';

  const dir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  fs.writeFileSync(path.join(dir, 'sitemap.xml'), xml);
  console.log(`Sitemap generated with ${xml.split('<url>').length - 1} entries.`);
}

generateSitemap();
