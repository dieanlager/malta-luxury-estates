
import https from 'https';
const DEEPL_KEY = '21316344-6804-46c9-9028-18aa2081163a';

async function test(host) {
    console.log(`\n--- Testing ${host} ---`);
    const body = new URLSearchParams({ text: 'Test', target_lang: 'IT' }).toString();
    return new Promise((resolve) => {
        const req = https.request({
            hostname: host,
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
