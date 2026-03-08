
import https from 'https';

const GEMINI_KEYS = [
    'AIzaSyBvP0jc_gpugX4F1hHf9A77CFz0uSuNVrs',
    'AIzaSyBEl_w2fPlAHDyeIVYGFcjl7OiQ24MDMqs',
];

async function test(key) {
    console.log(`Testing key ${key.slice(0, 10)}...`);
    return new Promise((resolve) => {
        const body = JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] });
        const req = https.request({
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${d.slice(0, 150)}`);
                resolve();
            });
        });
        req.on('error', e => resolve(console.log(e.message)));
        req.write(body);
        req.end();
    });
}

async function main() {
    for (const k of GEMINI_KEYS) await test(k);
}
main();
