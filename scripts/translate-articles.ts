// scripts/translate-articles.ts
// Setup: npm install deepl-node @anthropic-ai/sdk tsx
// Run: npx --env-file=.env.local tsx scripts/translate-articles.ts --lang=it

import * as deepl from 'deepl-node';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// ── Config ────────────────────────────────────────────────────
// These will be loaded via --env-file=.env.local
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!DEEPL_API_KEY) {
    console.error('❌ Error: DEEPL_API_KEY is missing in environment.');
}
if (!ANTHROPIC_API_KEY) {
    console.warn('⚠️ Warning: ANTHROPIC_API_KEY is missing. Claude review will be skipped.');
}

const DEEPL = DEEPL_API_KEY ? new deepl.Translator(DEEPL_API_KEY) : null;
const CLAUDE = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

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
        }

        // 2. DeepL na body artykułu
        const deeplBody = await translateMarkdown(body, lang);

        // 3. Claude review (tone + quality check)
        const finalBody = await claudeReview(deeplBody, lang, frontmatter.title || filename);

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
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        console.log(`\n  ✅ ${lang.toUpperCase()}: ${results[lang].translated} translated, ${results[lang].skipped} skipped, ${results[lang].errors} errors`);
    }

    console.log('\n═══════════════════════════════════════');
    console.log('  TRANSLATION COMPLETE');
    console.log('═══════════════════════════════════════');
}

run().catch(console.error);
