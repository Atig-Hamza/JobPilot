import React from 'react';
import ChatMessage from './ChatMessage';
import AiLogo from '../../../assets/Main/logo-without-bg.png';
import AiLogoWhite from '../../../assets/Main/logo-white-without-bg.png';
import { useTheme } from '../../../context/ThemeContext';

const ChatInterface = ({ messages, isLoading, isGenerating }) => {
    const { theme } = useTheme();

    return (
        <div className="w-full max-w-3xl px-6 flex flex-col gap-12 pt-12 pb-44">
            {messages.map((msg, idx) => (
                <ChatMessage
                    key={idx}
                    msg={msg}
                    isStreaming={isGenerating && idx === messages.length - 1}
                />
            ))}

            {isLoading && (
                <div className="flex items-start gap-5 w-full">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 px-1">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 animate-pulse">Thinking</span>
                            <div className="flex gap-0.5 pt-1">
                                <div className="w-1 h-1 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"></div>
                                <div className="w-1 h-1 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce delay-75"></div>
                                <div className="w-1 h-1 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;
