
import fs from 'fs';
import path from 'path';

const BASE_DIR = 'src/content/articles';
const LANGS = ['pl', 'de', 'fr', 'it'];

function parseFM(c) {
    const end = c.indexOf('\n---', 4);
    if (end < 0) return { fm: {}, body: c };
    const fm = {};
    c.slice(4, end).split('\n').forEach(line => {
        const i = line.indexOf(': ');
        if (i < 0) return;
        fm[line.slice(0, i).trim()] = line.slice(i + 2).trim().replace(/^"|"$/g, '');
    });
    return { fm, body: c.slice(end + 5) };
}

function isActuallyTranslated(body, lang) {
    const s = body.slice(0, 2000);
    if (lang === 'pl') return /[ąćęłńóśźż]/i.test(s);
    if (lang === 'de') return /[äöüÄÖÜß]/.test(s);
    if (lang === 'fr') return /[àâçèéêëîïôùûü]/i.test(s);
    if (lang === 'it') return /[àèéìòù]/i.test(s);
    return false;
}

const report = {};

for (const lang of LANGS) {
    const dir = path.join(BASE_DIR, lang);
    if (!fs.existsSync(dir)) continue;

    report[lang] = { total: 0, translated: 0, english_body: [], missing_slug: [], identical_slug: [] };

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    report[lang].total = files.length;

    for (const file of files) {
        const enSlug = file.replace('.md', '');
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        const { fm, body } = parseFM(content);

        // Body Check
        if (isActuallyTranslated(body, lang)) {
            report[lang].translated++;
        } else {
            report[lang].english_body.push(file);
        }

        // Slug Check
        if (!fm.localizedSlug) {
            report[lang].missing_slug.push(file);
        } else if (fm.localizedSlug === enSlug) {
            report[lang].identical_slug.push(file);
        }
    }
}

console.log(JSON.stringify(report, null, 2));
