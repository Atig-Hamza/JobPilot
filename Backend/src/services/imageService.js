import https from 'https';
import http from 'http';

// ── Configuration ─────────────────────────────────────────────────
const REQUEST_TIMEOUT_MS = 8000; // 8s per source
const USER_AGENT = 'JobPilot/2.0 (Career Assistant; contact@jobpilot.app)';

/**
 * Fetch JSON from a URL with timeout, redirect handling, and error resilience.
 */
function fetchJSON(url, timeoutMs = REQUEST_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;

        const req = client.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
            // Follow redirects (3xx)
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                fetchJSON(res.headers.location, timeoutMs).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) {
                res.resume();
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }
            let data = '';
            res.on('data', chunk => (data += chunk));
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch {
                    reject(new Error('Invalid JSON'));
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(timeoutMs, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

// ── Query Optimizer ───────────────────────────────────────────────
/**
 * Optimizes search queries for better contextual image results.
 * Keeps the meaningful parts, strips noise, and adds context hints.
 */
function optimizeQuery(rawQuery) {
    if (!rawQuery || typeof rawQuery !== 'string') return '';

    let q = rawQuery.trim();

    // Remove filler words that don't help image search
    const fillers = [
        /\b(how to|what is|why do|when to|where to|who is|which|example of|examples of)\b/gi,
        /\b(please|help|show me|find me|search for|get me|give me|i need|i want)\b/gi,
        /\b(very|really|just|also|even|actually|basically)\b/gi,
    ];
    for (const filler of fillers) {
        q = q.replace(filler, '');
    }

    // Collapse whitespace
    q = q.replace(/\s+/g, ' ').trim();

    // If cleaned query is too short, fall back to original
    if (q.length < 3) return rawQuery.trim();

    // Cap at 80 chars for API efficiency
    if (q.length > 80) q = q.substring(0, 80).trim();

    return q;
}

// ══════════════════════════════════════════════════════════════════
// ── SOURCE 1: Openverse API (FREE, NO KEY, BEST CONTEXTUAL) ─────
// ══════════════════════════════════════════════════════════════════
/**
 * Openverse (by WordPress/Automattic) aggregates CC-licensed images
 * from Flickr, Wikimedia, and dozens of other sources. It has
 * excellent search relevance and returns contextually matched images.
 * 
 * ✅ No API key required
 * ✅ Great search relevance (title, tags, description matching)
 * ✅ High-quality photos from real sources
 */
async function searchOpenverse(query, limit = 4) {
    const encoded = encodeURIComponent(query);

    const apiUrl =
        `https://api.openverse.org/v1/images/` +
        `?q=${encoded}` +
        `&page_size=${limit + 6}` +
        `&mature=false`;

    const data = await fetchJSON(apiUrl);

    if (!data.results || data.results.length === 0) return [];

    return data.results
        .filter(item => {
            // Only photos with reasonable dimensions
            if (!item.url) return false;
            if (item.height && item.width && (item.height < 100 || item.width < 100)) return false;
            return true;
        })
        .slice(0, limit)
        .map(item => ({
            url: item.thumbnail || item.url,
            fullUrl: item.url,
            title: cleanTitle(item.title) || query,
            width: item.width || 800,
            height: item.height || 600,
            source: capitalizeSource(item.source || item.provider || 'Openverse'),
            license: item.license ? item.license.toUpperCase() : 'CC',
            description: item.attribution
                ? item.attribution.replace(/<[^>]*>/g, '').substring(0, 120)
                : '',
        }));
}

// ══════════════════════════════════════════════════════════════════
// ── SOURCE 2: Wikimedia Commons (FREE, NO KEY, CONTEXTUAL) ──────
// ══════════════════════════════════════════════════════════════════
async function searchWikimediaCommons(query, limit = 4) {
    const encoded = encodeURIComponent(query);

    const apiUrl =
        `https://commons.wikimedia.org/w/api.php?action=query` +
        `&generator=search&gsrnamespace=6` +
        `&gsrsearch=${encoded}` +
        `&gsrlimit=${limit + 6}` +
        `&prop=imageinfo&iiprop=url|size|mime|extmetadata` +
        `&iiurlwidth=800` +
        `&format=json&origin=*`;

    const data = await fetchJSON(apiUrl);

    if (!data.query?.pages) return [];

    return Object.values(data.query.pages)
        .filter(page => {
            const info = page.imageinfo?.[0];
            if (!info) return false;
            const mime = info.mime || '';
            // Only real photos — jpeg, png, webp
            return (
                (mime === 'image/jpeg' || mime === 'image/png' || mime === 'image/webp') &&
                (info.width || 0) >= 200 &&
                (info.height || 0) >= 150
            );
        })
        .slice(0, limit)
        .map(page => {
            const info = page.imageinfo[0];
            const meta = info.extmetadata || {};
            return {
                url: info.thumburl || info.url,
                fullUrl: info.url,
                title: cleanTitle(meta.ObjectName?.value || page.title || ''),
                width: info.thumbwidth || info.width,
                height: info.thumbheight || info.height,
                source: 'Wikimedia Commons',
                license: meta.LicenseShortName?.value || 'CC',
                description: meta.ImageDescription?.value
                    ?.replace(/<[^>]*>/g, '')
                    .substring(0, 120) || '',
            };
        });
}

// ══════════════════════════════════════════════════════════════════
// ── SOURCE 3: Pexels API (OPTIONAL — needs API key) ─────────────
// ══════════════════════════════════════════════════════════════════
async function searchPexels(query, limit = 4) {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) return [];

    const encoded = encodeURIComponent(query);
    const url = `https://api.pexels.com/v1/search?query=${encoded}&per_page=${limit}&size=medium`;

    const data = await new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: { 'Authorization': apiKey, 'User-Agent': USER_AGENT },
        }, (res) => {
            if (res.statusCode !== 200) {
                res.resume();
                reject(new Error(`Pexels HTTP ${res.statusCode}`));
                return;
            }
            let body = '';
            res.on('data', chunk => (body += chunk));
            res.on('end', () => {
                try { resolve(JSON.parse(body)); }
                catch { reject(new Error('Pexels invalid JSON')); }
            });
        });
        req.on('error', reject);
        req.setTimeout(REQUEST_TIMEOUT_MS, () => { req.destroy(); reject(new Error('Pexels timeout')); });
    });

    if (!data.photos?.length) return [];

    return data.photos.slice(0, limit).map(photo => ({
        url: photo.src?.medium || photo.src?.small || photo.src?.original,
        fullUrl: photo.src?.large2x || photo.src?.large || photo.src?.original,
        title: photo.alt || query,
        width: photo.width,
        height: photo.height,
        source: 'Pexels',
        license: 'Pexels License',
        description: photo.alt || '',
    }));
}

// ══════════════════════════════════════════════════════════════════
// ── SOURCE 4: Pixabay API (OPTIONAL — needs API key) ────────────
// ══════════════════════════════════════════════════════════════════
async function searchPixabay(query, limit = 4) {
    const apiKey = process.env.PIXABAY_API_KEY;
    if (!apiKey) return [];

    const encoded = encodeURIComponent(query);
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encoded}&per_page=${limit}&image_type=photo&safesearch=true`;

    const data = await fetchJSON(url);

    if (!data.hits?.length) return [];

    return data.hits.slice(0, limit).map(hit => ({
        url: hit.webformatURL,
        fullUrl: hit.largeImageURL,
        title: hit.tags || query,
        width: hit.webformatWidth || hit.imageWidth,
        height: hit.webformatHeight || hit.imageHeight,
        source: 'Pixabay',
        license: 'Pixabay License',
        description: hit.tags || '',
    }));
}

// ══════════════════════════════════════════════════════════════════
// ── SOURCE 5: Wikipedia Article Images (FREE, CONTEXTUAL) ───────
// ══════════════════════════════════════════════════════════════════
/**
 * Searches Wikipedia for articles matching the query and extracts
 * their main images. These are highly contextual because Wikipedia
 * curates relevant images for each topic.
 */
async function searchWikipediaImages(query, limit = 3) {
    const encoded = encodeURIComponent(query);

    // Step 1: Search for related articles
    const searchUrl =
        `https://en.wikipedia.org/w/api.php?action=query` +
        `&list=search&srsearch=${encoded}&srlimit=${limit + 2}` +
        `&format=json&origin=*`;

    const searchData = await fetchJSON(searchUrl);
    const articles = searchData?.query?.search;
    if (!articles?.length) return [];

    // Step 2: Get page images for found articles
    const titles = articles.slice(0, limit + 2).map(a => a.title).join('|');
    const imageUrl =
        `https://en.wikipedia.org/w/api.php?action=query` +
        `&titles=${encodeURIComponent(titles)}` +
        `&prop=pageimages&piprop=thumbnail|original&pithumbsize=800` +
        `&format=json&origin=*`;

    const imageData = await fetchJSON(imageUrl);
    if (!imageData.query?.pages) return [];

    return Object.values(imageData.query.pages)
        .filter(page => page.thumbnail?.source && page.pageid > 0)
        .slice(0, limit)
        .map(page => ({
            url: page.thumbnail.source,
            fullUrl: page.original?.source || page.thumbnail.source,
            title: page.title || query,
            width: page.thumbnail.width || 800,
            height: page.thumbnail.height || 600,
            source: 'Wikipedia',
            license: 'CC',
            description: `From Wikipedia: ${page.title}`,
        }));
}

// ══════════════════════════════════════════════════════════════════
// ── UTILITIES ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════

/** Clean image titles — remove file extensions, "File:" prefix, HTML */
function cleanTitle(raw) {
    if (!raw) return '';
    return raw
        .replace(/^File:/, '')
        .replace(/\.\w{2,5}$/, '')
        .replace(/<[^>]*>/g, '')
        .trim();
}

/** Capitalize source names like "flickr" → "Flickr" */
function capitalizeSource(src) {
    if (!src) return 'Unknown';
    return src.charAt(0).toUpperCase() + src.slice(1);
}

/** Deduplicate images by normalized URL */
function deduplicateImages(images) {
    const seen = new Set();
    return images.filter(img => {
        const key = (img.url || '').split('?')[0].toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// ══════════════════════════════════════════════════════════════════
// ── MAIN SEARCH — Multi-Source with Smart Fallback Chain ────────
// ══════════════════════════════════════════════════════════════════
/**
 * Search for images across multiple sources with intelligent
 * fallback. Every source used is SEARCH-BASED (no random images).
 *
 * Priority:
 *   1. Openverse (best relevance, free, no key)
 *   2. Pexels / Pixabay (if API keys set)
 *   3. Wikimedia Commons
 *   4. Wikipedia article images
 *
 * @param {string} query  – search terms from LLM
 * @param {number} limit  – max results (default 4)
 * @returns {Promise<Array<{url, fullUrl, title, width, height, source, license, description}>>}
 */
export async function searchImages(query, limit = 4) {
    try {
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return [];
        }

        const optimized = optimizeQuery(query);
        console.log(`[ImageService] Query: "${optimized}" (from: "${query.substring(0, 60)}")`);

        // ── Phase 1: Primary search — Openverse (best results) ─────
        let primaryImages = [];
        try {
            primaryImages = await searchOpenverse(optimized, limit + 2);
            console.log(`[ImageService] Openverse: ${primaryImages.length} results`);
        } catch (err) {
            console.warn(`[ImageService] Openverse failed: ${err.message}`);
        }

        // If Openverse gives enough results, return early (fastest path)
        if (primaryImages.length >= limit) {
            return deduplicateImages(primaryImages).slice(0, limit);
        }

        // ── Phase 2: Parallel fallbacks to fill remaining slots ────
        const needed = limit - primaryImages.length;
        const [pexels, pixabay, wikimedia, wikipedia] = await Promise.allSettled([
            searchPexels(optimized, needed).catch(() => []),
            searchPixabay(optimized, needed).catch(() => []),
            searchWikimediaCommons(optimized, needed).catch(() => []),
            searchWikipediaImages(optimized, Math.min(needed, 3)).catch(() => []),
        ]);

        const pexelsImgs = pexels.status === 'fulfilled' ? pexels.value : [];
        const pixabayImgs = pixabay.status === 'fulfilled' ? pixabay.value : [];
        const wikiImgs = wikimedia.status === 'fulfilled' ? wikimedia.value : [];
        const wpImgs = wikipedia.status === 'fulfilled' ? wikipedia.value : [];

        console.log(`[ImageService] Fallbacks: Pexels=${pexelsImgs.length}, Pixabay=${pixabayImgs.length}, Wikimedia=${wikiImgs.length}, Wikipedia=${wpImgs.length}`);

        // Merge everything — prioritize by quality/relevance
        let allImages = [
            ...primaryImages,    // Openverse first (best relevance)
            ...pexelsImgs,       // Pexels (high quality stock)
            ...pixabayImgs,      // Pixabay (high quality stock)
            ...wikiImgs,         // Wikimedia (mixed quality but relevant)
            ...wpImgs,           // Wikipedia (always contextual)
        ];

        allImages = deduplicateImages(allImages);

        if (allImages.length > 0) {
            const result = allImages.slice(0, limit);
            console.log(`[ImageService] Returning ${result.length} contextual images`);
            return result;
        }

        // ── Phase 3: Last resort — broader Openverse search ────────
        console.log(`[ImageService] No results found, trying broader search...`);
        try {
            // Try with simpler query (first 2-3 words)
            const words = optimized.split(' ').slice(0, 3).join(' ');
            const broaderResults = await searchOpenverse(words, limit);
            if (broaderResults.length > 0) {
                console.log(`[ImageService] Broader search found ${broaderResults.length} results`);
                return broaderResults.slice(0, limit);
            }
        } catch {
            // ignore
        }

        console.log(`[ImageService] All sources exhausted — returning empty`);
        return [];

    } catch (error) {
        console.error('[ImageService] Fatal error:', error.message);
        return [];
    }
}
