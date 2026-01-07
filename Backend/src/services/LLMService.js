import 'dotenv/config';
import OpenAi from 'openai';

const openai = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

const roomContexts = {};

async function generateText(prompt, roomId, onToken, systemPrompt) {
    try {
        if (!roomContexts[roomId]) {
            roomContexts[roomId] = [];
            if (systemPrompt) {
                roomContexts[roomId].push({ "role": "system", "content": systemPrompt });
            }
        }

        roomContexts[roomId].push({ "role": "user", "content": prompt });

        const stream = await openai.chat.completions.create({
            model: "moonshotai/kimi-k2-instruct",
            messages: roomContexts[roomId],
            temperature: 0.6,
            top_p: 0.9,
            max_tokens: 4096,
            stream: true
        });

        let fullResponse = "";

        for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content;
            if (token) {
                fullResponse += token;
                onToken(token);
            }
        }

        roomContexts[roomId].push({ "role": "assistant", "content": fullResponse });

        return fullResponse;
    } catch (error) {
        console.error("Error generating text:", error);
        throw error;
    }
}

export { generateText };