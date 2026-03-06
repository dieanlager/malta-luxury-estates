import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE_URL = 'https://maltaluxuryrealestate.com';

const staticPages = [
  '',
  '/about',
  '/insights',
  '/properties/all',
  '/market/live',
  '/insights/gozo-bridge-effect',
  '/tools/property-valuation',
  '/tools/property-quiz',
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

const articleSlugs = fs.readdirSync(path.join(process.cwd(), 'src/content/articles/en'))
  .filter(f => f.endsWith('.md'))
  .map(f => f.replace('.md', ''));

const propertyIds = Array.from({ length: 100 }, (_, i) => (i + 1).toString());

const languages = ['', '/it', '/de', '/fr', '/pl'];
const hreflangs = ['en', 'it', 'de', 'fr', 'pl'];

function generateSitemap() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  const addUrl = (path, priority = '0.5', changefreq = 'weekly') => {
    languages.forEach((langPrefix, index) => {
      const fullPath = `${langPrefix}${path === '/' ? '' : path}`;
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}${fullPath}</loc>\n`;

      // Add alternate links for each language
      hreflangs.forEach((hl, i) => {
        const altPrefix = languages[i];
        const altPath = `${altPrefix}${path === '/' ? '' : path}`;
        xml += `    <xhtml:link rel="alternate" hreflang="${hl}" href="${BASE_URL}${altPath}"/>\n`;
      });
      // x-default should point to English
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${path}"/>\n`;

      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += '  </url>\n';
    });
  };

  staticPages.forEach(p => addUrl(p === '' ? '/' : p, p === '' ? '1.0' : '0.8', 'daily'));
  articleSlugs.forEach(slug => addUrl(`/insights/${slug}`, '0.9', 'monthly'));

  citySlugs.forEach(slug => {
    addUrl(`/properties/${slug}`, '0.7', 'weekly');
    filterSlugs.forEach(filter => {
      addUrl(`/properties/${slug}/${filter}`, '0.6', 'weekly');
    });
  });

  propertyIds.forEach(id => addUrl(`/properties/${id}`, '0.8', 'daily'));

  xml += '</urlset>';

  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml);
  console.log(`Sitemap generated successfully at ${outputPath}`);
}

generateSitemap();
