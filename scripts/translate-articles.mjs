/**
 * translate-articles.mjs
 * Tłumaczy artykuły z EN na PL (i opcjonalnie FR/DE) używając DeepL API.
 * Używa markdown-safe chunking — DeepL obsługuje HTML, więc zachowujemy Markdown.
 * 
 * Usage: node scripts/translate-articles.mjs [lang] [--all]
 *   lang: pl | fr | de
 *   --all: tłumaczy wszystkie pliki (domyślnie tylko nieprzetłumaczone)
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const DEEPL_API_KEY = process.env.DEEPL_AUTH_KEY;
if (!DEEPL_API_KEY) console.warn('⚠ No DEEPL_AUTH_KEY found in env vars.');
const BASE_DIR = path.join(process.cwd(), 'src/content/articles');

const LANG_MAP = {
    pl: 'PL',
    fr: 'FR',
    de: 'DE',
    it: 'IT',
};

// Frontmatter field translations per language
const FM_TRANSLATIONS = {
    pl: {
        readTime: (val) => val.replace('min read', 'min czytania'),
        date: (val) => val, // keep as-is
        author: (val) => val,
    },
    fr: {
        readTime: (val) => val.replace('min read', 'min de lecture'),
        date: (val) => val,
        author: (val) => val,
    },
    de: {
        readTime: (val) => val.replace('min read', 'Min. Lesezeit'),
        date: (val) => val,
        author: (val) => val,
    },
};

// ── DeepL API call ─────────────────────────────────────────────
function deeplTranslate(text, targetLang) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams({
            auth_key: DEEPL_API_KEY,
            text: text,
            source_lang: 'EN',
            target_lang: targetLang,
            tag_handling: 'off',
            preserve_formatting: '1',
        });

        const body = params.toString();

        const options = {
            hostname: 'api-free.deepl.com',
            path: '/v2/translate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(body),
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.translations && json.translations[0]) {
                        resolve(json.translations[0].text);
                    } else {
                        reject(new Error('DeepL error: ' + data));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// ── Parse frontmatter ──────────────────────────────────────────
function parseFrontmatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) return { fm: {}, body: content, rawFm: '' };

    const rawFm = match[1];
    const body = match[2];
    const fm = {};

    rawFm.split('\n').forEach(line => {
        const colonIdx = line.indexOf(': ');
        if (colonIdx === -1) return;
        const key = line.slice(0, colonIdx).trim();
        const value = line.slice(colonIdx + 2).trim().replace(/^["']|["']$/g, '');
        fm[key] = value;
    });

    return { fm, body, rawFm };
}

// ── Check if content is already translated (contains non-ASCII chars typical of lang) ──
function isTranslated(body, lang) {
    if (lang === 'pl') return /[ąćęłńóśźż]/i.test(body.substring(0, 500));
    if (lang === 'de') return /[äöüÄÖÜ]/i.test(body.substring(0, 500));
    if (lang === 'fr') return /[àâçéèêëîïôùûü]/i.test(body.substring(0, 500));
    if (lang === 'it') return /[àèéìòù]/i.test(body.substring(0, 500));
    return true;
}

// ── Split body into chunks for translation (max 5000 chars) ───
function splitIntoChunks(text, maxSize = 4800) {
    const chunks = [];
    const paragraphs = text.split('\n\n');
    let current = '';

    for (const para of paragraphs) {
        if ((current + '\n\n' + para).length > maxSize && current.length > 0) {
            chunks.push(current.trim());
            current = para;
        } else {
            current = current ? current + '\n\n' + para : para;
        }
    }

    if (current.trim()) chunks.push(current.trim());
    return chunks;
}

// ── Translate a single file ─────────────────────────────────────
async function translateFile(enPath, targetPath, lang, targetLangCode) {
    const content = fs.readFileSync(enPath, 'utf8');
    const { fm, body } = parseFrontmatter(content);

    // Check if already translated
    if (fs.existsSync(targetPath)) {
        const existing = fs.readFileSync(targetPath, 'utf8');
        const { body: existingBody } = parseFrontmatter(existing);
        if (isTranslated(existingBody, lang)) {
            console.log(`  ✓ Already translated: ${path.basename(targetPath)}`);
            return false;
        }
    }

    console.log(`  → Translating: ${path.basename(enPath)} → ${lang}...`);

    // Translate title and excerpt
    let translatedTitle = fm.title || '';
    let translatedExcerpt = fm.excerpt || '';
    let translatedMeta = fm.metaDescription || '';

    try {
        if (translatedTitle) translatedTitle = await deeplTranslate(translatedTitle, targetLangCode);
        await new Promise(r => setTimeout(r, 300)); // rate limit
        if (translatedExcerpt) translatedExcerpt = await deeplTranslate(translatedExcerpt, targetLangCode);
        await new Promise(r => setTimeout(r, 300));
        if (translatedMeta) translatedMeta = await deeplTranslate(translatedMeta, targetLangCode);
        await new Promise(r => setTimeout(r, 300));
    } catch (e) {
        console.error(`  ✗ Error translating frontmatter: ${e.message}`);
        return false;
    }

    // Translate body in chunks
    const chunks = splitIntoChunks(body);
    const translatedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
        try {
            const translated = await deeplTranslate(chunks[i], targetLangCode);
            translatedChunks.push(translated);
            process.stdout.write(`    chunk ${i + 1}/${chunks.length}... `);
            await new Promise(r => setTimeout(r, 400)); // rate limit
        } catch (e) {
            console.error(`\n  ✗ Error translating chunk ${i + 1}: ${e.message}`);
            // On error, keep original chunk
            translatedChunks.push(chunks[i]);
        }
    }
    console.log('done');

    const translatedBody = translatedChunks.join('\n\n');

    // Read existing frontmatter fields (keep non-translatable ones)
    const fmLocalizations = FM_TRANSLATIONS[lang] || {};

    // Build new file
    const newContent = `---
title: "${translatedTitle.replace(/"/g, '\\"')}"
category: "${fm.category || 'General'}"
excerpt: "${translatedExcerpt.replace(/"/g, '\\"')}"
metaDescription: "${translatedMeta.replace(/"/g, '\\"')}"
image: "${fm.image || ''}"
date: "${fm.date || 'March 2026'}"
readTime: "${fmLocalizations.readTime ? fmLocalizations.readTime(fm.readTime || '10 min read') : (fm.readTime || '10 min read')}"
author: "${fm.author || 'Malta Luxury Real Estate'}"
slug: "${fm.slug || path.basename(enPath, '.md')}"
lang: ${lang}
---

${translatedBody}`;

    fs.writeFileSync(targetPath, newContent, 'utf8');
    console.log(`  ✓ Saved: ${path.basename(targetPath)}`);
    return true;
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);
    const targetLang = args[0] || 'pl';
    const forceAll = args.includes('--all');
    const singleFile = args.find(a => a.endsWith('.md'));

    if (!LANG_MAP[targetLang]) {
        console.error(`Unknown language: ${targetLang}. Use: pl, fr, de, it`);
        process.exit(1);
    }

    const targetLangCode = LANG_MAP[targetLang];
    const enDir = path.join(BASE_DIR, 'en');
    const targetDir = path.join(BASE_DIR, targetLang);

    // Get list of EN files
    let enFiles = fs.readdirSync(enDir).filter(f => f.endsWith('.md'));

    if (singleFile) {
        enFiles = enFiles.filter(f => f === singleFile || f.includes(singleFile));
        if (enFiles.length === 0) {
            console.error(`File not found: ${singleFile}`);
            process.exit(1);
        }
    }

    console.log(`\nTranslating ${enFiles.length} file(s) from EN → ${targetLang.toUpperCase()} using DeepL\n`);

    let translated = 0;
    let skipped = 0;

    for (const file of enFiles) {
        const enPath = path.join(enDir, file);
        const targetPath = path.join(targetDir, file);

        const result = await translateFile(enPath, targetPath, targetLang, targetLangCode);
        if (result) translated++;
        else skipped++;

        // Small delay between files
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n✅ Done! Translated: ${translated}, Skipped (already done): ${skipped}`);
}

main().catch(console.error);
