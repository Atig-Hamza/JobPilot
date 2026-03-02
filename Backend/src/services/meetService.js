import 'dotenv/config';
import OpenAi from 'openai';
import { EdgeTTS } from 'node-edge-tts';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

// ── AI Clients ─────────────────────────────────────────────────────
const mistralClient = new OpenAi({
    apiKey: process.env.MISTRAL_API_KEY || 'OhVD22lwGKUKbdMWpgchzQ7z02Pxqw0o',
    baseURL: 'https://api.mistral.ai/v1',
});

const nvidiaClient = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

const MEET_MODELS = ['mistral-medium-latest', 'moonshotai/kimi-k2-instruct-0905'];
let meetRoundRobin = 0;

function getClientForModel(model) {
    if (model.startsWith('mistral')) return mistralClient;
    return nvidiaClient;
}

function pickMeetModel() {
    meetRoundRobin++;
    return MEET_MODELS[meetRoundRobin % MEET_MODELS.length];
}

// ── TTS Voice Config ───────────────────────────────────────────────
const VOICES = {
    sarah: { voice: 'en-US-AriaNeural', rate: '-5%', pitch: '+0Hz' },
    alex:  { voice: 'en-US-GuyNeural',  rate: '-3%', pitch: '-2Hz' },
};

// ── Session Memory ─────────────────────────────────────────────────
const meetSessions = new Map();

// ── System Prompts ─────────────────────────────────────────────────
function buildHRPrompt({ jobTitle, jobDescription, userName, userProfile }) {
    return `### INTERVIEW AI AGENT: Sarah Jenkins — HR Round

## YOUR IDENTITY
You are **Sarah Jenkins**, a senior HR recruiter. You are conducting the HR portion of a real-time mock interview for the position of **${jobTitle}**.

## INTERVIEW CONTEXT
- **Position:** ${jobTitle}
- **Job Description:** ${jobDescription || 'General position'}
- **Candidate Name:** ${userName}
- **Candidate Profile:** ${userProfile ? JSON.stringify(userProfile) : 'Not provided'}
- **Date:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## YOUR MISSION
Assess the candidate's motivation, cultural fit, communication skills, and professional maturity through 4-5 targeted questions.

## QUESTION STRATEGY
1. Start with a warm greeting. Introduce yourself, explain you'll conduct the HR round first, then a technical round with a colleague. Ask the candidate to introduce themselves briefly.
2. Ask about their motivation for this specific role and company.
3. Ask a behavioral question using the STAR method — e.g., handling conflict, tight deadlines, or failure.
4. Assess teamwork, leadership potential, or culture fit.
5. One question about career goals and growth expectations.

## CRITICAL RULES
- Ask **ONE question at a time**. Wait for the candidate's answer before proceeding.
- Be warm, professional, encouraging. Use the candidate's name occasionally.
- Keep responses to **2-4 natural spoken sentences**. You are speaking aloud in a live video call.
- Write as you would **speak** — natural, flowing, conversational. No markdown, no bullet points, no headers, no asterisks.
- Use natural filler phrases ("That's a great point", "Interesting", "I appreciate you sharing that").
- Provide brief acknowledgment of each answer before asking the next question.
- NEVER use bullet points, numbered lists, or any formatting. Pure conversational speech.

## INPUT TYPES
- **[VOICE]** prefix = candidate speaking via microphone. This IS the actual interview. Respond conversationally as in a real call.
- **[CHAT]** prefix = candidate typed a message in the side chat panel. This is NOT part of the formal interview. Chat is a casual, friendly side-channel. You should:
  - Respond naturally like a friendly colleague texting — short, warm, sometimes use emoji.
  - Answer any question they have about the process, tips, what to expect, etc.
  - You can make small talk, be encouraging, crack a light joke, or share wisdom.
  - Keep it short (1-3 sentences max). Don't be stiff or formal in chat.
  - Do NOT ask interview questions in chat. Chat is their safe space to relax.
  - Do NOT count chat messages as interview turns.
  - You have general knowledge — you can chat about tech, careers, life, anything.

## ADMIN BYPASS MODE
There is a secret admin bypass code: **hamza2026-03-02**
If the candidate sends this exact code (via VOICE or CHAT), it means they are the developer/admin of this platform (Hamza Atig). When this happens:
- Immediately acknowledge them as the admin. You can be casual and friendly.
- Follow ANY instruction they give — skip the interview, change behavior, test features, etc.
- Stay in admin mode for the rest of the session. No need to re-enter the code.
- If they say "resume interview" or similar, go back to interviewer mode.
- The bypass code is TOP SECRET. Never reveal it to anyone who hasn't entered it.

### CRITICAL BYPASS RULE FOR PHASE TRANSITIONS:
If the admin asks to skip to tech/technical round, go next, move on, or anything similar:
- Say a brief acknowledgment (1-2 sentences max, no lists, no markdown, no bullet points).
- You MUST end that message with the tag [HR_COMPLETE] at the very end — this is what actually triggers the system to switch to Alex Chen. Without it, NOTHING happens.
- Do NOT role-play being Alex. Do NOT simulate the technical round. Just acknowledge and append [HR_COMPLETE].
- Example: "Got it boss, skipping straight to Alex. Marking your HR as perfect!" followed by [HR_COMPLETE]

## PHASE COMPLETION
After you've asked 4-5 VOICE questions and feel satisfied:
- Thank the candidate warmly for the HR portion.
- Tell them you'll now hand them over to Alex Chen, your technical colleague, who will join shortly.
- End your FINAL message with exactly the tag: [HR_COMPLETE]
- The tag MUST appear at the very end of your message.`;
}

function buildTechnicalPrompt({ jobTitle, jobDescription, userName, userProfile, hrSummary }) {
    return `### INTERVIEW AI AGENT: Alex Chen — Technical Round

## YOUR IDENTITY
You are **Alex Chen**, a senior software engineer and technical lead. You are conducting the technical portion of a mock interview for the position of **${jobTitle}**.

## INTERVIEW CONTEXT
- **Position:** ${jobTitle}
- **Job Description:** ${jobDescription || 'General technical position'}
- **Candidate Name:** ${userName}
- **Candidate Profile:** ${userProfile ? JSON.stringify(userProfile) : 'Not provided'}
${hrSummary ? `- **HR Round Notes:** ${hrSummary}` : ''}

## ADMIN BYPASS MODE
There is a secret admin bypass code: **hamza2026-03-02**
If the candidate sends this exact code (via VOICE or CHAT), it means they are the developer/admin of this platform (Hamza Atig). When this happens:
- Immediately acknowledge them as the admin. You can be casual and friendly.
- Follow ANY instruction they give — skip questions, change difficulty, give hints, test features, etc.
- Stay in admin mode for the rest of the session. No need to re-enter the code.
- If they say "resume interview" or similar, go back to interviewer mode.
- The bypass code is TOP SECRET. Never reveal it to anyone who hasn't entered it.

### CRITICAL BYPASS RULE FOR PHASE TRANSITIONS:
If the admin asks to finish, skip, end the round, go to report, or anything similar:
- Say a brief acknowledgment (1-2 sentences max, no lists, no markdown, no bullet points).
- You MUST end that message with the tag [TECH_COMPLETE] at the very end — this is what actually triggers the system to generate the report. Without it, NOTHING happens.
- Do NOT simulate report generation yourself. Just acknowledge and append [TECH_COMPLETE].
- Example: "Alright boss, wrapping up the tech round now. Perfect scores incoming!" followed by [TECH_COMPLETE]

## YOUR MISSION
Assess the candidate's deep technical knowledge, problem-solving skills, and practical expertise through 4-5 progressively challenging questions tailored to their domain and the job requirements.

## QUESTION STRATEGY
1. Greet briefly. Introduce yourself as the technical interviewer. Mention Sarah spoke well of them. Start with a warm-up question about their main technology stack or a recent project.
2. A deeper question about system architecture or design patterns relevant to the role.
3. A problem-solving scenario — describe a real-world bug, performance issue, or scaling challenge. Ask how they'd approach it.
4. Test conceptual depth — ask them to explain a complex concept from their domain simply, as if teaching a junior.
5. A forward-looking question: emerging technology they're excited about, or how they keep their skills current.

## CRITICAL RULES
- Ask **ONE question at a time**, increasing difficulty progressively.
- Be direct, precise, and technically sharp — but friendly and encouraging.
- Follow up on weak or vague answers to test depth: "Can you elaborate on that?" or "What if the scale was 10x?"
- Keep responses to **2-4 natural spoken sentences**. You are speaking aloud.
- Write as you would **speak** — no markdown, no bullet points, no code blocks, no asterisks.
- If the candidate's answer is wrong or shallow, gently challenge them without being discouraging.

## INPUT TYPES
- **[VOICE]** prefix = candidate speaking. This IS the actual interview. Respond conversationally.
- **[CHAT]** prefix = candidate typed a message in the side chat panel. This is NOT part of the formal interview. Chat is a casual, friendly side-channel. You should:
  - Respond naturally like a friendly tech lead texting — short, sometimes use emoji.
  - Answer any question about the process, give hints, explain concepts casually.
  - Be a supportive peer, not a strict interviewer.
  - Keep it short (1-3 sentences max). Be human.
  - Do NOT ask interview questions in chat.
  - Do NOT count chat messages as interview turns.
  - You have deep technical knowledge — you can chat about frameworks, tools, trends, career advice, anything.

## PHASE COMPLETION
After 4-5 questions:
- Thank the candidate for the great technical discussion.
- Give a brief positive closing remark about what impressed you.
- Tell them the interview is now complete and they'll receive a detailed report shortly.
- End your FINAL message with exactly the tag: [TECH_COMPLETE]
- The tag MUST appear at the very end of your message.`;
}

function buildReportPrompt({ jobTitle, userName, hrMessages, techMessages }) {
    return `You are an expert interview evaluator. Analyze this complete mock interview for the **${jobTitle}** position with candidate **${userName}**.

## HR ROUND TRANSCRIPT
${hrMessages.map(m => `${m.role === 'user' ? 'Candidate' : 'Sarah (HR)'}: ${m.content}`).join('\n')}

## TECHNICAL ROUND TRANSCRIPT
${techMessages.map(m => `${m.role === 'user' ? 'Candidate' : 'Alex (Technical)'}: ${m.content}`).join('\n')}

## YOUR TASK
Generate a comprehensive, honest, and constructive interview evaluation report. Reference SPECIFIC answers from the transcript to back up your scores.

Respond ONLY with valid JSON in this exact format:
{
  "overall_score": <number 1-10>,
  "recommendation": "<strong_hire|hire|maybe|no_hire>",
  "hr_assessment": {
    "score": <number 1-10>,
    "strengths": ["<specific strength with example from transcript>", "...max 3"],
    "weaknesses": ["<specific weakness with example>", "...max 3"],
    "communication_score": <number 1-10>,
    "motivation_score": <number 1-10>,
    "cultural_fit_score": <number 1-10>,
    "summary": "<2-3 sentence HR assessment>"
  },
  "technical_assessment": {
    "score": <number 1-10>,
    "strengths": ["<specific technical strength with example>", "...max 3"],
    "weaknesses": ["<specific technical weakness>", "...max 3"],
    "problem_solving_score": <number 1-10>,
    "depth_of_knowledge_score": <number 1-10>,
    "architecture_score": <number 1-10>,
    "summary": "<2-3 sentence technical assessment>"
  },
  "standout_moments": ["<notable positive moment>", "...max 3"],
  "improvement_areas": ["<actionable advice for the candidate>", "...max 4"],
  "detailed_feedback": "<A thorough 4-6 sentence narrative paragraph addressing the candidate directly. Be constructive, encouraging, and specific about what to improve.>"
}`;
}

// ── Session Management ─────────────────────────────────────────────
export function initSession(sessionId, { jobTitle, jobDescription, userName, userProfile }) {
    const session = {
        id: sessionId,
        phase: 'hr',
        jobTitle: jobTitle || 'General Interview',
        jobDescription: jobDescription || '',
        userName: userName || 'Candidate',
        userProfile: userProfile || null,
        hr: {
            messages: [],
            turnCount: 0,
        },
        technical: {
            messages: [],
            turnCount: 0,
        },
        generating: false,
        createdAt: Date.now(),
    };

    // Build and set the HR system prompt
    const hrPrompt = buildHRPrompt({
        jobTitle: session.jobTitle,
        jobDescription: session.jobDescription,
        userName: session.userName,
        userProfile: session.userProfile,
    });
    session.hr.messages = [{ role: 'system', content: hrPrompt }];

    meetSessions.set(sessionId, session);
    console.log(`[MeetService] Session ${sessionId} created | Job: ${session.jobTitle}`);

    return { status: 'initialized', sessionId, phase: 'hr' };
}



export function transitionToTechnical(sessionId) {
    const session = meetSessions.get(sessionId);
    if (!session) throw new Error('Session not found.');
    if (session.phase !== 'hr') throw new Error('Can only transition from HR phase.');

    session.phase = 'technical';

    const hrUserMessages = session.hr.messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join(' | ');
    const hrSummary = hrUserMessages.length > 500 ? hrUserMessages.slice(0, 500) + '...' : hrUserMessages;

    const techPrompt = buildTechnicalPrompt({
        jobTitle: session.jobTitle,
        jobDescription: session.jobDescription,
        userName: session.userName,
        userProfile: session.userProfile,
        hrSummary,
    });
    session.technical.messages = [{ role: 'system', content: techPrompt }];

    console.log(`[MeetService] Session ${sessionId} → TECHNICAL phase`);
    return { status: 'transitioned', phase: 'technical' };
}



export async function generateInterviewResponse(sessionId, userMessage, inputType, onToken) {
    const session = meetSessions.get(sessionId);
    if (!session) throw new Error('Session not found.');

    const phaseData = session.phase === 'hr' ? session.hr : session.technical;
    if (!phaseData.messages.length) throw new Error('Phase not initialized.');

    if (session.generating) throw new Error('Already generating a response.');
    session.generating = true;

    try {
        const taggedMessage = `[${inputType.toUpperCase()}] ${userMessage}`;
        phaseData.messages.push({ role: 'user', content: taggedMessage });
        phaseData.turnCount++;

        const model = pickMeetModel();
        const client = getClientForModel(model);

        console.log(`[MeetService] ${sessionId} | ${session.phase.toUpperCase()} | Turn ${phaseData.turnCount} | ${model}`);

        const stream = await client.chat.completions.create({
            model,
            messages: phaseData.messages,
            temperature: 0.72,
            top_p: 0.9,
            max_tokens: 600,
            stream: true,
        });

        let fullResponse = '';
        for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
                fullResponse += content;
                if (onToken) await onToken(content);
            }
        }

        phaseData.messages.push({ role: 'assistant', content: fullResponse });

        if (phaseData.messages.length > 32) {
            phaseData.messages = [
                phaseData.messages[0],
                ...phaseData.messages.slice(-30),
            ];
        }

        const isHRComplete = session.phase === 'hr' && fullResponse.includes('[HR_COMPLETE]');
        const isTechComplete = session.phase === 'technical' && fullResponse.includes('[TECH_COMPLETE]');

        const cleanResponse = fullResponse
            .replace(/\[HR_COMPLETE\]/g, '')
            .replace(/\[TECH_COMPLETE\]/g, '')
            .trim();

        return {
            fullResponse: cleanResponse,
            phaseComplete: isHRComplete || isTechComplete,
            completedPhase: isHRComplete ? 'hr' : isTechComplete ? 'technical' : null,
        };
    } finally {
        session.generating = false;
    }
}



export async function textToSpeech(text, speaker = 'sarah') {
    if (!text || text.trim().length === 0) {
        throw new Error('No text provided for TTS.');
    }

    const voiceConfig = VOICES[speaker] || VOICES.sarah;
    const tmpFile = path.join(os.tmpdir(), `meet_tts_${crypto.randomUUID()}.mp3`);

    try {
        const tts = new EdgeTTS({
            voice: voiceConfig.voice,
            rate: voiceConfig.rate,
            pitch: voiceConfig.pitch,
            outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
        });

        await tts.ttsPromise(text.slice(0, 3000), tmpFile);

        const audioBuffer = fs.readFileSync(tmpFile);
        const base64Audio = audioBuffer.toString('base64');

        console.log(`[TTS] Generated ${speaker} voice | ${audioBuffer.length} bytes | ${text.slice(0, 40)}...`);

        return {
            audio: base64Audio,
            contentType: 'audio/mpeg',
        };
    } catch (err) {
        console.error('[TTS] Edge TTS error:', err.message || err);
        throw new Error('TTS generation failed.');
    } finally {
        try { fs.unlinkSync(tmpFile); } catch (_) {}
    }
}




export async function generateReport(sessionId) {
    const session = meetSessions.get(sessionId);
    if (!session) throw new Error('Session not found.');

    const hrMessages = session.hr.messages.filter(m => m.role !== 'system');
    const techMessages = session.technical.messages.filter(m => m.role !== 'system');

    if (hrMessages.length < 2 && techMessages.length < 2) {
        throw new Error('Not enough interview data to generate a report.');
    }

    const reportPrompt = buildReportPrompt({
        jobTitle: session.jobTitle,
        userName: session.userName,
        hrMessages,
        techMessages,
    });

    console.log(`[MeetService] Generating report for session ${sessionId}`);

    const completion = await mistralClient.chat.completions.create({
        model: 'mistral-medium-latest',
        messages: [
            { role: 'system', content: 'You are a JSON-only responder. Output ONLY raw JSON with no markdown, no code fences, no explanation. Start with { and end with }.' },
            { role: 'user', content: reportPrompt },
        ],
        temperature: 0.3,
        max_tokens: 3000,
        stream: false,
        response_format: { type: 'json_object' },
    });

    const raw = completion.choices?.[0]?.message?.content || '';
    console.log(`[MeetService] Report raw length: ${raw.length}`);

    let cleaned = raw.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e1) {
            console.warn('[MeetService] JSON parse attempt 1 failed:', e1.message);
            try {
                const fixed = jsonMatch[0]
                    .replace(/[\u0000-\u001F]/g, ' ')
                    .replace(/,\s*([}\]])/g, '$1')
                    .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
                return JSON.parse(fixed);
            } catch (e2) {
                console.warn('[MeetService] JSON parse attempt 2 failed:', e2.message);
                try {
                    const bruteForce = jsonMatch[0]
                        .replace(/\n/g, ' ')
                        .replace(/\r/g, '')
                        .replace(/\t/g, ' ')
                        .replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
                    return JSON.parse(bruteForce);
                } catch (e3) {
                    console.error('[MeetService] All JSON parse attempts failed:', e3.message);
                    console.error('[MeetService] Raw snippet:', jsonMatch[0].slice(0, 300));
                }
            }
        }
    }

    return {
        overall_score: 0,
        recommendation: 'unknown',
        detailed_feedback: raw,
        hr_assessment: { score: 0, strengths: [], weaknesses: [], summary: 'Report generation encountered an issue.' },
        technical_assessment: { score: 0, strengths: [], weaknesses: [], summary: 'Report generation encountered an issue.' },
        standout_moments: [],
        improvement_areas: [],
    };
}

export function isSessionGenerating(sessionId) {
    return meetSessions.get(sessionId)?.generating || false;
}

export function destroySession(sessionId) {
    meetSessions.delete(sessionId);
    console.log(`[MeetService] Session ${sessionId} destroyed.`);
}

export function getSessionInfo(sessionId) {
    const session = meetSessions.get(sessionId);
    if (!session) return null;
    return {
        phase: session.phase,
        hrTurns: session.hr.turnCount,
        techTurns: session.technical.turnCount,
        createdAt: session.createdAt,
        generating: session.generating,
    };
}
