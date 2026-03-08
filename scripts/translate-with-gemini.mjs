/**
 * translate-with-gemini.mjs v2
 * Tłumaczy artykuły EN→ {pl,de,fr} używając Google Gemini API
 * + generuje zlokalizowane slugi URL
 */
import fs from 'fs';
import path from 'path';
import https from 'https';

const GEMINI_KEYS = (process.env.GOOGLE_API_KEYS || process.env.GOOGLE_API_KEY || '').split(',').filter(Boolean);
if (GEMINI_KEYS.length === 0) {
    console.warn('⚠ No Google API keys found in GOOGLE_API_KEYS or GOOGLE_API_KEY env vars.');
}
let keyIndex = 0;

const BASE_DIR = path.join(process.cwd(), 'src/content/articles');

const LANG_CONFIG = {
    pl: { name: 'Polish', readTime: (v) => v.replace('min read', 'min czytania') },
    de: { name: 'German', readTime: (v) => v.replace('min read', 'Min. Lesezeit') },
    fr: { name: 'French', readTime: (v) => v.replace('min read', 'min de lecture') },
    it: { name: 'Italian', readTime: (v) => v.replace('min read', 'min di lettura') },
};

// ── Gemini call with key rotation ──────────────────────────────
async function gemini(prompt, attempt = 0) {
    const key = GEMINI_KEYS[keyIndex % GEMINI_KEYS.length];

    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.15, maxOutputTokens: 8192 }
        });
        const opts = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-flash-lite-latest:generateContent?key=${key}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        };
        const req = https.request(opts, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try {
                    const j = JSON.parse(d);
                    if (j.error) {
                        if ((j.error.code === 429 || j.error.status === 'RESOURCE_EXHAUSTED' || j.error.message?.includes('quota')) && attempt < 10) {
                            keyIndex++;
                            console.log(`    ⚡ Quota/Rate limit. Switching to API key ${(keyIndex % GEMINI_KEYS.length) + 1} (Attempt ${attempt + 1})...`);
                            setTimeout(() => gemini(prompt, attempt + 1).then(resolve).catch(reject), 30000);
                            return;
                        }
                        return reject(new Error(`Gemini: ${j.error.message}`));
                    }
                    const txt = j.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                    if (txt) resolve(txt);
                    else reject(new Error('Empty Gemini response'));
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', (err) => {
            if ((err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET') && attempt < 10) {
                console.log(`    ⚡ Network error (${err.code}). Retrying... (Attempt ${attempt + 1})`);
                setTimeout(() => gemini(prompt, attempt + 1).then(resolve).catch(reject), 5000);
            } else {
                reject(err);
            }
        });
        req.write(body);
        req.end();
    });
}

// ── Parse frontmatter (handles CRLF and LF) ─────────────────────
function parseFM(content) {
    // Normalize line endings first
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const m = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) return { fm: {}, body: normalized };
    const fm = {};
    m[1].split('\n').forEach(line => {
        const ci = line.indexOf(': ');
        if (ci < 0) return;
        fm[line.slice(0, ci).trim()] = line.slice(ci + 2).trim().replace(/^["']|["']$/g, '');
    });
    return { fm, body: m[2] };
}

// ── Check if already translated ───────────────────────────────
function isTranslated(body, lang) {
    const s = body.slice(0, 800);
    if (lang === 'pl') return /[ąćęłńóśźż]/i.test(s);
    if (lang === 'de') return /[äöüÄÖÜß]/.test(s);
    if (lang === 'fr') return /[àâçèéêëîïôùûü]/i.test(s);
    if (lang === 'it') return /[àèéìòù]/i.test(s);
    return false;
}

// ── Split markdown into chunks ────────────────────────────────
function chunks(text, maxChars = 5500) {
    const result = [];
    const paras = text.split(/\n\n+/);
    let cur = '';
    for (const p of paras) {
        if ((cur + '\n\n' + p).length > maxChars && cur) {
            result.push(cur.trim());
            cur = p;
        } else {
            cur = cur ? cur + '\n\n' + p : p;
        }
    }
    if (cur.trim()) result.push(cur.trim());
    return result;
}

// ── Translate one markdown chunk ──────────────────────────────
async function translateChunk(text, langName) {
    const prompt = `You are a professional translator. Translate this Markdown from English to ${langName}.
    IMPORTANT: Every single word (except proper nouns like Malta) MUST be translated into ${langName}.

RULES (CRITICAL):
1. Keep ALL Markdown syntax exactly: #, ##, **text**, *text*, | tables |, > blockquotes, \`code\`, - lists
2. Keep proper nouns in English: Malta, Gozo, Valletta, Sliema, St. Julian's, Mdina, Mellieha, AIP, MPRP, SDA, MRVP, etc.
3. Keep ALL URLs as-is: /properties/sliema, /insights/..., https://...
4. Keep numbers, €, percentages, dates exactly
5. Keep HTML tags and attributes unchanged
6. Return ONLY the translated markdown, zero explanation

MARKDOWN TO TRANSLATE:
${text}`;

    return gemini(prompt);
}

// ── Generate localized slug ────────────────────────────────────
async function makeSlug(title, enSlug, langName) {
    const prompt = `Generate a SEO-friendly URL slug in ${langName} for this article title: "${title}"

Rules:
- All lowercase ASCII letters only (a-z, 0-9, hyphens)
- Remove ALL diacritics/accents (ą→a, ę→e, ó→o, ś→s, ł→l, ż→z, ź→z, ć→c, ń→n, ä→a, ö→o, ü→u, é→e, è→e, à→a, etc.)
- Replace spaces with hyphens
- 4-7 words, concise and descriptive
- Keep: Malta, Gozo, MPRP, SDA, mprp, sda (lowercase)
- Examples:
  * German "Immobilienkauf auf Malta" → "immobilienkauf-auf-malta-2026"
  * Polish "Jak kupić nieruchomość" → "jak-kupic-nieruchomosc"
  * French "Résidez à Malte" → "residez-a-malte"

Return ONLY the slug, no quotes, no explanation.`;

    try {
        const raw = await gemini(prompt);
        const slug = raw.trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        return slug.length > 5 ? slug : enSlug;
    } catch (e) {
        return enSlug;
    }
}

// ── Translate frontmatter via Gemini ──────────────────────────
async function translateFM(fm, lang, langName) {
    const prompt = `You are a professional translator. Translate these article fields from English to ${langName}.
Return ONLY a valid JSON object. Keep Malta, Gozo, MPRP, SDA, €, numbers unchanged.
IMPORTANT: The output values MUST be in ${langName}.

Input:
{
  "title": ${JSON.stringify(fm.title || '')},
  "excerpt": ${JSON.stringify((fm.excerpt || '').slice(0, 300))},
  "metaDescription": ${JSON.stringify((fm.metaDescription || '').slice(0, 300))}
}

Output (valid JSON only, no markdown blocks):`;

    try {
        let raw = await gemini(prompt);
        console.log('DEBUG [FM RAW]:', raw);
        // Strip markdown code blocks if present
        raw = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
        // Extract JSON object
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
            const parsed = JSON.parse(match[0]);
            return {
                ...fm,
                title: parsed.title || fm.title,
                excerpt: parsed.excerpt || fm.excerpt,
                metaDescription: parsed.metaDescription || fm.metaDescription,
                readTime: LANG_CONFIG[lang]?.readTime?.(fm.readTime || '10 min read') || fm.readTime,
            };
        }
    } catch (e) {
        console.log(`    ⚠ FM translate error: ${e.message.slice(0, 50)}, keeping original`);
    }
    return { ...fm, readTime: LANG_CONFIG[lang]?.readTime?.(fm.readTime || '10 min read') || fm.readTime };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Translate one file ─────────────────────────────────────────
async function translateFile(enPath, targetPath, lang, forceAll) {
    const langName = LANG_CONFIG[lang].name;
    const src = fs.readFileSync(enPath, 'utf8');
    const { fm, body } = parseFM(src);
    const enSlug = fm.slug || path.basename(enPath, '.md');

    // Check if already fully translated
    if (!forceAll && fs.existsSync(targetPath)) {
        const existing = fs.readFileSync(targetPath, 'utf8');
        const { body: eb, fm: ef } = parseFM(existing);
        if (isTranslated(eb, lang)) {
            process.stdout.write(`  ✓ `);
            // Update localizedSlug if missing or identical to English
            const isIdentical = ef.localizedSlug === enSlug;
            if ((!ef.localizedSlug && !existing.includes('localizedSlug:')) || isIdentical) {
                process.stdout.write(isIdentical ? `Fixing slug... ` : `Adding slug... `);
                const ls = await makeSlug(ef.title || fm.title, enSlug, langName);
                let updated = existing;
                if (existing.includes('localizedSlug:')) {
                    updated = existing.replace(/localizedSlug: .*\n/, `localizedSlug: "${ls}"\n`);
                } else {
                    updated = existing.replace('lang: ' + lang, `localizedSlug: "${ls}"\nlang: ${lang}`);
                }
                fs.writeFileSync(targetPath, updated, 'utf8');
                console.log(`[${ls}] ${path.basename(targetPath)}`);
            } else {
                console.log(`${path.basename(targetPath)}`);
            }
            return { translated: false, localizedSlug: ef.localizedSlug || enSlug };
        }
    }

    console.log(`\n  ▶ ${path.basename(enPath)} → ${lang.toUpperCase()}`);

    // 1. Frontmatter
    process.stdout.write(`    [FM] `);
    const tFm = await translateFM(fm, lang, langName);
    console.log(`✓ "${tFm.title?.slice(0, 50)}..."`);
    await sleep(500);

    // 2. Slug
    process.stdout.write(`    [SLUG] `);
    const localizedSlug = await makeSlug(tFm.title, enSlug, langName);
    console.log(`✓ ${localizedSlug}`);
    await sleep(300);

    // 3. Body chunks
    const bodyChunks = chunks(body);
    console.log(`    [BODY] ${bodyChunks.length} chunks:`);
    const translated = [];

    for (let i = 0; i < bodyChunks.length; i++) {
        process.stdout.write(`      [${i + 1}/${bodyChunks.length}] `);
        try {
            const t = await translateChunk(bodyChunks[i], langName);
            translated.push(t);
            console.log(`✓ (${t.length} chars)`);
        } catch (e) {
            console.log(`✗ kept original (${e.message.slice(0, 40)})`);
            translated.push(bodyChunks[i]);
        }
        await sleep(5000);
    }

    const translatedBody = translated.join('\n\n');

    // 4. Write file
    const esc = (v) => (v || '').replace(/"/g, '\\"');
    const out = `---
title: "${esc(tFm.title)}"
category: "${fm.category || 'General'}"
excerpt: "${esc(tFm.excerpt)}"
metaDescription: "${esc(tFm.metaDescription)}"
image: "${fm.image || ''}"
date: "${fm.date || 'March 2026'}"
readTime: "${tFm.readTime || '10 min read'}"
author: "${fm.author || 'Malta Luxury Real Estate'}"
slug: "${enSlug}"
localizedSlug: "${localizedSlug}"
lang: ${lang}
---

${translatedBody}
`;

    fs.writeFileSync(targetPath, out, 'utf8');
    console.log(`  ✅ Done: ${path.basename(targetPath)}`);
    return { translated: true, localizedSlug };
}

// ── Save slug map ──────────────────────────────────────────────
function saveSlugMap() {
    const map = {};
    for (const lang of ['pl', 'de', 'fr', 'it']) {
        map[lang] = {};
        const dir = path.join(BASE_DIR, lang);
        if (!fs.existsSync(dir)) continue;
        for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
            const { fm } = parseFM(fs.readFileSync(path.join(dir, f), 'utf8'));
            if (fm.slug && fm.localizedSlug) map[lang][fm.slug] = fm.localizedSlug;
        }
    }
    const outPath = path.join(process.cwd(), 'src/lib/article-slugs.json');
    fs.writeFileSync(outPath, JSON.stringify(map, null, 2), 'utf8');
    const total = Object.values(map).reduce((s, m) => s + Object.keys(m).length, 0);
    console.log(`\n📄 Slug map saved (${total} entries) → src/lib/article-slugs.json`);
    return map;
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);
    const lang = args[0] || 'pl';
    const forceAll = args.includes('--all');
    const singleFile = args.find(a => a.endsWith('.md'));

    if (args.includes('--slugmap')) { saveSlugMap(); return; }
    if (!LANG_CONFIG[lang]) { console.error(`Bad lang: ${lang}`); process.exit(1); }

    const enDir = path.join(BASE_DIR, 'en');
    const targetDir = path.join(BASE_DIR, lang);
    let files = fs.readdirSync(enDir).filter(f => f.endsWith('.md'));
    if (singleFile) files = files.filter(f => f.includes(singleFile.replace('.md', '')));

    console.log(`\n🌍 EN → ${lang.toUpperCase()} | ${files.length} files | Gemini 1.5 Flash\n`);
    let ok = 0, skip = 0, fail = 0;

    for (const f of files) {
        try {
            const r = await translateFile(path.join(enDir, f), path.join(targetDir, f), lang, forceAll);
            r.translated ? ok++ : skip++;
        } catch (e) {
            console.error(`  ✗ FAIL ${f}: ${e.message}`);
            fail++;
        }
        await sleep(5000);
    }

    console.log(`\n📊 Translated: ${ok} | Skipped: ${skip} | Failed: ${fail}`);
    saveSlugMap();
}

main().catch(console.error);
