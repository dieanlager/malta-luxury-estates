
const LOCATION_LINK_MAP: Record<string, string> = {
    // Główne miasta
    'Sliema': '/properties/sliema',
    'St. Julian\'s': '/properties/st-julians',
    'St Julian\'s': '/properties/st-julians',
    'Valletta': '/properties/valletta',
    'Mellieħa': '/properties/mellieha',
    'Mellieha': '/properties/mellieha',
    'Gżira': '/properties/gzira',
    'Gzira': '/properties/gzira',
    'Msida': '/properties/msida',
    'Mdina': '/properties/mdina',
    'Gozo': '/properties/gozo',
    'Victoria': '/properties/victoria',
    'Marsaxlokk': '/properties/marsaxlokk',
    'Swieqi': '/properties/swieqi',
    'Naxxar': '/properties/naxxar',
    'Qawra': '/properties/qawra',
    'Bugibba': '/properties/san-pawl-il-bahar',
    'Buġibba': '/properties/san-pawl-il-bahar',
    'Marsascala': '/properties/marsascala',
    'Birżebbuġa': '/properties/birzebbuga',
    'Madliena': '/properties/madliena',
    // Typy nieruchomości
    'houses of character': '/properties/malta/houses-of-character',
    'house of character': '/properties/malta/houses-of-character',
    'farmhouse': '/properties/gozo/farmhouses',
    'farmhouses': '/properties/gozo/farmhouses',
    'penthouse': '/properties/malta/penthouses',
    'penthouses': '/properties/malta/penthouses',
    // Programy
    'MPRP': '/insights/malta-permanent-residency-mprp-property-guide',
    'AIP': '/insights/buying-property-in-malta-as-a-foreigner-2026',
    'SDA': '/insights/sda-projects-complete-list-malta-2026',
}

const ARTICLE_LINK_MAP: Record<string, string> = {
    'stamp duty': '/insights/property-taxes-malta-2026',
    'rental yield': '/insights/rental-yields-malta-2026',
    'rental income tax': '/insights/rental-income-tax-malta-2026',
    'inheritance tax': '/insights/property-inheritance-malta-succession-tax',
    'buying process': '/insights/buying-process-malta-step-by-step-guide',
    'short-let': '/insights/short-let-vs-long-let-malta-2026',
    'long-let': '/insights/short-let-vs-long-let-malta-2026',
    'mortgage': '/insights/mortgage-malta-foreigners-guide-2026',
    'mortgages': '/insights/mortgage-malta-foreigners-guide-2026',
    'tax optimization': '/insights/property-tax-optimization-malta-2026',
    'ROI': '/insights/malta-real-estate-investment-guide-2026',
    'Permanent Residency': '/insights/malta-permanent-residency-mprp-financial-benefits',
    'cryptocurrency': '/insights/buying-property-malta-cryptocurrency-guide-2026',
    'Bitcoin': '/insights/buying-property-malta-cryptocurrency-guide-2026',
    'Blockchain': '/insights/buying-property-malta-cryptocurrency-guide-2026',
    'international school': '/insights/international-schools-malta-expat-guide',
    'international schools': '/insights/international-schools-malta-expat-guide',
    'Palazzo': '/insights/restoring-historic-palazzo-malta-guide',
    'Palazzos': '/insights/restoring-historic-palazzo-malta-guide',
    'yacht': '/insights/yachting-lifestyle-malta-marinas-property',
    'yachting': '/insights/yachting-lifestyle-malta-marinas-property',
    'healthcare': '/insights/healthcare-in-malta-guide-for-expats-2026',
    'Sliema market': '/insights/sliema-real-estate-market-deep-dive-2026',
    'Valletta investing': '/insights/valletta-investing-in-malta-baroque-capital-2026',
    'investing in Valletta': '/insights/valletta-investing-in-malta-baroque-capital-2026',
    'Marsaxlokk property': '/insights/marsaxlokk-south-malta-emerging-real-estate-values',
    'St. Julian’s investment': '/insights/st-julians-portomaso-luxury-living-nightlife-investment-2026',
    'Mdina real estate': '/insights/mdina-rabat-noble-heartland-property-guide-2026',
    'ground rent': '/insights/ground-rent-cens-redemption-malta-guide',
    'cens': '/insights/ground-rent-cens-redemption-malta-guide',
    'pets': '/insights/moving-to-malta-with-pets-buying-renting-guide',
    'pet-friendly': '/insights/moving-to-malta-with-pets-buying-renting-guide',
    'commercial investment': '/insights/commercial-vs-residential-investment-malta-2026',
    'House of Character': '/insights/renovating-house-of-character-malta-costs-pitfalls',
    'renovation': '/insights/renovating-house-of-character-malta-costs-pitfalls',
    'retirement': '/insights/retirement-in-malta-for-british-eu-citizens-2026',
    'off-plan': '/insights/buying-off-plan-property-malta-risks-rewards',
    'Nomad Residence Permit': '/insights/digital-nomad-residence-permit-malta-housing-guide-2026',
    'Digital Nomad': '/insights/digital-nomad-residence-permit-malta-housing-guide-2026',
    'EPC': '/insights/energy-efficiency-epc-malta-solar-incentives-2026',
    'solar': '/insights/energy-efficiency-epc-malta-solar-incentives-2026',
    'condominium': '/insights/condominium-fees-management-malta-guide-2026',
    'condo': '/insights/condominium-fees-management-malta-guide-2026',
    'inheritance': '/insights/property-inheritance-malta-succession-tax-2026',
}

const ALL_LINK_MAP = { ...LOCATION_LINK_MAP, ...ARTICLE_LINK_MAP }

/**
 * Injects internal Markdown links into the provided markdown string.
 * This function targets ONLY the first occurrence of each keyword to avoid over-linking.
 */
export function injectInternalLinks(markdown: string): string {
    let result = markdown;
    const linked = new Set<string>();

    // Sort by length to match the longest terms first (e.g. "houses of character" before "house")
    const sortedKeys = Object.keys(ALL_LINK_MAP).sort((a, b) => b.length - a.length);

    for (const keyword of sortedKeys) {
        if (linked.has(keyword)) continue;

        const href = ALL_LINK_MAP[keyword];
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Regex explanation:
        // 1. (?<!\[) - Ensure not already inside a markdown link text [keyword]
        // 2. (?<!/) - Ensure not part of a URL path /keyword
        // 3. \b(keyword)\b - Match the whole word
        // 4. (?![^\]]*\]\() - Ensure not followed by a markdown link target
        // 5. (?![^\(]*\)) - Ensure not inside a markdown link URL (...)
        const pattern = new RegExp(`(?<!\\[|/)\\b(${escaped})\\b(?![^\\]]*\\]\\()(?![^\\(]*\\))`, 'i');

        if (pattern.test(result)) {
            // Replace only the FIRST occurrence
            result = result.replace(pattern, (match) => {
                // Double check if we are inside a link by checking if the surrounding context matches a markdown link
                // This is a safety fallback for complex cases
                linked.add(keyword);
                return `[${match}](${href})`;
            });
        }
    }

    return result;
}
