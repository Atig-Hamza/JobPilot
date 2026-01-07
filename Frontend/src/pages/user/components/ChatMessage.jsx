import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ThumbsUp, ThumbsDown, Check, Copy, MoreHorizontal } from 'lucide-react';
import AiLogo from '../../../assets/Main/logo-without-bg.png';

const ChatMessage = ({ msg }) => {
    const [feedback, setFeedback] = useState(null);
    const [isCopied, setIsCopied] = useState(false);

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
                    <div className="bg-gray-100 text-gray-900 px-5 py-3 rounded-2xl rounded-tr-sm">
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-left font-medium tracking-wide">
                            {msg.content}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="w-8 h-8 mt-1 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                            <img src={AiLogo} alt="AI" className="w-full h-full object-contain p-0.5" />
                    </div>

                    <div className="flex-1 min-w-0 backdrop-blur-sm rounded-2xl p-0.5 sm:p-0">
                        <div className="flex items-center gap-3 mb-2 px-1">
                            <span className="text-xs font-bold text-gray-900 tracking-tight">JobPilot AI</span>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 uppercase tracking-wider font-bold">Bot</span>
                        </div>

                        <div className="space-y-6 text-[#1A1A1A] text-[16px] leading-8 font-[450]">
                                <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({node, inline, className, children, ...props}) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return !inline ? (
                                                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white my-4">
                                                <div className="bg-gray-50 px-4 py-2 flex justify-between items-center border-b border-gray-200">
                                                    <span className="text-xs font-mono text-gray-500">{match ? match[1] : 'Code'}</span>
                                                </div>
                                                <div className="p-5 bg-[#FBFBFB] overflow-x-auto">
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                </div>
                                            </div>
                                        ) : (
                                            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-pink-600" {...props}>
                                                {children}
                                            </code>
                                        )
                                    },
                                    p: ({children}) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                                    ul: ({children}) => <ul className="list-disc pl-5 mb-4 space-y-1 marker:text-gray-400">{children}</ul>,
                                    ol: ({children}) => <ol className="list-decimal pl-5 mb-4 space-y-1 marker:text-gray-400">{children}</ol>,
                                    li: ({children}) => <li className="pl-1">{children}</li>,
                                    h1: ({children}) => <h1 className="text-3xl font-bold mb-6 mt-8 tracking-tight text-gray-900">{children}</h1>,
                                    h2: ({children}) => <h2 className="text-2xl font-bold mb-4 mt-8 tracking-tight text-gray-900">{children}</h2>,
                                    h3: ({children}) => <h3 className="text-xl font-bold mb-3 mt-6 text-gray-900">{children}</h3>,
                                    h4: ({children}) => <h4 className="text-lg font-bold mb-2 mt-4 text-gray-900">{children}</h4>,
                                    div: ({children}) => <div className="mb-4">{children}</div>,
                                    blockquote: ({children}) => (
                                        <div className="flex gap-4 p-4 rounded-lg bg-amber-50 border border-amber-100 my-4 border-l-4 border-l-amber-300">
                                            <div className="text-sm text-amber-900 leading-relaxed italic">{children}</div>
                                        </div>
                                    ),
                                    a: ({href, children}) => <a href={href} className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>,
                                    table: ({children}) => <div className="overflow-x-auto my-8 rounded-xl border border-gray-200 shadow-sm"><table className="min-w-full divide-y divide-gray-200 text-sm table-fixed">{children}</table></div>,
                                    thead: ({children}) => <thead className="bg-gray-50">{children}</thead>,
                                    tbody: ({children}) => <tbody className="bg-white divide-y divide-gray-100">{children}</tbody>,
                                    tr: ({children}) => <tr className="group hover:bg-gray-50/50 transition-colors">{children}</tr>,
                                    th: ({children}) => <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">{children}</th>,
                                    td: ({children}) => <td className="px-6 py-4 text-gray-600 align-top leading-relaxed">{children}</td>,
                                    hr: () => <hr className="my-8 border-gray-100" />,
                                }}
                                >
                                {msg.content}
                                </ReactMarkdown>

                                <div className="flex items-center gap-2 pt-2">
                                <button 
                                    onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                                    className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${feedback === 'up' ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-gray-600'}`}
                                    title="Good response"
                                >
                                    <ThumbsUp size={18} />
                                </button>
                                <button 
                                    onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                                    className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${feedback === 'down' ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-gray-600'}`}
                                    title="Bad response"
                                >
                                    <ThumbsDown size={18} />
                                </button>
                                <button 
                                    onClick={handleCopy}
                                    className={`p-1.5 rounded hover:bg-gray-100 transition-colors ml-1 ${isCopied ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-gray-600'}`}
                                    title="Copy text"
                                >
                                    {isCopied ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                                <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors ml-auto" title="More options">
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
