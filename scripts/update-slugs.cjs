const fs = require('fs');
const path = require('path');

const mappings = {
    'buying-property-in-malta-as-a-foreigner-2026.md': 'buying-property-in-malta-as-a-foreigner-2026',
    'special-designated-areas-malta-guide.md': 'special-designated-areas-malta-guide',
    'rental-yields-malta-2026.md': 'rental-yields-malta-2026',
    'property-taxes-malta-2026.md': 'property-taxes-malta-2026'
};

const langs = ['en', 'pl', 'it', 'de', 'fr'];
const baseDir = 'src/content/articles';

langs.forEach(lang => {
    Object.keys(mappings).forEach(filename => {
        const filePath = path.join(baseDir, lang, filename);
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            const newSlug = mappings[filename];
            // Replace slug line
            content = content.replace(/^slug: ".*"$/m, `slug: "${newSlug}"`);
            fs.writeFileSync(filePath, content);
            console.log(`Updated slug in ${filePath}`);
        } else {
            console.log(`File not found: ${filePath}`);
        }
    });
});
