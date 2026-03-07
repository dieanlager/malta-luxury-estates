import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const GOOGLE_API_KEYS = (process.env.GOOGLE_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
if (GOOGLE_API_KEYS.length === 0) {
    console.error('❌ Missing GOOGLE_API_KEY');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEYS[0]);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function translate() {
    const content = {
        "market": {
            "title": "Malta Property Market Pulse | Real-Time Data 2026",
            "description": "Monitor real-time property price trends, live listings, and market heat across Malta and Gozo. Data-driven insights for luxury investors."
        },
        "tools": {
            "oracle": {
                "title": "AI Property Price Oracle | Free Valuation Malta & Gozo",
                "description": "Get an instant, AI-powered property valuation. Our Oracle analyzes market trends, location data, and property specs to provide high-precision estimates."
            }
        }
    };

    const prompt = `Translate the following JSON object into Italian, German, French, and Polish. 
  Maintain the JSON structure exactly. 
  Return ONLY a single valid JSON object where keys are language codes (it, de, fr, pl) and values are the translated versions of the input JSON.
  Use a luxury, professional real estate tone.
  Input JSON: ${JSON.stringify(content, null, 2)}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        // Clean up potential markdown code blocks
        const cleanedText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        console.log(cleanedText);
    } catch (error: any) {
        console.error('Error:', error.message || error);
        if (error.response) {
            console.error('Response:', await error.response.text());
        }
    }
}
translate();
