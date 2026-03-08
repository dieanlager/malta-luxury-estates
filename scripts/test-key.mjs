
import https from 'https';
const DEEPL_KEY = 'd8015cad-b25b-4c91-9331-07d8fc8f9fb7';

const params = new URLSearchParams({
    text: 'Hello world',
    target_lang: 'IT',
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
        console.log('Status:', res.statusCode);
        console.log('Response:', d);
    });
});
req.on('error', e => console.error(e));
req.write(body);
req.end();
