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

const CVDownloadCard = ({ html }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        setIsGenerating(true);
        const toastId = toast.loading('Generating PDF...');

        try {
            const cleanHtml = html.replace('<!-- CV_START -->', '').replace('<!-- CV_END -->', '');

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
                window.open(data.data.url, '_blank');
                toast.success('PDF Generated!', { id: toastId });
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
        <div className="my-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#181819] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-black dark:text-white">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">CV Generated</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ready to download</p>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-white dark:bg-[#18181b]">
                <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-all"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Generating PDF...
                        </>
                    ) : (
                        <>
                            <Download size={16} />
                            Download PDF
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

    const renderMessageContent = () => {
        const content = msg.content;

        const startMatch = content.match(/<!--\s*CV_START\s*-->/);
        const endMatch = content.match(/<!--\s*CV_END\s*-->/);

        if (startMatch && endMatch) {
            const startIndex = startMatch.index;
            const endIndex = endMatch.index;
            const endMarkerLength = endMatch[0].length;

            let beforeCv = content.substring(0, startIndex);
            const cvContent = content.substring(startIndex, endIndex + endMarkerLength);
            let afterCv = content.substring(endIndex + endMarkerLength);

            beforeCv = beforeCv.replace(/```\w*\s*$/, '').trim();
            afterCv = afterCv.replace(/^\s*```/, '').replace(/<!--\s*CV_END\s*-->/g, '').trim();

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
                                            <code className={`bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 px-1 py-0.2 rounded-md text-[0.9em] font-medium border border-transparent ${isInlineOrShortText ? 'inline-block my-1' : ''}`} {...props}>
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
                                            <code className={`bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 px-1 py-0.2 rounded-md text-[0.9em] font-medium border border-transparent ${isInlineOrShortText ? 'inline-block my-1' : ''}`} {...props}>
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

        return (
            <div className="space-y-6 text-[#1A1A1A] dark:text-gray-200 text-[16px] leading-8 font-[450]">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '')
                            const content = String(children).replace(/\n$/, '')
                            const isInlineOrShortText = !inline && (!match || match[1] === 'text') && !content.includes('\n');

                            if (content.includes('CV_START') || (content.includes('<!DOCTYPE html>') && content.includes('<title>Professional Resume</title>'))) {
                                return <CVDownloadCard html={content} />
                            }

                            if (inline || isInlineOrShortText) {
                                return (
                                    <code className={`bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 px-1 py-0.2 rounded-md text-[0.9em] font-medium border border-transparent ${isInlineOrShortText ? 'inline-block my-1' : ''}`} {...props}>
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
                    }}
                >
                    {msg.content}
                </ReactMarkdown>
            </div>
        );
    };

    return (
        <div className={msg.role === 'user' ? "flex justify-end w-full group" : "flex items-start gap-3 md:gap-5 w-full animate-in fade-in slide-in-from-bottom-2 duration-500"}>
            {msg.role === 'user' ? (
                <div className="flex flex-col items-end gap-2 max-w-[90%] md:max-w-[80%]">
                    <div className="bg-gray-100 dark:bg-[#161616] text-gray-900 px-4 md:px-5 py-2 md:py-3 rounded-2xl rounded-tr-sm">
                        <p className="text-[14px] md:text-[15px] leading-relaxed whitespace-pre-wrap text-left font-medium tracking-wide dark:text-gray-100">
                            {msg.content}
                        </p>
                    </div>
                </div>
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

                            <div className="relative">
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
