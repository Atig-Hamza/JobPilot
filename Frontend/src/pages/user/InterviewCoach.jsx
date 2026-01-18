import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import UserLayout from './components/UserLayout';

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

const InterviewCoach = () => {
    const isMobile = useIsMobile();
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    const [settings, setSettings] = useState({
        cvFile: null,
        jobDescription: '',
        companyName: '',
        interviewType: 'behavioral',
        experienceLevel: 'mid',
        duration: '30',
        tone: 'neutral',
        focusAreas: []
    });

    const [isSessionStarted, setIsSessionStarted] = useState(false);

    const focusOptions = [
        { id: 'react', label: 'React' },
        { id: 'node', label: 'Node.js' },
        { id: 'python', label: 'Python' },
        { id: 'system_design', label: 'System Design' },
        { id: 'leadership', label: 'Leadership' },
        { id: 'sql', label: 'SQL' },
        { id: 'cloud', label: 'Cloud/AWS' }
    ];

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSettings({ ...settings, cvFile: e.target.files[0] });
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSettings({ ...settings, cvFile: e.dataTransfer.files[0] });
        }
    };

    const removeFile = (e) => {
        e?.stopPropagation();
        setSettings({ ...settings, cvFile: null });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const toggleFocusArea = (id) => {
        setSettings(prev => {
            if (prev.focusAreas.includes(id)) {
                return { ...prev, focusAreas: prev.focusAreas.filter(f => f !== id) };
            } else {
                return { ...prev, focusAreas: [...prev.focusAreas, id] };
            }
        });
    };

    const startSession = () => {
        setIsSessionStarted(true);
    };

    return (
        <UserLayout activeMode="interview-coach" isMobile={isMobile}>
            <div className="h-full bg-white dark:bg-[#050505] overflow-y-auto">
                <div className="max-w-5xl mx-auto p-4 md:p-12 pb-24">

                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900 dark:text-white mb-4">
                            Configure your session
                        </h1>
                        <p className="text-gray-500 dark:text-[#888888] text-lg max-w-2xl mx-auto">
                            Tailor the AI to simulate your specific interview scenario.
                        </p>
                    </div>

                    {!isSessionStarted ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <section className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#222222] rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg border border-gray-100 dark:border-[#222]">
                                            <i className="ph ph-briefcase text-lg text-gray-900 dark:text-white"></i>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Target Role</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Company Name</label>
                                            <div className="h-11 px-3 bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#333] rounded-xl flex items-center focus-within:border-gray-400 dark:focus-within:border-zinc-500 transition-colors">
                                                <i className="ph ph-buildings text-gray-400 dark:text-zinc-600 text-lg mr-2"></i>
                                                <input
                                                    type="text"
                                                    className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600"
                                                    placeholder="e.g. Google, Amazon..."
                                                    value={settings.companyName}
                                                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Experience Level</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full h-11 pl-10 pr-4 bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#333] rounded-xl appearance-none text-sm text-gray-900 dark:text-white focus:border-gray-400 dark:focus:border-zinc-500 outline-none transition-colors"
                                                    value={settings.experienceLevel}
                                                    onChange={(e) => setSettings({ ...settings, experienceLevel: e.target.value })}
                                                >
                                                    <option value="junior">Junior (0-2 years)</option>
                                                    <option value="mid">Mid-Level (3-5 years)</option>
                                                    <option value="senior">Senior (5-8 years)</option>
                                                    <option value="staff">Staff/Principal (8+ years)</option>
                                                    <option value="executive">Executive</option>
                                                </select>
                                                <div className="absolute left-3 top-3 pointer-events-none">
                                                    <i className="ph ph-trend-up text-gray-400 dark:text-zinc-600 text-lg"></i>
                                                </div>
                                                <div className="absolute right-3 top-3 pointer-events-none">
                                                    <i className="ph ph-caret-down text-gray-400 dark:text-zinc-600 text-xs"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Job Description (Optional)</label>
                                        <textarea
                                            className="w-full bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#333] rounded-xl p-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors resize-none min-h-[120px]"
                                            placeholder="Paste the job description here for a tailored experience..."
                                            value={settings.jobDescription}
                                            onChange={(e) => setSettings({ ...settings, jobDescription: e.target.value })}
                                        ></textarea>
                                    </div>
                                </section>
                                <section className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#222222] rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg border border-gray-100 dark:border-[#222]">
                                            <i className="ph ph-file-text text-lg text-gray-900 dark:text-white"></i>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Resume Context</h3>
                                    </div>

                                    <div
                                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragActive
                                                ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-[#1A1A1A]'
                                                : 'border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-zinc-600 bg-white dark:bg-[#161616]'
                                            }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                        />

                                        {settings.cvFile ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#222] flex items-center justify-center">
                                                    <i className="ph ph-file-pdf text-2xl text-red-500"></i>
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{settings.cvFile.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{(settings.cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                                <button
                                                    onClick={removeFile}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#333] rounded-full text-gray-500 hover:text-red-500 transition-colors ml-2"
                                                >
                                                    <i className="ph ph-x"></i>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-[#222] flex items-center justify-center mb-3 text-gray-400 dark:text-zinc-500">
                                                    <i className="ph ph-upload-simple text-2xl"></i>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Upload your Resume</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Drag & drop or click to browse (PDF, DOCX)</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                            <div className="space-y-6">
                                <section className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#222222] rounded-2xl p-6 shadow-sm h-full">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg border border-gray-100 dark:border-[#222]">
                                            <i className="ph ph-sliders text-lg text-gray-900 dark:text-white"></i>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Parameters</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Interview Type</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Behavioral', 'Technical', 'System Design', 'Live Coding'].map((type) => {
                                                    const value = type.toLowerCase().replace(' ', '_');
                                                    const isSelected = settings.interviewType === value;
                                                    return (
                                                        <button
                                                            key={value}
                                                            onClick={() => setSettings({ ...settings, interviewType: value })}
                                                            className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${isSelected
                                                                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                                                    : 'bg-white dark:bg-[#161616] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-zinc-500'
                                                                }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Interviewer Tone</label>
                                            <div className="flex bg-gray-100 dark:bg-[#161616] p-1 rounded-xl">
                                                {['Friendly', 'Neutral', 'Strict'].map((tone) => {
                                                    const value = tone.toLowerCase();
                                                    const isSelected = settings.tone === value;
                                                    return (
                                                        <button
                                                            key={value}
                                                            onClick={() => setSettings({ ...settings, tone: value })}
                                                            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${isSelected
                                                                    ? 'bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white shadow-sm'
                                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                                }`}
                                                        >
                                                            {tone}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Duration</label>
                                            <div className="h-10 px-1 bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#333] rounded-xl flex items-center justify-between">
                                                <button
                                                    onClick={() => setSettings(s => ({ ...s, duration: Math.max(15, parseInt(s.duration) - 15).toString() }))}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white"
                                                >
                                                    <i className="ph ph-minus"></i>
                                                </button>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {settings.duration} min
                                                </span>
                                                <button
                                                    onClick={() => setSettings(s => ({ ...s, duration: Math.min(60, parseInt(s.duration) + 15).toString() }))}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white"
                                                >
                                                    <i className="ph ph-plus"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Technical Focus</label>
                                            <div className="flex flex-wrap gap-2">
                                                {focusOptions.map((option) => {
                                                    const isSelected = settings.focusAreas.includes(option.id);
                                                    return (
                                                        <button
                                                            key={option.id}
                                                            onClick={() => toggleFocusArea(option.id)}
                                                            className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${isSelected
                                                                    ? 'bg-gray-100 dark:bg-[#222] border-gray-400 dark:border-zinc-500 text-black dark:text-white'
                                                                    : 'bg-transparent border-gray-200 dark:border-[#333] text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-600'
                                                                }`}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    );
                                                })}
                                                <button className="px-3 py-1.5 rounded-full text-[11px] font-medium border border-dashed border-gray-300 dark:border-[#444] text-gray-400 hover:text-gray-600 dark:hover:text-white hover:border-gray-400 transition-colors">
                                                    + Add
                                                </button>
                                            </div>
                                        </div>
                                        <div className="pt-6 mt-4 border-t border-gray-100 dark:border-[#222]">
                                            <button
                                                onClick={startSession}
                                                className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg shadow-black/5"
                                            >
                                                <span>Start Session</span>
                                                <i className="ph-bold ph-arrow-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto text-center py-20">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Interview Session Initialized</h2>
                            <p className="text-gray-500 mb-8">Connecting to AI Interviewer...</p>
                            <button onClick={() => setIsSessionStarted(false)} className="text-sm underline">Back to settings</button>
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    );
};

export default InterviewCoach;
