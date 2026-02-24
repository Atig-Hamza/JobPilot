import https from 'https';
import http from 'http';

/**
 * Fetch JSON from a URL (no external dependency needed).
 */
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, { headers: { 'User-Agent': 'JobPilot/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => (data += chunk));
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        }).on('error', reject);
    });
}

/**
 * Search for images using Wikimedia Commons API.
 * Completely free, no API key required.
 *
 * @param {string} query  – search terms
 * @param {number} limit  – max results (default 3)
 * @returns {Promise<Array<{url, thumb, title, width, height, source}>>}
 */
export async function searchImages(query, limit = 3) {
    try {
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return [];
        }

        const encodedQuery = encodeURIComponent(query.trim());

        // Use Wikimedia Commons API to search for images
        const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodedQuery}&gsrlimit=${limit + 5}&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=800&format=json&origin=*`;

        const data = await fetchJSON(apiUrl);

        if (!data.query || !data.query.pages) {
            return [];
        }

        const pages = Object.values(data.query.pages);

        const images = pages
            .filter(page => {
                const info = page.imageinfo?.[0];
                if (!info) return false;
                // Only include actual images (not SVGs, PDFs, etc. unless they're small SVGs)
                const mime = info.mime || '';
                return mime.startsWith('image/') && !mime.includes('svg') && !mime.includes('tiff');
            })
            .slice(0, limit)
            .map(page => {
                const info = page.imageinfo[0];
                const meta = info.extmetadata || {};
                return {
                    url: info.thumburl || info.url,
                    fullUrl: info.url,
                    title: (meta.ObjectName?.value || page.title || '').replace(/^File:/, '').replace(/\.\w+$/, ''),
                    width: info.thumbwidth || info.width,
                    height: info.thumbheight || info.height,
                    source: 'Wikimedia Commons',
                    license: meta.LicenseShortName?.value || 'CC',
                    description: meta.ImageDescription?.value?.replace(/<[^>]*>/g, '').substring(0, 150) || '',
                };
            });

        return images;
    } catch (error) {
        console.error('[ImageService] Search failed:', error.message);
        return [];
    }
}
