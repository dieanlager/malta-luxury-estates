
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import * as deepl from 'deepl-node';
import dotenv from 'dotenv';

dotenv.config();

const DEEPL_API_KEY = 'd8015cad-b25b-4c91-9331-07d8fc8f9fb7'; // Pro key
const translator = new deepl.Translator(DEEPL_API_KEY);

const lang = 'it';
const deeplCode = 'it';

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
        .split('-')
        .slice(0, 7)
        .join('-');
}

async function fixSlugs() {
    const slugMapPath = 'src/lib/article-slugs.json';
    const slugMap = JSON.parse(fs.readFileSync(slugMapPath, 'utf8'));
    const itSlugs = slugMap[lang];

    const sourceDir = 'src/content/articles/en';
    const targetDir = `src/content/articles/${lang}`;

    const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
        const enSlug = file.replace('.md', '');
        const currentItSlug = itSlugs[enSlug];

        if (currentItSlug === enSlug) {
            console.log(`Fixing slug for: ${enSlug}`);
            const targetPath = path.join(targetDir, file);
            if (!fs.existsSync(targetPath)) continue;

            const content = fs.readFileSync(targetPath, 'utf8');
            const { data: fm, content: body } = matter(content);

            try {
                const res = await translator.translateText(fm.title, null, deeplCode);
                const translatedTitle = res.text;
                const newSlug = slugify(translatedTitle);

                if (newSlug && newSlug.length > 3) {
                    console.log(`  New slug: ${newSlug}`);
                    fm.slug = newSlug;
                    itSlugs[enSlug] = newSlug;

                    const newContent = matter.stringify(body, fm);
                    fs.writeFileSync(targetPath, newContent);
                }
            } catch (e) {
                console.error(`  Error fixing slug for ${enSlug}:`, e);
            }
        }
    }

    fs.writeFileSync(slugMapPath, JSON.stringify(slugMap, null, 2));
    console.log('Done fixing Italian slugs.');
}

fixSlugs();
