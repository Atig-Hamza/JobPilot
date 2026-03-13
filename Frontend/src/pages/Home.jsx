import React, { useState, useRef } from 'react';
import {
  ArrowRight,
  Check,
  Sparkles,
  Lock,
  Terminal,
  Code,
  Zap,
  Shield,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  Layout,
  Github,
  Database,
  FileText,
  Mail,
  Globe,
  X,
  BookOpen,
  Users,
  PlayCircle,
  Cpu,
  Layers,
  MessageSquare,
  Menu,
  Mic,
  FileBadge,
  Target,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import kimiK2 from '../assets/Secondaire/kimi-k2.png';
import MainLogo from '../assets/Main/logo-without-bg.png';

const styles = `
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-scroll {
    animation: scroll 30s linear infinite;
  }
  .mask-fade-sides {
    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  }
  .scrollbar-hide::-webkit-scrollbar {
      display: none;
  }
  .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
  }
  /* Soft blob animation */
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
  
  /* Dropdown Animations - Adjusted for smoothness */
  .nav-item:hover .nav-dropdown {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) translateX(-50%);
  }
  .nav-item:hover .chevron {
    transform: rotate(180deg);
  }
  .nav-dropdown {
    transform: translateY(10px) translateX(-50%);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Premium UI Enhancements */
  .glass-panel {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
  }
`;

const TopBanner = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#ffb6e6] text-gray-900 border-b border-pink-300/50">
      <div className="relative flex items-center h-10 overflow-hidden">
        <div className="flex w-full whitespace-nowrap overflow-hidden">
          <div className="flex animate-scroll min-w-full items-center">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-8 mx-4 text-xs font-bold uppercase tracking-widest text-pink-950"
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={14} /> New: Technical Interview Scoring is Live
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
                <span>Generate your CV to PDF in seconds</span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
                <span>Developed by Hamza Atig</span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuItem = ({ icon: Icon, title, desc, gradient }) => (
  <a href="#" className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 hover:shadow-sm transition-all duration-300 group/item border border-transparent hover:border-gray-100">
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-sm border border-white/50 group-hover/item:scale-110 transition-transform duration-300`}>
      <Icon size={20} className="text-gray-900" strokeWidth={1.5} />
    </div>
    <div>
      <div className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1">
        {title}
        <ChevronRight size={12} className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-gray-400" />
      </div>
      <p className="text-xs text-gray-500 font-medium leading-relaxed">{desc}</p>
    </div>
  </a>
);

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-14 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={`
          glass-panel pointer-events-auto 
          max-w-5xl w-full relative transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
          flex flex-col md:flex-row md:items-center justify-between
          ${isMobileMenuOpen ? 'rounded-[2rem]' : 'rounded-full'}
          md:rounded-full py-1.5
        `}
      >
        <div className="flex items-center justify-between px-5 py-2 w-full md:w-auto z-20">
          <div className="flex items-center gap-2 font-bold text-gray-900 tracking-tight text-lg pl-2 select-none cursor-pointer">
            <img src={MainLogo} alt="JobPilot Logo" className='w-5 h-5' />
            JOBPILOT
          </div>

          <button
            className="md:hidden p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <div className="nav-item relative px-3 py-2 group cursor-pointer">
            <button className="flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-black transition-colors">
              Features <ChevronDown size={14} className="chevron transition-transform duration-300 text-gray-400 group-hover:text-black group-hover:rotate-180" />
            </button>
            <div className="nav-dropdown absolute top-[calc(100%+20px)] left-1/2 -translate-x-1/2 w-[700px] bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(50,50,93,0.15)] border border-gray-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden flex">
              <div className="w-[60%] p-4 grid grid-cols-1 gap-1">
                <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Core Platform</div>
                <MenuItem icon={FileText} gradient="from-purple-100 to-purple-50" title="Smart CV Studio" desc="Upload, chat with AI, and export PDF CVs." />
                <MenuItem icon={Search} gradient="from-blue-100 to-blue-50" title="Opportunity Finder" desc="Discover companies matching your exact skills." />
                <MenuItem icon={Mic} gradient="from-pink-100 to-pink-50" title="Interview Simulator" desc="Full HR & Tech rounds with detailed scoring." />
              </div>

              <div className="w-[40%] bg-gray-50 rounded-[1.5rem] p-6 flex flex-col justify-between border border-gray-100/50 m-2 relative overflow-hidden group/card hover:bg-gray-100/80 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-3xl opacity-20 group-hover/card:opacity-40 transition-opacity"></div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold uppercase tracking-wide">New Feature</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">Technical Scoring</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Get graded on system design and coding just like real FAANG interviews.
                  </p>
                </div>
                <div className="mt-8 relative">
                  <img src={kimiK2} alt="Preview" className="w-full h-32 object-cover rounded-xl shadow-sm opacity-80 grayscale group-hover/card:grayscale-0 transition-all duration-500 mix-blend-multiply" />
                  <div className="flex items-center gap-2 mt-4 text-xs font-bold text-gray-900 group-hover/card:translate-x-1 transition-transform cursor-pointer">
                    View Sample Report <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="nav-item relative px-3 py-2 group cursor-pointer">
            <button className="flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-black transition-colors">
              Resources <ChevronDown size={14} className="chevron transition-transform duration-300 text-gray-400 group-hover:text-black group-hover:rotate-180" />
            </button>
            <div className="nav-dropdown absolute top-[calc(100%+20px)] left-1/2 -translate-x-1/2 w-[400px] bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(50,50,93,0.15)] border border-gray-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2 space-y-1">
                <MenuItem icon={Award} gradient="from-orange-100 to-orange-50" title="Success Stories" desc="See how Alex nailed his Stripe interview." />
                <MenuItem icon={BookOpen} gradient="from-sky-100 to-sky-50" title="Interview Guides" desc="Cheatsheets for technical assessments." />
              </div>
              <div className="mt-2 p-4 bg-gray-50 rounded-2xl border border-gray-100/50 flex items-center justify-between hover:bg-gray-100 transition-colors cursor-pointer group/link" onClick={() => window.open('https://github.com/Atig-Hamza/JobPilot', '_blank')}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                    <Github size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Open Source</div>
                    <div className="text-[10px] text-gray-500">Star us on GitHub</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-gray-400 group-hover/link:text-black group-hover/link:translate-x-1 transition-all" />
              </div>
            </div>
          </div>

          <a href="#" className="px-3 py-2 text-sm font-bold text-gray-600 hover:text-black transition-colors">Pricing</a>
        </div>

        <div className="hidden md:flex items-center gap-4 px-5">
          <Link to="/login" className="text-sm font-bold text-gray-900 hover:text-black hidden sm:block">Login</Link>
          <Link to="/signup" className="bg-[#ffb6e6] hover:bg-pink-300 text-gray-900 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Content Omitted for Brevity but keeps logic */}
        <div className={`md:hidden w-full overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${isMobileMenuOpen ? 'max-h-[85vh] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}>
          <div className="flex flex-col gap-3 px-4 pb-6 pt-4 border-t border-gray-100/50">
            <Link to="/login" className="w-full text-center py-4 text-sm font-bold text-gray-900 hover:bg-gray-50 rounded-2xl transition-colors">Login</Link>
            <Link to="/signup" className="w-full text-center bg-[#ffb6e6] hover:bg-pink-300 text-gray-900 py-4 rounded-2xl text-sm font-bold transition-all shadow-sm">Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

/* --- App Context Mockups (Styled like the original minimalist mockups) --- */
const CVMockup = () => (
  <div className="flex flex-col p-6 h-full bg-white font-sans">
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
        <FileText size={16} className="text-blue-500" />
        <div>
          <div className="text-xs font-bold text-gray-800">My_Resume_v1.pdf</div>
          <div className="text-[10px] text-gray-400">Parsed successfully</div>
        </div>
      </div>
      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">PDF Ready</span>
    </div>
    <div className="space-y-3 mt-auto">
      <div className="flex gap-2 items-start">
        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mt-1 shrink-0"><Sparkles size={12}/></div>
        <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl rounded-tl-none text-xs text-gray-600">
          I've added your new React skills. Want me to generate the PDF layout now?
        </div>
      </div>
      <div className="flex gap-2 items-start flex-row-reverse">
        <div className="w-6 h-6 rounded-full bg-black mt-1 shrink-0"></div>
        <div className="bg-blue-50 border border-blue-100 text-blue-900 p-3 rounded-xl rounded-tr-none text-xs font-medium">
          Yes, make it ATS friendly.
        </div>
      </div>
    </div>
  </div>
);

const SearchMockup = () => (
  <div className="p-6 bg-white h-full flex flex-col gap-4">
    <div className="flex justify-between items-center">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Opportunity Finder</div>
      <span className="text-[10px] bg-pink-50 text-pink-600 px-2 py-0.5 rounded font-bold border border-pink-100">Live Matching</span>
    </div>
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <div className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-500 font-medium">Senior Frontend...</div>
    </div>
    <div className="space-y-2 mt-2">
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-black flex items-center justify-center text-white"><Layout size={14} /></div>
          <div><div className="text-xs font-bold text-gray-900">Stripe</div><div className="text-[10px] text-gray-500">92% Profile Match</div></div>
        </div>
        <button className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-50">Apply</button>
      </div>
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center justify-between opacity-70">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white"><Target size={14} /></div>
          <div><div className="text-xs font-bold text-gray-900">Linear</div><div className="text-[10px] text-gray-500">88% Profile Match</div></div>
        </div>
        <button className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded">Apply</button>
      </div>
    </div>
  </div>
);

const InterviewMockup = () => (
  <div className="p-6 bg-white h-full font-mono text-[10px]">
    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
      <span className="font-bold text-purple-600 flex items-center gap-1"><Code size={12}/> Tech Round: React</span>
      <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded font-bold border border-green-100">Score: 94/100</span>
    </div>
    <div className="space-y-3 text-gray-500">
      <p><span className="text-gray-800 font-bold">Feedback:</span> Your explanation of the Virtual DOM was perfect.</p>
      <div className="bg-gray-50 p-2 rounded border border-gray-100">
        <div className="flex justify-between mb-1 text-[9px] uppercase font-bold text-gray-400"><span>Architecture</span> <span>95%</span></div>
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
          <div className="h-full w-[95%] bg-purple-500"></div>
        </div>
        <div className="flex justify-between mb-1 text-[9px] uppercase font-bold text-gray-400"><span>Communication</span> <span>92%</span></div>
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-[92%] bg-blue-500"></div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button className="bg-black text-white px-3 py-1.5 rounded flex-1 hover:bg-gray-800 transition-colors">View Full Report</button>
      </div>
    </div>
  </div>
);

const WorkflowStep = ({ step, title, desc, children }) => (
  <div className="flex flex-col items-start text-left group">
    <div className="w-full aspect-[4/3] bg-gradient-to-b from-[#ffb6e6]/30 to-white rounded-2xl p-6 mb-6 relative overflow-hidden border border-pink-100/50 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(255,182,230,0.4)]">
      <div className="glass-panel rounded-xl h-full w-full relative z-10 overflow-hidden flex flex-col">
        <div className="h-6 bg-white/60 border-b border-white/60 flex items-center px-3 gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>
        <div className="flex-1 overflow-hidden relative bg-white/50">
          {children}
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-300 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
    </div>
    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mb-4 shadow-sm">
      {step}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 leading-relaxed text-sm max-w-sm">
      {desc}
    </p>
  </div>
);

const Logo = ({ name, icon: Icon }) => (
  <div className="flex items-center gap-2 text-gray-900 opacity-80 hover:opacity-100 hover:scale-105 transition-all font-bold text-xl px-6 cursor-default">
    {Icon && <Icon size={24} />}
    <span>{name}</span>
  </div>
);

const UseCaseCard = ({ icon: Icon, title, color }) => (
  <div className="min-w-[320px] bg-white rounded-3xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 border border-gray-100 group cursor-default relative overflow-hidden">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6 text-gray-800 transition-transform duration-500 group-hover:scale-110 shadow-sm`}>
      <Icon size={24} />
    </div>
    <h4 className="font-bold text-gray-900 text-lg leading-snug relative z-10">{title}</h4>
    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gray-50 rounded-full blur-2xl group-hover:bg-gray-100 transition-colors pointer-events-none"></div>
  </div>
);

const StatCard = ({ val, suffix, desc, color, icon: Icon, subText }) => (
  <div className={`rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col justify-between h-80 group ${color} transition-all duration-500 hover:scale-[1.02] hover:shadow-xl border border-white/40`}>
    <div className="flex justify-between items-start">
      <span className="font-mono text-7xl md:text-8xl font-medium tracking-tighter text-gray-900 leading-none">
        {val}<span className="text-4xl align-top opacity-50 ml-1">{suffix}</span>
      </span>
      <div className="bg-white/30 p-3 rounded-2xl backdrop-blur-sm group-hover:bg-white/50 transition-colors shadow-sm">
        <Icon size={24} className="text-gray-900" />
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-lg font-bold text-gray-900 leading-tight mb-2 max-w-[80%]">{desc}</p>
      {subText && <p className="text-xs opacity-60 uppercase tracking-widest font-bold">{subText}</p>}
    </div>
    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none group-hover:bg-white/30 transition-colors"></div>
  </div>
);

const CheckItem = ({ text, colorClass = "text-blue-600 bg-blue-100" }) => (
  <li className="flex gap-4 text-base text-gray-700 items-start font-medium">
    <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm ${colorClass}`}>
      <Check size={14} strokeWidth={4} />
    </div>
    <span className="leading-relaxed">{text}</span>
  </li>
);

const testimonials = [
  {
    quote: "I uploaded my messy CV, chatted with the AI, and exported a stunning PDF. Used the interview simulator to practice, and landed my Stripe offer 2 weeks later.",
    author: "Alex Chen",
    role: "Senior Product Engineer"
  },
  {
    quote: "The technical interview simulator is mind-blowing. It actually understood my system design choices and gave me a 92/100 with actionable feedback.",
    author: "Sarah Jenkins",
    role: "Lead UX Designer"
  },
  {
    quote: "Finally, an AI tool that respects my privacy. I can upload my career history and practice interviews knowing my data isn't training a global model.",
    author: "Michael Ross",
    role: "Staff Data Scientist"
  }
];

const App = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  const handleNext = () => setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  const handlePrev = () => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const handleMouseMove = (e) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-pink-200 selection:text-pink-900 overflow-x-hidden">
      <style>{styles}</style>
      <TopBanner />
      <Navbar />

      {/* --- HERO SECTION with Cursor Animation --- */}
      <header 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative pt-48 pb-20 px-6 flex flex-col items-center text-center overflow-hidden min-h-[90vh] justify-center"
      >
        {/* Dynamic Interactive Cursor Glow */}
        <div 
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
          style={{
            background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 182, 230, 0.15), transparent 40%)`
          }}
        />

        {/* Original Animated Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-5xl mx-auto z-30 flex flex-col items-center text-center relative">
          <h1 className="text-6xl md:text-[6.5rem] font-bold tracking-tight text-gray-900 mb-6 leading-[1.05]">
            Upload your CV.<br />
            Master interviews.
          </h1>
          <div className="mb-10">
            <span className="inline-flex items-center gap-2 bg-[#ffb6e6] px-8 py-2 rounded-full text-5xl md:text-[4rem] max-sm:text-4xl font-bold italic tracking-tight transform -rotate-2 border border-pink-300 shadow-xl">
              <Sparkles size={40} className="fill-black text-black" /> land the job
            </span>
          </div>

          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Your AI career co-pilot. Export stunning PDF resumes, discover targeted roles, and crush your HR & Technical mock interviews.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
            <button className="glass-panel px-10 py-4 rounded-full font-bold text-base hover:bg-gray-50 transition-all text-gray-900 border border-gray-200">
              See how it works
            </button>
            <Link to="/signup" className="px-10 py-4 rounded-full bg-black text-white font-bold text-base flex items-center gap-3 hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
              Start Building
              <div className="bg-white/20 rounded-full p-1 text-white">
                <ArrowRight size={14} />
              </div>
            </Link>
          </div>

          <div className="flex flex-col items-center gap-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Users landing roles at</p>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              <Logo name="Stripe" />
              <Logo name="Linear" />
              <Logo name="Vercel" icon={Terminal} />
              <Logo name="GitHub" icon={Github} />
              <Logo name="OpenAI" />
              <Logo name="Microsoft" icon={Layout} />
            </div>
          </div>
        </div>
      </header>

      {/* --- WORKFLOW --- */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">How JobPilot works</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <WorkflowStep
            step="1"
            title="Upload & Chat"
            desc="Drop your current CV. Chat with our AI to refine your experience and instantly export a pixel-perfect PDF."
          >
            <CVMockup />
          </WorkflowStep>

          <WorkflowStep
            step="2"
            title="Discover & Match"
            desc="Use the Opportunity Finder to search for companies hiring for your newly optimized profile and tech stack."
          >
            <SearchMockup />
          </WorkflowStep>

          <WorkflowStep
            step="3"
            title="Simulate & Score"
            desc="Run through grueling HR and Technical rounds. Get a final scorecard to perfect your answers before the real thing."
          >
            <InterviewMockup />
          </WorkflowStep>
        </div>
      </section>

      {/* --- USE CASES --- */}
      <section className="py-24 bg-gray-50/50 border-y border-gray-100 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight">Everything you need to secure the offer</h2>
          <div className="flex gap-6 overflow-x-auto pb-12 pt-4 snap-x scrollbar-hide px-4 mask-fade-sides">
            <UseCaseCard icon={FileBadge} title="Generate PDF Resumes instantly" color="bg-blue-100" />
            <UseCaseCard icon={Target} title="Smart job matching & searching" color="bg-pink-100" />
            <UseCaseCard icon={Mic} title="Voice/Text HR mock interviews" color="bg-sky-100" />
            <UseCaseCard icon={Code} title="Technical system design grading" color="bg-purple-100" />
            <UseCaseCard icon={Check} title="Detailed feedback scorecards" color="bg-rose-100" />
          </div>
        </div>
      </section>

      {/* --- COMPARISON / EVAL RESULTS --- */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="bg-[#f2f0ef] rounded-[3rem] p-10 md:p-20 flex flex-col md:flex-row gap-20 items-center border border-gray-200/50 shadow-sm relative overflow-hidden">
          {/* Subtle glow in the gray box */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white rounded-full blur-[100px] opacity-60 pointer-events-none"></div>

          <div className="w-full md:w-1/2 relative min-h-[400px] flex items-end gap-6 md:gap-10 px-6 border-b border-gray-300/50 pb-0 z-10">
            <div className="absolute inset-0 border-t border-dashed border-gray-300 opacity-30 top-[20%]"></div>
            <div className="absolute inset-0 border-t border-dashed border-gray-300 opacity-30 top-[50%]"></div>

            <div className="absolute top-16 left-0 w-full border-t-2 border-dashed border-gray-400 text-xs text-gray-500">
              <span className="bg-[#f2f0ef] pr-3 py-1 font-bold text-gray-900 absolute -top-4 left-0">Generic Prep</span>
              <span className="absolute right-0 -top-6 bg-white px-2 py-1 rounded-lg text-[10px] font-mono border border-gray-200 shadow-sm font-bold">Pass Rate • 15%</span>
            </div>

            <div className="flex flex-col items-center gap-3 w-1/4 group">
              <div className="w-full bg-gray-800 rounded-t-xl h-32 opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Manual</div>
            </div>
            <div className="flex flex-col items-center gap-3 w-1/4 relative z-10">
              <div className="w-full bg-gradient-to-b from-gray-700 to-black rounded-t-xl h-[280px] relative shadow-2xl">
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-2xl p-4 text-center min-w-[140px] border border-gray-100 transform scale-110">
                  <div className="text-2xl font-bold text-gray-900 tracking-tight">85%</div>
                  <div className="text-[10px] font-bold text-green-600 bg-green-50 rounded-full px-2 py-1 mt-1 inline-block border border-green-100">Interview Pass Rate</div>
                </div>
              </div>
              <div className="text-xs font-bold text-gray-900 uppercase tracking-wider bg-white px-4 py-1.5 rounded-full shadow-md border border-gray-100">JobPilot</div>
            </div>
            <div className="flex flex-col items-center gap-3 w-1/4 group">
              <div className="w-full bg-gray-800 rounded-t-xl h-44 opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Courses</div>
            </div>
            <div className="flex flex-col items-center gap-3 w-1/4 group">
              <div className="w-full bg-gray-800 rounded-t-xl h-20 opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">No Prep</div>
            </div>
          </div>

          <div className="w-full md:w-1/2 space-y-10 z-10">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              Mind blowing <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">interview results.</span>
            </h2>

            <div className="space-y-8">
              <div className="pl-6 border-l-2 border-pink-300">
                <h4 className="text-xl font-bold text-gray-900">Hyper-Realistic Scenarios</h4>
                <p className="text-base text-gray-600 mt-2 leading-relaxed">
                  JobPilot generates technical rounds based exactly on your target company's known interview loops and your CV's tech stack.
                </p>
              </div>
              <div className="pl-6 border-l-2 border-blue-300">
                <h4 className="text-xl font-bold text-gray-900">Actionable Scorecards</h4>
                <p className="text-base text-gray-600 mt-2 leading-relaxed">
                  Stop guessing why you got rejected. Get definitive grades on architecture, communication, and coding before the real deal.
                </p>
              </div>
            </div>

            <button className="bg-black text-white px-8 py-4 rounded-full text-sm font-bold flex items-center gap-3 hover:bg-gray-800 hover:shadow-xl transition-all hover:-translate-y-1 group">
              View Sample Scorecard
              <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform">
                <ArrowRight size={14} />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="py-20 px-6 max-w-[1400px] mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 tracking-tight">The impact our users have seen</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard val="3" suffix="x" desc="Higher interview pass rate" color="bg-fuchsia-200" icon={Award} />
          <StatCard val="100" suffix="%" desc="ATS compliant PDF exports" color="bg-indigo-200" icon={FileBadge} />
          <StatCard val="10" suffix="h" desc="Saved per week on interview prep" color="bg-sky-200" icon={Check} subText="Time Saved" />
          <StatCard val="2" suffix="wk" desc="Faster time to final offer" color="bg-pink-200" icon={Code} />
        </div>
      </section>

      {/* --- DEPLOYMENT / PRIVACY (Adapted to CV/Interview context) --- */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 flex flex-col md:flex-row items-center justify-center gap-4">
            Where does your data go?
            <div className="flex gap-4 text-xl md:text-2xl font-serif italic">
              <span className="bg-pink-100 text-pink-700 px-6 py-2 rounded-full flex items-center gap-2 border border-pink-200 shadow-sm transform rotate-[-2deg]">
                <Sparkles size={20} /> Private Vault
              </span>
              <span className="bg-blue-100 text-blue-700 px-6 py-2 rounded-full flex items-center gap-2 border border-blue-200 shadow-sm transform rotate-[2deg]">
                <Sparkles size={20} /> Encrypted Cloud
              </span>
            </div>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Your career history, salary expectations, and interview weaknesses are sensitive. JobPilot is engineered for total privacy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#edeceb] rounded-[3rem] p-12 border border-transparent hover:border-pink-300 hover:shadow-[0_20px_40px_-15px_rgba(255,182,230,0.5)] transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200 rounded-full blur-[80px] opacity-0 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none"></div>
            <div className="w-14 h-14 bg-pink-200 rounded-2xl flex items-center justify-center text-pink-600 mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative z-10">
              <Lock size={28} />
            </div>
            <h3 className="text-3xl font-bold mb-8 text-gray-900 relative z-10">Local CV Vault</h3>
            <ul className="space-y-6 relative z-10">
              <CheckItem text="Delete your entire CV history and PDFs in one click." colorClass="bg-pink-200 text-pink-600" />
              <CheckItem text="No recruiter or employer access to your profile. Ever." colorClass="bg-pink-200 text-pink-600" />
              <CheckItem text="Your interview weakness data is never used to train global models." colorClass="bg-pink-200 text-pink-600" />
            </ul>
          </div>
          <div className="bg-[#edeceb] rounded-[3rem] p-12 border border-transparent hover:border-blue-300 hover:shadow-[0_20px_40px_-15px_rgba(147,197,253,0.5)] transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full blur-[80px] opacity-0 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none"></div>
            <div className="w-14 h-14 bg-blue-200 rounded-2xl flex items-center justify-center text-blue-600 mb-8 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 relative z-10">
              <Shield size={28} />
            </div>
            <h3 className="text-3xl font-bold mb-8 text-gray-900 relative z-10">Encrypted Cloud</h3>
            <ul className="space-y-6 relative z-10">
              <CheckItem text="Sync seamlessly between your laptop and mobile device." colorClass="bg-blue-200 text-blue-700" />
              <CheckItem text="End-to-end encrypted database hosted in a secure VPC." colorClass="bg-blue-200 text-blue-700" />
              <CheckItem text="Access frontier models for complex technical interview reasoning." colorClass="bg-blue-200 text-blue-700" />
            </ul>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-32 px-6 max-w-5xl mx-auto text-center relative">
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-4 glass-panel shadow-lg rounded-full hover:scale-110 transition-all text-gray-400 hover:text-black hidden md:block z-10"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-4 glass-panel shadow-lg rounded-full hover:scale-110 transition-all text-gray-400 hover:text-black hidden md:block z-10"
        >
          <ChevronRight size={24} />
        </button>

        <div className="mb-10 font-black text-2xl tracking-tighter text-gray-900">Candidate.</div>

        <div className="min-h-[200px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
              transition={{ duration: 0.4 }}
            >
              <blockquote className="text-2xl md:text-4xl font-medium leading-normal mb-10 text-gray-900 tracking-tight px-4 md:px-12">
                "{testimonials[activeTestimonial].quote}"
              </blockquote>
              <div className="text-base">
                <div className="font-bold text-gray-900">{testimonials[activeTestimonial].author}</div>
                <div className="text-gray-500 font-medium">{testimonials[activeTestimonial].role}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-3 mt-12">
          {testimonials.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setActiveTestimonial(idx)}
              className={`h-2.5 rounded-full cursor-pointer transition-all duration-300 ${idx === activeTestimonial ? 'w-8 bg-black' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
            ></div>
          ))}
        </div>
      </section>

      {/* --- TRUST / TRANSPARENCY --- */}
      <section className="pb-32 px-6 max-w-7xl mx-auto">
        <div className="bg-[#f2f0ef] rounded-[4rem] p-12 md:p-24 text-center border border-gray-200/50 relative overflow-hidden shadow-sm">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-white rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
          
          <div className="w-16 h-16 bg-pink-100 rounded-3xl flex items-center justify-center text-pink-600 mx-auto mb-10 shadow-sm relative z-10">
            <Lock size={32} />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 relative z-10">Safety, Trust & Transparency</h2>
          <p className="text-gray-500 text-lg max-w-3xl mx-auto mb-20 relative z-10">
            JobPilot is built for candidates who care about their data. We treat your resumes and interview transcripts as critical infrastructure.
          </p>

          <div className="grid md:grid-cols-2 gap-x-20 gap-y-12 text-left max-w-5xl mx-auto relative z-10">
            <div className="space-y-8">
              <div>
                <h4 className="font-bold flex items-center gap-3 mb-2 text-lg"><Check size={18} className="text-pink-500 bg-pink-100 rounded-full p-0.5 shadow-sm" /> Your IP stays yours</h4>
                <p className="text-sm text-gray-500 pl-8 leading-relaxed">We don't sell your data to recruiters. You own your profile completely.</p>
              </div>
              <div>
                <h4 className="font-bold flex items-center gap-3 mb-2 text-lg"><Check size={18} className="text-pink-500 bg-pink-100 rounded-full p-0.5 shadow-sm" /> Full visibility</h4>
                <p className="text-sm text-gray-500 pl-8 leading-relaxed">See exactly how you're being scored. No "black box" interview rejections.</p>
              </div>
              <div>
                <h4 className="font-bold flex items-center gap-3 mb-2 text-lg"><Check size={18} className="text-pink-500 bg-pink-100 rounded-full p-0.5 shadow-sm" /> Zero data leakage</h4>
                <p className="text-sm text-gray-500 pl-8 leading-relaxed">No training on shared models. Your CV never leaves your secure environment.</p>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <h4 className="font-bold flex items-center gap-3 mb-2 text-lg"><Check size={18} className="text-pink-500 bg-pink-100 rounded-full p-0.5 shadow-sm" /> Open Source Core</h4>
                <p className="text-sm text-gray-500 pl-8 leading-relaxed">Audit our logic on GitHub. Verify what we do with your data.</p>
              </div>
              <div>
                <h4 className="font-bold flex items-center gap-3 mb-2 text-lg"><Check size={18} className="text-pink-500 bg-pink-100 rounded-full p-0.5 shadow-sm" /> Seamless export</h4>
                <p className="text-sm text-gray-500 pl-8 leading-relaxed">Export your CV to perfectly formatted PDFs at any time.</p>
              </div>
              <div>
                <h4 className="font-bold flex items-center gap-3 mb-2 text-lg"><Check size={18} className="text-pink-500 bg-pink-100 rounded-full p-0.5 shadow-sm" /> Private deployments</h4>
                <p className="text-sm text-gray-500 pl-8 leading-relaxed">On-prem options ensure full control over your career infrastructure.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative overflow-hidden pt-40 pb-16 bg-gradient-to-t from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
            Ready to secure <br/> the offer?
          </h2>
          <div className="flex justify-center gap-4 mb-32">
            <Link to="/signup" className="px-10 py-4 rounded-full bg-black text-white font-bold text-base flex items-center gap-3 hover:bg-gray-800 hover:shadow-2xl hover:-translate-y-1 transition-all group">
              Start Practicing Today
              <div className="bg-white/20 rounded-full p-1 text-white group-hover:translate-x-1 transition-transform">
                <ArrowRight size={14} />
              </div>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 border-t border-gray-200/50 pt-10">
          <div className="flex items-center gap-2 font-bold text-gray-900 tracking-tight mb-6 md:mb-0 text-lg">
            <img src={MainLogo} alt="JobPilot Logo" className='w-4 h-4' />
            JOBPILOT
          </div>
          <div className="flex gap-8 font-medium">
            <a href="/privacy" className="hover:text-black transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-black transition-colors">Privacy</a>
            <a href="/contact" className="hover:text-black transition-colors">Contact Us</a>
            <a href="/soon" className="hover:text-black transition-colors">X</a>
            <a href="/soon" className="hover:text-black transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;