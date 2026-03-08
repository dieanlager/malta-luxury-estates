/**
 * translate-v3.mjs - Clean implementation
 */
import fs from 'fs';
import path from 'path';
import https from 'https';

const GEMINI_KEYS = [
    'AIzaSyBvP0jc_gpugX4F1hHf9A77CFz0uSuNVrs',
    'AIzaSyBEl_w2fPlAHDyeIVYGFcjl7OiQ24MDMqs',
];
let keyIndex = 0;
const BASE_DIR = path.join(process.cwd(), 'src/content/articles');

const LANG = {
    pl: { name: 'Polish', readTime: v => v.replace('min read', 'min czytania') },
    de: { name: 'German', readTime: v => v.replace('min read', 'Min. Lesezeit') },
    fr: { name: 'French', readTime: v => v.replace('min read', 'min de lecture') },
};

// ── Gemini API ──────────────────────────────────────────────────
async function gemini(prompt, attempt = 0) {
    const key = GEMINI_KEYS[keyIndex % 2];
    const body = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
    });
    return new Promise((res, rej) => {
        const req = https.request({
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        }, r => {
            let d = '';
            r.on('data', c => d += c);
            r.on('end', () => {
                const j = JSON.parse(d);
                if (j.error) {
                    if ((j.error.code === 429 || j.error.status === 'RESOURCE_EXHAUSTED') && attempt < 4) {
                        keyIndex++;
                        console.log(`      🔑 Rate limit, key ${(keyIndex % 2) + 1}...`);
                        return setTimeout(() => gemini(prompt, attempt + 1).then(res).catch(rej), 5000);
                    }
                    return rej(new Error(`Gemini[${j.error.code}]: ${j.error.message}`));
                }
                const txt = j?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                if (txt) res(txt);
                else rej(new Error('Empty: ' + JSON.stringify(j).slice(0, 100)));
            });
        });
        req.on('error', rej);
        req.write(body);
        req.end();
    });
}

// ── Frontmatter parser (CRLF safe) ────────────────────────────
function parseFM(raw) {
    const c = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const end = c.indexOf('\n---\n', 4);
    if (!c.startsWith('---\n') || end < 0) return { fm: {}, body: c };
    const fmRaw = c.slice(4, end);
    const body = c.slice(end + 5);
    const fm = {};
    fmRaw.split('\n').forEach(l => {
        const i = l.indexOf(': ');
        if (i < 0) return;
        fm[l.slice(0, i).trim()] = l.slice(i + 2).trim().replace(/^"|"$/g, '');
    });
    return { fm, body };
}

// ── Split body ──────────────────────────────────────────────────
function splitBody(text, max = 5000) {
    const chunks = [], paras = text.split(/\n\n+/);
    let cur = '';
    for (const p of paras) {
        if (cur && (cur + '\n\n' + p).length > max) { chunks.push(cur.trim()); cur = p; }
        else cur = cur ? cur + '\n\n' + p : p;
    }
    if (cur.trim()) chunks.push(cur.trim());
    return chunks;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Translate body chunk ────────────────────────────────────────
async function txChunk(text, langName) {
    const r = await gemini(`Translate from English to ${langName}. RULES: keep ALL Markdown syntax (##, **, *, |, >, -, \`\`\`), keep proper nouns (Malta, Gozo, Valletta, Sliema, MPRP, AIP, SDA etc), keep URLs and € unchanged. Return ONLY translated markdown, no explanation.\n\n${text}`);
    return r;
}

// ── Generate localized slug ────────────────────────────────────
async function txSlug(title, fallback, langName) {
    try {
        const r = await gemini(`Create a URL slug in ${langName} for: "${title}". Rules: lowercase ASCII (a-z,0-9,-) only, remove all diacritics (ą→a,ę→e,ó→o,ś→s,ł→l,ź→z,ż→z,ć→c,ń→n,ä→a,ö→o,ü→u,é→e,è→e,à→a,ç→c etc), 4-7 words, keep Malta/MPRP/SDA lowercase. Return ONLY the slug.`);
        const s = r.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        return s.length > 4 ? s : fallback;
    } catch (e) { return fallback; }
}

// ── Translate frontmatter ──────────────────────────────────────
async function txFM(fm, lang, langName) {
    try {
        const r = await gemini(`Translate to ${langName}. Return ONLY valid JSON (no markdown). Keep Malta,Gozo,€,MPRP,SDA unchanged:\n{"title":${JSON.stringify(fm.title || '')},"excerpt":${JSON.stringify((fm.excerpt || '').slice(0, 250))},"metaDescription":${JSON.stringify((fm.metaDescription || '').slice(0, 250))}}`);
        const clean = r.replace(/```json?\n?|```\n?/g, '').trim();
        const m = clean.match(/\{[\s\S]*\}/);
        if (m) {
            const p = JSON.parse(m[0]);
            return {
                ...fm,
                title: p.title || fm.title,
                excerpt: p.excerpt || fm.excerpt,
                metaDescription: p.metaDescription || fm.metaDescription,
                readTime: LANG[lang].readTime(fm.readTime || '10 min read')
            };
        }
    } catch (e) { console.log('    ⚠ FM err:', e.message.slice(0, 60)); }
    return { ...fm, readTime: LANG[lang].readTime(fm.readTime || '10 min read') };
}

// ── Main translate a file ──────────────────────────────────────
async function translateFile(enFile, lang) {
    const langName = LANG[lang].name;
    const targetPath = path.join(BASE_DIR, lang, path.basename(enFile));
    const src = fs.readFileSync(enFile, 'utf8');
    const { fm, body } = parseFM(src);
    const enSlug = fm.slug || path.basename(enFile, '.md');

    console.log(`\n▶ ${path.basename(enFile)} → ${lang.toUpperCase()}`);

    // Frontmatter
    process.stdout.write('  [1] FM... ');
    const tFm = await txFM(fm, lang, langName);
    console.log(`✓  title: "${(tFm.title || '').slice(0, 50)}"`);
    await sleep(600);

    // Slug
    process.stdout.write('  [2] Slug... ');
    const localSlug = await txSlug(tFm.title, enSlug, langName);
    console.log(`✓  ${localSlug}`);
    await sleep(400);

    // Body
    const bodyParts = splitBody(body);
    console.log(`  [3] Body (${bodyParts.length} parts):`);
    const txParts = [];
    for (let i = 0; i < bodyParts.length; i++) {
        process.stdout.write(`      [${i + 1}/${bodyParts.length}] `);
        try {
            const t = await txChunk(bodyParts[i], langName);
            txParts.push(t);
            console.log(`✓ (${t.length}ch)`);
        } catch (e) {
            console.log(`✗ (${e.message.slice(0, 50)})`);
            txParts.push(bodyParts[i]);
        }
        await sleep(1000);
    }

    const txBody = txParts.join('\n\n');
    const esc = v => (v || '').replace(/"/g, '\\"');

    const out = `---
title: "${esc(tFm.title)}"
category: "${fm.category || 'General'}"
excerpt: "${esc(tFm.excerpt)}"
metaDescription: "${esc(tFm.metaDescription)}"
image: "${fm.image || ''}"
date: "${fm.date || 'March 2026'}"
readTime: "${tFm.readTime}"
author: "${fm.author || 'Malta Luxury Real Estate'}"
slug: "${enSlug}"
localizedSlug: "${localSlug}"
lang: ${lang}
---

${txBody}
`;

    fs.writeFileSync(targetPath, out, 'utf8');
    console.log(`✅ Saved → ${path.basename(targetPath)}`);
    return localSlug;
}

// ── Check if translated ────────────────────────────────────────
function isTranslated(enFile, lang) {
    const tp = path.join(BASE_DIR, lang, path.basename(enFile));
    if (!fs.existsSync(tp)) return false;
    const { body } = parseFM(fs.readFileSync(tp, 'utf8'));
    if (lang === 'pl') return /[ąćęłńóśźż]/i.test(body.slice(0, 1000));
    if (lang === 'de') return /[äöüÄÖÜß]/.test(body.slice(0, 1000));
    if (lang === 'fr') return /[àâçèéêëîïôùûü]/i.test(body.slice(0, 1000));
    return true;
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
    fs.writeFileSync(path.join(process.cwd(), 'src/lib/article-slugs.json'), JSON.stringify(map, null, 2), 'utf8');
    const n = Object.values(map).reduce((s, m) => s + Object.keys(m).length, 0);
    console.log(`\n📄 Slug map: ${n} entries → src/lib/article-slugs.json`);
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);
    const lang = args[0];
    const force = args.includes('--all');
    const single = args.find(a => a.endsWith('.md'));

    if (!lang || !LANG[lang]) { console.error('Usage: node translate-v3.mjs [pl|de|fr] [file.md] [--all]'); process.exit(1); }

    const enDir = path.join(BASE_DIR, 'en');
    let files = fs.readdirSync(enDir).filter(f => f.endsWith('.md'));
    if (single) files = files.filter(f => f === single || f.includes(single.replace('.md', '')));

    console.log(`\n🌍 EN→${lang.toUpperCase()} | ${files.length} files\n`);
    let ok = 0, skip = 0, fail = 0;

    for (const f of files) {
        const enPath = path.join(enDir, f);
        if (!force && isTranslated(enPath, lang)) {
            // Check if localizedSlug exists, if not add it
            const tp = path.join(BASE_DIR, lang, f);
            const { fm } = parseFM(fs.readFileSync(tp, 'utf8'));
            if (!fm.localizedSlug) {
                const existing = fs.readFileSync(tp, 'utf8');
                process.stdout.write(`  ✓ Adding slug: ${f}... `);
                const ls = await txSlug(fm.title || '', fm.slug || f.replace('.md', ''), LANG[lang].name);
                const updated = existing.replace('lang: ' + lang, `localizedSlug: "${ls}"\nlang: ${lang}`);
                fs.writeFileSync(tp, updated, 'utf8');
                console.log(ls);
                await sleep(500);
            } else {
                console.log(`  ✓ Skip: ${f} [${fm.localizedSlug}]`);
            }
            skip++; continue;
        }
        try {
            await translateFile(enPath, lang);
            ok++;
        } catch (e) {
            console.error(`  ✗ FAIL ${f}: ${e.message}`);
            fail++;
        }
        await sleep(1500);
    }

    console.log(`\n📊 Done: ${ok} | Skipped: ${skip} | Failed: ${fail}`);
    saveSlugMap();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
