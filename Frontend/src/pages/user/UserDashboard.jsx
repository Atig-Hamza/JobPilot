import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Sidebar from '../../components/Sidebar';
import {
    Plus,
    ArrowRight,
    Sparkles,
    UploadCloud,
    Globe,
    Mail,
    Send,
    CheckCircle2,
    FileCheck,
    Trash2,
    AlertCircle,
    Mic,
    Search,
    ChevronRight,
    Briefcase,
    FileText,
    Calendar,
    Zap,
    CreditCard,
    Crown,
    ThumbsUp,
    ThumbsDown,
    Copy,
    MoreHorizontal,
    Check
} from 'lucide-react';
import JopBg from '../../assets/User/JOP.png';
import AiLogo from '../../assets/Main/logo-without-bg.png';

const generateRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'CROM-';
    for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const JobPilotDashboard = () => {
    const [activeMode, setActiveMode] = useState('general');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [chatStarted, setChatStarted] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [roomId] = useState(() => generateRoomId());
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;
        const userMsg = inputValue;
        setChatStarted(true);
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInputValue("");
        setIsLoading(true);

        let aiText = ''; 
        let isResponseStarted = false;

        try {
            const response = await fetch('http://localhost:5000/api/llm/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userMsg, roomId: roomId })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                if (!isResponseStarted) {
                    setIsLoading(false);
                    isResponseStarted = true;
                    setMessages(prev => [...prev, { role: 'ai', content: '' }]);
                }

                const text = decoder.decode(value, { stream: true });
                aiText += text;

                setMessages(prev => {
                    const newMessages = [...prev];
                    if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'ai') {
                        newMessages[newMessages.length - 1] = { role: 'ai', content: aiText };
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error fetching AI response:", error);
            setIsLoading(false);
            
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
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const creditBalance = 1250;
    const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const fileInputRef = useRef(null);

    const handleModeChange = (mode) => {
        setActiveMode(mode);
        setUploadedFile(null);
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
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
        e.stopPropagation();
        setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="flex h-screen w-screen bg-[#FAFAFA] font-sans text-gray-900 overflow-hidden selection:bg-pink-200 selection:text-pink-900">
            <Sidebar />
            <main className="flex-1 flex flex-col relative h-full">
                <div className="flex-1 overflow-y-auto w-full scroll-smooth">
                    <div className="min-h-full flex flex-col items-center p-6 md:p-8 pb-44">
                        {!chatStarted ? (
                        <div className="w-full max-w-[1600px] space-y-8">
                            <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-2">
                                <div>
                                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        <Calendar size={12} />
                                        <span>{todayDate}</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                                        Welcome back, Sam.
                                    </h2>
                                </div>
                                <div className="group flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Available Credits</span>
                                        <div className="flex justify-center items-center gap-2">
                                            <span className="text-xl font-bold text-gray-900 leading-none font-mono tracking-tight">
                                                {creditBalance.toLocaleString()}
                                            </span>
                                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                                                <Plus size={12} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </header>

                            <section className="space-y-4 pt-6 border-t border-dashed border-gray-200">
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <Sparkles size={16} className="text-yellow-500 fill-yellow-500" />
                                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">You might want to try</h3>
                                </div>

                                <div className="relative w-full">
                                    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-1 scrollbar-hide snap-x">
                                        <div className="min-w-[260px] h-[85px] bg-white border border-gray-200 hover:border-blue-300 hover:shadow-[0_4px_20px_-10px_rgba(59,130,246,0.3)] transition-all rounded-2xl flex items-center justify-between p-5 cursor-pointer snap-start relative overflow-hidden group">
                                            <div className="z-10 flex flex-col justify-center h-full">
                                                <span className="font-bold text-[15px] text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">New<br />Application</span>
                                                <span className="text-[10px] text-gray-400 font-medium mt-2 group-hover:text-blue-400 transition-colors">Start from scratch</span>
                                            </div>
                                            <div className="relative w-[70px] h-full flex items-center justify-center">
                                                <div className="absolute w-14 h-16 bg-blue-50 border border-blue-100 rounded-lg rotate-[-6deg] group-hover:rotate-[-12deg] transition-transform duration-300 origin-bottom-right"></div>
                                                <div className="absolute w-14 h-16 bg-blue-100 border border-blue-200 rounded-lg rotate-[6deg] group-hover:rotate-[12deg] transition-transform duration-300 origin-bottom-left"></div>
                                                <div className="relative w-14 h-16 bg-white border border-blue-200 rounded-lg shadow-sm flex flex-col items-center justify-center gap-2 z-10 group-hover:-translate-y-1 transition-transform duration-300">
                                                    <Briefcase size={20} className="text-blue-500" />
                                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md shadow-blue-200">
                                                        <Plus size={12} strokeWidth={3} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="min-w-[280px] h-[85px] bg-white border border-gray-200 hover:border-orange-300 hover:shadow-[0_4px_20px_-10px_rgba(251,146,60,0.3)] transition-all rounded-2xl flex items-center justify-between p-5 cursor-pointer snap-start relative overflow-hidden group">
                                            <div className="z-10 flex flex-col items-start h-full justify-center">
                                                <span className="bg-orange-100 text-orange-600 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide mb-1.5 border border-orange-200">New</span>
                                                <span className="font-bold text-[15px] text-gray-900 leading-tight">Free AI<br />Cover Letter</span>
                                            </div>
                                            <div className="relative w-24 h-16 group-hover:scale-105 transition-transform duration-300">
                                                <div className="absolute inset-0 bg-orange-50 rounded-xl border border-orange-100 overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-orange-200"></div>
                                                    </div>
                                                    <div className="p-3 space-y-1.5 mt-2">
                                                        <div className="w-3/4 h-1.5 bg-orange-200/50 rounded-full"></div>
                                                        <div className="w-full h-1.5 bg-gray-100 rounded-full"></div>
                                                        <div className="w-5/6 h-1.5 bg-gray-100 rounded-full"></div>
                                                        <div className="w-full h-1.5 bg-gray-100 rounded-full"></div>
                                                    </div>
                                                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-white rounded-full shadow-md border border-orange-100 flex items-center justify-center z-20 group-hover:rotate-12 transition-transform">
                                                        <Sparkles size={12} className="text-orange-500 fill-orange-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="min-w-[280px] h-[85px] bg-white border border-gray-200 hover:border-purple-300 hover:shadow-[0_4px_20px_-10px_rgba(168,85,247,0.3)] transition-all rounded-2xl flex items-center justify-between p-5 cursor-pointer snap-start relative overflow-hidden group">
                                            <div className="z-10 flex flex-col items-start h-full justify-center">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="bg-purple-100 text-purple-600 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide border border-purple-200">Beta</span>
                                                </div>
                                                <span className="font-bold text-[15px] text-gray-900 leading-tight">Interview<br />Coach</span>
                                            </div>
                                            <div className="w-24 h-16 bg-purple-50 rounded-xl border border-purple-100 relative overflow-hidden flex items-center justify-center gap-1 group-hover:gap-1.5 transition-all">
                                                <div className="w-1.5 h-4 bg-purple-300 rounded-full animate-pulse"></div>
                                                <div className="w-1.5 h-8 bg-purple-500 rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
                                                <div className="w-1.5 h-5 bg-purple-400 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                                                <div className="w-1.5 h-10 bg-purple-600 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]"></div>
                                                <div className="w-1.5 h-6 bg-purple-400 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]"></div>

                                                <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-purple-100 to-transparent opacity-50"></div>
                                            </div>
                                        </div>
                                        <div className="min-w-[280px] h-[85px] bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-[0_4px_20px_-10px_rgba(16,185,129,0.3)] transition-all rounded-2xl flex items-center justify-between p-5 cursor-pointer snap-start relative overflow-hidden group">
                                            <div className="z-10 flex flex-col justify-center h-full">
                                                <span className="font-bold text-[15px] text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors">Find Career<br />Paths AI</span>
                                                <span className="text-[10px] text-gray-400 font-medium mt-2">Explore roadmaps</span>
                                            </div>
                                            <div className="w-24 h-16 bg-emerald-50 rounded-xl border border-emerald-100 relative overflow-hidden group-hover:scale-105 transition-transform">
                                                <div className="absolute top-3 left-3 w-2.5 h-2.5 bg-emerald-400 rounded-full z-10 ring-2 ring-white"></div>
                                                <div className="absolute top-8 left-10 w-2.5 h-2.5 bg-emerald-300 rounded-full z-10 ring-2 ring-white"></div>
                                                <div className="absolute bottom-3 right-4 w-3 h-3 bg-emerald-500 rounded-full z-10 ring-2 ring-white shadow-sm flex items-center justify-center">
                                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                                </div>
                                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                                    <path d="M15 15 Q 35 15, 42 32 T 80 50" fill="none" stroke="#6ee7b7" strokeWidth="2" strokeDasharray="4 2" />
                                                </svg>

                                                <div className="absolute top-2 right-2 p-1 bg-white rounded shadow-sm border border-emerald-100">
                                                    <Search size={10} className="text-emerald-500" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="min-w-[60px] h-[85px] bg-gray-50 border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-gray-400 transition-all group">
                                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                                <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-900" />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </section>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div
                                    onClick={() => handleModeChange('jop1_scrape')}
                                    className={`relative overflow-hidden rounded-[2rem] p-7 h-[250px] cursor-pointer transition-all duration-300 hover:-translate-y-1 group border ${activeMode === 'jop1_scrape' ? 'border-purple-400 ring-4 ring-purple-50 shadow-xl' : 'border-gray-100 shadow-sm'}`}
                                    style={{
                                        backgroundImage: `url(${JopBg})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                >

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="bg-white text-purple-700 px-2 py-1 border border-purple-700 rounded-md text-[10px] font-bold uppercase">Scraper</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">JOP-1 Assistant</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed font-medium">Paste a job URL. I'll parse requirements & generate tailored application assets.</p>
                                    </div>
                                </div>
                                <div
                                    onClick={() => handleModeChange('resume_opt')}
                                    className={`relative overflow-hidden rounded-[2rem] p-7 cursor-pointer transition-all duration-300 hover:-translate-y-1 group border ${activeMode === 'resume_opt'
                                        ? 'bg-white border-pink-400 ring-4 ring-pink-50 shadow-2xl'
                                        : 'bg-white border-gray-100 shadow-sm'
                                        }`}
                                >
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="bg-white text-pink-700 px-2 py-1 border border-pink-700 rounded-md text-[10px] font-bold uppercase">Popular</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-20">Resume Optimizer</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed font-medium max-w-[220px] relative z-20">
                                            Upload PDF. I'll rewrite bullets to match JD keywords instantly using AI.
                                        </p>
                                        <div className="absolute bottom-[-40px] right-[-65px] w-[320px] h-[160px] pointer-events-none perspective-[1000px]">
                                            <div className="absolute bottom-[35px] left-8 w-24 h-20 bg-white/90 backdrop-blur-md border border-pink-100 rounded-xl shadow-lg z-10 transform rotate-[-6deg] translate-x-4 group-hover:-translate-x-6 group-hover:rotate-[-12deg] transition-all duration-500 ease-out flex flex-col p-2 gap-1.5">
                                                <div className="text-[8px] font-bold text-gray-400 uppercase">Missing Keywords</div>
                                                <div className="flex flex-wrap gap-1">
                                                    <div className="h-1.5 w-8 bg-pink-100 rounded-full"></div>
                                                    <div className="h-1.5 w-5 bg-gray-100 rounded-full"></div>
                                                    <div className="h-1.5 w-10 bg-gray-100 rounded-full"></div>
                                                    <div className="h-1.5 w-6 bg-pink-100 rounded-full"></div>
                                                </div>
                                                <div className="mt-auto flex items-center gap-1 text-[9px] font-bold text-pink-500">
                                                    <AlertCircle size={10} /> 4 Found
                                                </div>
                                            </div>
                                            <div className="absolute bottom-12 right-12 w-24 h-24 bg-white/90 backdrop-blur-md border border-pink-100 rounded-xl shadow-lg z-10 transform rotate-[6deg] -translate-x-4 group-hover:translate-x-4 group-hover:rotate-[12deg] transition-all duration-500 ease-out flex flex-col items-center justify-center p-2">
                                                <div className="relative w-10 h-10 mb-1">
                                                    <svg className="w-full h-full rotate-[-90deg]">
                                                        <circle cx="20" cy="20" r="16" stroke="#f3f4f6" strokeWidth="4" fill="none" />
                                                        <circle cx="20" cy="20" r="16" stroke="#ec4899" strokeWidth="4" fill="none" strokeDasharray="100" strokeDashoffset="100" className="group-hover:stroke-dashoffset-10 transition-all duration-1000 ease-out" />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-900">98%</div>
                                                </div>
                                                <div className="text-[8px] font-bold text-gray-400 uppercase text-center">ATS Score</div>
                                            </div>
                                            <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 w-40 h-52 bg-gradient-to-b from-white to-gray-50 rounded-t-2xl border border-gray-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20 group-hover:-translate-y-6 transition-transform duration-500 ease-out">
                                                <div className="p-4 border-b border-dashed border-gray-200 flex gap-3 items-center">
                                                    <div className="w-8 h-8 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center">
                                                        <span className="text-[10px] font-bold text-pink-500">CV</span>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="w-16 h-2 bg-gray-800 rounded-full"></div>
                                                        <div className="w-10 h-1.5 bg-gray-300 rounded-full"></div>
                                                    </div>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <div className="flex gap-2">
                                                        <div className="w-1 h-1 rounded-full bg-gray-300 mt-1"></div>
                                                        <div className="space-y-1.5 flex-1">
                                                            <div className="w-full h-1.5 bg-gray-100 rounded-full"></div>
                                                            <div className="w-5/6 h-1.5 bg-gray-100 rounded-full"></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="w-1 h-1 rounded-full bg-pink-500 mt-1 shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
                                                        <div className="space-y-1.5 flex-1">
                                                            <div className="w-full h-1.5 bg-gray-100 rounded-full relative overflow-hidden">
                                                                <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-transparent w-full -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                                                            </div>
                                                            <div className="w-4/5 h-1.5 bg-gray-100 rounded-full"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute -top-3 -right-3 bg-white p-1.5 rounded-full shadow-md border border-pink-100 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 delay-200">
                                                    <Sparkles size={14} className="text-pink-500 fill-pink-500 animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="bg-white rounded-[2rem] p-7 transition-all duration-300 hover:-translate-y-1 group border border-orange-200 hover:border-orange-400 hover:shadow-[0_20px_60px_-15px_rgba(249,115,22,0.3)] cursor-pointer relative overflow-hidden h-full flex flex-col justify-between"
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(249,115,22,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(249,115,22,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

                                    <div className="relative z-20 pointer-events-none">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="flex flex-row align-center justify-center gap-1 bg-white backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-orange-400 border border-orange-400"><span><Crown size={16} /></span> Master</span>
                                            <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 px-2 py-1 rounded-md">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                                                <span className="text-[10px] font-bold text-orange-700 font-mono">
                                                    <span className="group-hover:hidden">READY</span>
                                                    <span className="hidden group-hover:inline">PROCESSING...</span>
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">Poli-1 Automation</h3>
                                        <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[240px]">
                                            Launch targeted emails to the <span className="text-gray-900 font-bold border-b-2 border-orange-200">12 leads</span> found below.
                                        </p>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full h-[180px] overflow-hidden pointer-events-none">
                                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-100"></div>
                                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent transform -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                            <div className="relative w-16 h-16 bg-white rounded-2xl border border-gray-100 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <div className="absolute inset-0 bg-orange-100/50 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 animate-pulse"></div>
                                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden">
                                                    <Zap size={20} className="text-white fill-white relative z-10" />
                                                    <div className="absolute inset-0 bg-white/30 skew-x-12 -translate-x-10 group-hover:animate-[shine_1.5s_infinite]"></div>
                                                </div>
                                                <div className="absolute -top-4 -bottom-4 w-[2px] bg-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                        </div>
                                        <div className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-16 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col items-center justify-center gap-1 z-10 opacity-60 group-hover:animate-[slideRight_2s_linear_infinite]">
                                            <div className="w-6 h-6 bg-gray-100 rounded-full"></div>
                                            <div className="w-8 h-1 bg-gray-100 rounded-full"></div>
                                        </div>
                                        <div className="absolute top-1/2 -left-12 -translate-y-1/2 w-12 h-16 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col items-center justify-center gap-1 z-10 opacity-60 group-hover:animate-[slideRight_2s_linear_infinite_0.7s]">
                                            <div className="w-6 h-6 bg-gray-100 rounded-full"></div>
                                            <div className="w-8 h-1 bg-gray-100 rounded-full"></div>
                                        </div>
                                        <div className="absolute top-1/2 right-12 -translate-y-1/2 z-10 opacity-0 group-hover:animate-[flyOut_2s_linear_infinite_1s]">
                                            <div className="bg-green-500 p-2 rounded-full shadow-lg shadow-green-200 border-2 border-white transform rotate-45">
                                                <Send size={16} className="text-white fill-white" />
                                            </div>
                                            <div className="absolute top-1/2 right-full w-12 h-[2px] bg-gradient-to-l from-green-400 to-transparent"></div>
                                        </div>
                                        <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10 opacity-0 group-hover:animate-[flyOut_2s_linear_infinite_1.7s]">
                                            <div className="bg-green-500 p-2 rounded-full shadow-lg shadow-green-200 border-2 border-white transform rotate-45">
                                                <Send size={16} className="text-white fill-white" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative z-30 flex items-center gap-2 text-xs font-bold text-gray-900 bg-white/80 border border-gray-100 self-start px-5 py-3 rounded-xl backdrop-blur-md shadow-sm w-fit">
                                        Start Auto-Sequence
                                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center transition-colors">
                                            <ArrowRight size={10} className="text-gray-500 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                    <style jsx>{`
                                        @keyframes slideRight {
                                            0% { transform: translate(0, -50%); opacity: 0; }
                                            10% { opacity: 1; }
                                            45% { transform: translate(calc(50vw - 120px), -50%); opacity: 1; scale: 1; }
                                            50% { transform: translate(calc(50vw - 100px), -50%); opacity: 0; scale: 0.5; }
                                            100% { opacity: 0; }
                                        }
                                        @keyframes flyOut {
                                           0% { transform: translate(0, -50%) scale(0.5); opacity: 0; }
                                           5% { opacity: 1; transform: translate(10px, -50%) scale(1); }
                                           100% { transform: translate(150px, -80%) scale(1); opacity: 0; }
                                        }
                                        @keyframes shimmer {
                                            0% { transform: translateX(-100%); }
                                            100% { transform: translateX(100%); }
                                        }
                                        @keyframes shine {
                                            0% { transform: translateX(-150%) skewX(12deg); }
                                            100% { transform: translateX(150%) skewX(12deg); }
                                        }
                                    `}</style>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        Identified Companies
                                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">12</span>
                                    </h3>
                                    <div className="flex gap-2">
                                        <button className="text-xs font-bold text-gray-500 hover:text-black px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">Get More</button>
                                        <button className="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1.5 rounded-lg hover:bg-pink-100 transition-colors">View All</button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 mb-2">
                                        <div className="col-span-4">Company</div>
                                        <div className="col-span-4">Target Email</div>
                                        <div className="col-span-2">Source</div>
                                        <div className="col-span-2 text-right">Action</div>
                                    </div>
                                    <CompanyRow
                                        name="Vercel"
                                        logo="https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png"
                                        email="jobs@vercel.com"
                                        source="LinkedIn"
                                        status="ready"
                                    />
                                    <CompanyRow
                                        name="Stripe"
                                        logo="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                                        email="recruiting@stripe.com"
                                        source="Referral"
                                        status="sent"
                                    />
                                </div>
                            </div>
                        </div>
                        ) : (
                             <>
                                <ChatInterface messages={messages} isLoading={isLoading} />
                                <div ref={messagesEndRef} />
                             </>
                        )}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 to-transparent pt-16 pb-8 px-6 z-30 pointer-events-none">
                    <div className="max-w-3xl mx-auto pointer-events-auto">
                        <div className="flex justify-center gap-2 mb-4">
                            <ModeBadge
                                active={activeMode === 'general'}
                                label="Chat"
                                onClick={() => handleModeChange('general')}
                            />
                            <ModeBadge
                                active={activeMode === 'resume_opt'}
                                label="CV Optimization"
                                icon={<Sparkles size={10} />}
                                onClick={() => handleModeChange('resume_opt')}
                            />
                            <ModeBadge
                                active={activeMode === 'jop1_scrape'}
                                label="JOP-1 Scraper"
                                icon={<Globe size={10} />}
                                onClick={() => handleModeChange('jop1_scrape')}
                            />
                        </div>
                        <div className={`bg-white/80 backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] rounded-[1.5rem] transition-all duration-300 relative overflow-hidden border ${activeMode === 'resume_opt' ? 'border-pink-200 ring-4 ring-pink-50/50' : 'border-gray-200 ring-4 ring-white/50'}`}>
                            {activeMode === 'resume_opt' ? (
                                <div className="p-2.5 flex items-center gap-3 h-[76px]">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
                                    />
                                    <div
                                        onClick={!uploadedFile ? handleUploadClick : undefined}
                                        className={`flex-1 h-full rounded-2xl flex items-center px-4 gap-4 transition-all duration-200 ${uploadedFile
                                            ? 'bg-green-50 border border-green-200 cursor-default'
                                            : 'bg-gray-50 border border-dashed border-gray-300 hover:border-pink-300 hover:bg-pink-50/50 cursor-pointer group'
                                            }`}
                                    >
                                        {uploadedFile ? (
                                            <>
                                                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                                    <FileCheck size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-gray-900 truncate">{uploadedFile.name}</h4>
                                                    <p className="text-[10px] font-medium text-gray-500 uppercase">{uploadedFile.size}</p>
                                                </div>
                                                <button
                                                    onClick={removeFile}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-200/50 text-green-700 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-pink-500 shadow-sm transition-colors">
                                                    <UploadCloud size={20} />
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">Click to upload CV</span>
                                                    <span className="text-[10px] font-medium text-gray-400">PDF, DOCX up to 10MB</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <button
                                        disabled={!uploadedFile}
                                        className={`h-full px-6 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm shrink-0 ${uploadedFile
                                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <Sparkles size={16} className={uploadedFile ? "animate-pulse" : ""} />
                                        <span>Enhance</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 p-2.5 h-[76px]">
                                    <button className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors shrink-0">
                                        <Plus size={24} />
                                    </button>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={activeMode === 'jop1_scrape' ? "Paste job keyword here..." : "Ask JobPilot to find leads..."}
                                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 h-full text-lg font-medium px-2"
                                    />
                                    <button 
                                        onClick={handleSendMessage}
                                        className={`h-12 px-6 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all shadow-sm group shrink-0 ${activeMode === 'jop1_scrape' ? 'bg-black text-white hover:bg-gray-800' : 'bg-[#ffb6e6] hover:bg-pink-300 text-gray-900'}`}>
                                        <span>{activeMode === 'jop1_scrape' ? 'Scrape' : 'Send'}</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="text-center mt-3">
                            <p className="text-[10px] font-bold text-gray-400 flex items-center justify-center gap-1.5">
                                <AlertCircle size={10} />
                                AI can make mistakes. Verify important info.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};



const ModeBadge = ({ active, label, icon, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border shadow-sm ${active ? 'bg-gray-900 text-white border-gray-900 scale-105' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600 hover:scale-105'}`}
    >
        {icon}
        {label}
    </button>
);

const CompanyRow = ({ name, logo, email, source, status }) => (
    <div className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
        <div className="col-span-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 p-1 flex items-center justify-center shrink-0 shadow-sm">
                <img src={logo} alt={name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('bg-gray-100'); }} />
            </div>
            <span className="text-sm font-bold text-gray-900">{name}</span>
        </div>
        <div className="col-span-4">
            <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-900 transition-colors font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">{email}</span>
        </div>
        <div className="col-span-2">
            <span className="text-xs font-bold text-gray-400">{source}</span>
        </div>
        <div className="col-span-2 text-right">
            {status === 'sent' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <CheckCircle2 size={12} /> SENT
                </span>
            ) : (
                <button className="opacity-0 group-hover:opacity-100 transition-all bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:scale-105 active:scale-95 shadow-lg shadow-gray-200">
                    Include
                </button>
            )}
        </div>
    </div>
);

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

export default JobPilotDashboard;