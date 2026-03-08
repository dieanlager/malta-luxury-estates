import https from 'https';

const body = JSON.stringify({
    contents: [{
        parts: [{
            text: `Translate the English article title or slug into Polish and create a URL-friendly version.
Input title: "Stała rezydencja na Malcie dzięki inwestycjom 2026 - Kompletny przewodnik po MPRP"
Input English slug: "malta-permanent-residency-mprp-property-guide"

Rules:
1. The output MUST be in Polish but using ONLY lowercase ASCII (a-z, 0-9, hyphens).
2. REMOVE all diacritics/accents (e.g., ą -> a, ł -> l, ä -> a, é -> e).
3. Return ONLY the slug string, nothing else.` }]
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 50 }
});

const req = https.request({
    hostname: 'generativelanguage.googleapis.com',
    path: '/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBvP0jc_gpugX4F1hHf9A77CFz0uSuNVrs',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
}, res => {
    let d = ''; res.on('data', c => d += c);
    res.on('end', () => {
        console.log(d);
    });
});
req.write(body); req.end();
