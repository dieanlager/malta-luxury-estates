import type { Location, LocationStats } from '../../types';

export function formatPrice(price: number | null): string {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-GB', {
        notation: 'compact',
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 1,
    }).format(price);
}

export function generateCityFAQSchema(
    location: Location,
    stats: LocationStats | null
) {
    const islandLabel = location.island === 'malta' ? 'Malta' : location.island === 'gozo' ? 'Gozo' : 'Comino';

    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `What is the average property price in ${location.nameEn}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: stats
                        ? `The median asking price for property in ${location.nameEn} is ${formatPrice(stats.medianPriceSale)}, based on ${stats.listingsSaleCount} active sale listings. The average price is ${formatPrice(stats.avgPriceSale)}. Rental prices start from ${formatPrice(stats.medianPriceRent)} per month.`
                        : `Market data for ${location.nameEn} is being compiled. Check back soon for updated pricing based on active listings.`,
                },
            },
            {
                '@type': 'Question',
                name: `Can foreigners buy property in ${location.nameEn}, ${islandLabel}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: location.isLuxuryHub
                        ? `Yes, ${location.nameEn} is one of Malta's prime locations for international buyers. Non-EU citizens can purchase property in Special Designated Areas (SDA) without requiring an AIP permit. For standard properties outside SDAs, a one-time AIP permit (€233) is required. EU citizens who have lived in Malta for 5+ years face fewer restrictions.`
                        : `Non-EU buyers require an Acquisition of Immovable Property (AIP) permit for properties outside Special Designated Areas (SDA). EU citizens with 5+ years residency in Malta face fewer restrictions. SDA developments allow unrestricted foreign ownership.`,
                },
            },
            {
                '@type': 'Question',
                name: `What rental yields can I expect in ${location.nameEn}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Estimated gross rental yields in ${location.nameEn} range from 4% to 6.5% annually, depending on property type and location within the area. Seafront apartments and furnished units typically achieve higher returns (5%–7%). Short-let properties can yield even more during peak tourist season (May–October).`,
                },
            },
            {
                '@type': 'Question',
                name: `What types of properties are available in ${location.nameEn}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Popular property types in ${location.nameEn} include modern seafront apartments, luxury penthouses with panoramic views, ${location.island === 'gozo' ? 'traditional houses of character, converted farmhouses,' : 'designer townhouses,'} and exclusive villas with private pools. Browse our curated listings to find your ideal property.`,
                },
            },
            {
                '@type': 'Question',
                name: `What are the buying costs when purchasing property in ${location.nameEn}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Standard buyer costs in Malta include: Stamp Duty of 5% (reduced to 3.5% on the first €200,000 for primary residence), Notary Fees of 1%–1.5%, Search Fees of approximately €300–€600, and an AIP Permit fee of €233 if applicable. First-time buyers enjoy stamp duty exemptions on the first €200,000. Use our Buying Costs Calculator for a personalised breakdown.`,
                },
            },
        ],
    };
}

export function generateFilterFAQSchema(
    cityName: string,
    filterSlug: string,
    filteredCount: number
) {
    const filterLabels: Record<string, string> = {
        'under-500k': 'under €500,000',
        'under-1m': 'under €1,000,000',
        '500k-1m': '€500,000 – €1,000,000',
        'over-1m': 'over €1,000,000',
        'over-3m': 'over €3,000,000',
        'sea-view': 'with sea view',
        'with-pool': 'with a private pool',
        'new-build': 'new-build',
        'furnished': 'fully furnished',
        'apartments': 'apartments',
        'villas': 'villas',
        'penthouses': 'penthouses',
        'houses-of-character': 'houses of character',
    };

    const filterLabel = filterLabels[filterSlug] || filterSlug.replace(/-/g, ' ');

    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `How many ${filterLabel} properties are available in ${cityName}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `There are currently ${filteredCount} active ${filterLabel} listings in ${cityName}. Our curated portfolio features hand-selected properties from Malta's leading agencies. New listings are added regularly.`,
                },
            },
            {
                '@type': 'Question',
                name: `What is the best time to buy ${filterLabel} property in ${cityName}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `The Maltese property market is active year-round, but prices tend to be more negotiable during the quieter winter months (November–February). Spring and summer see more listings and faster transactions. For investment properties, buying before the high season allows you to capitalise on peak rental demand.`,
                },
            },
        ],
    };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

export function generateArticleSchema(article: {
    title: string;
    excerpt: string;
    content: string;
    image: string;
    date: string;
    readTime: string;
    slug: string;
}) {
    const wordCount = article.content.split(/\s+/).length;

    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        image: article.image,
        datePublished: article.date,
        dateModified: article.date,
        wordCount,
        articleSection: 'Real Estate',
        author: {
            '@type': 'Organization',
            name: 'Malta Luxury Real Estate',
            url: 'https://maltaluxuryrealestate.com',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Malta Luxury Real Estate',
            logo: {
                '@type': 'ImageObject',
                url: 'https://maltaluxuryrealestate.com/logo.png',
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://maltaluxuryrealestate.com/insights/${article.slug}`,
        },
    };
}

// ─────────────────────────────────────────
// LOCAL BUSINESS – dla każdej lokalizacji
// Dominacja Google Maps / Local Pack
// ─────────────────────────────────────────
export function localBusinessSchema(location: {
    nameEn: string
    slug: string
    lat: number
    lng: number
    island: string
    shortDesc: string
    listingsSaleCount: number
    medianPriceSale?: number
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'RealEstateAgent',
        name: `Malta Luxury Real Estate – ${location.nameEn}`,
        description: `Premium property listings in ${location.nameEn}, ${location.island === 'gozo' ? 'Gozo' : 'Malta'
            }. ${location.shortDesc}`,
        url: `https://maltaluxuryrealestate.com/properties/${location.slug}`,
        image: 'https://maltaluxuryrealestate.com/og-image.jpg',
        address: {
            '@type': 'PostalAddress',
            addressLocality: location.nameEn,
            addressCountry: 'MT',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: location.lat,
            longitude: location.lng,
        },
        areaServed: {
            '@type': 'City',
            name: location.nameEn,
            containedInPlace: {
                '@type': 'Country',
                name: 'Malta',
            },
        },
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: `Properties in ${location.nameEn}`,
            numberOfItems: location.listingsSaleCount,
        },
    }
}

// ─────────────────────────────────────────
// HOW-TO – artykuły procesowe
// "How to buy", "How to apply for AIP" etc.
// ─────────────────────────────────────────
export function howToSchema(params: {
    name: string
    description: string
    steps: { name: string; text: string }[]
    estimatedCost?: string
    totalTime?: string // ISO 8601 duration, np. "P3M" = 3 miesiące
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: params.name,
        description: params.description,
        ...(params.totalTime && { totalTime: params.totalTime }),
        ...(params.estimatedCost && {
            estimatedCost: {
                '@type': 'MonetaryAmount',
                currency: 'EUR',
                value: params.estimatedCost,
            },
        }),
        step: params.steps.map((s, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: s.name,
            text: s.text,
        })),
    }
}


export function generatePropertySchema(property: any) {
    return {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: property.title,
        description: property.description,
        url: `https://maltaluxuryrealestate.com/properties/${property.id}`,
        image: property.images[0],
        offeredBy: {
            '@type': 'RealEstateAgent',
            name: property.agency?.name || 'Malta Luxury Real Estate',
        },
    };
}
