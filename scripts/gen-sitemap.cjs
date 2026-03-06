const fs = require('fs');
const DOMAIN = 'https://malta-luxury-estates.vercel.app';
const today = new Date().toISOString().split('T')[0];

const staticPages = [
    ['/', '1.0', 'daily'],
    ['/properties/all', '0.9', 'daily'],
    ['/market/live', '0.9', 'daily'],
    ['/insights', '0.9', 'daily'],
    ['/insights/gozo-bridge-effect', '0.9', 'weekly'],
    ['/tools/property-valuation', '0.9', 'weekly'],
    ['/tools/property-quiz', '0.9', 'weekly'],
    ['/properties/sliema', '0.8', 'weekly'],
    ['/properties/st-julians', '0.8', 'weekly'],
    ['/properties/valletta', '0.8', 'weekly'],
    ['/properties/mellieha', '0.7', 'weekly'],
    ['/properties/victoria', '0.7', 'weekly'],
    ['/properties/three-cities', '0.7', 'weekly'],
    ['/properties/mdina', '0.7', 'weekly'],
    ['/properties/madliena', '0.7', 'weekly'],
    ['/properties/swieqi', '0.6', 'weekly'],
    ['/properties/attard', '0.6', 'weekly'],
    ['/properties/san-pawl-il-bahar', '0.6', 'weekly'],
    ['/properties/naxxar', '0.6', 'weekly'],
    ['/properties/marsascala', '0.6', 'weekly'],
    ['/properties/xlendi', '0.6', 'weekly'],
    ['/properties/gharghur', '0.6', 'weekly'],
    ['/properties/sliema/villas', '0.7', 'weekly'],
    ['/properties/sliema/penthouses', '0.7', 'weekly'],
    ['/properties/st-julians/penthouses', '0.7', 'weekly'],
    ['/properties/valletta/palazzos', '0.7', 'weekly'],
    ['/privacy-policy', '0.3', 'monthly'],
    ['/terms-of-service', '0.3', 'monthly'],
    ['/cookie-policy', '0.3', 'monthly'],
];

const articles = [
    'step-by-step-buying-process-malta', 'selling-property-malta-complete-guide',
    'rental-law-malta-landlords-tenants-2026', 'short-let-vs-long-let-malta-2026',
    'malta-permanent-residency-property-mprp', 'property-inheritance-malta',
    'moving-to-malta-complete-guide', 'rental-income-tax-malta-2026',
    'planning-permission-malta-guide', 'mortgage-malta-foreigners-guide-2026',
    'off-plan-buying-guide-malta-2026', 'gozo-property-investment-guide-2026',
    'property-tax-optimization-malta-2026', 'investing-gozo-vs-malta-financial-comparison',
    'malta-permanent-residency-mprp-financial-benefits', 'buying-property-malta-cryptocurrency-guide-2026',
    'sliema-real-estate-market-deep-dive-2026', 'valletta-investing-in-malta-baroque-capital-2026',
    'marsaxlokk-south-malta-emerging-real-estate-values', 'st-julians-portomaso-luxury-living-nightlife-investment-2026',
    'mdina-rabat-noble-heartland-property-guide-2026', 'international-schools-malta-expat-guide',
    'most-exclusive-neighborhoods-malta-villas-2026', 'restoring-historic-palazzo-malta-guide',
    'yachting-lifestyle-malta-marinas-property', 'healthcare-in-malta-guide-for-expats-2026',
    'ground-rent-cens-redemption-malta-guide', 'moving-to-malta-with-pets-buying-renting-guide',
    'commercial-vs-residential-investment-malta-2026', 'renovating-house-of-character-malta-costs-pitfalls',
    'retirement-in-malta-for-british-eu-citizens-2026', 'buying-off-plan-property-malta-risks-rewards',
    'digital-nomad-residence-permit-malta-housing-guide-2026', 'energy-efficiency-epc-malta-solar-incentives-2026',
    'condominium-fees-management-malta-guide-2026', 'property-inheritance-malta-succession-tax-2026',
    'student-accommodation-malta-guide-2026', 'sda-projects-complete-list-malta-2026',
    'cost-of-living-malta-2026', 'malta-property-market-forecast-2026-2030'
];

function url(loc, priority, changefreq) {
    return '  <url>\n    <loc>' + loc + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>' + changefreq + '</changefreq>\n    <priority>' + priority + '</priority>\n  </url>';
}

const urls = [
    ...staticPages.map(function (p) { return url(DOMAIN + p[0], p[1], p[2]); }),
    ...articles.map(function (s) { return url(DOMAIN + '/insights/' + s, '0.8', 'monthly'); })
];

const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join('\n') + '\n</urlset>';

if (!fs.existsSync('public')) fs.mkdirSync('public');
fs.writeFileSync('public/sitemap.xml', xml, 'utf-8');
console.log('OK: ' + urls.length + ' URLs');
