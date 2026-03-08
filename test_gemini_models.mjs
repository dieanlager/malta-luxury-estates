
import https from 'https';

const GEMINI_KEYS = [
    'AIzaSyBvP0jc_gpugX4F1hHf9A77CFz0uSuNVrs',
    'AIzaSyBEl_w2fPlAHDyeIVYGFcjl7OiQ24MDMqs',
];

async function testGemini(model, key) {
    console.log(`Testing model: ${model} with key: ${key.slice(0, 10)}...`);
    const body = JSON.stringify({
        contents: [{ parts: [{ text: "Translate 'Hello' to Italian. Return only the word." }] }],
    });
    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${model}:generateContent?key=${key}`,
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
    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.5-pro'];
    for (const model of models) {
        await testGemini(model, GEMINI_KEYS[1]); // Try the second key
    }
}
main();
