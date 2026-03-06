import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("No missing key allowed");
    const claude = new Anthropic({ apiKey: key });

    try {
        const response = await claude.messages.create({
            model: 'claude-3-5-sonnet-latest',
            max_tokens: 100,
            messages: [{ role: 'user', content: "Hello" }],
        });
        console.log("Response:", response.content[0]);
    } catch (e: any) {
        console.error("Error from Claude:", e.message);
    }
}
main().catch(console.error);
