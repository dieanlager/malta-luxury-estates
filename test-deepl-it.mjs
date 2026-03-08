
import https from 'https';
const DEEPL_KEY = 'd8015cad-b25b-4c91-9331-07d8fc8f9fb7';

async function deepl(text, targetLang) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams({
            text,
            source_lang: 'EN',
            target_lang: targetLang,
        });
        const body = params.toString();
        const req = https.request({
            hostname: 'api.deepl.com',
            path: '/v2/translate',
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(body),
            },
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                const j = JSON.parse(d);
                if (j.message) return reject(new Error(j.message));
                resolve(j.translations[0].text);
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function main() {
    console.log('Result:', await deepl('Hello world', 'IT'));
}
main();
