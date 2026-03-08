
import https from 'https';
const DEEPL_KEY = '8559bb1f-d325-4a55-a73e-8c493de24c33';

async function deepl(text, targetLang) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams({
            auth_key: DEEPL_KEY,
            text,
            target_lang: targetLang,
        });
        const body = params.toString();
        const req = https.request({
            hostname: 'api-free.deepl.com',
            path: '/v2/translate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(body),
            },
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try {
                    const j = JSON.parse(d);
                    if (j.message) return reject(new Error(j.message));
                    resolve(j.translations[0].text);
                } catch (e) {
                    reject(new Error('Parse error: ' + d));
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function main() {
    try {
        console.log('Result:', await deepl('Hello world', 'IT'));
    } catch (e) {
        console.error('Error:', e.message);
    }
}
main();
