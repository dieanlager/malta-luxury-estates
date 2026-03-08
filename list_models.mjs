
import https from 'https';

const GEMINI_KEYS = [
    'AIzaSyBvP0jc_gpugX4F1hHf9A77CFz0uSuNVrs',
    'AIzaSyBEl_w2fPlAHDyeIVYGFcjl7OiQ24MDMqs',
];

async function listModels(key) {
    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models?key=${key}`,
        method: 'GET',
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                const j = JSON.parse(data);
                console.log(JSON.stringify(j, null, 2));
                resolve();
            });
        });
        req.on('error', (e) => {
            console.error(`Error: ${e.message}`);
            resolve();
        });
        req.end();
    });
}

listModels(GEMINI_KEYS[1]);
