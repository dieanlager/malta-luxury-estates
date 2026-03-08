
import https from 'https';
const DEEPL_KEY = 'd8015cad-b25b-4c91-9331-07d8fc8f9fb7';

const req = https.request({
    hostname: 'api.deepl.com',
    path: '/v2/usage',
    method: 'GET',
    headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
    },
}, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        const j = JSON.parse(d);
        console.log(JSON.stringify(j, null, 2));
    });
});
req.on('error', e => console.error(e));
req.end();
