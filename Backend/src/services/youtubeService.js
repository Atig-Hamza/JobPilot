import yts from 'yt-search';

/**
 * Search YouTube videos without an API key.
 * Uses the yt-search package which scrapes YouTube search results.
 *
 * @param {string} query  – search terms
 * @param {number} limit  – max results (default 3)
 * @returns {Promise<Array<{id, title, url, thumbnail, duration, views, author, ago}>>}
 */
export async function searchYouTube(query, limit = 3) {
    try {
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return [];
        }

        const result = await yts(query.trim());

        if (!result || !result.videos || result.videos.length === 0) {
            return [];
        }

        return result.videos.slice(0, limit).map(video => ({
            id: video.videoId,
            title: video.title,
            url: video.url,
            thumbnail: video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
            duration: video.timestamp,
            views: video.views,
            author: video.author?.name || '',
            ago: video.ago || '',
        }));
    } catch (error) {
        console.error('[YouTubeService] Search failed:', error.message);
        return [];
    }
}
