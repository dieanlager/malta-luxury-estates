import * as deepl from 'deepl-node';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import * as fs from 'fs/promises';

async function test() {
    const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
    const translator = new deepl.Translator(DEEPL_API_KEY!);
    const raw = await fs.readFile('src/content/articles/en/buying-property-malta-cryptocurrency-guide-2026.md', 'utf-8');
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) throw new Error("No match");

    console.log("Translating body...");
    try {
        const bodyRes = await translator.translateText(match[2].substring(0, 500), null, 'de', {
            tagHandling: 'xml',
            formality: 'more',
            ignoreTags: ['code', 'pre']
        });
        console.log("Translated body:", bodyRes.text);
    } catch (e: any) {
        console.error("DeepL Error Keys:", Object.keys(e));
        console.error("Message:", e.message);
        console.error("Name:", e.name);
        console.error(e);
    }
}
test().catch(e => console.error("Global:", e));
