import 'dotenv/config';
import OpenAi from 'openai';
import { generatePdfFromHtml, savePdfLocally } from './pdfService.js';

const openai = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

const roomContexts = {};

const CV_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Professional Resume</title>
    <style>
        @page { margin: 0; size: A4; }
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #fff; }
        .container { width: 210mm; margin: 0 auto; padding: 20mm; box-sizing: border-box; background: white; min-height: 297mm; }
        
        /* Smarter Page Breaks */
        .section { margin-bottom: 25px; page-break-inside: avoid; break-inside: avoid; }
        .experience-item { margin-bottom: 20px; page-break-inside: avoid; break-inside: avoid; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; page-break-inside: avoid; }
        h1, h2, h3, h4 { page-break-after: avoid; }
        
        .name { font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #2d3748; margin: 0; }
        .contact-info { margin-top: 10px; font-size: 14px; color: #666; display: flex; gap: 15px; flex-wrap: wrap; }
        .section-title { font-size: 16px; font-weight: 700; text-transform: uppercase; color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px; letter-spacing: 0.5px; }
        .job-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .job-title { font-weight: 700; color: #1a202c; }
        .company { color: #4a5568; font-weight: 500; }
        .date { color: #718096; font-size: 14px; white-space: nowrap; }
        .description-list { margin: 5px 0 0 18px; padding: 0; }
        .description-list li { margin-bottom: 5px; font-size: 14px; color: #4a5568; }
        .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
        .skill-tag { background: #f7fafc; padding: 4px 8px; border-radius: 4px; font-size: 13px; color: #4a5568; border: 1px solid #edf2f7; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Content will be injected here -->
    </div>
</body>
</html>
`;

async function generateText(prompt, roomId, onToken, systemPrompt, baseUrl) {
    try {
        if (!roomContexts[roomId]) {
            roomContexts[roomId] = [];

            const enhancedSystemPrompt = (systemPrompt || "You are a helpful career assistant.") +
                "\n\nWhen asked to generate a CV, use the following HTML structure/style as an inspiration/template. output pure HTML inside <!-- CV_START --> and <!-- CV_END --> markers:\n" + CV_TEMPLATE;

            roomContexts[roomId].push({ "role": "system", "content": enhancedSystemPrompt });
        }

        roomContexts[roomId].push({ "role": "user", "content": prompt });

        const stream = await openai.chat.completions.create({
            model: "moonshotai/kimi-k2-instruct-0905",
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

async function generateChatTitle(roomId) {
    try {
        if (!roomContexts[roomId]) return null;

        const messages = [...roomContexts[roomId]];
        messages.push({
            role: "user",
            content: "Generate a very short title (max 4 words) for this conversation based on the context. Respond with only the title, no additional text, no markdown."
        });

        const response = await openai.chat.completions.create({
            model: "moonshotai/kimi-k2-instruct-0905",
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
            model: "moonshotai/kimi-k2-instruct-0905",
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