import { useEffect } from 'react';

const BASE_URL = 'https://www.maltaluxuryrealestate.com';
const LANGUAGES = ['en', 'it', 'de', 'fr', 'pl'];

interface MetaConfig {
    title: string;
    description: string;
    canonicalPath: string; // The path WITHOUT language prefix (e.g. /properties/sliema)
    currentLang?: string;
    noIndex?: boolean;
    ogType?: 'website' | 'article';
    ogImage?: string;
    forceSelfCanonical?: boolean; // If true, canonical will include the current language prefix
    i18n?: any;
}

/**
 * Sets document head meta tags for SEO.
 * Since this is a React SPA, we manipulate the DOM directly.
 */
export function usePageMeta(config: MetaConfig) {
    useEffect(() => {
        const { title, description, canonicalPath, currentLang = 'en', noIndex, ogType, ogImage, forceSelfCanonical } = config;

        // Determine if we should use a language-specific canonical or point to English
        // Default: City/Filter pages canonical to English version to consolidate authority
        // Exceptions: Articles and Properties (unique localized content)
        const isEn = currentLang === 'en' || currentLang === '';
        const langPrefix = isEn ? '' : `/${currentLang}`;

        let finalCanonicalPath = canonicalPath;
        if (forceSelfCanonical || canonicalPath.startsWith('/insights/') || canonicalPath.startsWith('/properties/')) {
            // Check if it's a property ID (e.g. /properties/123) vs a city (e.g. /properties/sliema)
            // Property detail pages and articles should be self-referential
            const isDetailOrArticle = canonicalPath.match(/^\/properties\/\d+$/) || canonicalPath.startsWith('/insights/');
            if (isDetailOrArticle || forceSelfCanonical) {
                finalCanonicalPath = `${langPrefix}${canonicalPath}`;
            }
        }

        const canonicalUrl = `${BASE_URL}${finalCanonicalPath === '/' ? '' : finalCanonicalPath}`;

        // Title
        document.title = title;

        // Meta description
        setMeta('description', description);

        // Canonical
        setLink('canonical', canonicalUrl);

        // Hreflang Tags
        // We use i18n directly to get translations for other languages
        const { i18n } = config;

        LANGUAGES.forEach(lang => {
            const prefix = lang === 'en' ? '' : `/${lang}`;

            // Localize the path parts
            const parts = canonicalPath.split('/').filter(Boolean);
            const localizedParts = i18n ? parts.map(part => {
                const translation = i18n.getResource(lang, 'common', `slugs.${part}`);
                return translation || part;
            }) : parts;

            const localizedPath = localizedParts.length > 0 ? `/${localizedParts.join('/')}` : '';
            const href = `${BASE_URL}${prefix}${localizedPath === '/' ? '' : localizedPath}`;
            setLink('alternate', href, lang);
        });
        // x-default
        setLink('alternate', `${BASE_URL}${canonicalPath === '/' ? '' : canonicalPath}`, 'x-default');

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
        setMeta('og:locale', currentLang === 'en' ? 'en_MT' : `${currentLang}_MT`, 'property');
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

        return () => {
            // No reset needed as it will be overwritten by next page
        };
    }, [config.title, config.description, config.canonicalPath, config.currentLang]);
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

function setLink(rel: string, href: string, hreflang?: string) {
    const selector = hreflang
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]:not([hreflang])`;

    let link = document.querySelector(selector) as HTMLLinkElement | null;
    if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        if (hreflang) link.hreflang = hreflang;
        document.head.appendChild(link);
    }
    link.href = href;
}

/**
 * Determines the canonical path for filter pages.
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
 */
export function buildPageTitle(parts: string[]): string {
    return [...parts, 'Malta Luxury Real Estate'].join(' | ');
}
