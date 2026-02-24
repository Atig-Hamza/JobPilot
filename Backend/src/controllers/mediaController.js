import { searchYouTube } from '../services/youtubeService.js';
import { searchImages } from '../services/imageService.js';

export async function handleYouTubeSearch(req, res) {
    try {
        const { q, limit } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({ status: 'error', message: 'Query parameter "q" is required.' });
        }

        const videos = await searchYouTube(q, parseInt(limit) || 3);

        return res.status(200).json({
            status: 'success',
            data: { videos },
        });
    } catch (error) {
        console.error('[MediaController] YouTube search error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to search YouTube.' });
    }
}

export async function handleImageSearch(req, res) {
    try {
        const { q, limit } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({ status: 'error', message: 'Query parameter "q" is required.' });
        }

        const images = await searchImages(q, parseInt(limit) || 3);

        return res.status(200).json({
            status: 'success',
            data: { images },
        });
    } catch (error) {
        console.error('[MediaController] Image search error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to search images.' });
    }
}
