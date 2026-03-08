
import fs from 'fs';
const map = JSON.parse(fs.readFileSync('src/lib/article-slugs.json', 'utf8'));
for (const lang in map) {
    console.log(`Checking ${lang}...`);
    for (const enSlug in map[lang]) {
        if (enSlug === map[lang][enSlug]) {
            console.log(`  Identical: ${enSlug}`);
        }
    }
}
