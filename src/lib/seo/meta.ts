import { useEffect } from 'react';

const BASE_URL = 'https://maltaluxuryrealestate.com';

interface MetaConfig {
    title: string;
    description: string;
    canonicalPath: string;
    noIndex?: boolean;
    ogType?: 'website' | 'article';
    ogImage?: string;
}

/**
 * Sets document head meta tags for SEO.
 * Since this is a React SPA, we manipulate the DOM directly.
 * 
 * CANONICAL STRATEGY:
 * - City pages (/properties/sliema) = canonical to themselves (PageRank pillars)
 * - Filter pages (/properties/sliema/under-500k) = canonical to city page
 *   → concentrates authority on fewer, stronger pages
 *   → filter pages still rank for long-tail but don't dilute city page authority
 * - Article pages = canonical to themselves (unique content)
 * - Property detail pages = canonical to themselves (highest conversion)
 */
export function usePageMeta(config: MetaConfig) {
    useEffect(() => {
        const { title, description, canonicalPath, noIndex, ogType, ogImage } = config;
        const canonicalUrl = `${BASE_URL}${canonicalPath}`;

        // Title
        document.title = title;

        // Meta description
        setMeta('description', description);

        // Canonical
        setLink('canonical', canonicalUrl);

        // Robots
        if (noIndex) {
            setMeta('robots', 'noindex, nofollow');
        } else {
            setMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1');
        }

        // Open Graph
        setMeta('og:title', title, 'property');
        setMeta('og:description', description, 'property');
        setMeta('og:url', canonicalUrl, 'property');
        setMeta('og:site_name', 'Malta Luxury Real Estate', 'property');
        setMeta('og:locale', 'en_MT', 'property');
        setMeta('og:type', ogType || 'website', 'property');
        if (ogImage) {
            setMeta('og:image', ogImage, 'property');
        }

        // Twitter
        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', title);
        setMeta('twitter:description', description);
        if (ogImage) {
            setMeta('twitter:image', ogImage);
        }

        // Cleanup on unmount
        return () => {
            document.title = 'Malta Luxury Real Estate – Premium Real Estate Portal';
        };
    }, [config.title, config.description, config.canonicalPath]);
}

function setMeta(nameOrProp: string, content: string, attr: 'name' | 'property' = 'name') {
    let meta = document.querySelector(`meta[${attr}="${nameOrProp}"]`) as HTMLMetaElement | null;
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, nameOrProp);
        document.head.appendChild(meta);
    }
    meta.content = content;
}

function setLink(rel: string, href: string) {
    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
    }
    link.href = href;
}

/**
 * Determines the canonical path for filter pages.
 * 
 * STRATEGY:
 * - Filter pages with UNIQUE content (long description, stats) → self-canonical
 * - Filter pages with THIN content → canonical to parent city page
 * 
 * This prevents PageRank dilution across 100+ filter variations
 * while still allowing Google to index them for long-tail ranking.
 */
export function getCanonicalPath(citySlug: string, filterSlug?: string): string {
    if (!filterSlug) return `/properties/${citySlug}`;

    // These filter pages have enough unique content for self-canonical
    const selfCanonicalFilters = ['apartments', 'villas', 'penthouses', 'houses-of-character'];

    if (selfCanonicalFilters.includes(filterSlug)) {
        return `/properties/${citySlug}/${filterSlug}`;
    }

    // Price/feature filters → canonical to city page (PageRank consolidation)
    return `/properties/${citySlug}`;
}

/**
 * Build full page title following SEO best practices.
 * Format: "{Specific} in {Location} | Malta Luxury Real Estate"
 */
export function buildPageTitle(parts: string[]): string {
    return [...parts, 'Malta Luxury Real Estate'].join(' | ');
}

