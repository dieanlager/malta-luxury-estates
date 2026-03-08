
import https from 'https';
const DEEPL_KEY = 'd8015cad-b25b-4c91-9331-07d8fc8f9fb7';

async function test(hostname) {
    console.log(`Testing ${hostname}...`);
    const body = new URLSearchParams({ text: 'Hi', target_lang: 'IT' }).toString();
    return new Promise((resolve) => {
        const req = https.request({
            hostname: hostname,
            path: '/v2/translate',
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(body)
            },
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${d}`);
                resolve();
            });
        });
        req.on('error', e => resolve(console.log(e.message)));
        req.write(body);
        req.end();
    });
}

async function main() {
    await test('api.deepl.com');
    await test('api-free.deepl.com');
}
main();
