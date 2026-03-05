import * as JOPService from '../services/JOPService.js';
import { spendUserCredits } from '../services/userService.js';
import { saveChatInteraction } from "../services/historyService.js";
import { AppError } from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const crawlCompanies = catchAsync(async (req, res) => {
    const { keywords, country, limit, roomId, includeRecruiterEmails } = req.body;

    if (!req.user || !req.user.id) {
        return res.status(400).send({ error: "User information is required." });
    }
    const creditSpent = await spendUserCredits(req.user.id, 70);
    if (!creditSpent) {
        return res.status(402).send({ error: "Insufficient credits." });
    }

    if (!keywords) {
        throw new AppError('Keywords are required', 400);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let accumulatedResponse = "";

    try {
        const stream = JOPService.processSearchWithAI({
            keywords,
            country: country || 'Global',
            limit: limit || 12,
            includeRecruiterEmails: !!includeRecruiterEmails
        });

        for await (const chunk of stream) {
            if (chunk.type === 'markdown') {
                accumulatedResponse += chunk.content;
            }
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }

        if (roomId && accumulatedResponse) {
            await saveChatInteraction(req.user.id, roomId, keywords, accumulatedResponse);
        }

    } catch (error) {
        console.error('Streaming error:', error);
        res.write(`data: ${JSON.stringify({
            type: 'error',
            message: 'Internal processing error occurred.'
        })}\n\n`);
    } finally {
        res.end();
    }
});
