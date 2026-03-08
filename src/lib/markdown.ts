import type { Article } from '../types'
import articleSlugs from './article-slugs.json'

// ── Wszystkie pliki MD załadowane przez Vite w build time ────
// Vite bundluje je statycznie — działa SSG/SSR i na produkcji
const allMarkdownFiles = import.meta.glob(
    '/src/content/articles/**/*.md',
    { as: 'raw', eager: false }   // eager: false = lazy load per artykuł
)

// ── Supported langs z fallback do EN ─────────────────────────
export const SUPPORTED_ARTICLE_LANGS = ['en', 'it', 'de', 'fr', 'pl'] as const
export type ArticleLang = typeof SUPPORTED_ARTICLE_LANGS[number]

export function resolveArticleLang(lang: string): ArticleLang {
    const short = lang.slice(0, 2).toLowerCase()
    return SUPPORTED_ARTICLE_LANGS.includes(short as ArticleLang)
        ? (short as ArticleLang)
        : 'en'
}

// ── Frontmatter parser — zero dependencies ────────────────────
// Parsuje YAML frontmatter z ---...--- bloku
interface Frontmatter {
    title?: string
    excerpt?: string
    category?: string
    date?: string
    readTime?: string
    image?: string
    slug?: string
    [key: string]: string | undefined
}

function parseFrontmatter(raw: string): { fm: Frontmatter; body: string } {
    // Regex to match frontmatter between --- and ---
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
    if (!match) return { fm: {}, body: raw }

    const fm: Frontmatter = {}
    match[1].split('\n').forEach(line => {
        const colonIdx = line.indexOf(': ')
        if (colonIdx === -1) return
        const key = line.slice(0, colonIdx).trim()
        const value = line.slice(colonIdx + 2).trim().replace(/^["']|["']$/g, '')
        fm[key] = value
    })

    return { fm, body: match[2] }
}

// ── Zbuduj ścieżkę do pliku MD ────────────────────────────────
function buildPath(slug: string, lang: ArticleLang): string {
    return `/src/content/articles/${lang}/${slug}.md`
}

// ── Załaduj jeden artykuł po slug + lang ─────────────────────
export async function loadArticle(
    slug: string,
    lang: ArticleLang
): Promise<Article | null> {

    let realSlug = slug;

    // Resolve localized slug to English filename slug
    if (lang !== 'en') {
        const langMap = (articleSlugs as any)[lang] || {};
        const entries = Object.entries(langMap);
        const found = entries.find(([_, local]) => local === slug);
        if (found) {
            realSlug = found[0];
        }
    }

    const primaryPath = buildPath(realSlug, lang)
    const fallbackPath = buildPath(realSlug, 'en')

    // Próbuj główny język → fallback do EN
    const loader = allMarkdownFiles[primaryPath] ?? allMarkdownFiles[fallbackPath]

    if (!loader) return null

    try {
        const raw = await (loader as () => Promise<string>)()
        const { fm, body } = parseFrontmatter(raw)

        return {
            slug,
            title: fm.title ?? slug,
            excerpt: fm.excerpt ?? '',
            category: (fm.category as Article['category']) ?? 'Buying',
            date: fm.date ?? '',
            readTime: fm.readTime ?? fm['read_time'] ?? '5 min read',
            image: fm.image ?? '/images/default-article.jpg',
            content: body.trim(),
        }
    } catch (error) {
        console.error(`Error loading article ${slug} for lang ${lang}:`, error)
        return null
    }
}

// ── Załaduj wszystkie artykuły dla danego języka ─────────────
export async function loadAllArticles(lang: ArticleLang): Promise<Article[]> {
    const prefix = `/src/content/articles/${lang}/`

    // Filtruj pliki dla tego języka
    const paths = Object.keys(allMarkdownFiles).filter(p => p.startsWith(prefix))

    // Fallback: jeśli lang nie ma plików, weź EN
    const activePaths = paths.length > 0
        ? paths
        : Object.keys(allMarkdownFiles).filter(p =>
            p.startsWith('/src/content/articles/en/')
        )

    const articles = await Promise.all(
        activePaths.map(async path => {
            try {
                const raw = await (allMarkdownFiles[path] as () => Promise<string>)()
                const { fm, body } = parseFrontmatter(raw)

                // Wyciągnij slug z nazwy pliku
                const enSlug = path.split('/').pop()?.replace(/\.md$/, '') ?? ''
                const slug = fm.localizedSlug || enSlug

                return {
                    slug,
                    title: fm.title ?? slug,
                    excerpt: fm.excerpt ?? '',
                    category: (fm.category as Article['category']) ?? 'Buying',
                    date: fm.date ?? '',
                    readTime: fm.readTime ?? fm['read_time'] ?? '5 min read',
                    image: fm.image ?? '/images/default-article.jpg',
                    content: body.trim(),
                } satisfies Article
            } catch (error) {
                console.error(`Error loading all articles from ${path}:`, error)
                return null
            }
        })
    )

    return articles
        .filter((a): a is Article => a !== null)
        .sort((a, b) => {
            // Sortuj po dacie (newest first) jeśli jest w frontmatter
            if (a.date && b.date) return b.date.localeCompare(a.date)
            return 0
        })
}

// ── Pobierz zlokalizowany link do artykułu ──────────────────
export function getLocalizedArticleLink(enSlug: string, lang: string): string {
    const activeLang = resolveArticleLang(lang);
    const insightsSlug = activeLang === 'pl' ? 'wiedza' :
        activeLang === 'de' ? 'einblicke' :
            activeLang === 'fr' ? 'conseils' :
                activeLang === 'it' ? 'approfondimenti' : 'insights';

    let finalSlug = enSlug;
    if (activeLang !== 'en') {
        const langMap = (articleSlugs as any)[activeLang] || {};
        finalSlug = langMap[enSlug] || enSlug;
    }

    const prefix = activeLang === 'en' ? '' : `/${activeLang}`;
    return `${prefix}/${insightsSlug}/${finalSlug}`;
}
