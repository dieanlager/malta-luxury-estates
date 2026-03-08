
import https from 'https';

const GEMINI_KEYS = [
    'AIzaSyBvP0jc_gpugX4F1hHf9A77CFz0uSuNVrs',
    'AIzaSyBEl_w2fPlAHDyeIVYGFcjl7OiQ24MDMqs',
];

async function testGemini(model, key, version = 'v1beta') {
    console.log(`Testing model: ${model} (${version}) with key: ${key.slice(0, 10)}...`);
    const body = JSON.stringify({
        contents: [{ parts: [{ text: "Translate 'Hello' to Italian. Return only the word." }] }],
    });
    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/${version}/models/${model}:generateContent?key=${key}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${data.slice(0, 200)}`);
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

async function main() {
    await testGemini('gemini-2.0-flash', GEMINI_KEYS[1], 'v1beta');
    await testGemini('gemini-1.5-flash', GEMINI_KEYS[1], 'v1');
}
main();
