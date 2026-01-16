import React, { useState, useEffect } from 'react';
import { 
    Upload, FileText, Settings, Play, PenTool, 
    Briefcase, Code2, Users, ChevronRight, Server,
    CheckCircle2, AlertCircle, X, Languages, Globe
} from 'lucide-react';
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

const templates = [
    { id: 'frontend', name: 'Frontend Developer', icon: Code2, desc: 'React, Vue, CSS, System Design' },
    { id: 'backend', name: 'Backend Developer', icon: Server, desc: 'Node.js, Databases, API Design' },
    { id: 'behavioral', name: 'Behavioral & HR', icon: Users, desc: 'Soft skills, Leadership, Culture fit' },
    { id: 'fullstack', name: 'Full Stack', icon: Briefcase, desc: 'End-to-end development challenges' },
];

const InterviewCoach = () => {
    const isMobile = useIsMobile();
    const [settings, setSettings] = useState({
        cvFile: null,
        difficulty: 'intermediate',
        useCanvas: false,
        template: 'frontend',
        companyContext: '',
        language: 'english'
    });
    
    const [isSessionStarted, setIsSessionStarted] = useState(false);
    const [dragActive, setDragActive] = useState(false);

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

    const removeFile = () => {
        setSettings({ ...settings, cvFile: null });
    };

    const startSession = () => {
        setIsSessionStarted(true);
    };

    return (
        <UserLayout activeMode="interview-coach" isMobile={isMobile}>
            <div className="h-full bg-gray-50 dark:bg-[#090909] p-4 md:p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">AI Interview Coach</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Practice technical and behavioral interviews with our advanced AI. Customize your session to match your target role.
                    </p>
                </div>

                {!isSessionStarted ? (
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-[#121111] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#1F1F1F]">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-indigo-500" />
                                    Session Parameters
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty Level</label>
                                        <div className="flex bg-gray-100 dark:bg-[#1A1A1A] p-1 rounded-lg">
                                            {['beginner', 'intermediate', 'hard'].map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setSettings({...settings, difficulty: level})}
                                                    className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-all ${
                                                        settings.difficulty === level 
                                                        ? 'bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-gray-100 shadow-sm' 
                                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interview Language</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                            <select 
                                                value={settings.language}
                                                onChange={(e) => setSettings({...settings, language: e.target.value})}
                                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                                            >
                                                <option value="english">English</option>
                                                <option value="french">French</option>
                                                <option value="spanish">Spanish</option>
                                                <option value="german">German</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Company (Optional)</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Google, Amazon, Startup..." 
                                            value={settings.companyContext}
                                            onChange={(e) => setSettings({...settings, companyContext: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">We'll adapt the interview style to match this company's culture.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-[#121111] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#1F1F1F]">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-500" />
                                    Resume Context
                                </h3>
                                
                                <div 
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`
                                        border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 relative
                                        ${dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-gray-200 dark:border-[#333] hover:border-indigo-400'}
                                    `}
                                >
                                    {settings.cvFile ? (
                                        <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="bg-white dark:bg-[#090909] p-2 rounded shadow-sm">
                                                    <FileText size={20} className="text-indigo-600" />
                                                </div>
                                                <div className="text-left overflow-hidden">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[120px]">{settings.cvFile.name}</p>
                                                    <p className="text-xs text-gray-500">{(settings.cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <button onClick={removeFile} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                                                <X size={16} className="text-gray-500" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input 
                                                id="cv-upload" 
                                                type="file" 
                                                className="hidden" 
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                            />
                                            <label htmlFor="cv-upload" className="cursor-pointer block">
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                                    <Upload size={24} />
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">Click to upload</p>
                                                <p className="text-xs text-gray-500 mt-1">or drag and drop PDF/DOCX</p>
                                            </label>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#121111] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#1F1F1F]">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tools</h3>
                                
                                <div 
                                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] cursor-pointer transition-colors"
                                    onClick={() => setSettings({...settings, useCanvas: !settings.useCanvas})}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${settings.useCanvas ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <PenTool size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Whiteboard Mode</p>
                                            <p className="text-xs text-gray-500">For coding & diagrams</p>
                                        </div>
                                    </div>
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.useCanvas ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings.useCanvas ? 'left-[22px]' : 'left-0.5'}`} />
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={startSession}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group"
                            >
                                <Play size={20} className="fill-current" />
                                Start Interview
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            
                            <p className="text-center text-xs text-gray-400">
                                Usually takes 15-30 mins. You can stop anytime.
                            </p>
                        </div>
                    </div>
                ) : (
                     <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Live Session
                                </div>
                                <span className="text-gray-500 text-sm">|</span>
                                <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">{templates.find(t => t.id === settings.template)?.name || 'Custom'} Interview</span>
                                <span className="text-xs text-gray-400">({settings.difficulty})</span>
                            </div>
                            <button 
                                onClick={() => setIsSessionStarted(false)}
                                className="text-sm text-red-500 hover:text-red-600 font-medium px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                            >
                                End Session
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                            <div className={`bg-white dark:bg-[#121111] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1F1F1F] flex flex-col overflow-hidden ${settings.useCanvas ? '' : 'lg:col-span-2'}`}>
                                <div className="flex-1 p-6 flex items-center justify-center text-gray-400 flex-col gap-4">
                                     <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/10 flex items-center justify-center animate-bounce">
                                        <Briefcase className="text-indigo-500" size={32} />
                                     </div>
                                     <p>AI Interviewer is initializing...</p>
                                     <p className="text-xs max-w-md text-center">Using context: <b>{settings.template}</b> role, <b>{settings.difficulty}</b> difficulty{settings.companyContext && `, at ${settings.companyContext}`}.</p>
                                </div>
                                <div className="p-4 border-t border-gray-100 dark:border-[#1F1F1F]">
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Type your answer..." 
                                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                        <button className="px-6 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">Send</button>
                                    </div>
                                </div>
                            </div>
                            {settings.useCanvas && (
                                <div className="bg-white dark:bg-[#121111] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1F1F1F] flex flex-col overflow-hidden">
                                    <div className="h-10 border-b border-gray-100 dark:border-[#1F1F1F] flex items-center justify-between px-4 bg-gray-50 dark:bg-[#1A1A1A]">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                            <PenTool size={14} /> Whiteboard
                                        </span>
                                        <div className="flex gap-1">
                                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        </div>
                                    </div>
                                    <textarea 
                                        className="flex-1 p-4 w-full h-full resize-none outline-none font-mono text-sm bg-white dark:bg-[#121111] text-gray-800 dark:text-gray-200"
                                        placeholder="// Write your code or notes here..."
                                    ></textarea>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </UserLayout>
    );
};

export default InterviewCoach;
