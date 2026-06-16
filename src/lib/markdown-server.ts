import fs from 'fs';
import path from 'path';
import type { Article } from '../types';
import articleSlugsJson from './article-slugs.json';

export const SUPPORTED_ARTICLE_LANGS = ['en', 'it', 'de', 'fr', 'pl'] as const;
export type ArticleLang = typeof SUPPORTED_ARTICLE_LANGS[number];

const ARTICLES_DIR = path.join(process.cwd(), 'src', 'content', 'articles');
const slugMap = articleSlugsJson as Record<string, Record<string, string>>;

export function resolveArticleLang(lang: string): ArticleLang {
  const short = lang.slice(0, 2).toLowerCase();
  return SUPPORTED_ARTICLE_LANGS.includes(short as ArticleLang) ? (short as ArticleLang) : 'en';
}

interface Frontmatter {
  title?: string;
  excerpt?: string;
  category?: string;
  date?: string;
  readTime?: string;
  image?: string;
  [key: string]: string | undefined;
}

function parseFrontmatter(raw: string): { fm: Frontmatter; body: string } {
  const cleaned = raw.replace(/^﻿[\r\n]*/, '');
  const match = cleaned.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { fm: {}, body: cleaned };
  const fm: Frontmatter = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(': ');
    if (idx === -1) return;
    fm[line.slice(0, idx).trim()] = line.slice(idx + 2).trim().replace(/^["']|["']$/g, '');
  });
  return { fm, body: match[2] };
}

function readMd(filePath: string): string | null {
  try { return fs.readFileSync(filePath, 'utf-8'); } catch { return null; }
}

export function getAllArticleEnSlugs(): string[] {
  try {
    return fs.readdirSync(path.join(ARTICLES_DIR, 'en'))
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace(/\.md$/, ''));
  } catch { return []; }
}

export function getLocalizedSlug(enSlug: string, lang: ArticleLang): string {
  if (lang === 'en') return enSlug;
  return slugMap[lang]?.[enSlug] ?? enSlug;
}

export function getEnSlugFromLocalized(localSlug: string, lang: ArticleLang): string {
  if (lang === 'en') return localSlug;
  const langMap = slugMap[lang] ?? {};
  return Object.entries(langMap).find(([_, v]) => v === localSlug)?.[0] ?? localSlug;
}

export async function loadArticle(slug: string, lang: ArticleLang): Promise<Article | null> {
  const realSlug = getEnSlugFromLocalized(slug, lang);
  const raw =
    readMd(path.join(ARTICLES_DIR, lang, `${realSlug}.md`)) ??
    readMd(path.join(ARTICLES_DIR, 'en', `${realSlug}.md`));
  if (!raw) return null;
  const { fm, body } = parseFrontmatter(raw);
  return {
    slug,
    title: fm.title ?? slug,
    excerpt: fm.excerpt ?? '',
    category: (fm.category as Article['category']) ?? 'Buying',
    date: fm.date ?? '',
    readTime: fm.readTime ?? fm['read_time'] ?? '5 min read',
    image: fm.image ?? 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    content: body.trim(),
  };
}

export async function loadAllArticles(lang: ArticleLang): Promise<Article[]> {
  const dir = path.join(ARTICLES_DIR, lang);
  const fallback = path.join(ARTICLES_DIR, 'en');
  let files: string[] = [];
  try { files = fs.readdirSync(dir).filter(f => f.endsWith('.md')); }
  catch { files = fs.readdirSync(fallback).filter(f => f.endsWith('.md')); }

  const articles: Article[] = [];
  for (const file of files) {
    const enSlug = file.replace(/\.md$/, '');
    const raw = readMd(path.join(dir, file)) ?? readMd(path.join(fallback, file));
    if (!raw) continue;
    const { fm, body } = parseFrontmatter(raw);
    articles.push({
      slug: getLocalizedSlug(enSlug, lang),
      title: fm.title ?? enSlug,
      excerpt: fm.excerpt ?? '',
      category: (fm.category as Article['category']) ?? 'Buying',
      date: fm.date ?? '',
      readTime: fm.readTime ?? fm['read_time'] ?? '5 min read',
      image: fm.image ?? 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
      content: body.trim(),
    });
  }
  return articles.sort((a, b) => (a.date && b.date ? b.date.localeCompare(a.date) : 0));
}

export function extractFAQs(body: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  const section = body.match(/##\s+Frequently Asked Questions([\s\S]*?)(?=\n##\s|\s*$)/)?.[1];
  if (section) {
    const re = /(?:\*\*([^*\n]+)\*\*|###\s+([^\n]+))\n+([\s\S]*?)(?=\n\s*(?:\*\*[^*]|\#\#\#\s)|\s*$)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(section)) !== null && faqs.length < 10) {
      const q = (m[1] || m[2]).trim();
      const a = m[3].trim().replace(/\n+/g, ' ');
      if (q && a) faqs.push({ question: q, answer: a });
    }
  }
  return faqs.slice(0, 10);
}
