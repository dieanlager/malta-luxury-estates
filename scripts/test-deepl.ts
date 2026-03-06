import * as deepl from 'deepl-node';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    const key = process.env.DEEPL_API_KEY;
    if (!key) throw new Error("No key");
    console.log("Key:", key.substring(0, 5) + "...");
    const translator = new deepl.Translator(key);

    // Test basic translation
    const res = await translator.translateText("Hello, world!", null, "it");
    console.log("Translation result:", res.text);
}
test().catch(console.error);
