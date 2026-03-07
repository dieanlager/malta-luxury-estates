import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const GOOGLE_API_KEYS = (process.env.GOOGLE_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEYS[0]);

async function listModels() {
    try {
        // There is no direct listModels in the SDK sometimes, but let's try a simple prompt with a known model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Hi');
        console.log(result.response.text());
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}
listModels();
