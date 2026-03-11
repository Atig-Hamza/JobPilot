import { createPortal } from 'react-dom';
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Check, Copy, MoreHorizontal, ChevronDown, ChevronUp, Download, FileText, Loader2, Volume2, Share2, StopCircle } from 'lucide-react';
import AiLogo from '../../../assets/Main/logo-without-bg.png';
import AiLogoWhite from '../../../assets/Main/logo-white-without-bg.png';
import { useTheme } from '../../../context/ThemeContext';
import toast from 'react-hot-toast';

// ── Skeleton Loader ───────────────────────────────────────────────
const SkeletonPulse = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700/50 rounded-xl ${className}`} />
);

const YouTubeSkeleton = () => (
    <div className="my-4 w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212]">
        <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
        <div className="p-3 flex flex-col gap-2">
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700/50 animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700/50 animate-pulse rounded" />
        </div>
    </div>
);

const ImagesSkeleton = () => (
    <div className="flex gap-3 overflow-hidden my-4 w-full">
        {[0, 1, 2, 3].map(i => (
            <div key={i} className="shrink-0 w-[160px] md:w-[200px] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212]">
                <div className="w-full h-[120px] md:h-[150px] bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
                <div className="px-2.5 py-2 space-y-1.5">
                    <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700/50 animate-pulse rounded" />
                    <div className="h-2 w-1/2 bg-gray-200 dark:bg-gray-700/50 animate-pulse rounded" />
                </div>
            </div>
        ))}
    </div>
);

// ── YouTube Embed Card ────────────────────────────────────────────
const YouTubeEmbed = ({ video }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [thumbLoaded, setThumbLoaded] = useState(false);

    if (!video || !video.id) return null;

    return (
        <div className="my-4 w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-sm hover:shadow-md transition-shadow">
            {!isPlaying ? (
                <div className="relative cursor-pointer group" onClick={() => setIsPlaying(true)}>
                    {!thumbLoaded && (
                        <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
                    )}
                    <img
                        src={video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                        alt={video.title}
                        className={`w-full aspect-video object-cover ${thumbLoaded ? 'block' : 'hidden'}`}
                        onLoad={() => setThumbLoaded(true)}
                    />
                    {thumbLoaded && (
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 flex items-center justify-center transition-all duration-300">
                            {/* Enhanced YouTube play button */}
                            <div className="relative flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ease-out">
                                {/* Glow ring */}
                                <div className="absolute w-20 h-20 rounded-full bg-red-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <svg className="w-[72px] h-[50px] drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]" viewBox="0 0 68 48">
                                    <path
                                        className="fill-red-600 group-hover:fill-red-600 transition-colors duration-300"
                                        d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
                                    />
                                    <path className="fill-white" d="M45 24 27 14v20z" />
                                </svg>
                            </div>
                        </div>
                    )}
                    {video.duration && thumbLoaded && (
                        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded-md font-mono">
                            {video.duration}
                        </span>
                    )}
                </div>
            ) : (
                <div className="relative w-full aspect-video">
                    {!iframeLoaded && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 dark:bg-[#1a1a1a]">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 size={32} className="animate-spin text-gray-400 dark:text-gray-500" />
                                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Loading video...</span>
                            </div>
                        </div>
                    )}
                    <iframe
                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                        title={video.title}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={() => setIframeLoaded(true)}
                    />
                </div>
            )}
            <div className="p-3 flex flex-col gap-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
                    {video.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {video.author && <span>{video.author}</span>}
                    {video.author && video.views && <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />}
                    {video.views && <span>{typeof video.views === 'number' ? video.views.toLocaleString() : video.views} views</span>}
                </div>
            </div>
        </div>
    );
};

// ── Image Embed Card (horizontal scrollable gallery) ─────────────
const ImageEmbed = ({ images }) => {
    const [expandedImg, setExpandedImg] = useState(null);
    const [loadedSet, setLoadedSet] = useState(new Set());
    const [errorSet, setErrorSet] = useState(new Set());
    const [retryCount, setRetryCount] = useState({});

    // Normalize: accept a single image object or an array
    const imageList = React.useMemo(() => {
        if (Array.isArray(images)) return images.filter(Boolean);
        if (images && typeof images === 'object' && images.url) return [images];
        return [];
    }, [images]);

    const handleRetry = (idx) => {
        setErrorSet(prev => {
            const next = new Set(prev);
            next.delete(idx);
            return next;
        });
        setRetryCount(prev => ({ ...prev, [idx]: (prev[idx] || 0) + 1 }));
    };

    if (imageList.length === 0) return null;

    // Check if all images have errored out
    const allErrored = imageList.every((_, idx) => errorSet.has(idx));
    if (allErrored) return null;

    return (
        <>
            <div className="my-4 w-full overflow-hidden">
                <div
                    className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                    {imageList.map((image, idx) => {
                        if (!image?.url) return null;
                        const isLoaded = loadedSet.has(idx);
                        const hasError = errorSet.has(idx);
                        const retries = retryCount[idx] || 0;

                        // After 2 retries, hide the card
                        if (hasError && retries >= 2) return null;

                        // Show retry button on error
                        if (hasError) {
                            return (
                                <div
                                    key={`${image.url}-${idx}`}
                                    className="shrink-0 w-[160px] md:w-[200px] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-sm"
                                >
                                    <div className="w-full h-[120px] md:h-[150px] flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800/50">
                                        <svg className="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <button
                                            onClick={() => handleRetry(idx)}
                                            className="text-[10px] text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={`${image.url}-${idx}-${retries}`}
                                className="shrink-0 w-[160px] md:w-[200px] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (isLoaded) setExpandedImg(image);
                                }}
                            >
                                <div className="relative w-full h-[120px] md:h-[150px] overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    {!isLoaded && (
                                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
                                    )}
                                    <img
                                        src={`${image.url}${retries > 0 ? (image.url.includes('?') ? '&' : '?') + 'r=' + retries : ''}`}
                                        alt={image.title || 'Image'}
                                        className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                                        onLoad={() => setLoadedSet(prev => new Set([...prev, idx]))}
                                        onError={() => setErrorSet(prev => new Set([...prev, idx]))}
                                        loading="lazy"
                                        draggable={false}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-1.5">
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                {(image.title || image.source) && (
                                    <div className="px-2.5 py-2">
                                        {image.title && (
                                            <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 line-clamp-1 leading-tight">
                                                {image.title}
                                            </p>
                                        )}
                                        {image.source && (
                                            <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
                                                {image.source}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Fullscreen zoom modal */}
            {expandedImg && createPortal(
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center p-4"
                    style={{ zIndex: 99999 }}
                    onClick={() => setExpandedImg(null)}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setExpandedImg(null); }}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                        style={{ zIndex: 100000 }}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <img
                        src={expandedImg.fullUrl || expandedImg.url}
                        alt={expandedImg.title || 'Image'}
                        className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                        draggable={false}
                    />
                </div>,
                document.body
            )}
        </>
    );
};

// ── Media Embeds Section ──────────────────────────────────────────
const MediaEmbeds = ({ media, isLoading }) => {
    if ((!media || media.length === 0) && !isLoading) return null;

    return (
        <div className="flex flex-col items-start gap-1 mt-2 w-full">
            {media?.map((item, idx) => {
                if (item.mediaType === 'youtube') {
                    return <YouTubeEmbed key={`yt-${idx}`} video={item.data} />;
                }
                if (item.mediaType === 'image') {
                    return <ImageEmbed key={`img-${idx}`} images={item.data} />;
                }
                return null;
            })}
        </div>
    );
};

const CVDownloadCard = ({ html }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [isReady, setIsReady] = useState(false);

    const handleDownload = async () => {
        if (downloadUrl) {
            window.open(downloadUrl, '_blank');
            return;
        }

        setIsGenerating(true);
        const toastId = toast.loading('Generating your CV...');

        try {
            const cleanHtml = html
                .replace(/<!--\s*CV_START\s*-->/gi, '')
                .replace(/<!--\s*CV_END\s*-->/gi, '')
                .replace(/^```[a-z]*\s*/gi, '')
                .replace(/\s*```$/gi, '');
            const API_URL = import.meta.env.VITE_BACKEND_API_URL;
            const userStr = localStorage.getItem('User');
            const token = userStr ? JSON.parse(userStr).token : localStorage.getItem('token');

            const response = await fetch(`${API_URL}/cv/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ html: cleanHtml })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Generation failed');
            }

            const data = await response.json();

            if (data.status === 'success' && data.data.url) {
                setDownloadUrl(data.data.url);
                setIsReady(true);
                window.open(data.data.url, '_blank');
                toast.success('Your CV is ready!', { id: toastId });
            } else {
                throw new Error('Invalid response');
            }
        } catch (error) {
            console.error('Download error:', error);
            toast.error(error.message || 'Failed to generate PDF', { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full">
            <div className="group relative flex w-full items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-2 pr-3 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] transition-all hover:border-gray-300 hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-[#121212] dark:shadow-none">

                <div className="flex flex-1 items-center gap-4 overflow-hidden">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 dark:bg-[#1c1c1c] dark:border-white/5">
                        <FileText
                            size={24}
                            className="text-gray-700 dark:text-gray-300 transition-transform duration-300 group-hover:scale-110"
                            strokeWidth={1.5}
                        />
                        <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1c1c1c]" />
                    </div>
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                        <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                            Resume_Export.pdf
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-medium">PDF Document</span>
                            <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                            <span>Professional</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="relative flex h-11 shrink-0 items-center gap-2 overflow-hidden rounded-xl bg-black px-6 text-sm font-medium text-white transition-all hover:bg-gray-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:disabled:bg-white/10 dark:disabled:text-gray-500"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Exporting...</span>
                        </>
                    ) : (
                        <>
                            <span>Download</span>
                            <Download size={16} strokeWidth={2} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const ProcessTimer = () => {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <span className="text-sm font-mono text-gray-400 dark:text-gray-500 px-2 py-1 rounded-md">
            {seconds}s
        </span>
    );
};

const ChatMessage = ({ msg, isStreaming }) => {
    const { theme } = useTheme();
    const [feedback, setFeedback] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const [showProcess, setShowProcess] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const moreMenuRef = React.useRef(null);

    useEffect(() => {
        if (!showMore) return;
        const handleOutsideClick = (e) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
                setShowMore(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [showMore]);
    const [resolvedMedia, setResolvedMedia] = useState(null);
    const [mediaLoading, setMediaLoading] = useState(false);

    // Auto-resolve media markers from history messages that don't have pre-loaded media
    useEffect(() => {
        if (msg.role === 'user') return;
        // During streaming, media arrives via SSE events on msg.media
        if (isStreaming) return;
        // Already have media from SSE
        if (msg.media?.length > 0) return;

        const content = msg.content || '';
        const youtubeMatches = [...content.matchAll(/<!--\s*YOUTUBE:\s*(.*?)\s*-->/g)];
        const imageMatches = [...content.matchAll(/<!--\s*IMAGE:\s*(.*?)\s*-->/g)];

        if (youtubeMatches.length === 0 && imageMatches.length === 0) return;

        const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
        const userStr = localStorage.getItem('User');
        const token = userStr ? JSON.parse(userStr).token : localStorage.getItem('token');

        let cancelled = false;
        setMediaLoading(true);

        const fetchMedia = async () => {
            const mediaItems = [];
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch all in parallel
            const promises = [];

            for (const m of youtubeMatches) {
                const query = m[1].trim();
                promises.push(
                    fetch(`${API_URL}/media/youtube?q=${encodeURIComponent(query)}&limit=1`, { headers })
                        .then(r => r.json())
                        .then(data => {
                            if (data.data?.videos?.[0]) {
                                return { mediaType: 'youtube', query, data: data.data.videos[0] };
                            }
                            return null;
                        })
                        .catch(() => null)
                );
            }

            for (const m of imageMatches) {
                const query = m[1].trim();
                promises.push(
                    fetch(`${API_URL}/media/images?q=${encodeURIComponent(query)}&limit=4`, { headers })
                        .then(r => r.json())
                        .then(data => {
                            if (data.data?.images?.length > 0) {
                                return { mediaType: 'image', query, data: data.data.images };
                            }
                            return null;
                        })
                        .catch(() => null)
                );
            }

            const results = await Promise.allSettled(promises);
            if (cancelled) return;

            const items = results
                .filter(r => r.status === 'fulfilled' && r.value)
                .map(r => r.value);

            setResolvedMedia(items.length > 0 ? items : []);
            setMediaLoading(false);
        };

        fetchMedia();
        return () => { cancelled = true; };
    }, [msg.content, msg.role, msg.media, isStreaming]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            window.speechSynthesis.cancel();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (isSpeaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isSpeaking]);

    const handleStopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const cleanTextForSpeech = (text) => {
        return text
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/(\*\*|__)(.*?)\1/g, '$2')
            .replace(/(\*|_)(.*?)\1/g, '$2')
            .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
            .replace(/^\s*[-*+]\s/gm, '')
            .replace(/[\\*#_`~>]/g, '')
            .replace(/\n+/g, '. ');
    };

    const detectLanguage = (text) => {
        const frenchPattern = /[àâäéèêëîïôöùûüçœ]|(\b(le|la|les|est|et|des|pour|dans|sur)\b)/i;
        return frenchPattern.test(text) ? 'fr-FR' : 'en-US';
    };

    const handleSpeak = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            const cleanContent = cleanTextForSpeech(msg.content);
            const language = detectLanguage(cleanContent);
            const utterance = new SpeechSynthesisUtterance(cleanContent);

            utterance.lang = language;

            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.startsWith(language) && v.name.includes('Google')) ||
                voices.find(v => v.lang.startsWith(language));

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            utterance.onstart = () => {
                setIsSpeaking(true);
            };

            utterance.onend = () => {
                setIsSpeaking(false);
            };

            utterance.onerror = () => {
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'JobPilot AI Response',
                    text: msg.content,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            handleCopy();
            toast.success('Copied to clipboard');
        }
    };

    const handleCopy = async () => {
        if (!msg.content) return;
        try {
            await navigator.clipboard.writeText(msg.content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const renderUserContent = () => {
        let content = msg.content || '';
        let imageUrl = null;

        const imageMatch = content.match(/\[Image: (.*?)\]/);
        if (imageMatch) {
            const relativePath = imageMatch[1];
            if (relativePath.startsWith('http') || relativePath.startsWith('blob:')) {
                imageUrl = relativePath;
            } else {
                const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
                const domain = API_URL.replace(/\/api\/?$/, '');
                imageUrl = `${domain}${relativePath}`;
            }
            content = content.replace(imageMatch[0], '').trim();
        }

        return (
            <div className="flex flex-col items-end gap-2 max-w-[90%] md:max-w-[80%]">
                {imageUrl && (
                    <div className="mb-2 bg-gray-100 dark:bg-[#161616] p-2 rounded-xl">
                        <img src={imageUrl} alt="Uploaded" className="max-w-xs rounded-lg max-h-64 object-cover" />
                    </div>
                )}
                {content && (
                    <div className="bg-gray-100 dark:bg-[#161616] text-gray-900 px-4 md:px-5 py-2 md:py-3 rounded-2xl rounded-tr-sm">
                        <p className="text-[14px] md:text-[15px] leading-relaxed whitespace-pre-wrap text-left font-medium tracking-wide dark:text-gray-100">
                            {content}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    const renderMessageContent = () => {
        const content = msg.content;

        const startMatch = content.match(/<!--\s*CV_START\s*-->/);
        const endMatch = content.match(/<!--\s*CV_END\s*-->/);

        if (startMatch && !endMatch) {
            const beforeCv = content.substring(0, startMatch.index).trim();

            return (
                <div className="space-y-4 text-[#1A1A1A] dark:text-gray-200 text-[16px] leading-8 font-[450]">
                    {beforeCv && (
                        <p className="text-gray-900 dark:text-gray-200 leading-relaxed">{beforeCv}</p>
                    )}
                </div>
            );
        }

        if (startMatch && endMatch) {
            const startIndex = startMatch.index;
            const endIndex = endMatch.index;
            const endMarkerLength = endMatch[0].length;

            let beforeCv = content.substring(0, startIndex).trim();
            const cvContent = content.substring(startIndex, endIndex + endMarkerLength);
            const rawAfterCv = content.substring(endIndex + endMarkerLength);

            const afterCv = rawAfterCv
                .replace(/<!--\s*CV_END\s*-->/g, '')
                .replace(/```[\w]*\s*/g, '')
                .replace(/your cv has been generated successfully[.!]?/gi, '')
                .replace(/\*\*Success!\*\*[^\n]*/g, '')
                .replace(/\[Download PDF\]\([^)]*\)/g, '')
                .replace(/Your CV is ready[^\n]*/gi, '')
                .replace(/You can download it[^\n]*/gi, '')
                .replace(/using the button above[^\n]*/gi, '')
                .replace(/let me know if you'?d? like any adjustments\.?/gi, '')
                .trim();

            return (
                <div className="space-y-6 text-[#1A1A1A] dark:text-gray-200 text-[16px] leading-8 font-[450]">
                    {beforeCv && (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    const content = String(children).replace(/\n$/, '')
                                    const isInlineOrShortText = !inline && (!match || match[1] === 'text') && !content.includes('\n');

                                    if (inline || isInlineOrShortText) {
                                        return (
                                            <code className={`relative
    bg-gray-100 dark:bg-gray-800/50 
    text-gray-900 dark:text-gray-100
    px-1 py-0.5 rounded-lg
    font-medium
    ${isInlineOrShortText ? 'inline-block my-1' : ''}`} {...props}>
                                                {children}
                                            </code>
                                        )
                                    }

                                    return (
                                        <div className="rounded-lg overflow-hidden my-4 relative group border border-gray-200 dark:border-gray-800">
                                            <div className="bg-gray-50 dark:bg-[#18181b] px-4 py-2 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
                                                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 capitalize">{match ? match[1] : 'text'}</span>
                                            </div>
                                            <SyntaxHighlighter
                                                style={theme === 'dark' ? oneDark : oneLight}
                                                language={match ? match[1] : 'text'}
                                                PreTag="div"
                                                customStyle={{ margin: 0, borderRadius: '0 0 0.5rem 0.5rem', padding: '1.25rem' }}
                                                {...props}
                                            >
                                                {content}
                                            </SyntaxHighlighter>
                                        </div>
                                    )
                                },
                                p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-gray-900 dark:text-gray-200">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1 marker:text-gray-400 dark:marker:text-gray-600 text-gray-900 dark:text-gray-200">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1 marker:text-gray-400 dark:marker:text-gray-600 text-gray-900 dark:text-gray-200">{children}</ol>,
                                li: ({ children }) => <li className="pl-1 text-gray-900 dark:text-gray-200">{children}</li>,
                                h1: ({ children }) => <h1 className="text-3xl font-bold mb-6 mt-8 tracking-tight text-gray-900 dark:text-white">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-2xl font-bold mb-4 mt-8 tracking-tight text-gray-900 dark:text-white">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-xl font-bold mb-3 mt-6 text-gray-900 dark:text-white">{children}</h3>,
                                a: ({ href, children }) => <a href={href} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300 dark:decoration-blue-700 underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>,
                                blockquote: ({ children }) => <div className="my-6 pl-5 border-l-[3px] border-pink-300 dark:border-pink-700"><div className="text-[16px] text-gray-800 dark:text-gray-300 italic leading-8 font-serif">{children}</div></div>,
                            }}
                        >
                            {beforeCv}
                        </ReactMarkdown>
                    )}

                    <CVDownloadCard html={cvContent} />

                    {afterCv && (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    const content = String(children).replace(/\n$/, '')
                                    const isInlineOrShortText = !inline && (!match || match[1] === 'text') && !content.includes('\n');

                                    if (inline || isInlineOrShortText) {
                                        return (
                                            <code className={`relative
    bg-gray-100 dark:bg-gray-800/50 
    text-gray-900 dark:text-gray-100
    px-1 py-0.5 rounded-lg
    font-medium
    ${isInlineOrShortText ? 'inline-block my-1' : ''}`} {...props}>
                                                {children}
                                            </code>
                                        )
                                    }

                                    return (
                                        <div className="rounded-lg overflow-hidden my-4 relative group border border-gray-200 dark:border-gray-800">
                                            <div className="bg-gray-50 dark:bg-[#18181b] px-4 py-2 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
                                                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 capitalize">{match ? match[1] : 'text'}</span>
                                            </div>
                                            <SyntaxHighlighter style={theme === 'dark' ? oneDark : oneLight} language={match ? match[1] : 'text'} PreTag="div" customStyle={{ margin: 0, borderRadius: '0 0 0.5rem 0.5rem', padding: '1.25rem' }} {...props}>{content}</SyntaxHighlighter>
                                        </div>
                                    )
                                },
                                p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-gray-900 dark:text-gray-200">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1 marker:text-gray-400 dark:marker:text-gray-600 text-gray-900 dark:text-gray-200">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1 marker:text-gray-400 dark:marker:text-gray-600 text-gray-900 dark:text-gray-200">{children}</ol>,
                                li: ({ children }) => <li className="pl-1 text-gray-900 dark:text-gray-200">{children}</li>,
                                h1: ({ children }) => <h1 className="text-3xl font-bold mb-6 mt-8 tracking-tight text-gray-900 dark:text-white">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-2xl font-bold mb-4 mt-8 tracking-tight text-gray-900 dark:text-white">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-xl font-bold mb-3 mt-6 text-gray-900 dark:text-white">{children}</h3>,
                                h4: ({ children }) => <h4 className="text-lg font-bold mb-2 mt-4 text-gray-900 dark:text-white">{children}</h4>,
                                a: ({ href, children }) => <a href={href} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300 dark:decoration-blue-700 underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>,
                                table: ({ children }) => <div className="overflow-x-auto my-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm table-fixed">{children}</table></div>,
                                thead: ({ children }) => <thead className="bg-gray-50 dark:bg-[#18181b]">{children}</thead>,
                                tbody: ({ children }) => <tbody className="bg-white dark:bg-[#111111] divide-y divide-gray-100 dark:divide-gray-800">{children}</tbody>,
                                tr: ({ children }) => <tr className="group hover:bg-gray-50/50 dark:hover:bg-[#18181b]/50 transition-colors">{children}</tr>,
                                th: ({ children }) => <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{children}</th>,
                                td: ({ children }) => <td className="px-6 py-4 text-gray-600 dark:text-gray-300 align-top leading-relaxed">{children}</td>,
                                blockquote: ({ children }) => <div className="my-6 pl-5 border-l-[3px] border-pink-300 dark:border-pink-700"><div className="text-[16px] text-gray-800 dark:text-gray-300 italic leading-8 font-serif">{children}</div></div>,
                                hr: () => <hr className="my-8 border-gray-100 dark:border-gray-800" />,
                            }}
                        >
                            {afterCv}
                        </ReactMarkdown>
                    )}
                </div>
            );
        }

        // Split content by media markers and render inline
        const allMedia = msg.media || resolvedMedia || [];
        const mediaByQuery = {};
        allMedia.forEach(m => { mediaByQuery[m.query] = m; });

        const mediaMarkerRegex = /<!--\s*(?:YOUTUBE|IMAGE):\s*(.*?)\s*-->/g;
        const hasMarkers = mediaMarkerRegex.test(msg.content || '');
        mediaMarkerRegex.lastIndex = 0;

        // Common markdown components used across all sections
        const markdownComponents = {
            code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                const content = String(children).replace(/\n$/, '')
                const isInlineOrShortText = !inline && (!match || match[1] === 'text') && !content.includes('\n');

                if (content.includes('CV_START') || (content.includes('<!DOCTYPE html>') && content.includes('<title>Professional Resume</title>'))) {
                    return <CVDownloadCard html={content} />
                }

                if (inline || isInlineOrShortText) {
                    return (
                        <code className={`relative
    bg-gray-100 dark:bg-gray-800/50 
    text-gray-900 dark:text-gray-100
    px-1 py-0.5 rounded-lg
    font-medium
    ${isInlineOrShortText ? 'inline-block my-1' : ''}`} {...props}>
                            {children}
                        </code>
                    )
                }

                return (
                    <div className="rounded-lg overflow-hidden my-4 relative group border border-gray-200 dark:border-gray-800">
                        <div className="bg-gray-50 dark:bg-[#18181b] px-4 py-2 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 capitalize">{match ? match[1] : 'text'}</span>
                        </div>
                        <SyntaxHighlighter
                            style={theme === 'dark' ? oneDark : oneLight}
                            language={match ? match[1] : 'text'}
                            PreTag="div"
                            customStyle={{
                                margin: 0,
                                borderRadius: '0 0 0.5rem 0.5rem',
                                padding: '1.25rem',
                            }}
                            {...props}
                        >
                            {content}
                        </SyntaxHighlighter>
                    </div>
                )
            },
            p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-gray-900 dark:text-gray-200">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1 marker:text-gray-400 dark:marker:text-gray-600 text-gray-900 dark:text-gray-200">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1 marker:text-gray-400 dark:marker:text-gray-600 text-gray-900 dark:text-gray-200">{children}</ol>,
            li: ({ children }) => <li className="pl-1 text-gray-900 dark:text-gray-200">{children}</li>,
            h1: ({ children }) => <h1 className="text-3xl font-bold mb-6 mt-8 tracking-tight text-gray-900 dark:text-white">{children}</h1>,
            h2: ({ children }) => <h2 className="text-2xl font-bold mb-4 mt-8 tracking-tight text-gray-900 dark:text-white">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xl font-bold mb-3 mt-6 text-gray-900 dark:text-white">{children}</h3>,
            h4: ({ children }) => <h4 className="text-lg font-bold mb-2 mt-4 text-gray-900 dark:text-white">{children}</h4>,
            div: ({ children }) => <div className="mb-4 text-gray-900 dark:text-gray-200">{children}</div>,
            blockquote: ({ children }) => (
                <div className="my-6 pl-5 border-l-[3px] border-pink-300 dark:border-pink-700">
                    <div className="text-[16px] text-gray-800 dark:text-gray-300 italic leading-8 font-serif">
                        {children}
                    </div>
                </div>
            ),
            a: ({ href, children }) => <a href={href} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300 dark:decoration-blue-700 underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>,
            table: ({ children }) => <div className="overflow-x-auto my-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm whitespace-nowrap">{children}</table></div>,
            thead: ({ children }) => <thead className="bg-gray-50 dark:bg-[#18181b]">{children}</thead>,
            tbody: ({ children }) => <tbody className="bg-white dark:bg-[#111111] divide-y divide-gray-100 dark:divide-gray-800">{children}</tbody>,
            tr: ({ children }) => <tr className="group hover:bg-gray-50/50 dark:hover:bg-[#18181b]/50 transition-colors">{children}</tr>,
            th: ({ children }) => <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{children}</th>,
            td: ({ children }) => <td className="px-6 py-4 text-gray-600 dark:text-gray-300 align-top leading-relaxed">{children}</td>,
            hr: () => <hr className="my-8 border-gray-100 dark:border-gray-800" />,
        };

        // If we have media markers, always split and render inline
        // Show skeleton loaders while media is being fetched
        if (hasMarkers) {
            const contentStr = msg.content || '';
            const segments = [];
            let lastIndex = 0;
            let m;

            const splitRegex = /<!--\s*(YOUTUBE|IMAGE):\s*(.*?)\s*-->/g;
            while ((m = splitRegex.exec(contentStr)) !== null) {
                if (m.index > lastIndex) {
                    segments.push({ type: 'text', content: contentStr.slice(lastIndex, m.index).trim() });
                }
                const markerType = m[1].toLowerCase();
                const query = m[2].trim();
                const mediaItem = mediaByQuery[query];
                segments.push({ type: markerType, media: mediaItem || null, query });
                lastIndex = m.index + m[0].length;
            }
            if (lastIndex < contentStr.length) {
                segments.push({ type: 'text', content: contentStr.slice(lastIndex).trim() });
            }

            return (
                <div className="space-y-2 text-[#1A1A1A] dark:text-gray-200 text-[16px] leading-8 font-[450]">
                    {segments.map((seg, idx) => {
                        if (seg.type === 'text' && seg.content) {
                            return (
                                <ReactMarkdown key={`seg-${idx}`} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                                    {seg.content}
                                </ReactMarkdown>
                            );
                        }
                        if (seg.type === 'youtube') {
                            if (seg.media) {
                                return <YouTubeEmbed key={`seg-yt-${idx}`} video={seg.media.data} />;
                            }
                            // Show skeleton only while media is actively loading
                            if (mediaLoading || (!resolvedMedia && isStreaming)) {
                                return <YouTubeSkeleton key={`seg-yts-${idx}`} />;
                            }
                            // Media resolution complete but no result — hide
                            return null;
                        }
                        if (seg.type === 'image') {
                            if (seg.media) {
                                return <ImageEmbed key={`seg-img-${idx}`} images={seg.media.data} />;
                            }
                            // Show skeleton only while media is actively loading
                            if (mediaLoading || (!resolvedMedia && isStreaming)) {
                                return <ImagesSkeleton key={`seg-imgs-${idx}`} />;
                            }
                            // Media resolution complete but no result — hide
                            return null;
                        }
                        return null;
                    })}
                </div>
            );
        }

        // No media markers — render plain markdown + any media from SSE below
        const cleanedContent = (msg.content || '')
            .replace(/<!--\s*YOUTUBE:\s*.*?\s*-->/g, '')
            .replace(/<!--\s*IMAGE:\s*.*?\s*-->/g, '')
            .trim();

        return (
            <div className="space-y-4 text-[#1A1A1A] dark:text-gray-200 text-[16px] leading-8 font-[450]">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={markdownComponents}
                >
                    {cleanedContent}
                </ReactMarkdown>
                {allMedia.length > 0 && <MediaEmbeds media={allMedia} />}
            </div>
        );
    };

    return (
        <div className={msg.role === 'user' ? "flex justify-end w-full group" : "flex items-start gap-3 md:gap-5 w-full animate-in fade-in slide-in-from-bottom-2 duration-500"}>
            {msg.role === 'user' ? (
                renderUserContent()
            ) : (
                <div className="flex-1 flex flex-col min-w-0 max-w-full">
                    {renderMessageContent()}

                    {!isStreaming && (
                        <div className="flex items-center gap-2 mt-4 select-none">
                            <button
                                onClick={handleCopy}
                                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-white/5"
                                title="Copy"
                            >
                                {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>

                            <button
                                onClick={() => setFeedback(feedback === 'good' ? null : 'good')}
                                className={`p-1.5 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-white/5 ${feedback === 'good' ? 'text-green-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                title="Good response"
                            >
                                <ThumbsUp size={16} />
                            </button>

                            <button
                                onClick={() => setFeedback(feedback === 'bad' ? null : 'bad')}
                                className={`p-1.5 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-white/5 ${feedback === 'bad' ? 'text-red-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                title="Bad response"
                            >
                                <ThumbsDown size={16} />
                            </button>

                            <div className="relative" ref={moreMenuRef}>
                                <button
                                    onClick={() => setShowMore(!showMore)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-white/5"
                                    title="More options"
                                >
                                    <MoreHorizontal size={16} />
                                </button>

                                {showMore && (
                                    <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden py-1 z-10 flex flex-col">
                                        <button
                                            onClick={() => { handleSpeak(); setShowMore(false); }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                                        >
                                            <Volume2 size={14} />
                                            <span>Read this</span>
                                        </button>
                                        <button
                                            onClick={() => { handleShare(); setShowMore(false); }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                                        >
                                            <Share2 size={14} />
                                            <span>Share</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {msg.processLogs && msg.processLogs.length > 0 && isStreaming && (
                        <div className="mt-3 relative overflow-hidden rounded-xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-4 shadow-sm">
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 dark:via-white/5 to-transparent z-0"
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.5,
                                    ease: "linear",
                                }}
                            />
                            <div className="relative z-10 flex items-center justify-between gap-3 w-full">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 shiny-text truncate">
                                    {msg.processLogs[msg.processLogs.length - 1]}
                                </span>
                                <ProcessTimer />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isSpeaking && createPortal(
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
                    <button
                        onClick={handleStopSpeaking}
                        className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg hover:opacity-90 transition-opacity font-medium text-sm"
                    >
                        <StopCircle size={16} className="animate-pulse" />
                        <span>Stop Reading</span>
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ChatMessage;
