import fs from 'fs';

function parseFM(content) {
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const m = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) { console.log('NO MATCH'); return { fm: {}, body: normalized }; }
    const fm = {};
    m[1].split('\n').forEach(line => {
        const ci = line.indexOf(': ');
        if (ci < 0) return;
        fm[line.slice(0, ci).trim()] = line.slice(ci + 2).trim().replace(/^"|"$/g, '');
    });
    return { fm, body: m[2] };
}

const content = fs.readFileSync('src/content/articles/pl/malta-permanent-residency-mprp-property-guide.md', 'utf8');
const { fm, body } = parseFM(content);
console.log('FM keys:', Object.keys(fm));
console.log('Body first 150:', body.slice(0, 150));
console.log('isTranslated:', /[ąćęłńóśźż]/i.test(body.slice(0, 800)));
