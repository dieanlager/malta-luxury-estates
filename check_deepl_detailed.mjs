
import https from 'https';
const Keys = [
    'd8015cad-b25b-4c91-9331-07d8fc8f9fb7',
    '8559bb1f-d325-4a55-a73e-8c493de24c33'
];

async function check(key) {
    console.log(`Checking key: ${key.slice(0, 8)}...`);
    return new Promise((resolve) => {
        const req = https.request({
            hostname: 'api.deepl.com',
            path: '/v2/usage',
            method: 'GET',
            headers: { 'Authorization': `DeepL-Auth-Key ${key}` },
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
        req.end();
    });
}

async function main() {
    for (const k of Keys) await check(k);
}
main();
