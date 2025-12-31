import React, { useState, useRef } from 'react';
import MainLogo from '../../assets/Main/logo-without-bg.png'; // Ensure path is correct
import { 
  LayoutGrid, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Settings, 
  Plus, 
  ArrowRight,
  Bot,
  Code2,
  Users,
  Briefcase,
  Sparkles,
  UploadCloud,
  Globe,
  Gift,
  Newspaper,
  Mail,
  Send,
  CheckCircle2,
  FileCheck,
  Trash2,
  AlertCircle
} from 'lucide-react';

const JobPilotDashboard = () => {
  // Modes: 'general', 'resume_opt', 'jop1_scrape'
  const [activeMode, setActiveMode] = useState('general');
  
  // Real File Handling State
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    setUploadedFile(null); // Reset file when changing modes
  };

  // Trigger the hidden file input
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Handle the file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create a URL for preview if needed, or just store metadata
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB', // Convert to MB
        type: file.type
      });
    }
  };

  // Remove the file
  const removeFile = (e) => {
    e.stopPropagation();
    setUploadedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex h-screen w-screen bg-[#FAFAFA] font-sans text-gray-900 overflow-hidden selection:bg-pink-200 selection:text-pink-900">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-[260px] bg-[#FDFDFD] border-r border-gray-100 flex flex-col justify-between shrink-0 z-20 hidden md:flex">
        <div className="p-5 flex flex-col h-full">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 mb-10 pl-2 select-none cursor-pointer">
            <img 
              src={MainLogo} 
              alt="JobPilot Logo" 
              className='w-6 h-6 object-contain' 
              onError={(e) => {e.target.src='https://via.placeholder.com/24'}}
            />
            <span className="font-bold text-gray-900 tracking-tight text-lg">JOBPILOT</span>
          </div>

          {/* Navigation */}
          <div className="space-y-8 flex-1 overflow-y-auto scrollbar-hide">
            <nav className="space-y-1">
              <NavItem icon={<LayoutGrid size={18} />} label="Dashboard" active />
              <NavItem icon={<Bot size={18} />} label="AutoPilot Agent" />
              <NavItem icon={<CheckSquare size={18} />} label="Applications" />
              <NavItem icon={<Calendar size={18} />} label="Interviews" />
              <NavItem icon={<FileText size={18} />} label="Cover Letters" />
            </nav>

            {/* Tools List */}
            <div className="px-3">
              <h3 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Power Tools</h3>
              <div className="space-y-4">
                <ToolItem icon={<Code2 size={16} />} label="Tech Interview Lab" />
                <ToolItem icon={<Users size={16} />} label="Behavioral Sim" />
                <ToolItem icon={<Briefcase size={16} />} label="Lead Finder" />
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="mt-auto pt-6 border-t border-gray-100 space-y-2">
            <div className="space-y-1 mb-4">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-black rounded-xl transition-colors">
                    <Newspaper size={16} className="text-gray-400"/>
                    <span>View News</span>
                </button>
                <button 
                    onClick={() => window.location.href='/user/redeem-code'}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-pink-50 hover:text-pink-600 rounded-xl transition-colors group"
                >
                    <Gift size={16} className="text-pink-400 group-hover:text-pink-600"/>
                    <span>Redeem Credit</span>
                </button>
            </div>

            <div className="flex items-center justify-between px-3 py-2 text-gray-500 hover:text-gray-900 cursor-pointer rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 border border-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-700">JS</div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">Sam Smith</span>
                    <span className="text-[10px] text-gray-400">Pro Plan</span>
                </div>
              </div>
              <Settings size={14} />
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col relative h-full">
        
        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto w-full scroll-smooth">
            <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-12 pb-44">
                <div className="w-full max-w-5xl space-y-8">
                    
                    {/* Header */}
                    <header>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1]">
                            Welcome back, Sam. <br />
                            <span className="text-gray-400 font-medium">You have <span className="text-gray-900 underline decoration-pink-300 decoration-4 underline-offset-4">12 companies</span> ready for outreach.</span>
                        </h2>
                    </header>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                        {/* Card 1: JOP-1 Scraper */}
                        <div 
                            onClick={() => handleModeChange('jop1_scrape')}
                            className={`relative overflow-hidden bg-white rounded-[2rem] p-7 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group border ${activeMode === 'jop1_scrape' ? 'border-purple-400 ring-4 ring-purple-50 shadow-xl' : 'border-gray-100 shadow-sm'}`}
                        >
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full blur-2xl group-hover:bg-purple-100 transition-colors"></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                                        <Globe size={22} />
                                    </div>
                                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">Scraper</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">JOP-1 Assistant</h3>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">Paste a job URL. I'll parse requirements & generate tailored application assets.</p>
                            </div>
                        </div>

                        {/* Card 2: AI Resume Opt */}
                        <div 
                            onClick={() => handleModeChange('resume_opt')}
                            className={`relative overflow-hidden bg-white rounded-[2rem] p-7 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group border ${activeMode === 'resume_opt' ? 'border-pink-400 ring-4 ring-pink-50 shadow-xl' : 'border-gray-100 shadow-sm'}`}
                        >
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-pink-50 rounded-full blur-2xl group-hover:bg-pink-100 transition-colors"></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-50 to-white border border-pink-100 flex items-center justify-center text-pink-600 shadow-sm group-hover:scale-110 transition-transform">
                                        <Sparkles size={22} />
                                    </div>
                                    <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">Popular</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Resume Optimizer</h3>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">Upload PDF. I'll rewrite bullets to match JD keywords instantly using AI.</p>
                            </div>
                        </div>

                        {/* Card 3: ACTION CARD (Auto Apply) */}
                        <div className="bg-gradient-to-br from-[#ffb6e6] to-[#ff9ecd] rounded-[2rem] p-7 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group border border-pink-300 cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400 opacity-30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                            
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center text-gray-900 shadow-inner">
                                            <Send size={22} />
                                        </div>
                                        <span className="bg-white/40 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-gray-900 border border-white/20">Action</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">Auto-Apply Sequence</h3>
                                    <p className="text-sm text-gray-900/80 font-semibold leading-relaxed">Launch targeted emails to the 12 leads found below.</p>
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 bg-white/30 self-start px-4 py-2 rounded-xl backdrop-blur-sm group-hover:bg-white/50 transition-colors mt-4">
                                    Start Campaign <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company Email List */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Mail size={18} className="text-pink-500"/> 
                                Identified Companies 
                                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">12</span>
                            </h3>
                            <div className="flex gap-2">
                                <button className="text-xs font-bold text-gray-500 hover:text-black px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">Select All</button>
                                <button className="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1.5 rounded-lg hover:bg-pink-100 transition-colors">Refresh List</button>
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            {/* Header Row */}
                            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 mb-2">
                                <div className="col-span-4">Company</div>
                                <div className="col-span-4">Target Email</div>
                                <div className="col-span-2">Source</div>
                                <div className="col-span-2 text-right">Action</div>
                            </div>

                            {/* List Items */}
                            <CompanyRow 
                                name="Linear" 
                                logo="https://upload.wikimedia.org/wikipedia/commons/9/95/Linear_logo.svg"
                                email="careers@linear.app"
                                source="Website"
                                status="ready"
                            />
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
                            <CompanyRow 
                                name="Airbnb" 
                                logo="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg"
                                email="talent@airbnb.com"
                                source="Website"
                                status="ready"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>

        {/* ================= INPUT AREA (Fixed Bottom) ================= */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 to-transparent pt-16 pb-8 px-6 z-30 pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">
                
                {/* Mode Indicators */}
                <div className="flex justify-center gap-2 mb-4">
                    <ModeBadge 
                        active={activeMode === 'general'} 
                        label="Chat" 
                        onClick={() => handleModeChange('general')} 
                    />
                    <ModeBadge 
                        active={activeMode === 'resume_opt'} 
                        label="CV Optimization" 
                        icon={<Sparkles size={10}/>}
                        onClick={() => handleModeChange('resume_opt')} 
                    />
                    <ModeBadge 
                        active={activeMode === 'jop1_scrape'} 
                        label="JOP-1 Scraper" 
                        icon={<Globe size={10}/>}
                        onClick={() => handleModeChange('jop1_scrape')} 
                    />
                </div>

                {/* Main Input Component */}
                <div className={`bg-white/80 backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] rounded-[1.5rem] transition-all duration-300 relative overflow-hidden border ${activeMode === 'resume_opt' ? 'border-pink-200 ring-4 ring-pink-50/50' : 'border-gray-200 ring-4 ring-white/50'}`}>
                    
                    {/* --- RESUME UPLOAD UI --- */}
                    {activeMode === 'resume_opt' ? (
                        <div className="p-2.5 flex items-center gap-3 h-[76px]">
                            
                            {/* Hidden File Input */}
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden" 
                                accept=".pdf,.doc,.docx"
                            />

                            {/* Drop Zone / Uploaded State */}
                            <div 
                                onClick={!uploadedFile ? handleUploadClick : undefined}
                                className={`flex-1 h-full rounded-2xl flex items-center px-4 gap-4 transition-all duration-200 ${
                                    uploadedFile 
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

                            {/* Action Button */}
                            <button 
                                disabled={!uploadedFile}
                                className={`h-full px-6 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm shrink-0 ${
                                    uploadedFile 
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg hover:scale-105 active:scale-95' 
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <Sparkles size={16} className={uploadedFile ? "animate-pulse" : ""} />
                                <span>Enhance</span>
                            </button>
                        </div>
                    ) : (
                        /* --- CHAT / SCRAPER UI --- */
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
                
                {/* Footer hint */}
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

/* --- Sub Components --- */

const NavItem = ({ icon, label, active }) => (
  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${active ? 'bg-pink-50 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
    <div className={`transition-colors ${active ? "text-pink-600" : "text-gray-400 group-hover:text-gray-900"}`}>{icon}</div>
    <span className={`text-sm font-bold ${active ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`}>{label}</span>
  </div>
);

const ToolItem = ({ icon, label }) => (
    <div className="flex items-center gap-3 text-sm font-medium text-gray-500 hover:text-pink-600 cursor-pointer group py-1">
        <div className="text-gray-300 group-hover:text-pink-400 transition-colors">{icon}</div>
        <span>{label}</span>
    </div>
);

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
        
        {/* Company Info */}
        <div className="col-span-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 p-1 flex items-center justify-center shrink-0 shadow-sm">
                <img src={logo} alt={name} className="w-full h-full object-contain" onError={(e) => {e.target.style.display='none'; e.target.parentElement.classList.add('bg-gray-100');}} />
            </div>
            <span className="text-sm font-bold text-gray-900">{name}</span>
        </div>

        {/* Email */}
        <div className="col-span-4">
            <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-900 transition-colors font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">{email}</span>
        </div>

        {/* Source */}
        <div className="col-span-2">
            <span className="text-xs font-bold text-gray-400">{source}</span>
        </div>

        {/* Action/Status */}
        <div className="col-span-2 text-right">
            {status === 'sent' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <CheckCircle2 size={12}/> SENT
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