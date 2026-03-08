/**
 * translate-deepl.mjs
 * Tłumaczy artykuły EN → {pl, de, fr} używając DeepL PRO API
 * + generuje zlokalizowane slugi URL przez Gemini
 * 
 * Usage:
 *   node scripts/translate-deepl.mjs pl            # all PL
 *   node scripts/translate-deepl.mjs de            # all DE
 *   node scripts/translate-deepl.mjs fr            # all FR
 *   node scripts/translate-deepl.mjs pl file.md    # single file
 *   node scripts/translate-deepl.mjs pl --all      # force retranslate
 *   node scripts/translate-deepl.mjs --slugmap     # only rebuild slug map
 */
import fs from 'fs';
import path from 'path';
import https from 'https';

const DEEPL_KEY = 'd8015cad-b25b-4c91-9331-07d8fc8f9fb7';
const GEMINI_KEYS = [
    'AIzaSyBvP0jc_gpugX4F1hHf9A77CFz0uSuNVrs',
    'AIzaSyBEl_w2fPlAHDyeIVYGFcjl7OiQ24MDMqs',
];
let geminiKeyIdx = 0;

const BASE_DIR = path.join(process.cwd(), 'src/content/articles');

const LANG = {
    pl: { name: 'Polish', deeplCode: 'PL', readTime: v => v.replace('min read', 'min czytania') },
    de: { name: 'German', deeplCode: 'DE', readTime: v => v.replace('min read', 'Min. Lesezeit') },
    fr: { name: 'French', deeplCode: 'FR', readTime: v => v.replace('min read', 'min de lecture') },
    it: { name: 'Italian', deeplCode: 'IT', readTime: v => v.replace('min read', 'min di lettura') },
};

// ── DeepL PRO translate ─────────────────────────────────────────
function deepl(text, targetLang) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams({
            text,
            source_lang: 'EN',
            target_lang: targetLang,
            preserve_formatting: '1',
            tag_handling: 'off',
        });
        const body = params.toString();
        const req = https.request({
            hostname: 'api.deepl.com',
            path: '/v2/translate',
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(body),
            },
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try {
                    const j = JSON.parse(d);
                    if (j.message) return reject(new Error(`DeepL: ${j.message}`));
                    const txt = j.translations?.[0]?.text;
                    if (txt) {
                        // console.log('DEBUG DeepL Result:', txt.slice(0, 100));
                        resolve(txt);
                    } else {
                        reject(new Error('DeepL empty: ' + d.slice(0, 100)));
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

// ── Simple Slugifier ───────────────────────────────────────────
function slugify(text) {
    return text
        .toString()
        .normalize('NFD')                   // split accented characters into components
        .replace(/[\u0300-\u036f]/g, '')    // remove accent components
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, '')       // remove all non-alphanumeric except spaces/hyphens
        .replace(/\s+/g, '-')               // replace spaces with hyphens
        .replace(/-+/g, '-');               // collapse multiple hyphens
}

// ── Generate localized slug via DeepL ──────────────────────────
async function makeSlug(title, enSlug, targetLang) {
    try {
        // We translate the title and then slugify it
        const translatedTitle = await deepl(title, targetLang);
        let s = slugify(translatedTitle);

        // Optimization: if it's too long, trim to 7 words
        const words = s.split('-');
        if (words.length > 7) s = words.slice(0, 7).join('-');

        return s.length > 4 ? s : enSlug;
    } catch (e) {
        console.log(`    [slug err: ${e.message.slice(0, 40)}]`);
        return enSlug;
    }
}

// ── Parse frontmatter (CRLF-safe) ──────────────────────────────
function parseFM(raw) {
    const c = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (!c.startsWith('---\n')) return { fm: {}, body: c };
    const end = c.indexOf('\n---\n', 4);
    if (end < 0) return { fm: {}, body: c };
    const fm = {};
    c.slice(4, end).split('\n').forEach(line => {
        const i = line.indexOf(': ');
        if (i < 0) return;
        fm[line.slice(0, i).trim()] = line.slice(i + 2).trim().replace(/^"|"$/g, '');
    });
    return { fm, body: c.slice(end + 5) };
}

// ── Split body into DeepL-safe chunks (<= 130KB each) ─────────
function splitBody(text, maxChars = 10000) {
    const chunks = [], paras = text.split(/\n\n+/);
    let cur = '';
    for (const p of paras) {
        if (cur && (cur + '\n\n' + p).length > maxChars) {
            chunks.push(cur.trim());
            cur = p;
        } else {
            cur = cur ? cur + '\n\n' + p : p;
        }
    }
    if (cur.trim()) chunks.push(cur.trim());
    return chunks;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Check if already translated ─────────────────────────────────
function isTranslated(targetPath, lang) {
    if (!fs.existsSync(targetPath)) return false;
    const { body } = parseFM(fs.readFileSync(targetPath, 'utf8'));
    const s = body.slice(0, 1000);
    if (lang === 'pl') return /[ąćęłńóśźż]/i.test(s);
    if (lang === 'de') return /[äöüÄÖÜß]/.test(s);
    if (lang === 'fr') return /[àâçèéêëîïôùûü]/i.test(s);
    if (lang === 'it') return /[àèéìòù]/i.test(s);
    return true;
}

// ── Translate one file ──────────────────────────────────────────
async function translateFile(enPath, lang, forceAll) {
    const cfg = LANG[lang];
    const targetPath = path.join(BASE_DIR, lang, path.basename(enPath));
    const src = fs.readFileSync(enPath, 'utf8');
    const { fm, body } = parseFM(src);
    const enSlug = fm.slug || path.basename(enPath, '.md');

    // Skip if already done
    if (!forceAll && isTranslated(targetPath, lang)) {
        // Ensure localizedSlug exists
        const { fm: ef } = parseFM(fs.readFileSync(targetPath, 'utf8'));
        if (!ef.localizedSlug) {
            process.stdout.write(`  + slug: ${path.basename(enPath)}... `);
            const ls = await makeSlug(ef.title || fm.title, enSlug, cfg.deeplCode);
            let existing = fs.readFileSync(targetPath, 'utf8').replace(/\r\n/g, '\n');
            existing = existing.replace(`lang: ${lang}\n`, `localizedSlug: "${ls}"\nlang: ${lang}\n`);
            fs.writeFileSync(targetPath, existing, 'utf8');
            console.log(ls);
            await sleep(100);
        } else {
            console.log(`  ✓ ${path.basename(enPath)} [${ef.localizedSlug}]`);
        }
        return { ok: false };
    }

    console.log(`\n  ▶ ${path.basename(enPath)} → ${lang.toUpperCase()}`);

    // 1. Translate title, excerpt, metaDescription via DeepL
    process.stdout.write('    [1/3] FM (title/excerpt/meta)... ');
    let tTitle = fm.title || '', tExcerpt = fm.excerpt || '', tMeta = fm.metaDescription || '';
    try {
        tTitle = await deepl(fm.title || '', cfg.deeplCode);
        tExcerpt = fm.excerpt ? await deepl(fm.excerpt, cfg.deeplCode) : '';
        tMeta = fm.metaDescription ? await deepl(fm.metaDescription, cfg.deeplCode) : '';
        console.log(`✓`);
    } catch (e) {
        console.log(`✗ (${e.message.slice(0, 50)})`);
    }
    await sleep(200);

    // 2. Generate localized slug
    process.stdout.write('    [2/3] Slug... ');
    const localSlug = await makeSlug(tTitle, enSlug, cfg.deeplCode);
    console.log(`✓ ${localSlug}`);
    await sleep(200);

    // 3. Translate body via DeepL
    const parts = splitBody(body);
    console.log(`    [3/3] Body (${parts.length} chunk${parts.length > 1 ? 's' : ''}):`);
    const txParts = [];
    for (let i = 0; i < parts.length; i++) {
        process.stdout.write(`      [${i + 1}/${parts.length}] `);
        try {
            const t = await deepl(parts[i], cfg.deeplCode);
            txParts.push(t);
            console.log(`✓ ${t.length}ch`);
        } catch (e) {
            console.log(`✗ kept original (${e.message.slice(0, 40)})`);
            txParts.push(parts[i]);
        }
        await sleep(100);
    }

    const txBody = txParts.join('\n\n');
    const esc = v => (v || '').replace(/"/g, '\\"');

    const out = `---
title: "${esc(tTitle)}"
category: "${fm.category || 'General'}"
excerpt: "${esc(tExcerpt)}"
metaDescription: "${esc(tMeta)}"
image: "${fm.image || ''}"
date: "${fm.date || 'March 2026'}"
readTime: "${cfg.readTime(fm.readTime || '10 min read')}"
author: "${fm.author || 'Malta Luxury Real Estate'}"
slug: "${enSlug}"
localizedSlug: "${localSlug}"
lang: ${lang}
---

${txBody}
`;

    fs.writeFileSync(targetPath, out, 'utf8');
    console.log(`  ✅ Saved: ${path.basename(targetPath)}`);
    return { ok: true, localSlug };
}

// ── Rebuild slug map ────────────────────────────────────────────
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
    const out = path.join(process.cwd(), 'src/lib/article-slugs.json');
    fs.writeFileSync(out, JSON.stringify(map, null, 2), 'utf8');
    const total = Object.values(map).reduce((s, m) => s + Object.keys(m).length, 0);
    console.log(`\n📄 Slug map: ${total} entries → src/lib/article-slugs.json`);
    return map;
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--slugmap')) { saveSlugMap(); return; }

    const lang = args[0];
    const forceAll = args.includes('--all');
    const single = args.find(a => a.endsWith('.md'));

    if (!lang || !LANG[lang]) {
        console.error('Usage: node translate-deepl.mjs [pl|de|fr] [file.md] [--all]');
        process.exit(1);
    }

    const enDir = path.join(BASE_DIR, 'en');
    let files = fs.readdirSync(enDir).filter(f => f.endsWith('.md'));
    if (single) files = files.filter(f => f === single || f.includes(single.replace('.md', '')));

    console.log(`\n🌍 EN → ${lang.toUpperCase()} | ${files.length} files | DeepL PRO\n`);

    let ok = 0, skip = 0, fail = 0;
    for (const f of files) {
        try {
            const r = await translateFile(path.join(enDir, f), lang, forceAll);
            r.ok ? ok++ : skip++;
        } catch (e) {
            console.error(`  ✗ FAIL ${f}: ${e.message}`);
            fail++;
        }
        await sleep(200);
    }

    console.log(`\n📊 Translated: ${ok} | Skipped: ${skip} | Failed: ${fail}`);
    saveSlugMap();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
