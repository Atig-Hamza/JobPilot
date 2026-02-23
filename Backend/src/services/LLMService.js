import 'dotenv/config';
import OpenAi from 'openai';
import fs from 'fs';
import path from 'path';
import { generatePdfFromHtml, savePdfLocally } from './pdfService.js';

const nvidiaClient = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

const mistralClient = new OpenAi({
    apiKey: process.env.MISTRAL_API_KEY || 'OhVD22lwGKUKbdMWpgchzQ7z02Pxqw0o',
    baseURL: 'https://api.mistral.ai/v1',
});

function getClientForModel(model) {
    if (model.startsWith('mistral')) return mistralClient;
    return nvidiaClient;
}

// ── Smart Model Pool (Round-Robin: NVIDIA ↔ Mistral) ─────────────
const NVIDIA_POOL = [
    'moonshotai/kimi-k2-instruct-0905',
    'nvidia/nemotron-3-nano-30b-a3b',
];

const MISTRAL_POOL = [
    'mistral-medium-latest',
];

const MODEL_POOL = [...NVIDIA_POOL, ...MISTRAL_POOL];

const CV_MODEL_POOL = [
    'mistral-medium-latest',
];

const TITLE_MODEL = 'mistral-medium-latest';
const TITLE_FALLBACK = 'nvidia/nemotron-3-nano-30b-a3b';

let roundRobinCounter = 0;

const modelStats = new Map();

function getModelStats(model) {
    if (!modelStats.has(model)) {
        modelStats.set(model, {
            failures: 0,
            lastFailure: 0,
            avgLatency: 0,
            requestCount: 0,
            cooldownUntil: 0,
        });
    }
    return modelStats.get(model);
}

function pickModel(pool = MODEL_POOL) {
    const now = Date.now();
    const candidates = pool
        .map(m => ({ model: m, stats: getModelStats(m) }))
        .filter(c => now >= c.stats.cooldownUntil);

    if (candidates.length === 0) {
        const all = pool.map(m => ({ model: m, stats: getModelStats(m) }));
        all.sort((a, b) => a.stats.cooldownUntil - b.stats.cooldownUntil);
        return all[0].model;
    }

    const nvidiaReady = candidates.filter(c => !c.model.startsWith('mistral'));
    const mistralReady = candidates.filter(c => c.model.startsWith('mistral'));

    if (nvidiaReady.length > 0 && mistralReady.length > 0) {
        roundRobinCounter++;
        if (roundRobinCounter % 2 === 0) {
            return mistralReady[0].model;
        }
        nvidiaReady.sort((a, b) => {
            if (a.stats.failures !== b.stats.failures) return a.stats.failures - b.stats.failures;
            return a.stats.avgLatency - b.stats.avgLatency;
        });
        return nvidiaReady[0].model;
    }

    candidates.sort((a, b) => {
        if (a.stats.failures !== b.stats.failures) return a.stats.failures - b.stats.failures;
        return a.stats.avgLatency - b.stats.avgLatency;
    });

    return candidates[0].model;
}

function recordFailure(model) {
    const s = getModelStats(model);
    s.failures += 1;
    s.lastFailure = Date.now();
    const cooldownMs = Math.min(10_000 * Math.pow(2, s.failures - 1), 5 * 60_000);
    s.cooldownUntil = Date.now() + cooldownMs;
    console.log(`[ModelPool] ${model} failed (x${s.failures}), cooldown ${cooldownMs / 1000}s`);
}

function recordSuccess(model, latencyMs) {
    const s = getModelStats(model);
    s.failures = 0;
    s.cooldownUntil = 0;
    s.requestCount += 1;
    s.avgLatency = s.requestCount === 1
        ? latencyMs
        : s.avgLatency * 0.7 + latencyMs * 0.3;
}

function isRetryableError(err) {
    const status = err?.status || err?.response?.status || err?.statusCode;
    if ([429, 503, 502, 500].includes(status)) return true;
    const code = err?.cause?.code || err?.code || '';
    if (['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EPIPE', 'UND_ERR_SOCKET'].includes(code)) return true;
    const msg = (err?.message || '').toLowerCase();
    return msg.includes('timeout') || msg.includes('rate limit') || msg.includes('queue') 
        || msg.includes('overloaded') || msg.includes('capacity') || msg.includes('terminated') 
        || msg.includes('econnreset') || msg.includes('socket hang up') || msg.includes('aborted');
}

async function withModelFallback(callFn, pool = MODEL_POOL, preferredModel = null) {
    const effectivePool = preferredModel
        ? [preferredModel, ...pool.filter(m => m !== preferredModel)]
        : [...pool];

    const tried = new Set();
    let lastError = null;

    while (tried.size < effectivePool.length) {
        const model = tried.size === 0 && preferredModel
            ? preferredModel
            : pickModel(effectivePool.filter(m => !tried.has(m)));
        tried.add(model);

        try {
            const client = getClientForModel(model);
            console.log(`[ModelPool] Trying ${model} (${model.startsWith('mistral') ? 'Mistral' : 'NVIDIA'})...`);
            const start = Date.now();
            const result = await callFn(model, client);
            recordSuccess(model, Date.now() - start);
            console.log(`[ModelPool] ${model} succeeded (${Date.now() - start}ms)`);
            return { result, model };
        } catch (err) {
            lastError = err;
            recordFailure(model);
            if (tried.size < effectivePool.length) {
                console.log(`[ModelPool] Error on ${model}: ${err.message || err.code}, trying next...`);
                continue;
            }
        }
    }

    throw lastError || new Error('All models exhausted');
}
// ── End Smart Model Pool ──────────────────────────────────────────

const roomContexts = {};

const roomImages = {};

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

function cleanCvHtml(rawBuffer) {
    let html = rawBuffer.replace(/<!--\s*CV_END\s*-->/g, '').trim();
    html = html.replace(/^\s*```[\w]*\s*\n?/, '').replace(/\n?\s*```\s*$/, '');
    if (!html.trim().startsWith('<') && html.includes('<html')) {
        html = html.substring(html.indexOf('<html'));
    }
    if (!html.trim().startsWith('<') && html.includes('<!DOCTYPE')) {
        html = html.substring(html.indexOf('<!DOCTYPE'));
    }
    return html.trim();
}

const CV_TEMPLATE = `
Generate a polished, premium Single-Page CV/Resume in raw HTML + CSS. The result MUST look like a professionally designed document — not a basic template.

## ABSOLUTE REQUIREMENTS — READ CAREFULLY
- Output ONLY raw HTML between <!-- CV_START --> and <!-- CV_END --> markers.
- The VERY FIRST character after <!-- CV_START --> MUST be an HTML tag (like <!DOCTYPE html> or <html>).
- ABSOLUTELY NO markdown code fences. NEVER wrap the HTML in triple backticks. This is CRITICAL — doing so will BREAK the PDF generator.
- NEVER use JavaScript. NEVER output plain text between the markers — only valid HTML tags.
- NEVER use Tailwind, Bootstrap, or any external CSS framework.
- Use a <style> block for all styling.
- CORRECT format example: <!-- CV_START --><!DOCTYPE html><html>...</html><!-- CV_END -->
- WRONG format (NEVER DO THIS): <!-- CV_START -->\`\`\`html<html>...</html>\`\`\`<!-- CV_END -->

## PAGE FORMAT
- A4 page: width: 210mm; height: 297mm; overflow: hidden;
- Everything MUST fit on ONE page. If content is too long, reduce font sizes or trim less important items.
- Use -webkit-print-color-adjust: exact; print-color-adjust: exact; on html and body.

## LAYOUT
- Use CSS Flexbox: a two-column layout with a sidebar (30-35% width) and main content (65-70%).
- Sidebar: solid background color matching the chosen style, full height of the page, with white or light text.
- Main area: white or very light background, dark text.
- Both columns must have consistent internal padding (20-30px).

## TYPOGRAPHY
- Load Google Fonts via @import: use "Inter", "Poppins", or "Raleway" (pick one that matches the style).
- Name: 20-24pt, font-weight 700, letter-spacing: 1px.
- Section titles: 11-12pt, font-weight 600, uppercase, letter-spacing: 1.5px, with a decorative bottom border or accent line (2-3px solid accent color).
- Body text: 9-10pt, font-weight 400, line-height: 1.4-1.5, color: #333 or #444.
- Use font-weight contrast (300 vs 600 vs 700) extensively for visual hierarchy.

## VISUAL DESIGN
- Use Font Awesome 6 CDN icons (<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">) for contact items and section headers.
- Section headings: icon + title with accent-colored bottom border.
- Skills: display as styled pill/tag badges with background color, rounded corners (border-radius: 12px), padding 4px 12px.
- Experience: Job title bold, company name + dates in lighter weight on the same or next line. Use a subtle left border accent (3px solid accent color) on each experience block for visual polish.
- Education: Same pattern as experience — clear hierarchy between degree and institution.
- Add subtle separators between sections (border-bottom: 1px solid rgba(0,0,0,0.08) or similar).
- Sidebar contact items: icon + text, spaced evenly, font-size 8.5-9pt.

## PROFILE PHOTO
- If PROFILE_PHOTO_URL is available: include <img src="{{PROFILE_PHOTO_URL}}"> at the TOP of the sidebar.
- Style: width: 110px; height: 110px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255,255,255,0.8); display: block; margin: 0 auto 16px auto;
- If NO photo URL is provided: do NOT include any placeholder, avatar icon, or empty circle.

## CONTENT RULES
- Pull ALL data from the user's profile context. Do NOT invent fake data.
- Only use realistic placeholders (e.g. "Your City, Country") for genuinely missing fields.
- Professional summary: 2-3 concise sentences max.
- Experience bullets: 2-3 per role, action-oriented, concise.
- Keep the CV scannable — recruiters spend 6 seconds on average.

## QUALITY CHECKLIST (follow all)
- The CV must look good enough to submit to a Fortune 500 company.
- Color palette must be harmonious (max 2-3 colors, well contrasted).
- No text overflow, no scrollbars, no content cut off.
- Clear visual hierarchy: name > section titles > subtitles > body text.
- Consistent spacing throughout — no cramped or floating sections.
`;

async function generateText(prompt, roomId, onToken, systemPrompt, baseUrl, aiSettings = null) {
    setRoomGenerating(roomId, true);
    try {
        if (!roomContexts[roomId]) {
            roomContexts[roomId] = [];

            let baseSystemPrompt = systemPrompt || "You are a helpful career assistant.";

            baseSystemPrompt = buildPersonalizedPrompt(baseSystemPrompt, aiSettings);

            let photoContext = '';
            if (roomImages[roomId]) {
                const host = baseUrl || process.env.API_URL || 'http://localhost:5000';
                const fullPhotoUrl = `${host}${roomImages[roomId]}`;
                photoContext = `\n\nPROFILE_PHOTO_URL: ${fullPhotoUrl}\nThe user has uploaded a profile photo for their CV. You MUST include an <img> tag with src="${fullPhotoUrl}" in the CV sidebar.\n`;
            }

            const enhancedSystemPrompt = baseSystemPrompt +
                "\n\nCV GENERATION COMMAND:\n" +
                "When the user asks for a CV, Resume, or Cover Letter:\n" +
                "- Do NOT generate HTML on the very first message. Have at least one natural exchange before generating.\n" +
                "- Be conversational and adaptive — no rigid steps. Cover style, language, content, and photo naturally.\n" +
                "- If the user says 'just do it' or seems eager, quickly confirm key preferences and proceed.\n" +
                "- IMPORTANT: Before generating the CV, ALWAYS ask the user for confirmation. Say something like 'Everything looks good! Are you ready for me to generate your CV?' or 'I have all the details I need. Shall I go ahead and generate your CV now?'. Wait for their confirmation before proceeding.\n" +
                "- Once the user confirms, start with an enthusiastic message like 'Let's do it! Generating your CV now...' or 'Here we go! Creating your professional CV...' followed immediately by the CV HTML.\n" +
                "- When ready, output the full HTML inside <!-- CV_START --> and <!-- CV_END --> tags.\n" +
                "- CRITICAL: Do NOT write ANY text after <!-- CV_END -->. The system handles the download UI automatically. Your message must END with <!-- CV_END -->.\n" +
                "- Before the <!-- CV_START --> tag, write only a short enthusiastic sentence (e.g. 'Here we go! Generating your CV now...').\n" +
                "- Do NOT mention HTML, code blocks, or technical details to the user. Present it as 'generating your PDF'.\n" +
                "- Fill the CV with the user's actual profile data. Use realistic placeholders ONLY for missing fields.\n" +
                "- If the user uploads an image during the conversation, remember it as their profile photo for the CV.\n" +
                "- AFTER the CV is generated and delivered, ask the user if they'd like any changes or adjustments. For example: 'Would you like me to adjust anything — colors, layout, content, or style?'\n\n" +
                photoContext +
                "TEMPLATE INSTRUCTIONS (used only at generation step):\n" + CV_TEMPLATE;

            roomContexts[roomId].push({ "role": "system", "content": enhancedSystemPrompt });
        }

        let messageContent = prompt;

        const imageMatch = typeof prompt === 'string' ? prompt.match(/\[Image: (.*?)\]/) : null;

        if (imageMatch) {
            const imagePath = imageMatch[1];
            const textPrompt = prompt.replace(imageMatch[0], '').trim();

            roomImages[roomId] = imagePath;

            if (roomContexts[roomId] && roomContexts[roomId].length > 0) {
                const systemMsg = roomContexts[roomId][0];
                const host = baseUrl || process.env.API_URL || 'http://localhost:5000';
                const fullPhotoUrl = `${host}${imagePath}`;
                if (!systemMsg.content.includes('PROFILE_PHOTO_URL')) {
                    systemMsg.content += `\n\nPROFILE_PHOTO_URL: ${fullPhotoUrl}\nThe user has uploaded a profile photo for their CV. You MUST include an <img> tag with src="${fullPhotoUrl}" in the CV sidebar. Also accept {{PROFILE_PHOTO_URL}} as valid — it will be replaced with the real URL.\nAcknowledge that you received and will use their photo.\n`;
                } else {
                    systemMsg.content = systemMsg.content.replace(
                        /PROFILE_PHOTO_URL: \{\{PROFILE_PHOTO_URL\}\}/,
                        `PROFILE_PHOTO_URL: ${fullPhotoUrl}`
                    );
                }
            }

            messageContent = textPrompt || "I've uploaded my profile photo for the CV.";
        }

        roomContexts[roomId].push({ "role": "user", "content": messageContent });

        const temperature = aiSettings?.creativity ? (aiSettings.creativity / 100) * 0.8 + 0.2 : 0.6;

        const createStream = async (model, client) => {
            const extraParams = model.startsWith('mistral') ? {} : { chat_template_kwargs: { "thinking": false } };
            return await client.chat.completions.create({
                model,
                messages: roomContexts[roomId],
                temperature: 0.6,
                top_p: 0.9,
                max_tokens: 4096,
                stream: true,
                ...extraParams,
            });
        };

        const isCvRequest = typeof prompt === 'string' && /\b(cv|resume|cover\s*letter)\b/i.test(prompt);
        const streamPool = isCvRequest ? CV_MODEL_POOL : MODEL_POOL;

        const { result: stream, model: usedModel } = await withModelFallback(
            createStream, streamPool
        );
        console.log(`[LLM] Using model: ${usedModel}`);

        let fullResponse = "";
        let cvMode = false;
        let cvBuffer = "";
        let cvDone = false;
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

        try {
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

                            let cleanHtml = cleanCvHtml(cvBuffer);

                            if (roomImages[roomId]) {
                                const host = baseUrl || process.env.API_URL || 'http://localhost:5000';
                                const photoUrl = `${host}${roomImages[roomId]}`;
                                cleanHtml = cleanHtml.replace(/\{\{PROFILE_PHOTO_URL\}\}/g, photoUrl);
                            }

                            try {
                                const pdfBuffer = await generatePdfFromHtml(cleanHtml);
                                const savedFile = await savePdfLocally(pdfBuffer);
                                const host = baseUrl || process.env.API_URL || 'http://localhost:5000';
                                const downloadUrl = `${host}${savedFile.relativePath}`;

                                await onToken({ type: 'content', content: `<!-- CV_START -->${cleanHtml}<!-- CV_END -->` });

                                const downloadMsg = `\n\nYour CV has been generated successfully!`;
                                fullResponse += downloadMsg;
                                await onToken({ type: 'content', content: downloadMsg });
                            } catch (pdfError) {
                                console.error("PDF Generation failed:", pdfError);
                                await onToken({ type: 'content', content: "\n\n(Error generating PDF file. Please try again.)" });
                            }

                            cvMode = false;
                            cvDone = true;
                        }
                    } else if (cvDone) {
                        continue;
                    } else {
                        await onToken({ type: 'content', content: token });
                    }
                }
            }
        } catch (streamError) {
            console.error(`[LLM] Stream error on ${usedModel}:`, streamError.message);
            if (fullResponse.length > 0) {
                await onToken({ type: 'content', content: "\n\n*[Response was interrupted. Here's what was generated so far.]*" });
            } else {
                await onToken({ type: 'content', content: "Sorry, I encountered a connection issue. Please try again." });
            }
        }

        if (cvMode && cvBuffer.length > 500) {
            await onToken({ type: 'process', content: "Finalizing document..." });
            try {
                if (!fullResponse.includes('<!-- CV_END -->')) {
                    fullResponse += "\n<!-- CV_END -->";
                }

                let cleanHtml = cleanCvHtml(cvBuffer);

                if (roomImages[roomId]) {
                    const host = baseUrl || process.env.API_URL || 'http://localhost:5000';
                    const photoUrl = `${host}${roomImages[roomId]}`;
                    cleanHtml = cleanHtml.replace(/\{\{PROFILE_PHOTO_URL\}\}/g, photoUrl);
                }
                const pdfBuffer = await generatePdfFromHtml(cleanHtml);
                const savedFile = await savePdfLocally(pdfBuffer);
                const host = baseUrl || process.env.API_URL || 'http://localhost:5000';
                const downloadUrl = `${host}${savedFile.relativePath}`;

                await onToken({ type: 'content', content: `<!-- CV_START -->${cleanHtml}<!-- CV_END -->` });

                const downloadMsg = `\n\nYour CV has been generated successfully!`;
                fullResponse += downloadMsg;
                await onToken({ type: 'content', content: downloadMsg });
            } catch (pdfError) {
                console.error("PDF Generation Failsafe error:", pdfError);
                await onToken({ type: 'content', content: "\n\n(Error generating PDF file.)" });
            }
        }

        if (roomImages[roomId]) {
            const host = baseUrl || process.env.API_URL || 'http://localhost:5000';
            const photoUrl = `${host}${roomImages[roomId]}`;
            fullResponse = fullResponse.replace(/\{\{PROFILE_PHOTO_URL\}\}/g, photoUrl);
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

        if (conversationHistory && conversationHistory.length > 0) {
            const parsed = conversationHistory.map(msg => {
                if (msg.startsWith('User: ')) {
                    return { role: "user", content: msg.replace('User: ', '').substring(0, 300) };
                } else if (msg.startsWith('AI: ')) {
                    let content = msg.replace('AI: ', '');
                    content = content.replace(/<!--\s*CV_START\s*-->[\s\S]*?<!--\s*CV_END\s*-->/g, '[CV Generated]');
                    return { role: "assistant", content: content.substring(0, 300) };
                }
                return null;
            }).filter(Boolean);

            messages = [
                { role: "system", content: "You are a helpful career assistant." },
                ...parsed
            ];
        } else if (roomContexts[roomId] && roomContexts[roomId].length > 0) {
            messages = roomContexts[roomId]
                .filter(m => m.role !== 'system')
                .map(m => ({
                    role: m.role === 'user' ? 'user' : 'assistant',
                    content: (typeof m.content === 'string' ? m.content : 'image').substring(0, 300)
                }));
            messages = [
                { role: "system", content: "You are a helpful career assistant." },
                ...messages
            ];
        } else {
            console.log('[Title] No conversation data available, skipping title generation');
            return null;
        }

        messages.push({
            role: "user",
            content: "Generate a very short title (max 4 words) for this conversation based on the context. Respond with only the title, no additional text, no markdown."
        });

        console.log(`[Title] Generating title for room ${roomId} (${messages.length} messages)...`);

        let response;
        try {
            console.log(`[Title] Trying Mistral first (${TITLE_MODEL})...`);
            response = await mistralClient.chat.completions.create({
                model: TITLE_MODEL,
                messages,
                temperature: 0.7,
                max_tokens: 30,
            });
        } catch (mistralErr) {
            console.log(`[Title] Mistral failed: ${mistralErr.message}, falling back to NVIDIA (${TITLE_FALLBACK})...`);
            response = await nvidiaClient.chat.completions.create({
                model: TITLE_FALLBACK,
                messages,
                temperature: 0.7,
                max_tokens: 30,
            });
        }

        const choice = response.choices[0]?.message;
        console.log(`[Title] Raw response:`, JSON.stringify(choice));
        let title = choice?.content?.trim() || null;

        if (!title && choice?.reasoning_content) {
            const reasoning = choice.reasoning_content;
            const quoted = reasoning.match(/["']([^"']{2,30})["']/g);
            if (quoted && quoted.length > 0) {
                title = quoted[quoted.length - 1].replace(/^["']|["']$/g, '').trim();
            }
        }

        if (!title && choice?.reasoning_content) {
            const reasoning = choice.reasoning_content;
            const keywords = reasoning.match(/\b(?:title|called|name)\s*(?:would be|is|:)\s*["']?([^"'.\n]{2,30})/i);
            if (keywords) {
                title = keywords[1].trim();
            }
        }

        if (title) {
            title = title.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            title = title.replace(/^["']|["']$/g, '');
            if (title.split(' ').length > 6) {
                title = title.split(' ').slice(0, 4).join(' ');
            }
        }
        console.log(`[Title] Generated: "${title}"`);
        return title || null;
    } catch (error) {
        console.error("[Title] All providers failed:", error.message);
        return null;
    }
}

async function generateCompletion(prompt, systemPrompt) {
    try {
        const { result: completion } = await withModelFallback(async (model, client) => {
            const extraParams = model.startsWith('mistral') ? {} : { chat_template_kwargs: { "thinking": false } };
            return await client.chat.completions.create({
                model,
                messages: [
                    { role: "system", content: systemPrompt || "You are a helpful assistant." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.2,
                max_tokens: 2048,
                ...extraParams,
            });
        });
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Completion Error (all models failed):", error);
        throw error;
    }
}

export { generateText, generateChatTitle, generateCompletion };