import 'dotenv/config';
import OpenAi from 'openai';
import fs from 'fs';
import path from 'path';
import { generatePdfFromHtml, savePdfLocally } from './pdfService.js';

const openai = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

const LLM_Model = 'moonshotai/kimi-k2-instruct-0905'

const roomContexts = {};

// Track rooms that are actively generating responses
const generatingRooms = new Map();

export function setRoomGenerating(roomId, status = true) {
    if (status) {
        generatingRooms.set(roomId, { startedAt: Date.now(), status: 'generating' });
    } else {
        generatingRooms.delete(roomId);
    }
}

export function isRoomGenerating(roomId) {
    const entry = generatingRooms.get(roomId);
    if (!entry) return false;
    // Auto-expire after 5 minutes to handle stuck generations
    if (Date.now() - entry.startedAt > 5 * 60 * 1000) {
        generatingRooms.delete(roomId);
        return false;
    }
    return true;
}

function buildPersonalizedPrompt(basePrompt, aiSettings) {
    if (!aiSettings) return basePrompt;

    let personalizedPrompt = basePrompt;

    const styleInstructions = {
        professional: "Respond in a formal, professional tone. Use industry-standard terminology and maintain a business-like demeanor.",
        friendly: "Respond in a warm, approachable, and conversational tone. Be helpful and encouraging.",
        concise: "Keep responses brief and to the point. Avoid unnecessary elaboration. Use bullet points when appropriate.",
        detailed: "Provide comprehensive, thorough responses with explanations. Include context and background information."
    };

    const focusInstructions = {
        general: "Provide balanced career advice covering various aspects.",
        technical: "Focus on technical skills, coding, engineering, and technology-related career advice.",
        creative: "Focus on creative careers, design, writing, marketing, and artistic pursuits.",
        business: "Focus on business skills, management, entrepreneurship, and leadership."
    };

    personalizedPrompt += "\n\n--- AI PERSONALIZATION SETTINGS ---";

    if (aiSettings.responseStyle && styleInstructions[aiSettings.responseStyle]) {
        personalizedPrompt += `\n\nCOMMUNICATION STYLE: ${styleInstructions[aiSettings.responseStyle]}`;
    }

    if (aiSettings.focusArea && focusInstructions[aiSettings.focusArea]) {
        personalizedPrompt += `\n\nFOCUS AREA: ${focusInstructions[aiSettings.focusArea]}`;
    }

    if (aiSettings.useEmojis === true) {
        personalizedPrompt += "\n\nEMOJIS: Use relevant emojis occasionally to make responses more engaging and friendly. Don't overuse them.";
    } else if (aiSettings.useEmojis === false) {
        personalizedPrompt += "\n\nEMOJIS: Do NOT use any emojis in your responses.";
    }

    if (aiSettings.includeExamples === true) {
        personalizedPrompt += "\n\nEXAMPLES: Include practical examples, templates, and sample content when relevant.";
    } else if (aiSettings.includeExamples === false) {
        personalizedPrompt += "\n\nEXAMPLES: Skip examples unless explicitly requested by the user.";
    }

    if (aiSettings.language && aiSettings.language !== 'English') {
        personalizedPrompt += `\n\nLANGUAGE: Respond in ${aiSettings.language} language.`;
    }

    if (aiSettings.customInstructions && aiSettings.customInstructions.trim()) {
        personalizedPrompt += `\n\nCUSTOM INSTRUCTIONS FROM USER: ${aiSettings.customInstructions.trim()}`;
    }

    if (aiSettings.autoSuggest === true) {
        personalizedPrompt += "\n\nSUGGESTIONS: End responses with helpful follow-up questions or next steps when appropriate.";
    } else if (aiSettings.autoSuggest === false) {
        personalizedPrompt += "\n\nSUGGESTIONS: Do NOT add follow-up questions or suggestions at the end of responses unless asked.";
    }

    personalizedPrompt += "\n--- END PERSONALIZATION ---\n";

    return personalizedPrompt;
}

const CV_TEMPLATE = `
Generate a professional, modern Single-Page CV in HTML/CSS with a strict A4 aspect ratio (210mm x 297mm).

**CRITICAL Design Requirements:**
1. **Layout**: Use a clean two-column grid layout. Left sidebar (~30-35% width) with a colored/dark background for contact info, skills, languages. Main content area (~65-70% width) for summary, experience, education, certifications.
2. **Styling**: Use ONLY raw inline CSS or a <style> block. NEVER use Tailwind, Bootstrap, or any external CSS framework. Use a sophisticated color palette (e.g., dark navy sidebar #1a1a2e or #2d3748 with white text, white main area with dark text).
3. **Typography**: Load Google Fonts via @import in the <style> block: Inter or Roboto. Use font-weight variations (300, 400, 600, 700) for hierarchy.
4. **Icons**: Use Font Awesome 6 CDN (<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">) for contact details and section headers. Use <i class="fa-solid fa-envelope"></i> style icons.
5. **Colors for Print**: All background colors MUST use inline style or CSS with -webkit-print-color-adjust: exact. This is critical for PDF rendering.
6. **Single Page Constraint**: STRICTLY fit everything on ONE A4 page (210mm x 297mm, max-height: 297mm).
    - Use font-size 9pt-10pt for body text, 11-12pt for section headers, 14-16pt for the name.
    - Use compact padding (8-12px) and margins (4-8px between sections).
    - Use line-height: 1.3-1.5 for body text.
7. **Structure**:
    - The entire CV must be wrapped in a single container div with width: 210mm; min-height: 297mm; display: flex;
    - Sidebar: position: relative, fixed height matching the container.
    - Each section should have a clear heading with an icon, a subtle bottom border or separator.
    - Experience items: Job Title (bold), Company + Date (lighter), bullet points for responsibilities.
    - Skills: Use progress bars, tags/pills, or star ratings for visual appeal.
8. **Restrictions**: 
    - NEVER use JavaScript.
    - NEVER add any interactive elements.
    - The HTML must be self-contained, render perfectly without any build step.
    - DO NOT wrap the HTML in markdown code fences.
    - Output only the raw HTML between <!-- CV_START --> and <!-- CV_END --> markers.
`;

async function generateText(prompt, roomId, onToken, systemPrompt, baseUrl, aiSettings = null) {
    setRoomGenerating(roomId, true);
    try {
        if (!roomContexts[roomId]) {
            roomContexts[roomId] = [];

            let baseSystemPrompt = systemPrompt || "You are a helpful career assistant.";

            baseSystemPrompt = buildPersonalizedPrompt(baseSystemPrompt, aiSettings);

            const enhancedSystemPrompt = baseSystemPrompt +
                "\n\nCV GENERATION COMMAND:\n" +
                "When the user asks for a CV, Resume, or Cover Letter:\n" +
                "- DO NOT generate the HTML immediately. Follow the interactive CV Creator flow defined in Section 6.3 of your system prompt.\n" +
                "- Guide the user through style, language, color, and content steps ONE AT A TIME.\n" +
                "- ONLY after the user explicitly confirms at the final step, output the full HTML inside <!-- CV_START --> and <!-- CV_END --> tags.\n" +
                "- Do NOT mention HTML, code blocks, or technical details to the user. Present it as 'generating your PDF'.\n" +
                "- Fill the CV with the user's actual profile data. Use realistic placeholders ONLY for missing fields.\n\n" +
                "TEMPLATE INSTRUCTIONS (used only at generation step):\n" + CV_TEMPLATE;

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

        const temperature = aiSettings?.creativity ? (aiSettings.creativity / 100) * 0.8 + 0.2 : 0.6;

        const stream = await openai.chat.completions.create({
            model: currentModel,
            messages: roomContexts[roomId],
            temperature: 0.6,
            top_p: 0.9,
            max_tokens: 4096,
            stream: true,
            chat_template_kwargs: { "thinking": false }
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

        setRoomGenerating(roomId, false);
        return fullResponse;
    } catch (error) {
        setRoomGenerating(roomId, false);
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
            max_tokens: 2048,
            chat_template_kwargs: { "thinking": false }
        });
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI Completion Error:", error);
        throw error;
    }
}

export { generateText, generateChatTitle, generateCompletion };