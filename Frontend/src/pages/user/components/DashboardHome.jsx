import React from 'react';
import {
    Calendar,
    Plus,
    Sparkles,
    Briefcase,
    Crown,
    Zap,
    Send,
    ArrowRight,
    Search,
    ChevronRight,
    AlertCircle,
    Globe
} from 'lucide-react';
import CompanyRow from './CompanyRow';
import JopBg from '../../../assets/User/JOP.png';

const DashboardHome = ({ activeMode, handleModeChange, todayDate, creditBalance }) => {
    return (
        <div className="w-full max-w-[1600px] space-y-8">
            <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-2">
                <div>
                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                        <Calendar size={12} />
                        <span>{todayDate}</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Welcome back, Sam.
                    </h2>
                </div>
                <div className="group flex items-center gap-3 bg-white dark:bg-[#111111] p-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-none mb-1">Available Credits</span>
                        <div className="flex justify-center items-center gap-2">
                            <span className="text-xl font-bold text-gray-900 dark:text-white leading-none font-mono tracking-tight">
                                {creditBalance.toLocaleString()}
                            </span>
                            <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors">
                                <Plus size={12} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <section className="space-y-4 pt-6 border-t border-dashed border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <Sparkles size={16} className="text-yellow-500 fill-yellow-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">You might want to try</h3>
                </div>

                <div className="relative w-full">
                    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-1 scrollbar-hide snap-x">
                        <div className="min-w-[260px] h-[85px] bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-[0_4px_20px_-10px_rgba(59,130,246,0.3)] transition-all rounded-2xl flex items-center justify-between p-5 cursor-pointer snap-start relative overflow-hidden group">
                            <div className="z-10 flex flex-col justify-center h-full">
                                <span className="font-bold text-[15px] text-gray-900 dark:text-gray-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">New<br />Application</span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-2 group-hover:text-blue-400 transition-colors">Start from scratch</span>
                            </div>
                            <div className="relative w-[70px] h-full flex items-center justify-center">
                                <div className="absolute w-14 h-16 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg rotate-[-6deg] group-hover:rotate-[-12deg] transition-transform duration-300 origin-bottom-right"></div>
                                <div className="absolute w-14 h-16 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg rotate-[6deg] group-hover:rotate-[12deg] transition-transform duration-300 origin-bottom-left"></div>
                                <div className="relative w-14 h-16 bg-white dark:bg-[#111111] border border-blue-200 dark:border-blue-700 rounded-lg shadow-sm flex flex-col items-center justify-center gap-2 z-10 group-hover:-translate-y-1 transition-transform duration-300">
                                    <Briefcase size={20} className="text-blue-500" />
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md shadow-blue-200 dark:shadow-none">
                                        <Plus size={12} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="min-w-[280px] h-[85px] bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-[0_4px_20px_-10px_rgba(251,146,60,0.3)] transition-all rounded-2xl flex items-center justify-between p-5 cursor-pointer snap-start relative overflow-hidden group">
                            <div className="z-10 flex flex-col items-start h-full justify-center">
                                <span className="bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide mb-1.5 border border-orange-200 dark:border-orange-900/40">New</span>
                                <span className="font-bold text-[15px] text-gray-900 dark:text-gray-100 leading-tight">Free AI<br />Cover Letter</span>
                            </div>
                            <div className="relative w-24 h-16 group-hover:scale-105 transition-transform duration-300">
                                <div className="absolute inset-0 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30 overflow-hidden">
                                    <div className="absolute top-0 right-0 p-1.5">
                                        <div className="w-2 h-2 rounded-full bg-orange-200 dark:bg-orange-800"></div>
                                    </div>
                                    <div className="p-3 space-y-1.5 mt-2">
                                        <div className="w-3/4 h-1.5 bg-orange-200/50 dark:bg-orange-800 rounded-full"></div>
                                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                                        <div className="w-5/6 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-white dark:bg-[#111111] rounded-full shadow-md border border-orange-100 dark:border-orange-900/30 flex items-center justify-center z-20 group-hover:rotate-12 transition-transform">
                                        <Sparkles size={12} className="text-orange-500 fill-orange-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="min-w-[280px] h-[85px] bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-[0_4px_20px_-10px_rgba(168,85,247,0.3)] transition-all rounded-2xl flex items-center justify-between p-5 cursor-pointer snap-start relative overflow-hidden group">
                            <div className="z-10 flex flex-col items-start h-full justify-center">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide border border-purple-200 dark:border-purple-900/40">Beta</span>
                                </div>
                                <span className="font-bold text-[15px] text-gray-900 dark:text-gray-100 leading-tight">Interview<br />Coach</span>
                            </div>
                            <div className="w-24 h-16 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30 relative overflow-hidden flex items-center justify-center gap-1 group-hover:gap-1.5 transition-all">
                                <div className="w-1.5 h-4 bg-purple-300 dark:bg-purple-700 rounded-full animate-pulse"></div>
                                <div className="w-1.5 h-8 bg-purple-500 dark:bg-purple-500 rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
                                <div className="w-1.5 h-5 bg-purple-400 dark:bg-purple-600 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                                <div className="w-1.5 h-10 bg-purple-600 dark:bg-purple-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]"></div>
                                <div className="w-1.5 h-6 bg-purple-400 dark:bg-purple-600 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]"></div>

                                <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-purple-100 dark:from-purple-900/30 to-transparent opacity-50"></div>
                            </div>
                        </div>
                        <div className="min-w-[280px] h-[85px] bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-[0_4px_20px_-10px_rgba(16,185,129,0.3)] transition-all rounded-2xl flex items-center justify-between p-5 cursor-pointer snap-start relative overflow-hidden group">
                            <div className="z-10 flex flex-col justify-center h-full">
                                <span className="font-bold text-[15px] text-gray-900 dark:text-gray-100 leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Find Career<br />Paths AI</span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-2">Explore roadmaps</span>
                            </div>
                            <div className="w-24 h-16 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden group-hover:scale-105 transition-transform">
                                <div className="absolute top-3 left-3 w-2.5 h-2.5 bg-emerald-400 rounded-full z-10 ring-2 ring-white dark:ring-[#111111]"></div>
                                <div className="absolute top-8 left-10 w-2.5 h-2.5 bg-emerald-300 rounded-full z-10 ring-2 ring-white dark:ring-[#111111]"></div>
                                <div className="absolute bottom-3 right-4 w-3 h-3 bg-emerald-500 rounded-full z-10 ring-2 ring-white dark:ring-[#111111] shadow-sm flex items-center justify-center">
                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                </div>
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    <path d="M15 15 Q 35 15, 42 32 T 80 50" fill="none" stroke="#6ee7b7" strokeWidth="2" strokeDasharray="4 2" />
                                </svg>

                                <div className="absolute top-2 right-2 p-1 bg-white dark:bg-[#111111] rounded shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                                    <Search size={10} className="text-emerald-500" />
                                </div>
                            </div>
                        </div>
                        <div className="min-w-[60px] h-[85px] bg-gray-50 dark:bg-[#18181b] border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white dark:hover:bg-[#111111] hover:border-gray-400 dark:hover:border-gray-600 transition-all group">
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                <ChevronRight size={18} className="text-gray-400 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white" />
                            </div>
                        </div>

                    </div>
                </div>
            </section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    onClick={() => handleModeChange('jop1_scrape')}
                    className={`relative overflow-hidden rounded-[2rem] p-7 h-[250px] cursor-pointer transition-all duration-300 hover:-translate-y-1 group border ${activeMode === 'jop1_scrape' ? 'border-purple-400 ring-4 ring-purple-50 shadow-xl dark:ring-purple-900/20' : 'border-gray-100 dark:border-gray-800 shadow-sm'}`}
                    style={{
                        backgroundImage: `url(${JopBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >

                    <div className="relative z-10">
                        <div className="flex flex-row gap-2 items-start mb-4">
                            <span className="bg-white/90 dark:bg-black/80 backdrop-blur-sm text-purple-700 dark:text-purple-400 px-2 py-1 border border-purple-700 dark:border-purple-500 rounded-md text-[10px] font-bold uppercase">Web Search</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">JOP-1 Assistant</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">An advanced AI model for intelligent company discovery and job contact search.</p>
                    </div>
                </div>
                <div
                    onClick={() => handleModeChange('resume_opt')}
                    className={`relative overflow-hidden rounded-[2rem] p-7 cursor-pointer transition-all duration-300 hover:-translate-y-1 group border ${activeMode === 'resume_opt'
                        ? 'bg-white dark:bg-[#111111] border-pink-400 ring-4 ring-pink-50 dark:ring-pink-900/20 shadow-2xl'
                        : 'bg-white dark:bg-[#111111] border-gray-100 dark:border-gray-800 shadow-sm'
                        }`}
                >
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-white dark:bg-black text-pink-700 dark:text-pink-400 px-2 py-1 border border-pink-700 dark:border-pink-500 rounded-md text-[10px] font-bold uppercase">Popular</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 relative z-20">Resume Optimizer</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium max-w-[220px] relative z-20">
                            Upload PDF. I'll rewrite bullets to match JD keywords instantly using AI.
                        </p>
                        <div className="absolute bottom-[-40px] right-[-65px] w-[320px] h-[160px] pointer-events-none perspective-[1000px]">
                            <div className="absolute bottom-[35px] left-8 w-24 h-20 bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md border border-pink-100 dark:border-pink-900/30 rounded-xl shadow-lg z-10 transform rotate-[-6deg] translate-x-4 group-hover:-translate-x-6 group-hover:rotate-[-12deg] transition-all duration-500 ease-out flex flex-col p-2 gap-1.5">
                                <div className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase">Missing Keywords</div>
                                <div className="flex flex-wrap gap-1">
                                    <div className="h-1.5 w-8 bg-pink-100 dark:bg-pink-900/50 rounded-full"></div>
                                    <div className="h-1.5 w-5 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                                    <div className="h-1.5 w-10 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                                    <div className="h-1.5 w-6 bg-pink-100 dark:bg-pink-900/50 rounded-full"></div>
                                </div>
                                <div className="mt-auto flex items-center gap-1 text-[9px] font-bold text-pink-500">
                                    <AlertCircle size={10} /> 4 Found
                                </div>
                            </div>
                            <div className="absolute bottom-12 right-12 w-24 h-24 bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md border border-pink-100 dark:border-pink-900/30 rounded-xl shadow-lg z-10 transform rotate-[6deg] -translate-x-4 group-hover:translate-x-4 group-hover:rotate-[12deg] transition-all duration-500 ease-out flex flex-col items-center justify-center p-2">
                                <div className="relative w-10 h-10 mb-1">
                                    <svg className="w-full h-full rotate-[-90deg]">
                                        <circle cx="20" cy="20" r="16" stroke="#f3f4f6" strokeWidth="4" fill="none" className="dark:stroke-gray-800" />
                                        <circle cx="20" cy="20" r="16" stroke="#ec4899" strokeWidth="4" fill="none" strokeDasharray="100" strokeDashoffset="100" className="group-hover:stroke-dashoffset-10 transition-all duration-1000 ease-out" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-900 dark:text-white">98%</div>
                                </div>
                                <div className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase text-center">ATS Score</div>
                            </div>
                            <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 w-40 h-52 bg-gradient-to-b from-white to-gray-50 dark:from-[#18181b] dark:to-[#09090b] rounded-t-2xl border border-gray-200 dark:border-gray-800 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20 group-hover:-translate-y-6 transition-transform duration-500 ease-out">
                                <div className="p-4 border-b border-dashed border-gray-200 dark:border-gray-800 flex gap-3 items-center">
                                    <div className="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-900/30 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-pink-500">CV</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="w-16 h-2 bg-gray-800 dark:bg-gray-600 rounded-full"></div>
                                        <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="flex gap-2">
                                        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mt-1"></div>
                                        <div className="space-y-1.5 flex-1">
                                            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                                            <div className="w-5/6 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-1 h-1 rounded-full bg-pink-500 mt-1 shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
                                        <div className="space-y-1.5 flex-1">
                                            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-transparent dark:from-pink-900 w-full -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                                            </div>
                                            <div className="w-4/5 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -top-3 -right-3 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-md border border-pink-100 dark:border-pink-900/30 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 delay-200">
                                    <Sparkles size={14} className="text-pink-500 fill-pink-500 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="bg-white dark:bg-[#111111] rounded-[2rem] p-7 transition-all duration-300 hover:-translate-y-1 group border border-orange-200 dark:border-orange-900/40 hover:border-orange-400 hover:shadow-[0_20px_60px_-15px_rgba(249,115,22,0.3)] cursor-pointer relative overflow-hidden h-full flex flex-col justify-between"
                >
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(249,115,22,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(249,115,22,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

                    <div className="relative z-20 pointer-events-none">
                        <div className="flex items-center justify-between mb-2">
                            <span className="flex flex-row align-center justify-center gap-1 bg-white dark:bg-black backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-orange-400 border border-orange-400"><span><Crown size={16} /></span> Master</span>
                            <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/40 px-2 py-1 rounded-md">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400 font-mono">
                                    <span className="group-hover:hidden">READY</span>
                                    <span className="hidden group-hover:inline">PROCESSING...</span>
                                </span>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 transition-colors">Poli-1 Automation</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-[240px]">
                            Launch targeted emails to the <span className="text-gray-900 dark:text-white font-bold border-b-2 border-orange-200 dark:border-orange-800">12 leads</span> found below.
                        </p>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[180px] overflow-hidden pointer-events-none">
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-100 dark:bg-gray-800"></div>
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent transform -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                            <div className="relative w-16 h-16 bg-white dark:bg-[#18181b] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <div className="absolute inset-0 bg-orange-100/50 dark:bg-orange-900/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 animate-pulse"></div>
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden">
                                    <Zap size={20} className="text-white fill-white relative z-10" />
                                    <div className="absolute inset-0 bg-white/30 skew-x-12 -translate-x-10 group-hover:animate-[shine_1.5s_infinite]"></div>
                                </div>
                                <div className="absolute -top-4 -bottom-4 w-[2px] bg-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                        <div className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-16 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm flex flex-col items-center justify-center gap-1 z-10 opacity-60 group-hover:animate-[slideRight_2s_linear_infinite]">
                            <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                            <div className="w-8 h-1 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                        </div>
                        <div className="absolute top-1/2 -left-12 -translate-y-1/2 w-12 h-16 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm flex flex-col items-center justify-center gap-1 z-10 opacity-60 group-hover:animate-[slideRight_2s_linear_infinite_0.7s]">
                            <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                            <div className="w-8 h-1 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                        </div>
                        <div className="absolute top-1/2 right-12 -translate-y-1/2 z-10 opacity-0 group-hover:animate-[flyOut_2s_linear_infinite_1s]">
                            <div className="bg-green-500 p-2 rounded-full shadow-lg shadow-green-200 dark:shadow-none border-2 border-white dark:border-[#111111] transform rotate-45">
                                <Send size={16} className="text-white fill-white" />
                            </div>
                            <div className="absolute top-1/2 right-full w-12 h-[2px] bg-gradient-to-l from-green-400 to-transparent"></div>
                        </div>
                        <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10 opacity-0 group-hover:animate-[flyOut_2s_linear_infinite_1.7s]">
                            <div className="bg-green-500 p-2 rounded-full shadow-lg shadow-green-200 dark:shadow-none border-2 border-white dark:border-[#111111] transform rotate-45">
                                <Send size={16} className="text-white fill-white" />
                            </div>
                        </div>
                    </div>
                    <div className="relative z-30 flex items-center gap-2 text-xs font-bold text-gray-900 bg-white/80 dark:bg-black/50 border border-gray-100 dark:border-gray-800 self-start px-5 py-3 rounded-xl backdrop-blur-md shadow-sm w-fit">
                        <span className="dark:text-white">Start Auto-Sequence</span>
                        <div className="w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center transition-colors">
                            <ArrowRight size={10} className="text-gray-500 dark:text-gray-400 group-hover:text-white transition-colors" />
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
            <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Identified Companies
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">12</span>
                    </h3>
                    <div className="flex gap-2">
                        <button className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Get More</button>
                        <button className="text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 px-3 py-1.5 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors">View All</button>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 mb-2">
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
    );
};

export default DashboardHome;
