
import https from 'https';
const DEEPL_KEY = '8559bb1f-d325-4a55-a73e-8c493de24c33';

async function translate(text, targetLang) {
    const params = new URLSearchParams({
        text,
        target_lang: targetLang,
    });
    const body = params.toString();
    const options = {
        hostname: 'api.deepl.com',
        path: '/v2/translate',
        method: 'POST',
        headers: {
            'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(body),
        },
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${data}`);
                resolve();
            });
        });
        req.on('error', (e) => {
            console.error(`Error: ${e.message}`);
            resolve();
        });
        req.write(body);
        req.end();
    });
}

translate('Hello World', 'IT');
