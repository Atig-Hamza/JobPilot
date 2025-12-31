import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Github, 
  Mail, 
  Check, 
  ChevronRight,
  Zap
} from 'lucide-react';
// NOTE: Ensure this path is correct based on your project structure
import MainLogo from '../assets/Main/logo-without-bg.png';
import { Link } from 'react-router-dom';

// --- Styles for Minimalist & Premium Animations ---
const premiumStyles = `
  /* Global Font Settings - Inter/SF Pro feel */
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Fade & Slide Transitions */
  @keyframes fadeEnterUp {
    0% { opacity: 0; transform: translateY(15px); scale: 0.98; }
    100% { opacity: 1; transform: translateY(0); scale: 1; }
  }
  
  @keyframes fadeExitDown {
    0% { opacity: 1; transform: scale(1); filter: blur(0px); }
    100% { opacity: 0; transform: scale(0.96); filter: blur(12px); }
  }

  .animate-enter {
    animation: fadeEnterUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  
  .animate-exit {
    animation: fadeExitDown 0.5s ease-in forwards;
  }

  /* Refined Shiny Text Animation (Liquid Metal) */
  @keyframes shineFlow {
    0% { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
  
  .shiny-text {
    background: linear-gradient(
      110deg, 
      #000 35%, 
      #888 50%, 
      #000 65%
    );
    background-size: 200% auto;
    color: #000;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shineFlow 4s linear infinite;
  }
  
  /* Input Autofill Override */
  input:-webkit-autofill,
  input:-webkit-autofill:focus{
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    transition: background-color 5000s ease-in-out 0s;
  }
`;

// --- Components ---

const MinimalInput = ({ type = "text", placeholder, autoFocus }) => (
  <div className="group relative w-full">
    <input 
      type={type} 
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="w-full py-4 bg-transparent border-b border-gray-200 text-lg font-medium text-gray-900 placeholder-gray-400 outline-none transition-colors duration-300 rounded-none"
    />
    {/* Animated bottom border */}
    <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-black group-focus-within:w-full transition-all duration-500 ease-[cubic-bezier(0.2,1,0.3,1)]"></div>
  </div>
);

const SocialBtn = ({ icon: Icon, label }) => (
  <button className="flex items-center justify-center gap-3 w-full py-3.5 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group active:scale-[0.99]">
    <Icon size={18} className="text-gray-600 group-hover:text-black transition-colors" />
    <span className="text-sm font-semibold text-gray-700 group-hover:text-black transition-colors tracking-tight">{label}</span>
  </button>
);

const OptionRow = ({ title, sub, active, onClick, disabled, badge }) => (
  <div 
    onClick={!disabled ? onClick : undefined}
    className={`flex items-start justify-between py-6 border-b border-gray-100 cursor-pointer group transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        <span className={`text-xl font-semibold tracking-tight transition-colors ${active ? 'text-black' : 'text-gray-500 group-hover:text-black'}`}>
          {title}
        </span>
        {badge && <span className="bg-gray-100 text-gray-600 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider">{badge}</span>}
      </div>
      <span className="text-sm text-gray-500 font-medium leading-relaxed">{sub}</span>
    </div>
    <div className={`mt-1 w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 ${active ? 'border-black bg-black scale-105' : 'border-gray-300 group-hover:border-gray-500'}`}>
      <Check size={14} className={`transition-opacity ${active ? 'text-white opacity-100' : 'opacity-0'}`} strokeWidth={3} />
    </div>
  </div>
);

// --- Main Flow ---

const SignUpFlow = () => {
  const [step, setStep] = useState(1);
  const [loadingText, setLoadingText] = useState({ line1: "Initializing", line2: "environment..." });
  const [isExiting, setIsExiting] = useState(false);
  const [accessSelection, setAccessSelection] = useState('waitlist');

  // Animation Sequence logic for Step 2
  useEffect(() => {
    if (step === 2) {
      const t1 = setTimeout(() => setIsExiting(true), 2500);
      const t2 = setTimeout(() => {
        setLoadingText({ line1: "Finalizing", line2: "optimization..." });
        setIsExiting(false);
      }, 3100); 
      const t3 = setTimeout(() => setIsExiting(true), 5500);
      const t4 = setTimeout(() => setStep(3), 6100);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col selection:bg-black selection:text-white relative">
      <style>{premiumStyles}</style>

      {/* Navbar - Fades out during step 2 */}
      <div className={`w-full px-8 py-6 flex justify-between items-center fixed top-0 left-0 z-50 pointer-events-none transition-opacity duration-500 ${step === 2 ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-center gap-2 font-bold text-gray-900 tracking-tight text-lg select-none pointer-events-auto">
           <img src={MainLogo} alt="JobPilot Logo" className='w-5 h-5' />
           JOBPILOT
        </div>
        {step === 1 && (
          <Link to={'/login'} className="text-sm font-medium text-gray-500 pointer-events-auto cursor-pointer hover:text-black transition-colors">
            Have an account? <span className="text-black font-bold underline underline-offset-2">Log in</span>
          </Link>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full px-6 pt-20">
        
        {/* --- STEP 1: ACCOUNT DETAILS --- */}
        {step === 1 && (
          <div className="w-full max-w-[420px] animate-enter">
            <h1 className="text-[2.5rem] font-bold tracking-tighter mb-3 leading-none">Get started</h1>
            <p className="text-gray-500 mb-10 text-lg font-medium">Create your JobPilot account.</p>

            <div className="space-y-4 mb-10">
              <SocialBtn icon={Mail} label="Continue with Google" />
              <SocialBtn icon={Github} label="Continue with GitHub" />
            </div>

            <div className="flex items-center gap-4 mb-10">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Or</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <div className="space-y-8 mb-12">
              <MinimalInput placeholder="Email address" autoFocus />
              <MinimalInput type="password" placeholder="Password" />
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full bg-black text-white h-14 rounded-lg font-bold text-base hover:bg-gray-900 hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              Continue
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-center mt-6 text-xs text-gray-400 font-medium">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        )}

        {/* --- STEP 2: FULL SCREEN ANIMATION --- */}
        {step === 2 && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center">
            <div className={`text-center transition-all duration-[600ms] ease-in-out px-6 ${isExiting ? 'opacity-0 blur-md scale-95 translate-y-4' : 'opacity-100 blur-0 scale-100 translate-y-0'}`}>
              {/* Using a flex col here to ensure the shiny text doesn't overlap strangely during transition */}
              <div className="flex flex-col items-center">
                 <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05] text-black">
                   {loadingText.line1}
                 </h2>
                 <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05] shiny-text pb-2">
                   {loadingText.line2}
                 </h2>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-gray-50 w-full">
              <div className="h-full bg-black animate-[width_6s_ease-in-out_forwards] w-0"></div>
            </div>
          </div>
        )}

        {/* --- STEP 3: ACCESS SELECTION --- */}
        {step === 3 && (
          <div className="w-full max-w-[500px] animate-enter">
            <h1 className="text-[2.5rem] font-bold tracking-tighter mb-3 leading-none">Select access</h1>
            <p className="text-gray-500 mb-12 text-lg font-medium">Choose how you want to join JobPilot.</p>

            <div className="w-full mb-12">
              <OptionRow 
                title="Join the Waitlist" 
                sub="Secure your spot. Current wait time is approximately 2 weeks."
                active={accessSelection === 'waitlist'}
                onClick={() => setAccessSelection('waitlist')}
                badge="Free"
              />
              <OptionRow 
                title="Priority Access" 
                sub="Skip the line and get instant access to the private beta."
                active={accessSelection === 'priority'}
                disabled={true}
                badge="Sold Out"
              />
            </div>

            <div className="flex flex-col gap-8">
               <div className="flex items-center justify-between group cursor-pointer py-2 px-1">
                  <span className="text-sm font-semibold text-gray-500 group-hover:text-black transition-colors flex items-center gap-2">
                    <Zap size={16} /> I have an invite code
                  </span>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors group-hover:translate-x-1" />
               </div>

              <button 
                onClick={() => alert("Setup Complete!")}
                className="w-full bg-black text-white h-14 rounded-lg font-bold text-base hover:bg-gray-900 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
              >
                Complete Setup
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SignUpFlow;