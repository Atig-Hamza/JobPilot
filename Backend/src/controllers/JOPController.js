import * as JOPService from '../services/JOPService.js';
import { AppError } from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const crawlCompanies = catchAsync(async (req, res) => {
    const { keywords, country, limit } = req.body;

    if (!keywords) {
        throw new AppError('Keywords are required', 400);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
        const stream = JOPService.processSearchWithAI({ 
            keywords, 
            country: country || 'Global', 
            limit: limit || 12 
        });

        for await (const chunk of stream) {
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
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
