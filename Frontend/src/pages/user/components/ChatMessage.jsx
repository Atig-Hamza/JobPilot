import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Check, Copy, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import AiLogo from '../../../assets/Main/logo-without-bg.png';
import AiLogoWhite from '../../../assets/Main/logo-white-without-bg.png';
import { useTheme } from '../../../context/ThemeContext';

const ChatMessage = ({ msg, isStreaming }) => {
    const { theme } = useTheme();
    const [feedback, setFeedback] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const [showProcess, setShowProcess] = useState(false);

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

    return (
        <div className={msg.role === 'user' ? "flex justify-end w-full group" : "flex items-start gap-5 w-full animate-in fade-in slide-in-from-bottom-2 duration-500"}>
            {msg.role === 'user' ? (
                <div className="flex flex-col items-end gap-2 max-w-[80%]">
                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 px-5 py-3 rounded-2xl rounded-tr-sm">
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-left font-medium tracking-wide dark:text-gray-100">
                            {msg.content}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="w-8 h-8 mt-1 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={theme === 'dark' ? AiLogoWhite : AiLogo} alt="AI" className="w-full h-full object-contain p-0.5" />
                    </div>

                    <div className="flex-1 min-w-0 backdrop-blur-sm rounded-2xl p-0.5 sm:p-0">
                        <div className="flex items-center gap-3 mb-2 px-1">
                            <span className="text-xs font-bold text-gray-900 dark:text-gray-100 tracking-tight">JobPilot AI</span>
                            <span className="text-[10px] bg-gray-100 dark:bg-[#111111] text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-800 uppercase tracking-wider font-bold">Bot</span>
                        </div>

                        {msg.processLogs && msg.processLogs.length > 0 && (
                            <div className="mb-5">
                                <button
                                    onClick={() => setShowProcess(!showProcess)}
                                    className="group relative overflow-hidden flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors bg-gray-50 dark:bg-[#111111] hover:bg-gray-100 dark:hover:bg-[#18181b] border border-gray-200 dark:border-gray-800 rounded px-3 py-1.5 w-full text-left"
                                >
                                    {isStreaming && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/40 dark:via-gray-600/20 to-transparent z-0"
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '100%' }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 1.5,
                                                ease: "linear",
                                                repeatDelay: 0.5
                                            }}
                                        />
                                    )}

                                    <div className="relative z-10 flex items-center gap-2 w-full">
                                        {showProcess ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                        <span className="font-semibold tracking-wide">{showProcess ? 'Hide searching process' : 'View searching process'}</span>
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {showProcess && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-2 pl-2 border-l-2 border-gray-200 dark:border-gray-800 space-y-2">
                                                {msg.processLogs.map((log, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ x: -10, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 font-mono leading-relaxed"
                                                    >
                                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600 shrink-0" />
                                                        <div className="flex-1">
                                                            <ReactMarkdown>{log}</ReactMarkdown>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        <div className="space-y-6 text-[#1A1A1A] dark:text-gray-200 text-[16px] leading-8 font-[450]">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return !inline ? (
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
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            </div>
                                        ) : (
                                            <code className="bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-gray-200 dark:border-gray-700" {...props}>
                                                {children}
                                            </code>
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
                                    table: ({ children }) => <div className="overflow-x-auto my-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm table-fixed">{children}</table></div>,
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

                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                                    className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${feedback === 'up' ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                    title="Good response"
                                >
                                    <ThumbsUp size={18} />
                                </button>
                                <button
                                    onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                                    className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${feedback === 'down' ? 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                    title="Bad response"
                                >
                                    <ThumbsDown size={18} />
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-1 ${isCopied ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                    title="Copy text"
                                >
                                    {isCopied ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                                <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-auto" title="More options">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatMessage;
