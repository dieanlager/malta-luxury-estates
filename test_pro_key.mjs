
import https from 'https';
const DEEPL_KEY = 'd8015cad-b25b-4c91-9331-07d8fc8f9fb7';

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

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${data}`);
                resolve();
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

translate('Hello World', 'IT');
