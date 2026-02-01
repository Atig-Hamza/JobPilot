import 'dotenv/config';
import OpenAi from 'openai';
import fs from 'fs';
import path from 'path';
import { generatePdfFromHtml, savePdfLocally } from './pdfService.js';

const openai = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

const LLM_Model = 'moonshotai/kimi-k2.5'

const roomContexts = {};

const CV_TEMPLATE = `
Generate a professional, modern Single-Page CV in HTML/CSS with a strict A4 aspect ratio (210mm x 297mm).
Design Requirements:
1. **Layout**: Use a clean two-column grid (Sidebar + Main Content). Ensure vertical balance so the page looks filled and professional.
2. **Styling**: use raw, semantic CSS (No Bootstrap/Tailwind). Use a sophisticated, modern color palette (e.g., Slate Blue/Charcoal/White or Navy/Cream/Gold).
3. **Typography**: Use clean sans-serif fonts (Inter, Roboto, or Open Sans) loaded via Google Fonts.
4. **Icons**: Use Phosphor Icons or FontAwesome (CDN) for contact details and section headers.
5. **Print-Ready**: Include a @media print block that forces -webkit-print-color-adjust: exact, sets zero margins, and hides non-CV elements.
6. **Single Page Constraint**: STRICTLY prioritize fitting everything on ONE A4 page. 
    - Adjust font-sizes (e.g., smaller body text 9pt-10pt) and reduce margins/padding if content is long.
    - Compact section spacing.
    - Only extend to a second page if absolutely unavoidable.
7. **Restrictions**: Max width 210mm. Min-height 297mm. No scrolling.
`;

async function generateText(prompt, roomId, onToken, systemPrompt, baseUrl) {
    try {
        if (!roomContexts[roomId]) {
            roomContexts[roomId] = [];

            const enhancedSystemPrompt = (systemPrompt || "You are a helpful career assistant.") +
                "\n\nCOMMAND: When the user asks for a CV, Resume, or Cover Letter, you must respond as follows:\n" +
                "1. **Conversational Part**: Briefly tell the user you are generating their professional PDF document. Do NOT mention HTML, code, or technical details.\n" +
                "2. **Generation Part**: Immediately after the text, output the full HTML code inside <!-- CV_START --> and <!-- CV_END --> tags.\n" +
                "3. **Content**: Fill the CV with the user's data (inferred or provided) or realistic placeholders if missing.\n\n" +
                "TEMPLATE INSTRUCTIONS:\n" + CV_TEMPLATE;

            roomContexts[roomId].push({ "role": "system", "content": enhancedSystemPrompt });
        }

        let currentModel = LLM_Model;
        let messageContent = prompt;

        const imageMatch = typeof prompt === 'string' ? prompt.match(/\[Image: (.*?)\]/) : null;

        if (imageMatch) {
            const imagePath = imageMatch[1];
            const textPrompt = prompt.replace(imageMatch[0], '').trim();

            try {
                const cleanPath = imagePath.replace(/^\/?media\//, '');
                const absolutePath = path.join(process.cwd(), 'media', cleanPath);

                if (fs.existsSync(absolutePath)) {
                    const fileBuffer = fs.readFileSync(absolutePath);
                    const base64Image = fileBuffer.toString('base64');
                    let mimeType = path.extname(absolutePath).slice(1).toLowerCase();
                    if (mimeType === 'jpg') mimeType = 'jpeg';

                    messageContent = [
                        { type: "text", text: textPrompt },
                        {
                            type: "image_url",
                            image_url: {
                                "url": `data:image/${mimeType};base64,${base64Image}`
                            }
                        }
                    ];
                }
            } catch (err) {
                console.error("Error preparing image for LLM:", err);
            }
        }

        roomContexts[roomId].push({ "role": "user", "content": messageContent });

        const hasImages = roomContexts[roomId].some(msg =>
            Array.isArray(msg.content) && msg.content.some(c => c.type === 'image_url')
        );

        if (hasImages) {
            currentModel = "meta/llama-3.2-90b-vision-instruct";
        }

        const stream = await openai.chat.completions.create({
            model: currentModel,
            messages: roomContexts[roomId],
            temperature: 0.6,
            top_p: 0.9,
            max_tokens: 4096,
            stream: true
        });

        let fullResponse = "";
        let cvMode = false;
        let cvBuffer = "";
        let processStep = 0;
        const processMessages = [
            "Analyzing profile data...",
            "Structuring CV layout...",
            "Drafting professional summary...",
            "Formatting experience section...",
            "Optimizing skills display...",
            "Applying design and typography...",
            "Finalizing document..."
        ];
        let lastUpdateLength = 0;

        for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content;
            if (token) {
                fullResponse += token;

                if (!cvMode && fullResponse.includes('<!-- CV_START -->')) {
                    cvMode = true;
                    await onToken({ type: 'process', content: "Initializing CV Generator..." });
                    continue;
                }

                if (cvMode) {
                    cvBuffer += token;

                    if (cvBuffer.length - lastUpdateLength > 500) {
                        lastUpdateLength = cvBuffer.length;
                        const msg = processMessages[processStep % processMessages.length];
                        await onToken({ type: 'process', content: msg });
                        processStep++;
                    }

                    if (cvBuffer.includes('<!-- CV_END -->')) {
                        await onToken({ type: 'process', content: "Rendering PDF..." });

                        const cleanHtml = cvBuffer.replace('<!-- CV_END -->', '').trim();

                        try {
                            const pdfBuffer = await generatePdfFromHtml(cleanHtml);
                            const savedFile = await savePdfLocally(pdfBuffer);
                            const host = baseUrl || process.env.API_URL || 'http://localhost:5000';
                            const downloadUrl = `${host}${savedFile.relativePath}`;

                            await onToken({ type: 'content', content: `\n\n**Success!** Your CV is ready.\n\n[Download PDF](${downloadUrl})` });
                        } catch (pdfError) {
                            console.error("PDF Generation failed:", pdfError);
                            await onToken({ type: 'content', content: "\n\n(Error generating PDF file. Please try again.)" });
                        }

                        cvMode = false;
                    }
                } else {
                    await onToken({ type: 'content', content: token });
                }
            }
        }

        if (cvMode && cvBuffer.length > 500) {
            await onToken({ type: 'process', content: "Finalizing document..." });
            try {
                if (!fullResponse.includes('<!-- CV_END -->')) {
                    fullResponse += "\n<!-- CV_END -->";
                }

                const cleanHtml = cvBuffer.replace('<!-- CV_END -->', '').trim();
                const pdfBuffer = await generatePdfFromHtml(cleanHtml);
                const savedFile = await savePdfLocally(pdfBuffer);
                const host = baseUrl || process.env.API_URL || 'http://localhost:5000';
                const downloadUrl = `${host}${savedFile.relativePath}`;

                await onToken({ type: 'content', content: "\n<!-- CV_END -->" });
                await onToken({ type: 'content', content: `\n\n**Success!** Your CV is ready.\n\n[Download PDF](${downloadUrl})` });
            } catch (pdfError) {
                console.error("PDF Generation Failsafe error:", pdfError);
                await onToken({ type: 'content', content: "\n\n(Error generating PDF file.)" });
            }
        }

        roomContexts[roomId].push({ "role": "assistant", "content": fullResponse });

        return fullResponse;
    } catch (error) {
        console.error("Error generating text:", error);
        throw error;
    }
}

async function generateChatTitle(roomId, conversationHistory = null) {
    try {
        let messages = [];

        if (roomContexts[roomId] && roomContexts[roomId].length > 0) {
            messages = [...roomContexts[roomId]];
        }
        else if (conversationHistory && conversationHistory.length > 0) {
            messages = [
                { role: "system", content: "You are a helpful career assistant." },
                ...conversationHistory.map(msg => {
                    if (msg.startsWith('User: ')) {
                        return { role: "user", content: msg.replace('User: ', '') };
                    } else if (msg.startsWith('AI: ')) {
                        return { role: "assistant", content: msg.replace('AI: ', '') };
                    }
                    return null;
                }).filter(Boolean)
            ];
        } else {
            return null;
        }

        messages.push({
            role: "user",
            content: "Generate a very short title (max 4 words) for this conversation based on the context. Respond with only the title, no additional text, no markdown."
        });

        const response = await openai.chat.completions.create({
            model: "meta/llama-3.2-3b-instruct",
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
            model: LLM_Model,
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