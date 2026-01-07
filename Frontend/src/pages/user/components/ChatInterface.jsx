import React from 'react';
import ChatMessage from './ChatMessage';
import AiLogo from '../../../assets/Main/logo-without-bg.png';

const ChatInterface = ({ messages, isLoading }) => (
    <div className="w-full max-w-3xl px-6 flex flex-col gap-12 pt-12 pb-44">
        {messages.map((msg, idx) => (
            <ChatMessage key={idx} msg={msg} />
        ))}

        {isLoading && (
            <div className="flex items-start gap-5 w-full">
                <div className="w-8 h-8 mt-1 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    <img src={AiLogo} alt="AI" className="w-full h-full object-contain p-0.5 opacity-80" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 px-1">
                        <span className="text-xs font-bold text-gray-900 tracking-tight">JobPilot AI</span>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 uppercase tracking-wider font-bold">Bot</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-1">
                        <span className="text-xs font-bold text-gray-400 animate-pulse">Thinking</span>
                        <div className="flex gap-0.5 pt-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
);

export default ChatInterface;
