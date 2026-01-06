import React, { useState, useRef } from 'react';
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
    Crown
} from 'lucide-react';
import JopBg from '../../assets/User/JOP.png';
import ResumeBg from '../../assets/User/CVOP.png';
import PoliBg from '../../assets/User/POLI.png';

const JobPilotDashboard = () => {
    const [activeMode, setActiveMode] = useState('general');
    const [uploadedFile, setUploadedFile] = useState(null);

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
                                    className={`relative overflow-hidden bg-white rounded-[2rem] p-7 cursor-pointer transition-all duration-300 hover:-translate-y-1 group border ${activeMode === 'resume_opt' ? 'border-pink-400 ring-4 ring-pink-50 shadow-xl' : 'border-gray-100 shadow-sm'}`}
                                    style={{
                                        backgroundImage: `url(${ResumeBg})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                >
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="bg-white text-pink-700 px-2 py-1 border border-pink-700 rounded-md text-[10px] font-bold uppercase">Popular</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Resume Optimizer</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed font-medium">Upload PDF. I'll rewrite bullets to match JD keywords instantly using AI.</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-[2rem] p-7 transition-all duration-300 hover:-translate-y-1 group border border-pink-300 cursor-pointer relative overflow-hidden"
                                    style={{
                                        backgroundImage: `url(${PoliBg})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                >
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-6">
                                                <span className="flex flex-row align-center justify-center gap-1 bg-white backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-orange-400 border border-orange-400"><span><Crown size={16} /></span> Master</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">Poli-1 Sequence</h3>
                                            <p className="text-sm text-gray-900/80 font-semibold leading-relaxed">Launch targeted emails to the 12 leads found below.</p>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-900 bg-white/30 self-start px-4 py-2 rounded-xl backdrop-blur-sm group-hover:bg-white/50 transition-colors mt-4">
                                            Start Campaign <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
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
                                        placeholder={activeMode === 'jop1_scrape' ? "Paste job keyword here..." : "Ask JobPilot to find leads..."}
                                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 h-full text-lg font-medium px-2"
                                    />
                                    <button className={`h-12 px-6 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all shadow-sm group shrink-0 ${activeMode === 'jop1_scrape' ? 'bg-black text-white hover:bg-gray-800' : 'bg-[#ffb6e6] hover:bg-pink-300 text-gray-900'}`}>
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

export default JobPilotDashboard;