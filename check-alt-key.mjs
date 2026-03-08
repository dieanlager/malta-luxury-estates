
import https from 'https';
const DEEPL_KEY = '8559bb1f-d325-4a55-a73e-8c493de24c33';

async function checkUsage(hostname) {
    console.log(`Checking ${hostname}...`);
    return new Promise((resolve) => {
        const req = https.request({
            hostname: hostname,
            path: '/v2/usage',
            method: 'GET',
            headers: { 'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}` },
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${d}`);
                resolve();
            });
        });
        req.on('error', e => {
            console.error(`Error: ${e.message}`);
            resolve();
        });
        req.end();
    });
}

async function main() {
    await checkUsage('api.deepl.com');
    await checkUsage('api-free.deepl.com');
}
main();
