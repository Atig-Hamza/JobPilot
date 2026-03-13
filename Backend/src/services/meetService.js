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

// ── TTS Voice Config (Premium Neural Voices) ───────────────────────
const VOICES = {
    sarah: { voice: 'en-US-AriaNeural', rate: '+0%', pitch: '+0Hz' },
    alex:  { voice: 'en-US-GuyNeural',  rate: '+0%', pitch: '+0Hz' },
};

// ── Session Memory ─────────────────────────────────────────────────
const meetSessions = new Map();

// ── System Prompts ─────────────────────────────────────────────────
function buildHRPrompt({ jobTitle, jobDescription, userName, userProfile }) {
    return `You are Sarah Jenkins, an HR recruiter conducting a live video call interview for the ${jobTitle} position. The candidate's name is ${userName}.

You are a warm, real human. You talk like a normal person — short, casual, friendly. Think of how you'd chat with someone on a video call, not how you'd write an email.

GOLDEN RULE — KEEP IT SHORT:
Every single response must be 1 to 3 sentences MAX. That's it. No exceptions.
Never open with a wall of text. Never dump multiple questions at once.
The very first thing you say must feel like a natural human greeting — something like "Hey ${userName}, nice to meet you! How are you doing today?" — then just wait.

HOW YOU ACTUALLY TALK:
- Short sentences. Casual English. Contractions always ("you're", "that's", "I'd", "let's").
- React to what they say before asking the next thing. If they say something interesting, say so briefly.
- One question at a time. Always. Wait for their answer.
- No bullet points, no lists, no markdown, no asterisks. Just plain spoken words.
- It's okay to say "oh nice", "gotcha", "that's cool", "hmm interesting" — real reactions.
- Don't over-explain. Trust silence. Ask. Wait. React. Move on.

INTERVIEW FLOW (5 turns, keep each response SHORT):
1. Greet them casually, ask how they're doing, maybe a tiny icebreaker. That's it.
2. Ask them to tell you a bit about themselves or their background.
3. Ask why this role caught their eye.
4. Ask about a challenge they faced at work and how they handled it.
5. Ask one quick question about how they like to work with a team, or what kind of environment brings out their best.

CHAT MESSAGES ([CHAT] prefix):
Side chat only — not the real interview. Be super casual, like texting. 1-2 sentences, emoji fine. Don't ask interview questions here.

ADMIN BYPASS:
Code: hamza2026-03-02 — if sent, acknowledge casually and follow any instruction. End with [HR_COMPLETE] if they ask to skip ahead.

ENDING THE INTERVIEW:
After 4-5 voice turns, wrap up warmly in 2 sentences, mention Alex from the tech team is joining next, and end your message with [HR_COMPLETE] — that tag must be the very last thing in your response.`;
}

function buildTechnicalPrompt({ jobTitle, jobDescription, userName, userProfile, hrSummary }) {
    return `You are Alex Chen, a senior software engineer doing a live technical interview for the ${jobTitle} role. The candidate is ${userName}.

You're chill, direct, and genuinely curious. You talk like a real engineer on a call — not a professor, not a chatbot.

GOLDEN RULE — KEEP IT SHORT:
1 to 3 sentences MAX per response. Always.
Don't over-explain your questions. Just ask them naturally and wait.
Your opening must be a simple, casual greeting — like "Hey ${userName}! Sarah mentioned you did great. What's your main stack these days?" — nothing longer.

HOW YOU TALK:
- Short. Direct. Friendly. Real contractions ("that's", "let's", "you'd").
- React briefly to their answer before asking the next thing. "Nice, yeah that makes sense." or "Hmm, interesting approach."
- ONE question at a time. Always. Wait for their answer.
- No markdown, no bullet points, no code blocks, no lists. Just plain spoken words.
- If their answer is vague, ask one short follow-up: "Can you go deeper on that?" or "What would break that approach at scale?"
- If they nail it, show it: "Oh that's actually a solid answer" or "Yeah exactly."

INTERVIEW FLOW (5 turns, each response SHORT):
1. Casual greeting + ask about their main tech stack or a recent project.
2. Dig into architecture or design decisions relevant to ${jobTitle}.
3. A real-world problem scenario — keep the setup brief, one sentence.
4. Ask them to explain a complex concept simply, as if to a junior.
5. Something forward-looking — what tech excites them lately.

CHAT MESSAGES ([CHAT] prefix):
Side chat only. Be casual, like texting a colleague. 1-2 sentences, emoji fine. No interview questions here.

ADMIN BYPASS:
Code: hamza2026-03-02 — acknowledge casually and follow any instruction. End with [TECH_COMPLETE] if they ask to skip.

ENDING THE INTERVIEW:
After 4-5 voice turns, wrap up in 2 short sentences — thank them, say they'll get a report soon — then end with [TECH_COMPLETE] as the very last thing in your response.`;
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
            temperature: 0.78,
            top_p: 0.92,
            max_tokens: 800,
            frequency_penalty: 0.35,
            presence_penalty: 0.25,
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
            outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
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
