
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log(result.response.text());
    } catch (e) {
        console.error("Gemini Pro failed:", e.message);
        try {
            const model2 = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
            const result2 = await model2.generateContent("Hello");
            console.log("Gemini 1.0 Pro worked:", result2.response.text());
        } catch (e2) {
            console.error("Gemini 1.0 Pro failed:", e2.message);
        }
    }
}

test();
