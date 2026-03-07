// scripts/translate-articles.ts
// Setup: npm install deepl-node @anthropic-ai/sdk tsx
// Run: npx --env-file=.env.local tsx scripts/translate-articles.ts --lang=it

import * as deepl from 'deepl-node';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config({ path: '.env.local' });

// ── Config ────────────────────────────────────────────────────
// These will be loaded via --env-file=.env.local
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GOOGLE_API_KEYS = (process.env.GOOGLE_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);

if (!DEEPL_API_KEY) {
    console.warn('⚠️ Warning: DEEPL_API_KEY is missing. DeepL will be skipped.');
}
if (!ANTHROPIC_API_KEY) {
    console.warn('⚠️ Warning: ANTHROPIC_API_KEY is missing. Claude review will be skipped.');
}
if (GOOGLE_API_KEYS.length === 0) {
    console.warn('⚠️ Warning: GOOGLE_API_KEY is missing. Gemini will be skipped.');
}

const DEEPL = DEEPL_API_KEY ? new deepl.Translator(DEEPL_API_KEY) : null;
const CLAUDE = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

let currentGeminiKeyIndex = 0;
function getGeminiInstance() {
    if (GOOGLE_API_KEYS.length === 0) return null;
    return new GoogleGenerativeAI(GOOGLE_API_KEYS[currentGeminiKeyIndex]);
}

function rotateGeminiKey() {
    if (GOOGLE_API_KEYS.length > 1) {
        currentGeminiKeyIndex = (currentGeminiKeyIndex + 1) % GOOGLE_API_KEYS.length;
        console.log(`\n🔄 Rotating Gemini API Key to #${currentGeminiKeyIndex + 1}...`);
        return true;
    }
    return false;
}

const ARTICLES_SRC = path.join(process.cwd(), 'src/content/articles/en');
const ARTICLES_OUT = path.join(process.cwd(), 'src/content/articles');

const LANG_CONFIG = {
    it: {
        name: 'Italian',
        deepl: 'it' as deepl.TargetLanguageCode,
        formality: 'more' as const, // 'prefer_more' in older SDK versions, 'more' in newer
        claudeTone: 'lusso immobiliare maltese – professionale, caldo, aspirazionale',
    },
    de: {
        name: 'German',
        deepl: 'de' as deepl.TargetLanguageCode,
        formality: 'more' as const,
        claudeTone: 'maltesische Luxusimmobilien – seriös, präzise, vertrauenswürdig',
    },
    fr: {
        name: 'French',
        deepl: 'fr' as deepl.TargetLanguageCode,
        formality: 'more' as const,
        claudeTone: 'immobilier de luxe à Malte – élégant, informatif, aspirationnel',
    },
    pl: {
        name: 'Polish',
        deepl: 'pl' as deepl.TargetLanguageCode,
        formality: 'more' as const, // Polish doesn't support formality in DeepL yet but we keep it for structure
        claudeTone: 'maltański rynek nieruchomości premium – profesjonalny, rzeczowy, inspirujący',
    },
} as const;

type Lang = keyof typeof LANG_CONFIG;

// ── Frontmatter parser ────────────────────────────────────────
function parseFrontmatter(content: string) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { frontmatter: {} as Record<string, string>, body: content };

    const raw = match[1];
    const body = match[2];
    const frontmatter: Record<string, string> = {};

    raw.split('\n').forEach(line => {
        const index = line.indexOf(':');
        if (index > -1) {
            const key = line.slice(0, index).trim();
            const val = line.slice(index + 1).trim().replace(/^["']|["']$/g, '');
            frontmatter[key] = val;
        }
    });

    return { frontmatter, body };
}

function buildFrontmatter(fm: Record<string, string>): string {
    return Object.entries(fm)
        .map(([k, v]) => `${k}: "${v.replace(/"/g, "'")}"`)
        .join('\n');
}

// ── DeepL – tłumaczy Markdown zachowując formatting ──────────
async function translateMarkdown(text: string, lang: Lang): Promise<string> {
    if (!DEEPL) return text;
    const config = LANG_CONFIG[lang];

    const result = await DEEPL.translateText(
        text,
        null, // autodetection for source
        config.deepl,
        {
            tagHandling: 'xml', // Better for Markdown than html sometimes, but keep consistent
            formality: (lang === 'pl') ? undefined : 'more',
            ignoreTags: ['code', 'pre'],
        }
    );

    return result.text;
}

// ── Gemini – Translation fallback ─────────────────────────────
async function translateWithGemini(text: string, lang: Lang): Promise<string> {
    const config = LANG_CONFIG[lang];
    const prompt = `Translate this Markdown text into ${config.name}.
Keep all Markdown formatting (##, **, [], etc.) exactly as-is.
Keep property terms (AIP, MPRP, UCA, PPR) and place names (Sliema, Valletta, Gozo) in English if appropriate for luxury context.
Return ONLY the translated text.

Text to translate:
${text}`;

    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
        const gemini = getGeminiInstance();
        if (!gemini) return text;
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (err: any) {
            attempts++;
            if (err.message.includes('429')) {
                if (rotateGeminiKey()) {
                    console.log(`\n  ⚠️ Gemini rate limit (429). Rotated key. Retrying immediately (Attempt ${attempts}/${maxAttempts})...`);
                    continue;
                } else {
                    console.log(`\n  ⚠️ Gemini rate limit (429). Only one key available. Retrying in 60s (Attempt ${attempts}/${maxAttempts})...`);
                    await new Promise(r => setTimeout(r, 60000));
                    continue;
                }
            }
            console.error('  ✗ Gemini Translation Error:', err.message);
            return text;
        }
    }
    return text;
}

// ── Claude – review tonu i naturalności ──────────────────────
async function claudeReview(
    translated: string,
    lang: Lang,
    articleTitle: string
): Promise<string> {
    if (!CLAUDE) return translated;
    const config = LANG_CONFIG[lang];

    const prompt = `You are a professional ${config.name} editor specialising in luxury real estate content.

Article: "${articleTitle}"
Target tone: ${config.claudeTone}

Review this machine-translated ${config.name} real estate article.
Your tasks:
1. Fix any phrases that sound unnatural or machine-translated
2. Ensure property terms are correct
3. Keep Malta-specific terms in English: Sliema, Valletta, Gozo, AIP, MPRP, UCA, PPR
4. Keep all Markdown formatting (##, **, *, [], etc.) exactly as-is
5. Keep all numbers, prices, percentages unchanged
6. Return ONLY the corrected article text – no explanation

Article to review:
${translated.slice(0, 10000)}`;

    const response = await CLAUDE.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
    });

    const reviewedText = response.content[0].type === 'text'
        ? response.content[0].text
        : translated;

    return reviewedText;
}

// ── Tłumaczenie jednego artykułu ─────────────────────────────
async function translateArticle(
    filename: string,
    lang: Lang,
    force = false
): Promise<'translated' | 'skipped' | 'error'> {

    const outDir = path.join(ARTICLES_OUT, lang);
    const outFile = path.join(outDir, filename);

    // Pomiń jeśli istnieje (chyba że --force)
    if (!force) {
        try {
            await fs.access(outFile);
            return 'skipped';
        } catch { /* nie istnieje – kontynuuj */ }
    }

    try {
        const srcFile = path.join(ARTICLES_SRC, filename);
        const raw = await fs.readFile(srcFile, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(raw);

        // 1. Tłumacz frontmatter (title, description, excerpt)
        const translatableKeys = ['title', 'description', 'excerpt', 'metaDescription'];
        const translatedFM = { ...frontmatter };

        if (DEEPL) {
            try {
                for (const key of translatableKeys) {
                    if (frontmatter[key]) {
                        const result = await DEEPL.translateText(
                            frontmatter[key],
                            null,
                            LANG_CONFIG[lang].deepl,
                            { formality: (lang === 'pl') ? undefined : 'more' }
                        );
                        translatedFM[key] = result.text;
                    }
                }
            } catch (err: any) {
                if (err.message.includes('Quota exceeded') || err.message.includes('limit reached')) {
                    console.log(`\n  ⚠️ DeepL limit reached. Falling back to Gemini for frontmatter...`);
                    for (const key of translatableKeys) {
                        if (frontmatter[key]) {
                            translatedFM[key] = await translateWithGemini(frontmatter[key], lang);
                        }
                    }
                } else {
                    throw err;
                }
            }
        } else if (GOOGLE_API_KEYS.length > 0) {
            for (const key of translatableKeys) {
                if (frontmatter[key]) {
                    translatedFM[key] = await translateWithGemini(frontmatter[key], lang);
                }
            }
        }

        // 2. Body translation (DeepL with Gemini fallback)
        let translatedBody = body;
        if (DEEPL) {
            try {
                translatedBody = await translateMarkdown(body, lang);
            } catch (err: any) {
                if (err.message.includes('Quota exceeded') || err.message.includes('limit reached')) {
                    console.log(`\n  ⚠️ DeepL limit reached. Falling back to Gemini for body...`);
                    translatedBody = await translateWithGemini(body, lang);
                } else {
                    throw err;
                }
            }
        } else if (GOOGLE_API_KEYS.length > 0) {
            translatedBody = await translateWithGemini(body, lang);
        }

        // 3. Claude review (tone + quality check)
        const finalBody = await claudeReview(translatedBody, lang, frontmatter.title || filename);

        // 4. Złóż z powrotem
        const output = `---\n${buildFrontmatter(translatedFM)}\nlang: ${lang}\ntranslatedFrom: en\ntranslatedAt: ${new Date().toISOString().split('T')[0]}\n---\n\n${finalBody}`;

        // 5. Zapisz
        await fs.mkdir(outDir, { recursive: true });
        await fs.writeFile(outFile, output, 'utf-8');

        return 'translated';
    } catch (err: any) {
        console.error(`  ✗ Error: ${filename}`, err.stack || err.message || err);
        return 'error';
    }
}

// ── Sprawdź limit DeepL przed startem ────────────────────────
async function checkDeeplUsage(langs: Lang[]): Promise<void> {
    if (!DEEPL) return;
    const usage = await DEEPL.getUsage();
    if (!usage.character) return;

    const used = usage.character.count;
    const limit = usage.character.limit;
    const remaining = limit - used;
    const pct = ((used / limit) * 100).toFixed(1);

    console.log(`\n📊 DeepL Usage: ${used.toLocaleString()} / ${limit.toLocaleString()} (${pct}% used)`);
    console.log(`   Remaining: ${remaining.toLocaleString()} characters`);

    const articlesDir = await fs.readdir(ARTICLES_SRC);
    const mdFiles = articlesDir.filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    const estimatedUse = mdFiles.length * 5000;

    console.log(`   Estimated need: ~${estimatedUse.toLocaleString()} chars per language`);
    console.log(`   Languages to translate: ${langs.length}`);
    console.log(`   Total estimated: ~${(estimatedUse * langs.length).toLocaleString()} chars`);

    if (remaining < estimatedUse * langs.length) {
        console.log(`\n⚠️  WARNING: Might not have enough chars for all languages`);
    }
}

// ── Podsumowanie per artykuł ──────────────────────────────────
function printProgress(
    current: number,
    total: number,
    filename: string,
    status: string
) {
    const bar = '█'.repeat(Math.floor((current / total) * 20));
    const empty = '░'.repeat(20 - Math.floor((current / total) * 20));
    const pct = Math.floor((current / total) * 100);
    process.stdout.write(
        `\r  [${bar}${empty}] ${pct}% | ${current}/${total} | ${status.padEnd(12)} | ${filename.slice(0, 35)}`
    );
}

// ── Main ──────────────────────────────────────────────────────
const args = process.argv.slice(2);
const langArg = args.find(a => a.startsWith('--lang='))?.split('=')[1] ?? 'all';
const force = args.includes('--force');
const checkOnly = args.includes('--check');

const langs: Lang[] = langArg === 'all'
    ? ['it', 'de', 'fr', 'pl']
    : [langArg as Lang];

async function run() {
    console.log('\n🌍 Malta Luxury Estates — Article Translation Pipeline');
    console.log('   DeepL Pro → Claude Review → Markdown output\n');

    await checkDeeplUsage(langs);
    if (checkOnly) return;

    const articles = (await fs.readdir(ARTICLES_SRC))
        .filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

    console.log(`\n   Articles found: ${articles.length}`);
    console.log(`   Total translations: ${articles.length * langs.length}\n`);

    const results: Record<string, { translated: number; skipped: number; errors: number }> = {};

    for (const lang of langs) {
        console.log(`\n▶ ${LANG_CONFIG[lang].name.toUpperCase()} (${lang})`);
        results[lang] = { translated: 0, skipped: 0, errors: 0 };

        for (let i = 0; i < articles.length; i++) {
            const file = articles[i];
            const status = await translateArticle(file, lang, force);

            results[lang][status === 'translated' ? 'translated' : status === 'skipped' ? 'skipped' : 'errors']++;
            printProgress(i + 1, articles.length, file, status);

            if (status === 'translated') {
                // Sleep to avoid rate limits
                await new Promise(r => setTimeout(r, 3000)); // 3 seconds for Gemini/DeepL cooldown
            }
        }

        console.log(`\n  ✅ ${lang.toUpperCase()}: ${results[lang].translated} translated, ${results[lang].skipped} skipped, ${results[lang].errors} errors`);
    }

    console.log('\n═══════════════════════════════════════');
    console.log('  TRANSLATION COMPLETE');
    console.log('═══════════════════════════════════════');
}

run().catch(console.error);
