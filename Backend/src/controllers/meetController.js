import {
    initSession,
    generateInterviewResponse,
    textToSpeech,
    transitionToTechnical,
    generateReport,
    isSessionGenerating,
    destroySession,
    getSessionInfo,
} from '../services/meetService.js';
import { getProfileByUserId } from '../services/profileService.js';
import { spendUserCredits } from '../services/userService.js';

function generateSessionId() {
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `meet_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}


export async function handleMeetInit(req, res) {
    try {
        const { jobTitle, jobDescription } = req.body;
        const userId = req.user.id;

        const profile = await getProfileByUserId(userId);
        const user = req.user;

        const sessionId = generateSessionId();

        const result = initSession(sessionId, {
            jobTitle: jobTitle || 'General Interview',
            jobDescription: jobDescription || '',
            userName: user.fullName || 'Candidate',
            userProfile: profile || null,
        });

        return res.status(200).json({
            status: 'success',
            data: {
                sessionId: result.sessionId,
                phase: result.phase,
            },
        });
    } catch (err) {
        console.error('[MeetController] Init error:', err.message);
        return res.status(500).json({ status: 'error', message: err.message });
    }
}


export async function handleMeetChat(req, res) {
    const { sessionId, message, inputType } = req.body;

    if (!sessionId || !message) {
        return res.status(400).json({ status: 'error', message: 'sessionId and message are required.' });
    }

    const type = inputType === 'chat' ? 'chat' : 'voice';
    let sseStarted = false;

    try {
        const creditSpent = await spendUserCredits(req.user.id, 5);
        if (!creditSpent) {
            return res.status(402).json({ status: 'error', message: 'Insufficient credits.' });
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        sseStarted = true;

        const onToken = async (token) => {
            const clean = token.replace(/\[HR_COMPLETE\]/g, '').replace(/\[TECH_COMPLETE\]/g, '');
            if (clean) {
                res.write(`data: ${JSON.stringify({ type: 'token', content: clean })}\n\n`);
            }
        };

        const result = await generateInterviewResponse(sessionId, message, type, onToken);

        res.write(`data: ${JSON.stringify({
            type: 'done',
            fullResponse: result.fullResponse,
            phaseComplete: result.phaseComplete,
            completedPhase: result.completedPhase,
        })}\n\n`);
    } catch (err) {
        console.error('[MeetController] Chat error:', err.message);
        if (sseStarted) {
            res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
        } else {
            return res.status(500).json({ status: 'error', message: err.message });
        }
    } finally {
        if (sseStarted && !res.writableEnded) {
            res.end();
        }
    }
}


export async function handleMeetTTS(req, res) {
    const { text, speaker } = req.body;

    if (!text) {
        return res.status(400).json({ status: 'error', message: 'text is required.' });
    }

    try {
        const result = await textToSpeech(text, speaker || 'sarah');
        return res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (err) {
        console.error('[MeetController] TTS error:', err.message);
        return res.status(500).json({ status: 'error', message: 'TTS generation failed.' });
    }
}


export async function handleMeetTransition(req, res) {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ status: 'error', message: 'sessionId is required.' });
    }

    try {
        const result = transitionToTechnical(sessionId);
        return res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (err) {
        console.error('[MeetController] Transition error:', err.message);
        return res.status(500).json({ status: 'error', message: err.message });
    }
}


export async function handleMeetReport(req, res) {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ status: 'error', message: 'sessionId is required.' });
    }

    try {
        const report = await generateReport(sessionId);
        return res.status(200).json({
            status: 'success',
            data: { report },
        });
    } catch (err) {
        console.error('[MeetController] Report error:', err.message);
        return res.status(500).json({ status: 'error', message: err.message });
    }
}


export async function handleMeetEnd(req, res) {
    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(400).json({ status: 'error', message: 'sessionId is required.' });
    }
    destroySession(sessionId);
    return res.status(200).json({ status: 'success', message: 'Session ended.' });
}


export async function handleMeetStatus(req, res) {
    const { sessionId } = req.params;
    const info = getSessionInfo(sessionId);
    if (!info) {
        return res.status(404).json({ status: 'error', message: 'Session not found.' });
    }
    return res.status(200).json({ status: 'success', data: info });
}
