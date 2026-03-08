import fs from 'fs';
import path from 'path';

const BASE_DIR = 'src/content/articles';
const SLUGS_FILE = 'src/lib/article-slugs.json';
const LANGS = ['pl', 'de', 'fr', 'it'];

function parseFM(c) {
    const end = c.indexOf('\n---', 4);
    if (end < 0) return {};
    const fm = {};
    c.slice(4, end).split('\n').forEach(line => {
        const i = line.indexOf(': ');
        if (i < 0) return;
        fm[line.slice(0, i).trim()] = line.slice(i + 2).trim().replace(/^"|"$/g, '');
    });
    return fm;
}

const map = JSON.parse(fs.readFileSync(SLUGS_FILE, 'utf8'));

for (const lang of LANGS) {
    const dir = path.join(BASE_DIR, lang);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

    if (!map[lang]) map[lang] = {};

    for (const file of files) {
        const enSlug = file.replace('.md', '');
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        const fm = parseFM(content);

        if (fm.localizedSlug) {
            map[lang][enSlug] = fm.localizedSlug;
        } else {
            // Fallback if not set
            if (!map[lang][enSlug]) {
                map[lang][enSlug] = enSlug;
            }
        }
    }
}

fs.writeFileSync(SLUGS_FILE, JSON.stringify(map, null, 2));
console.log('Updated src/lib/article-slugs.json');
