
import * as deepl from 'deepl-node';
const authKey = "8559bb1f-d325-4a55-a73e-8c493de24c33";
const translator = new deepl.Translator(authKey);

try {
    const result = await translator.translateText('Hello', null, 'fr');
    console.log('Test translation:', result.text);
} catch (error) {
    console.error('Translation failed:', error.message);
}
