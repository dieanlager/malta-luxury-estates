import https from 'https';

const GEMINI_KEYS = [
    'AIzaSyBvP0jc_gpugX4F1hHf9A77CFz0uSuNVrs',
    'AIzaSyBEl_w2fPlAHDyeIVYGFcjl7OiQ24MDMqs',
];

function callGemini(text, keyIdx = 0) {
    const key = GEMINI_KEYS[keyIdx];
    const body = JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: { temperature: 0.15, maxOutputTokens: 100 }
    });
    const opts = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    return new Promise((resolve, reject) => {
        const req = https.request(opts, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try {
                    const j = JSON.parse(d);
                    console.log('Status:', res.statusCode);
                    console.log('Response:', JSON.stringify(j).substring(0, 500));
                    resolve(j);
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

console.log('Testing key 1...');
try {
    await callGemini('Say "Hello" in Polish. Return only the word.');
} catch (e) {
    console.error('Key 1 error:', e.message);
}

console.log('\nTesting key 2...');
try {
    await callGemini('Say "Hello" in Polish. Return only the word.', 1);
} catch (e) {
    console.error('Key 2 error:', e.message);
}
