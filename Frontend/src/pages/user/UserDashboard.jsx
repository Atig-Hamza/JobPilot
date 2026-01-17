import React, { useState, useRef, useEffect } from 'react';
import UserLayout from './components/UserLayout';
import ChatInterface from './components/ChatInterface';
import { useTheme } from '../../context/ThemeContext';
import Mainlogo from '../../assets/Main/logo-without-bg.png';
import MainlogoWhite from '../../assets/Main/logo-white-without-bg.png';

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    return isMobile;
};

const generateRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'CROM-';
    for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const JobPilotDashboard = () => {
    const { theme } = useTheme();
    const isMobile = useIsMobile();
    
    const user = JSON.parse(localStorage.getItem('user')) || { fullName: 'User' };
    const firstName = user.fullName ? user.fullName.split(' ')[0] : 'User';

    const [activeMode, setActiveMode] = useState('general');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [chatStarted, setChatStarted] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [roomId] = useState(() => generateRoomId());
    const [selectedCountry, setSelectedCountry] = useState('all');
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = (behavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior: behavior });
    };

    useEffect(() => {
        scrollToBottom(isLoading ? "smooth" : "auto");
    }, [messages, isLoading]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        setMessages(prev => [...prev, { role: 'user', content: inputValue }]);

        let apiPrompt = inputValue;
        if (activeMode === 'jop1_scrape') {
            apiPrompt = `Scrape Request:\nKeywords: ${inputValue}\nCountry Code: ${selectedCountry.toUpperCase()}`;
        }

        setChatStarted(true);
        setInputValue("");
        setIsLoading(true);
        setIsGenerating(true);

        let aiText = '';
        let isResponseStarted = false;

        try {
            let response;
            const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';

            if (activeMode === 'jop1_scrape') {
                response = await fetch(`${API_URL}/crawl`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                    },
                    body: JSON.stringify({ keywords: inputValue, country: selectedCountry, limit: 5 })
                });
            } else {
                response = await fetch(`${API_URL}/llm/generate`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                    },
                    body: JSON.stringify({ prompt: apiPrompt, roomId: roomId, user: JSON.parse(localStorage.getItem('user')) })
                });
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value, { stream: true });

                if (!isResponseStarted) {
                    setIsLoading(false);
                    isResponseStarted = true;
                    setMessages(prev => [...prev, { role: 'ai', content: '' }]);
                }

                if (activeMode === 'jop1_scrape') {
                    buffer += text;
                    const parts = buffer.split('\n\n');
                    buffer = parts.pop();

                    for (const part of parts) {
                        if (part.startsWith('data: ')) {
                            try {
                                const jsonStr = part.slice(6);
                                const data = JSON.parse(jsonStr);

                                if (data.type === 'process') {
                                    setMessages(prev => {
                                        const newMessages = [...prev];
                                        if (newMessages.length > 0) {
                                            const lastMsg = newMessages[newMessages.length - 1];
                                            const currentProcess = lastMsg.processLogs || [];
                                            newMessages[newMessages.length - 1] = {
                                                ...lastMsg,
                                                processLogs: [...currentProcess, data.content]
                                            };
                                        }
                                        return newMessages;
                                    });
                                } else if (data.type === 'markdown') {
                                    aiText += data.content + '\n\n';
                                    setMessages(prev => {
                                        const newMessages = [...prev];
                                        if (newMessages.length > 0) {
                                            const lastMsg = newMessages[newMessages.length - 1];
                                            newMessages[newMessages.length - 1] = {
                                                ...lastMsg,
                                                content: aiText
                                            };
                                        }
                                        return newMessages;
                                    });
                                }
                            } catch (e) {
                                console.error('Stream parse error:', e);
                            }
                        }
                    }
                } else {
                    aiText += text;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        if (newMessages.length > 0) {
                            newMessages[newMessages.length - 1] = { role: 'ai', content: aiText };
                        }
                        return newMessages;
                    });
                }
            }
            setIsGenerating(false);
        } catch (error) {
            console.error("Error fetching AI response:", error);
            setIsLoading(false);
            setIsGenerating(false);

            setMessages(prev => {
                if (isResponseStarted) {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'ai', content: aiText + "\n\n[System Error: Response interrupted]" };
                    return newMessages;
                } else {
                    return [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please check your connection and try again." }];
                }
            });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleModeChange = (mode) => {
        setActiveMode(mode);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedFile({
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                type: file.type
            });
        }
    };

    const removeFile = (e) => {
        e?.stopPropagation();
        setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <UserLayout activeMode={activeMode}>
            
            <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
                <div className="flex items-center gap-3 cursor-pointer select-none">
                    <img 
                        src={theme === 'dark' ? MainlogoWhite : Mainlogo} 
                        alt="JobPilot" 
                        className="h-6 w-auto"
                    />
                    <span className="font-semibold text-gray-900 dark:text-white text-lg tracking-tight">JobPilot</span>
                </div>
            </header>

            {!chatStarted ? (
                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[900px] mx-auto px-6 overflow-y-auto fade-in">
                    
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#222222] text-[10px] text-gray-500 dark:text-[#888888] mb-6 shadow-sm">
                            Start your dream job search. <span className="text-indigo-600 dark:text-white ml-1 underline cursor-pointer">View new features.</span>
                        </div>
                        <h1 className="text-4xl font-medium tracking-tight text-gray-900 dark:text-white mb-2">Good Morning {firstName} <span className="animate-pulse inline-block">👋</span></h1>
                        <p className="text-gray-500 dark:text-[#888888] text-sm">Let JobPilot help you land your next opportunity.</p>
                    </div>

                    <div className="w-full max-w-3xl relative mb-6">
                        <div className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#222222] rounded-2xl p-4 min-h-[140px] flex flex-col justify-between shadow-xl dark:shadow-2xl focus-within:border-gray-300 dark:focus-within:border-zinc-600 transition-all">
                            
                            <div className="space-y-4">
                                <textarea 
                                    placeholder="Ask for interview tips, CV analysis, or job search help..." 
                                    className="w-full bg-transparent text-gray-900 dark:text-[#EDEDED] placeholder-gray-400 dark:placeholder-zinc-600 text-lg outline-none resize-none h-[60px]"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                ></textarea>
                            </div>

                            <div className="flex items-end justify-between mt-2">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 text-gray-400 dark:text-zinc-500">
                                        <button className="hover:text-gray-900 dark:hover:text-white transition-colors" title="Upload Image" onClick={handleUploadClick}>
                                            <i className="ph ph-image text-lg"></i>
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleModeChange(activeMode === 'jop1_scrape' ? 'general' : 'jop1_scrape')}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-colors ${activeMode === 'jop1_scrape' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-[#222] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] text-gray-500 dark:text-[#888888] hover:text-black dark:hover:text-white'}`}
                                        >
                                            <i className="ph ph-magnifying-glass"></i> web search
                                        </button>
                                        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#222] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] rounded-full text-xs text-gray-500 dark:text-[#888888] hover:text-black dark:hover:text-white transition-colors">
                                            <i className="ph ph-file-doc"></i> cv creation
                                        </button>
                                        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#222] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] rounded-full text-xs text-gray-500 dark:text-[#888888] hover:text-black dark:hover:text-white transition-colors">
                                            <i className="ph ph-magnifying-glass"></i> expert mode
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleSendMessage}
                                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#333] hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black flex items-center justify-center transition-all group"
                                >
                                    <i className="ph-bold ph-arrow-up text-gray-500 dark:text-[#888888] group-hover:text-white dark:group-hover:text-black"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div className="absolute -bottom-8 left-0 text-[10px] text-gray-400 dark:text-zinc-600 pl-2">
                            Collaborate with JobPilot to accelerate your hiring process
                        </div>
                    </div>

                    <div className="w-full max-w-3xl flex flex-wrap gap-3 mt-4 mb-12">
                        <button className="border border-dashed border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500 rounded-md px-4 py-1.5 flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                            <i className="ph ph-file-search"></i> Review CV
                        </button>
                        <button className="border border-dashed border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500 rounded-md px-4 py-1.5 flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                            <i className="ph ph-linkedin-logo"></i> LinkedIn Bio
                        </button>
                        <button className="border border-dashed border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500 rounded-md px-4 py-1.5 flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                            <i className="ph ph-code"></i> Coding Test
                        </button>
                        <button className="border border-dashed border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500 rounded-md px-4 py-1.5 flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                            More
                        </button>
                    </div>

                    <div className="w-full max-w-3xl">
                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-[#EDEDED] mb-4">
                            <i className="ph-fill ph-lightbulb"></i> Suggestions <i className="ph ph-caret-down text-xs text-gray-400 dark:text-zinc-500"></i>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button onClick={() => setInputValue("Critique my resume for a Senior Marketing role.")} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#222222] p-4 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:border-gray-300 dark:hover:border-zinc-700 transition-all group h-[100px] flex flex-col justify-between shadow-sm dark:shadow-none">
                                <div className="flex items-start gap-2">
                                    <i className="ph ph-magic-wand text-gray-400 dark:text-zinc-600 group-hover:text-black dark:group-hover:text-white mt-0.5"></i>
                                    <span className="text-sm text-gray-600 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white leading-snug">Critique my resume for a Senior Marketing role.</span>
                                </div>
                            </button>

                            <button onClick={() => setInputValue("Simulate a behavioral interview for Amazon.")} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#222222] p-4 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:border-gray-300 dark:hover:border-zinc-700 transition-all group h-[100px] flex flex-col justify-between shadow-sm dark:shadow-none">
                                <div className="flex items-start gap-2">
                                    <i className="ph ph-chat-circle-text text-gray-400 dark:text-zinc-600 group-hover:text-black dark:group-hover:text-white mt-0.5"></i>
                                    <span className="text-sm text-gray-600 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white leading-snug">Simulate a behavioral interview for Amazon.</span>
                                </div>
                            </button>

                            <button onClick={() => setInputValue("Draft a cold email to a hiring manager.")} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#222222] p-4 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:border-gray-300 dark:hover:border-zinc-700 transition-all group h-[100px] flex flex-col justify-between shadow-sm dark:shadow-none">
                                <div className="flex items-start gap-2">
                                    <i className="ph ph-envelope-simple text-gray-400 dark:text-zinc-600 group-hover:text-black dark:group-hover:text-white mt-0.5"></i>
                                    <span className="text-sm text-gray-600 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white leading-snug">Draft a cold email to a hiring manager.</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="mt-12 mb-4 text-[10px] text-gray-400 dark:text-zinc-700 text-center w-full">
                        JobPilot can make mistakes. Verify important career advice.
                    </div>

                </div>
            ) : (
                <div className="flex flex-col h-full relative">
                    <div className="flex-1 overflow-y-auto w-full">
                         <div className="flex flex-col items-center min-h-full p-4 md:p-8 pb-32 md:pb-32">
                             <ChatInterface messages={messages} isLoading={isLoading} isGenerating={isGenerating} />
                             <div ref={messagesEndRef} />
                         </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white via-white dark:from-[#050505] dark:via-[#050505] to-transparent z-20">
                        <div className="w-full max-w-3xl mx-auto relative">
                             {/* File Preview */}
                            {uploadedFile && (
                                <div className="absolute -top-12 left-0 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-lg px-3 py-1.5 flex items-center gap-2 animate-in slide-in-from-bottom-2 shadow-sm">
                                     <i className="ph ph-file-text text-indigo-500 dark:text-indigo-400"></i>
                                     <span className="text-xs text-gray-700 dark:text-gray-300 max-w-[150px] truncate">{uploadedFile.name}</span>
                                     <button onClick={(e) => { e.stopPropagation(); removeFile(); }} className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400">
                                        <i className="ph-bold ph-x"></i>
                                     </button>
                                </div>
                            )}

                             <div className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#222222] rounded-2xl p-3 flex flex-col gap-2 shadow-xl dark:shadow-2xl focus-within:border-gray-300 dark:focus-within:border-zinc-600 transition-all">
                                <textarea 
                                    placeholder="Message JobPilot..." 
                                    className="w-full bg-transparent text-gray-900 dark:text-[#EDEDED] placeholder-gray-400 dark:placeholder-zinc-600 text-sm outline-none resize-none px-2"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                    style={{ minHeight: '24px', maxHeight: '200px' }}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                ></textarea>
                                
                                <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center gap-2">
                                        <button className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors p-1" title="Upload Image" onClick={handleUploadClick}>
                                            <i className="ph ph-plus-circle text-lg"></i>
                                        </button>
                                        <button className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors p-1" onClick={() => handleModeChange('jop1_scrape')} title="Search">
                                            <i className={`ph ${activeMode === 'jop1_scrape' ? 'ph-globe-simple text-blue-500 dark:text-blue-400' : 'ph-globe-simple'} text-lg`}></i>
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />
                                    </div>

                                    <button 
                                        onClick={handleSendMessage}
                                        disabled={isGenerating || !inputValue.trim()}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${inputValue.trim() ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200' : 'bg-gray-100 dark:bg-[#333] text-gray-300 dark:text-[#666] cursor-not-allowed'}`}
                                    >
                                        {isGenerating ? <div className="w-4 h-4 border-2 border-gray-300 dark:border-zinc-500 border-t-gray-500 dark:border-t-zinc-300 rounded-full animate-spin"></div> : <i className="ph-bold ph-arrow-up"></i>}
                                    </button>
                                </div>
                            </div>
                            <div className="text-[10px] text-gray-400 dark:text-zinc-600 text-center mt-2">
                                JobPilot can make mistakes. Verify important career advice.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </UserLayout>
    );
};

export default JobPilotDashboard;
