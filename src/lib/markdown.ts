// Vite-era markdown loader stub for Next.js — use markdown-server.ts for real loading.
// Exports kept here to prevent TypeScript errors from src/App.tsx (old Vite router).
export const SUPPORTED_ARTICLE_LANGS = ['en', 'it', 'de', 'fr', 'pl'] as const;
export type ArticleLang = typeof SUPPORTED_ARTICLE_LANGS[number];

export function resolveArticleLang(lang: string): ArticleLang {
  const short = lang.slice(0, 2).toLowerCase();
  return SUPPORTED_ARTICLE_LANGS.includes(short as ArticleLang) ? (short as ArticleLang) : 'en';
}

export function getLocalizedArticleLink(slug: string, lang: string): string {
  const l = resolveArticleLang(lang);
  return l === 'en' ? `/insights/${slug}` : `/${l}/insights/${slug}`;
}

export async function loadArticle(_slug: string, _lang: ArticleLang) { return null; }
export async function loadAllArticles(_lang: ArticleLang) { return []; }