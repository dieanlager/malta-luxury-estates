import * as deepl from 'deepl-node';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    const key = process.env.DEEPL_API_KEY;
    if (!key) throw new Error("No missing key allowed");
    const translator = new deepl.Translator(key);

    const text = `# Buying Off-Plan Property in Malta
In Malta’s fast-moving market, many of the best units in new developments are sold before the first stone is laid.`;

    const res = await translator.translateText(text, null, 'it', {
        tagHandling: 'xml',
        formality: 'more',
        ignoreTags: ['code', 'pre'],
    });

    console.log("Translation result:", res.text);
}
test().catch(console.error);
