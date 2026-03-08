
import https from 'https';
const DEEPL_KEY = '21316344-6804-46c9-9028-18aa2081163a';

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
                resolve(res.statusCode === 200);
            });
        });
        req.on('error', e => {
            console.error(`Error: ${e.message}`);
            resolve(false);
        });
        req.end();
    });
}

async function testTranslate(hostname) {
    console.log(`\nTesting translation on ${hostname}...`);
    const body = new URLSearchParams({
        text: 'DeepL is the best.',
        target_lang: 'IT'
    }).toString();

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
                resolve(res.statusCode === 200);
            });
        });
        req.on('error', e => {
            console.error(`Error: ${e.message}`);
            resolve(false);
        });
        req.write(body);
        req.end();
    });
}

async function main() {
    let ok = await checkUsage('api.deepl.com');
    if (ok) {
        await testTranslate('api.deepl.com');
    } else {
        ok = await checkUsage('api-free.deepl.com');
        if (ok) await testTranslate('api-free.deepl.com');
    }
}
main();
