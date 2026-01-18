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

async function generateChatTitle(roomId) {
    try {
        if (!roomContexts[roomId]) return null;

        const messages = [...roomContexts[roomId]];
        messages.push({ 
            role: "user", 
            content: "Generate a very short title (max 4 words) for this conversation based on the context. Respond with only the title, no additional text, no markdown." 
        });

        const response = await openai.chat.completions.create({
            model: "moonshotai/kimi-k2-instruct",
            messages: messages,
            temperature: 0.7,
            max_tokens: 50
        });

        let title = response.choices[0]?.message?.content?.trim();
        if (title) {
            title = title.replace(/^["']|["']$/g, '');
            if (title.split(' ').length > 4) {
                 title = title.split(' ').slice(0, 4).join(' ');
            }
        }
        return title;
    } catch (error) {
        console.error("Error generating title:", error);
        return null;
    }
}

async function generateCompletion(prompt, systemPrompt) {
    try {
        const completion = await openai.chat.completions.create({
            model: "moonshotai/kimi-k2-instruct",
            messages: [
                { role: "system", content: systemPrompt || "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 2048
        });
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI Completion Error:", error);
        throw error;
    }
}

export { generateText, generateChatTitle, generateCompletion };