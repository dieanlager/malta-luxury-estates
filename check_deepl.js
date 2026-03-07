
import * as deepl from 'deepl-node';
const authKey = "8559bb1f-d325-4a55-a73e-8c493de24c33";
const translator = new deepl.Translator(authKey);

console.log('Checking usage...');
try {
    const usage = await translator.getUsage();
    console.log('Usage retrieved.');
    if (usage.anyLimitReached()) {
        console.log('Translation limit reached.');
    }
    if (usage.character) {
        console.log(`Characters: ${usage.character.count} of ${usage.character.limit}`);
    } else {
        console.log('No character usage info.');
    }
} catch (error) {
    console.error('Error occurred:', error.message);
}
