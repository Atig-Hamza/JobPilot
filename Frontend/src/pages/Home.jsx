import React, { useState } from 'react';
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
  Search,
  Layout,
  Github,
  Database,
  FileText,
  Mail,
  Globe,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Styles for Animations (Injected for portability) ---
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
`;

// --- Shared Components ---

const TopBanner = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#ffb6e6] text-gray-900 border-b border-pink-300/50">
      {/* Banner Strip */}
      <div className="relative flex items-center h-10 overflow-hidden">
        {/* Infinite Scrolling Text */}
        <div className="flex w-full whitespace-nowrap overflow-hidden">
          <div className="flex animate-scroll min-w-full items-center">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="flex items-center gap-8 mx-4 text-xs font-bold uppercase tracking-widest text-pink-950">
                  <span className="flex items-center gap-2">🛍️ Joining the beta cohort? Limited spots available</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
                  <span>New Integration: Workday Auto-Fill is live</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
                  <span>v2.4 Release Notes</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
               </div>
             ))}
          </div>
        </div>

        {/* Toggle Button Absolute Right */}
        <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-[#ffb6e6] via-[#ffb6e6] to-transparent pl-12 pr-4 flex items-center z-10">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="bg-white/40 hover:bg-white/80 text-pink-950 text-[10px] font-bold px-3 py-1 rounded-full border border-pink-400/30 transition-all flex items-center gap-1 backdrop-blur-sm"
          >
            {isOpen ? 'Close' : 'Read Notes ->'} 
            {isOpen && <X size={10} />}
          </button>
        </div>
      </div>

      {/* Dropdown Content */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out bg-white border-b border-gray-100 ${isOpen ? 'max-h-[300px] opacity-100 shadow-xl' : 'max-h-0 opacity-0'}`}>
        <div className="max-w-7xl mx-auto p-8 grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 flex items-center gap-2"><Sparkles size={14} className="text-pink-500"/> What's New</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                We've completely overhauled the reasoning engine. JobPilot now understands context from company blogs to tailor your cover letters tailored to their culture.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 flex items-center gap-2"><Zap size={14} className="text-yellow-500"/> Speed Improvements</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Local inference using Llama-3-8b is now 40% faster on M1/M2/M3 chips thanks to our new quantization engine.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center text-center">
              <div className="text-xs font-bold text-gray-400 uppercase mb-2">Beta Invite Code</div>
               <code className="text-lg font-mono font-bold text-gray-900">PILOT-2024-X</code>
            </div>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => (
  <nav className="fixed top-14 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
    <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-full px-4 py-2 flex items-center gap-1 shadow-lg shadow-gray-200/20 pointer-events-auto max-w-4xl w-full justify-between">
      <div className="flex items-center gap-8 pl-2">
        <div className="flex items-center gap-2 font-bold text-gray-900 tracking-tight text-xl">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
             <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          JOBPILOT
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 ml-4">
          <a href="#" className="hover:text-black transition-colors">Product</a>
          <a href="#" className="hover:text-black transition-colors">Manifesto</a>
          <a href="#" className="hover:text-black transition-colors">Pricing</a>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-sm font-bold text-gray-900 hover:text-black hidden sm:block">Login</Link>
        <button className="bg-[#ffb6e6] hover:bg-pink-300 text-gray-900 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm">
          Get Started
        </button>
      </div>
    </div>
  </nav>
);

// --- Mockup Contents for "How It Works" ---

const ConnectMockup = () => (
  <div className="flex flex-col gap-3 p-6 h-full justify-center bg-white">
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
       <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600"><Globe size={16}/></div>
       <div>
         <div className="text-xs font-bold text-gray-800">LinkedIn Jobs</div>
         <div className="text-[10px] text-gray-400">Syncing...</div>
       </div>
    </div>
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 opacity-60">
       <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center text-purple-600"><Mail size={16}/></div>
       <div>
         <div className="text-xs font-bold text-gray-800">Gmail</div>
         <div className="text-[10px] text-gray-400">Connected</div>
       </div>
    </div>
  </div>
);

const LaunchMockup = () => (
  <div className="p-6 bg-white h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
         <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Application Queue</div>
         <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">Processing</span>
      </div>
      
      <div className="space-y-3">
         <div className="bg-gray-50 p-2 rounded border border-gray-100">
             <div className="h-2 w-3/4 bg-gray-200 rounded-full mb-2"></div>
             <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-blue-500"></div>
             </div>
         </div>
      </div>

      <div className="bg-pink-50 border border-pink-100 rounded-lg p-3 mt-auto">
         <div className="flex gap-2 items-center text-pink-700 text-xs font-bold mb-1">
            <Sparkles size={12} /> Tailoring Resume
         </div>
         <div className="h-1.5 w-full bg-pink-200 rounded-full overflow-hidden">
             <div className="h-full w-4/5 bg-pink-500 animate-pulse"></div>
         </div>
      </div>
  </div>
);

const ReviewMockup = () => (
  <div className="p-6 bg-white h-full font-mono text-[10px]">
    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
        <span className="font-bold text-gray-600">Cover_Letter_v1.pdf</span>
        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded font-bold">Ready</span>
    </div>
    <div className="space-y-2 text-gray-500">
        <p><span className="text-purple-600">Dear</span> Hiring Manager,</p>
        <p>I am writing to express my interest in the <span className="bg-yellow-100 text-yellow-800 px-1">Senior Product Role</span>.</p>
        <p className="opacity-50">My experience at Stripe aligns perfectly with...</p>
        <div className="flex gap-2 mt-4">
            <button className="bg-black text-white px-3 py-1.5 rounded flex-1 hover:bg-gray-800">Submit</button>
            <button className="border border-gray-200 text-gray-500 px-3 py-1.5 rounded hover:bg-gray-50">Edit</button>
        </div>
    </div>
  </div>
);

// --- New Workflow Step Component (Reference: image_6c4bcb.jpg) ---
const WorkflowStep = ({ step, title, desc, children }) => (
  <div className="flex flex-col items-start text-left group">
    {/* Image Container */}
    <div className="w-full aspect-[4/3] bg-gradient-to-b from-[#ffb6e6]/30 to-white rounded-2xl p-6 mb-6 relative overflow-hidden border border-pink-100/50">
       {/* Window Chrome */}
       <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-full w-full relative z-10 overflow-hidden flex flex-col">
          <div className="h-6 bg-gray-50 border-b border-gray-100 flex items-center px-3 gap-1.5">
             <div className="w-2 h-2 rounded-full bg-gray-300"></div>
             <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
          <div className="flex-1 overflow-hidden relative">
             {children}
          </div>
       </div>
       {/* Glow effect behind */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-300 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
    </div>

    {/* Step Number Bubble */}
    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mb-4">
      {step}
    </div>

    {/* Text Content */}
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 leading-relaxed text-sm max-w-sm">
      {desc}
    </p>
  </div>
);

// --- Logo Component ---
const Logo = ({ name, icon: Icon }) => (
  <div className="flex items-center gap-2 text-gray-900 opacity-80 hover:opacity-100 transition-opacity font-bold text-xl px-6">
    {Icon && <Icon size={24} />}
    <span>{name}</span>
  </div>
);

// --- Shared Components for Rest of Page ---

const UseCaseCard = ({ icon: Icon, title, color }) => (
  <div className="min-w-[320px] bg-white rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group cursor-default">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6 text-gray-800 transition-transform group-hover:scale-110`}>
      <Icon size={24} />
    </div>
    <h4 className="font-bold text-gray-900 text-lg leading-snug">{title}</h4>
  </div>
);

const StatCard = ({ val, suffix, desc, color, icon: Icon, subText }) => (
  <div className={`rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col justify-between h-80 group ${color} transition-all hover:scale-[1.02] hover:shadow-lg`}>
    <div className="flex justify-between items-start">
        <span className="font-mono text-7xl md:text-8xl font-medium tracking-tighter text-gray-900 leading-none">
          {val}<span className="text-4xl align-top opacity-50 ml-1">{suffix}</span>
        </span>
        <div className="bg-black/5 p-3 rounded-full group-hover:bg-black/10 transition-colors">
            <Icon size={24} className="text-gray-900" />
        </div>
    </div>
    <div className="relative z-10">
        <p className="text-lg font-bold text-gray-900 leading-tight mb-2 max-w-[80%]">{desc}</p>
        {subText && <p className="text-xs opacity-60 uppercase tracking-widest font-bold">{subText}</p>}
    </div>
    
    {/* Decorative background element */}
    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
  </div>
);

const CheckItem = ({ text, colorClass = "text-blue-600 bg-blue-100" }) => (
  <li className="flex gap-4 text-base text-gray-700 items-start">
    <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
      <Check size={14} strokeWidth={4} />
    </div>
    <span className="leading-relaxed">{text}</span>
  </li>
);

// --- Main Layout ---

const App = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-pink-200 selection:text-pink-900 overflow-x-hidden">
      <style>{styles}</style>
      
      <TopBanner />
      <Navbar />

      {/* Hero Section (Reference: image_6c44c4.jpg) */}
      <header className="relative pt-48 pb-20 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
           <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
           <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>
        </div>

        {/* Hero Content */}
        <div className="max-w-5xl mx-auto z-10">
          <h1 className="text-6xl md:text-[6.5rem] font-bold tracking-tight text-gray-900 mb-6 leading-[1.05]">
            The career <br/>
            agent built for
          </h1>
          <div className="mb-10">
            <span className="inline-flex items-center gap-2 bg-[#ffb6e6] px-8 py-2 rounded-full text-5xl md:text-[4rem] font-bold italic tracking-tight transform -rotate-2 border border-pink-300">
               <Sparkles size={40} className="fill-black text-black"/> privacy first
            </span>
          </div>
          
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Unblocking job search in complex, fragmented markets.<br/>
            Available fully air-gapped (local) or on your Private Cloud.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
            <button className="px-10 py-4 rounded-full border-2 border-gray-900 font-bold text-base hover:bg-gray-50 transition-all bg-transparent text-gray-900">
              Learn more
            </button>
            <button className="px-10 py-4 rounded-full bg-black text-white font-bold text-base flex items-center gap-3 hover:bg-gray-800 transition-all">
              Get Started
              <div className="bg-white rounded-full p-1 text-black">
                 <ArrowRight size={14} />
              </div>
            </button>
          </div>

          {/* Trusted By Logos - Integrated directly into Hero (No free space) */}
          <div className="flex flex-col items-center gap-8">
             <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Trusted by Candidates at</p>
             <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <Logo name="Stripe" />
                <Logo name="Linear" />
                <Logo name="Vercel" icon={Terminal} />
                <Logo name="GitHub" icon={Github} />
                <Logo name="J.P.Morgan" />
                <Logo name="OpenAI" />
                <Logo name="Microsoft" icon={Layout} />
                <Logo name="Shopify" />
             </div>
          </div>
        </div>
      </header>

      {/* How It Works Section (Reference: image_6c4bcb.jpg) */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
           <h2 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">How JobPilot works</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
           {/* Step 1 */}
           <WorkflowStep 
             step="1" 
             title="Connect sources" 
             desc="Plug JobPilot into LinkedIn, Indeed, or your email to centralize all opportunities."
           >
             <ConnectMockup />
           </WorkflowStep>

           {/* Step 2 */}
           <WorkflowStep 
             step="2" 
             title="Reason with context" 
             desc="Our agent understands your resume and rewrites applications to match JDs perfectly."
           >
             <LaunchMockup />
           </WorkflowStep>

           {/* Step 3 */}
           <WorkflowStep 
             step="3" 
             title="Review & Apply" 
             desc="JobPilot drafts the application, you stay in control. Review, approve, and send."
           >
             <ReviewMockup />
           </WorkflowStep>
        </div>
      </section>

      {/* Use Cases Scroller */}
      <section className="py-20 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight">How Candidates Are Using JobPilot</h2>
          
          {/* Scrolling Container */}
          <div className="flex gap-6 overflow-x-auto pb-12 pt-4 snap-x scrollbar-hide px-4 mask-fade-sides">
            <UseCaseCard icon={Zap} title="Automating repetitive application forms on Workday" color="bg-blue-100" />
            <UseCaseCard icon={Search} title="Comprehensive salary research & negotiation prep" color="bg-pink-100" />
            <UseCaseCard icon={Layout} title="Organizing 50+ active applications in one Kanban" color="bg-sky-100" />
            <UseCaseCard icon={Terminal} title='Analyzing cultural fit via company blogs ("research mode")' color="bg-purple-100" />
            <UseCaseCard icon={Check} title="Drafting contextual cover letters that pass ATS" color="bg-rose-100" />
          </div>
        </div>
      </section>

      {/* Benchmark Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="bg-[#f2f0ef] rounded-[3rem] p-10 md:p-20 flex flex-col md:flex-row gap-20 items-center border border-gray-200/50 shadow-sm">
          
          {/* Chart Graphic */}
          <div className="w-full md:w-1/2 relative min-h-[400px] flex items-end gap-6 md:gap-10 px-6 border-b border-gray-300/50 pb-0">
             {/* Grid Lines */}
             <div className="absolute inset-0 border-t border-dashed border-gray-300 opacity-30 top-[20%]"></div>
             <div className="absolute inset-0 border-t border-dashed border-gray-300 opacity-30 top-[50%]"></div>

             <div className="absolute top-16 left-0 w-full border-t-2 border-dashed border-gray-400 text-xs text-gray-500">
               <span className="bg-[#f2f0ef] pr-3 py-1 font-bold text-gray-900 absolute -top-4 left-0">Generic GPT-4o</span>
               <span className="absolute right-0 -top-6 bg-white px-2 py-1 rounded text-[10px] font-mono border border-gray-200 shadow-sm">Response Rate • 12%</span>
             </div>

             {/* Bar 1 */}
             <div className="flex flex-col items-center gap-3 w-1/4 group">
                <div className="w-full bg-gray-800 rounded-t-xl h-32 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Manual</div>
             </div>
             {/* Bar 2 (Hero) */}
             <div className="flex flex-col items-center gap-3 w-1/4 relative z-10">
                <div className="w-full bg-gradient-to-b from-gray-700 to-black rounded-t-xl h-[280px] relative shadow-2xl">
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-2xl p-4 text-center min-w-[140px] border border-gray-100 transform scale-110">
                        <div className="text-2xl font-bold text-gray-900 tracking-tight">42%</div>
                        <div className="text-xs font-bold text-green-600 bg-green-50 rounded-full px-2 py-0.5 mt-1 inline-block">Response Rate</div>
                    </div>
                </div>
                <div className="text-xs font-bold text-gray-900 uppercase tracking-wider bg-white px-3 py-1 rounded-full shadow-sm">JobPilot</div>
             </div>
             {/* Bar 3 */}
             <div className="flex flex-col items-center gap-3 w-1/4 group">
                <div className="w-full bg-gray-800 rounded-t-xl h-44 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Agency</div>
             </div>
             {/* Bar 4 */}
             <div className="flex flex-col items-center gap-3 w-1/4 group">
                <div className="w-full bg-gray-800 rounded-t-xl h-20 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Copy/Paste</div>
             </div>
          </div>

          <div className="w-full md:w-1/2 space-y-10">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              Mind blowing <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">eval results.</span>
            </h2>
            
            <div className="space-y-8">
              <div className="pl-6 border-l-2 border-gray-300">
                <h4 className="text-xl font-bold text-gray-900">Context is King</h4>
                <p className="text-base text-gray-600 mt-2 leading-relaxed">
                  JobPilot outperforms generic tools because it ingests your entire work history and the company's public docs to write highly specific applications.
                </p>
              </div>
              <div className="pl-6 border-l-2 border-gray-300">
                <h4 className="text-xl font-bold text-gray-900">Beat the ATS</h4>
                <p className="text-base text-gray-600 mt-2 leading-relaxed">
                  We reverse-engineered common ATS filters to ensure your resume formatting and keyword density pass the automated screening.
                </p>
              </div>
            </div>

            <button className="bg-black text-white px-8 py-4 rounded-full text-sm font-bold flex items-center gap-3 hover:bg-gray-800 hover:shadow-xl transition-all group">
              Read the case study
              <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform">
                <ArrowRight size={14} />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 px-6 max-w-[1400px] mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 tracking-tight">The impact our users have seen</h2>
        <div className="grid md:grid-cols-4 gap-6">
           <StatCard val="3" suffix="x" desc="Increase in interview callbacks" color="bg-fuchsia-200" icon={Zap} />
           <StatCard val="10" suffix="h" desc="Hours saved per week on form filling" color="bg-indigo-200" icon={Terminal} />
           <StatCard val="20" suffix="m" desc="Time to customize resume per role" color="bg-sky-200" icon={Check} subText="Record Time" />
           <StatCard val="2" suffix="wk" desc="Faster time to final offer" color="bg-pink-200" icon={Code} />
        </div>
      </section>

      {/* Deployment Options */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 flex flex-col md:flex-row items-center justify-center gap-4">
            Your choice of deployment:
            <div className="flex gap-4 text-xl md:text-2xl font-serif italic">
               <span className="bg-pink-100 text-pink-700 px-6 py-2 rounded-full flex items-center gap-2 border border-pink-200 shadow-sm transform rotate-[-2deg]">
                  <Sparkles size={20} /> Fully air-gapped
               </span>
               <span className="bg-blue-100 text-blue-700 px-6 py-2 rounded-full flex items-center gap-2 border border-blue-200 shadow-sm transform rotate-[2deg]">
                  <Sparkles size={20} /> Private Cloud
               </span>
            </div>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
             Your career data is sensitive. That's why JobPilot is engineered for total privacy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
           {/* Card 1 */}
           <div className="bg-[#edeceb] rounded-[3rem] p-12 border border-transparent hover:border-pink-300 hover:shadow-2xl transition-all duration-300 group">
             <div className="w-14 h-14 bg-pink-200 rounded-2xl flex items-center justify-center text-pink-600 mb-8 shadow-sm group-hover:scale-110 transition-transform">
                 <Lock size={28} />
             </div>
             <h3 className="text-3xl font-bold mb-8 text-gray-900">Local (Air-gapped)</h3>
             <ul className="space-y-6">
                 <CheckItem text="Fully installed on your machine with no external data egress." colorClass="bg-pink-200 text-pink-600" />
                 <CheckItem text="Store all your resumes and notes locally on your hard drive." colorClass="bg-pink-200 text-pink-600" />
                 <CheckItem text="Use local LLMs (Llama 3) for free, private inference." colorClass="bg-pink-200 text-pink-600" />
             </ul>
           </div>
           
           {/* Card 2 */}
           <div className="bg-[#edeceb] rounded-[3rem] p-12 border border-transparent hover:border-blue-300 hover:shadow-2xl transition-all duration-300 group">
             <div className="w-14 h-14 bg-blue-200 rounded-2xl flex items-center justify-center text-blue-600 mb-8 shadow-sm group-hover:scale-110 transition-transform">
                 <Shield size={28} />
             </div>
             <h3 className="text-3xl font-bold mb-8 text-gray-900">Private Cloud</h3>
             <ul className="space-y-6">
                 <CheckItem text="Sync seamlessly between your laptop and mobile device." />
                 <CheckItem text="End-to-end encrypted database hosted in a secure VPC." />
                 <CheckItem text="Access our most powerful frontier models for complex reasoning." />
             </ul>
           </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-32 px-6 max-w-5xl mx-auto text-center relative">
        <button className="absolute left-0 top-1/2 -translate-y-1/2 p-4 bg-white border border-gray-100 shadow-lg rounded-full hover:scale-110 transition-all text-gray-400 hover:text-black hidden md:block">
            <ChevronLeft size={24} />
        </button>
        <button className="absolute right-0 top-1/2 -translate-y-1/2 p-4 bg-white border border-gray-100 shadow-lg rounded-full hover:scale-110 transition-all text-gray-400 hover:text-black hidden md:block">
            <ChevronRight size={24} />
        </button>

        <div className="mb-10 font-black text-2xl tracking-tighter">Candidate.</div>
        <blockquote className="text-2xl md:text-4xl font-medium leading-normal mb-10 text-gray-900 tracking-tight">
            "I applied to 50 jobs manually and got 0 callbacks. With JobPilot, I sent 15 tailored applications and got 3 interviews. It feels like cheating."
        </blockquote>
        <div className="text-base">
            <div className="font-bold text-gray-900">Alex Chen</div>
            <div className="text-gray-500 font-medium">Senior Product Engineer</div>
        </div>
        <div className="flex justify-center gap-3 mt-12">
            <div className="w-2.5 h-2.5 rounded-full bg-black"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300 hover:bg-gray-400 cursor-pointer transition-colors"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300 hover:bg-gray-400 cursor-pointer transition-colors"></div>
        </div>
      </section>

      {/* Safety & Transparency */}
      <section className="pb-32 px-6 max-w-7xl mx-auto">
        <div className="bg-[#f2f0ef] rounded-[4rem] p-12 md:p-24 text-center border border-gray-200/50">
             <div className="w-16 h-16 bg-pink-100 rounded-3xl flex items-center justify-center text-pink-600 mx-auto mb-10 shadow-sm">
                  <Lock size={32} />
             </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Safety, Trust & Transparency</h2>
            <p className="text-gray-500 text-lg max-w-3xl mx-auto mb-20">
               JobPilot is built for candidates who care about their data. We treat your resume and application history as critical infrastructure.
            </p>

            <div className="grid md:grid-cols-2 gap-x-20 gap-y-12 text-left max-w-5xl mx-auto">
                <div className="space-y-8">
                    <div>
                        <h4 className="font-bold flex items-center gap-3 mb-2 text-lg"><Check size={18} className="text-pink-500 bg-pink-100 rounded-full p-0.5" /> Your IP stays yours</h4>
                        <p className="text-sm text-gray-500 pl-8 leading-relaxed">We don't sell your data to recruiters. You own your profile completely.</p>
                    </div>
                    <div>
                        <h4 className="font-bold flex items-center gap-3 mb-2 text-lg"><Check size={18} className="text-pink-500 bg-pink-100 rounded-full p-0.5" /> Full visibility</h4>
                        <p className="text-sm text-gray-500 pl-8 leading-relaxed">See exactly what the agent is sending. No "black box" applications.</p>
                    </div>
                    <div>
                        <h4 className="font-bold flex items-center gap-3 mb-2 text-lg"><Check size={18} className="text-pink-500 bg-pink-100 rounded-full p-0.5" /> Zero data leakage</h4>
                        <p className="text-sm text-gray-500 pl-8 leading-relaxed">No training on shared models. Your resume never leaves your secure environment.</p>
                    </div>
                </div>
                 <div className="space-y-8">
                    <div>
                        <h4 className="font-bold flex items-center gap-3 mb-2 text-lg"><Check size={18} className="text-pink-500 bg-pink-100 rounded-full p-0.5" /> Open Source Core</h4>
                        <p className="text-sm text-gray-500 pl-8 leading-relaxed">Audit our logic on GitHub. Verify what we do with your data.</p>
                    </div>
                    <div>
                        <h4 className="font-bold flex items-center gap-3 mb-2 text-lg"><Check size={18} className="text-pink-500 bg-pink-100 rounded-full p-0.5" /> Seamless integration</h4>
                        <p className="text-sm text-gray-500 pl-8 leading-relaxed">Works with your email and browser for a frictionless workflow.</p>
                    </div>
                    <div>
                        <h4 className="font-bold flex items-center gap-3 mb-2 text-lg"><Check size={18} className="text-pink-500 bg-pink-100 rounded-full p-0.5" /> Private deployments</h4>
                        <p className="text-sm text-gray-500 pl-8 leading-relaxed">On-prem options ensure full control over your career infrastructure.</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="relative overflow-hidden pt-40 pb-16 bg-gradient-to-t from-gray-50 to-white">
         <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
               Ready to deploy?
            </h2>
            <div className="flex justify-center gap-4 mb-32">
            <button className="px-10 py-4 rounded-full bg-black text-white font-bold text-base flex items-center gap-3 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all group">
              Get Started Today
              <div className="bg-white rounded-full p-1 text-black group-hover:translate-x-1 transition-transform">
                 <ArrowRight size={14} />
              </div>
            </button>
          </div>
         </div>
         
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 border-t border-gray-200/50 pt-10">
            <div className="flex items-center gap-2 font-bold text-gray-900 tracking-tight mb-6 md:mb-0 text-lg">
                <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                JOBPILOT
            </div>
            <div className="flex gap-8 font-medium">
                <a href="#" className="hover:text-black transition-colors">Terms</a>
                <a href="#" className="hover:text-black transition-colors">Privacy</a>
                <a href="#" className="hover:text-black transition-colors">Contact Us</a>
                <a href="#" className="hover:text-black transition-colors">X</a>
                <a href="#" className="hover:text-black transition-colors">LinkedIn</a>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default App;