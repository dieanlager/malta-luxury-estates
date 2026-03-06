import { writeFileSync } from 'fs';
import { resolve } from 'path';

const DOMAIN = 'https://malta-luxury-estates.vercel.app';

// Static pages
const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/properties/all', priority: '0.9', changefreq: 'daily' },
    { url: '/insights', priority: '0.9', changefreq: 'daily' },
    // City pages
    { url: '/properties/sliema', priority: '0.8', changefreq: 'weekly' },
    { url: '/properties/st-julians', priority: '0.8', changefreq: 'weekly' },
    { url: '/properties/valletta', priority: '0.8', changefreq: 'weekly' },
    { url: '/properties/mellieha', priority: '0.7', changefreq: 'weekly' },
    { url: '/properties/victoria', priority: '0.7', changefreq: 'weekly' },
    { url: '/properties/three-cities', priority: '0.7', changefreq: 'weekly' },
    { url: '/properties/mdina', priority: '0.7', changefreq: 'weekly' },
    { url: '/properties/marsaskala', priority: '0.6', changefreq: 'weekly' },
    // Filter pages
    { url: '/properties/sliema/villas', priority: '0.7', changefreq: 'weekly' },
    { url: '/properties/sliema/penthouses', priority: '0.7', changefreq: 'weekly' },
    { url: '/properties/sliema/apartments', priority: '0.7', changefreq: 'weekly' },
    { url: '/properties/st-julians/penthouses', priority: '0.7', changefreq: 'weekly' },
    { url: '/properties/valletta/palazzos', priority: '0.7', changefreq: 'weekly' },
    { url: '/properties/victoria/farmhouses', priority: '0.6', changefreq: 'weekly' },
];

// Article slugs from all content files
const articleSlugs = [
    // phase2
    'step-by-step-buying-process-malta',
    'selling-property-malta-complete-guide',
    'rental-law-malta-landlords-tenants-2026',
    'short-let-vs-long-let-malta-2026',
    // phase3
    'malta-permanent-residency-property-mprp',
    'property-inheritance-malta',
    // phase3b
    'moving-to-malta-complete-guide',
    'rental-income-tax-malta-2026',
    // phase4
    'planning-permission-malta-guide',
    'mortgage-malta-foreigners-guide-2026',
    // phase4b
    'off-plan-buying-guide-malta-2026',
    'gozo-property-investment-guide-2026',
    // finance
    'property-tax-optimization-malta-2026',
    'investing-gozo-vs-malta-financial-comparison',
    'malta-permanent-residency-mprp-financial-benefits',
    'buying-property-malta-cryptocurrency-guide-2026',
    // cities
    'sliema-real-estate-market-deep-dive-2026',
    'valletta-investing-in-malta-baroque-capital-2026',
    'marsaxlokk-south-malta-emerging-real-estate-values',
    'st-julians-portomaso-luxury-living-nightlife-investment-2026',
    'mdina-rabat-noble-heartland-property-guide-2026',
    // lifestyle
    'international-schools-malta-expat-guide',
    'most-exclusive-neighborhoods-malta-villas-2026',
    'restoring-historic-palazzo-malta-guide',
    'yachting-lifestyle-malta-marinas-property',
    'healthcare-in-malta-guide-for-expats-2026',
    // longtail
    'ground-rent-cens-redemption-malta-guide',
    'moving-to-malta-with-pets-buying-renting-guide',
    'commercial-vs-residential-investment-malta-2026',
    'renovating-house-of-character-malta-costs-pitfalls',
    'retirement-in-malta-for-british-eu-citizens-2026',
    // technical
    'buying-off-plan-property-malta-risks-rewards',
    'digital-nomad-residence-permit-malta-housing-guide-2026',
    'energy-efficiency-epc-malta-solar-incentives-2026',
    'condominium-fees-management-malta-guide-2026',
    'property-inheritance-malta-succession-tax-2026',
    // phase5
    'student-accommodation-malta-guide-2026',
    'sda-projects-complete-list-malta-2026',
    // phase5b
    'cost-of-living-malta-2026',
    'malta-property-market-forecast-2026-2030',
];

const today = new Date().toISOString().split('T')[0];

const urls = [
    ...staticPages.map(p => `
  <url>
    <loc>${DOMAIN}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
    ...articleSlugs.map(slug => `
  <url>
    <loc>${DOMAIN}/insights/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.join('')}
</urlset>`;

const outPath = resolve('public', 'sitemap.xml');
writeFileSync(outPath, xml, 'utf-8');
console.log(`✅ sitemap.xml generated → ${outPath} (${urls.length} URLs)`);
