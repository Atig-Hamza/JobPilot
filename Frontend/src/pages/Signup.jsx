import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Github, 
  Check, 
  ChevronRight,
  Zap,
  ArrowLeft,
  Calendar,
  ChevronDown,
  Search,
  MessageSquare,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import MainLogo from '../assets/Main/logo-without-bg.png';


const premiumStyles = `
  /* Global Font Settings */
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
    animation: fadeEnterUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  
  /* Loading Text Animation */
  @keyframes shineFlow {
    0% { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
  
  .shiny-text-dark {
    background: linear-gradient(
      110deg, 
      #555 35%, 
      #fff 50%, 
      #555 65%
    );
    background-size: 200% auto;
    color: #555;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shineFlow 4s linear infinite;
  }
  
  /* Input Autofill Override */
  input:-webkit-autofill,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    transition: background-color 5000s ease-in-out 0s;
  }
  
  /* Remove number arrows */
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    margin: 0; 
  }
`;



const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.799 L -6.734 42.379 C -8.804 40.439 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
    </g>
  </svg>
);



const MinimalInput = ({ type = "text", placeholder, autoFocus, value, onChange, icon: Icon }) => (
  <div className="group relative w-full">
    <div className="relative flex items-center">
      {Icon && <Icon size={18} className="absolute left-0 text-gray-400 group-focus-within:text-[#ffb6e6] transition-colors" />}
      <input 
        type={type} 
        placeholder={placeholder}
        autoFocus={autoFocus}
        value={value}
        onChange={onChange}
        className={`w-full py-4 bg-transparent border-b border-gray-200 text-lg font-medium text-gray-900 placeholder-gray-400 outline-none transition-colors duration-300 rounded-none focus:border-transparent ${Icon ? 'pl-8' : ''}`}
      />
    </div>
    {/* Pink underline on focus */}
    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#ffb6e6] group-focus-within:w-full transition-all duration-500 ease-[cubic-bezier(0.2,1,0.3,1)]"></div>
  </div>
);


const SplitDateInput = () => {
  return (
    <div className="group relative w-full">
      <div className="flex items-end gap-3 w-full border-b border-gray-200 py-4">
        <Calendar size={18} className="text-gray-400 mb-1 group-focus-within:text-[#ffb6e6] transition-colors" />
        
        <div className="flex-1 flex gap-2 text-lg font-medium text-gray-900">
           {/* Day */}
           <input 
              type="number" 
              placeholder="DD" 
              className="w-8 bg-transparent outline-none placeholder-gray-400 text-center" 
              min="1" max="31"
           />
           <span className="text-gray-300">/</span>
           {/* Month */}
           <input 
              type="number" 
              placeholder="MM" 
              className="w-10 bg-transparent outline-none placeholder-gray-400 text-center" 
              min="1" max="12"
           />
           <span className="text-gray-300">/</span>
           {/* Year */}
           <input 
              type="number" 
              placeholder="YYYY" 
              className="w-16 bg-transparent outline-none placeholder-gray-400 text-center" 
              min="1900" max="2025"
           />
        </div>
      </div>
      
      {/* Pink underline */}
      <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#ffb6e6] group-focus-within:w-full transition-all duration-500 ease-[cubic-bezier(0.2,1,0.3,1)]"></div>
      
      {/* Label */}
      <span className="absolute -top-2 left-0 text-[10px] font-bold text-gray-400 uppercase tracking-widest group-focus-within:text-[#ffb6e6] transition-colors">
        Date of Birth
      </span>
    </div>
  );
};


const CustomGenderSelect = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const dropdownRef = useRef(null);

  const options = ["Male", "Female", "Non-binary", "Prefer not to say"];

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="group cursor-pointer relative w-full py-4 border-b border-gray-200 flex items-center justify-between text-lg font-medium"
      >
        <span className={`${selected ? 'text-gray-900' : 'text-gray-400'}`}>
          {selected || "Gender"}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-black' : ''}`} 
        />
        
        {/* Underline Animation */}
        <div className={`absolute bottom-0 left-0 h-[2px] bg-[#ffb6e6] transition-all duration-500 ease-[cubic-bezier(0.2,1,0.3,1)] ${isOpen ? 'w-full' : 'w-0'}`}></div>
      </div>

      {/* Dropdown Menu */}
      <div 
        className={`absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 transition-all duration-300 origin-top ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        {options.map((opt) => (
          <div 
            key={opt}
            onClick={() => {
              setSelected(opt);
              setIsOpen(false);
            }}
            className="px-5 py-3 hover:bg-[#fff0f8] cursor-pointer flex items-center justify-between group transition-colors"
          >
            <span className={`text-sm font-medium ${selected === opt ? 'text-black' : 'text-gray-500 group-hover:text-black'}`}>
              {opt}
            </span>
            {selected === opt && <Check size={14} className="text-[#ffb6e6]" strokeWidth={3} />}
          </div>
        ))}
      </div>
    </div>
  );
};

const SocialBtn = ({ icon: Icon, component, label }) => (
  <button className="flex items-center justify-center gap-3 w-full py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group active:scale-[0.99] bg-white">
    {component ? component : <Icon size={20} className="text-gray-900" />}
    <span className="text-sm font-semibold text-gray-700 group-hover:text-black transition-colors tracking-tight">{label}</span>
  </button>
);

const OptionRow = ({ title, sub, active, onClick, disabled, badge }) => (
  <div 
    onClick={!disabled ? onClick : undefined}
    className={`flex items-start justify-between py-5 border-b border-gray-100 cursor-pointer group transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        <span className={`text-xl font-semibold tracking-tight transition-colors ${active ? 'text-black' : 'text-gray-500 group-hover:text-black'}`}>
          {title}
        </span>
        {badge && (
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider ${active || badge === 'Free' ? 'bg-[#ffb6e6] text-black' : 'bg-gray-100 text-gray-600'}`}>
            {badge}
          </span>
        )}
      </div>
      <span className="text-sm text-gray-500 font-medium leading-relaxed max-w-[80%]">{sub}</span>
    </div>
    <div className={`mt-1 w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 ${active ? 'border-[#ffb6e6] bg-[#ffb6e6] scale-105' : 'border-gray-300 group-hover:border-gray-500'}`}>
      <Check size={14} className={`transition-opacity ${active ? 'text-black opacity-100' : 'opacity-0'}`} strokeWidth={3} />
    </div>
  </div>
);



const SignUpFlow = () => {
  const [step, setStep] = useState(1);
  const [loadingText, setLoadingText] = useState({ line1: "Initializing", line2: "workspace..." });
  const [isExiting, setIsExiting] = useState(false);
  const [accessMode, setAccessMode] = useState('waitlist'); 

  useEffect(() => {
    if (step === 2) {
      const t1 = setTimeout(() => setIsExiting(true), 2500);
      const t2 = setTimeout(() => {
        setLoadingText({ line1: "Configuring", line2: "preferences..." });
        setIsExiting(false);
      }, 3100); 
      const t3 = setTimeout(() => setIsExiting(true), 5500);
      const t4 = setTimeout(() => setStep(3), 6100);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col selection:bg-[#ffb6e6] selection:text-black relative">
      <style>{premiumStyles}</style>

      {/* Navbar */}
      <div className={`w-full px-8 py-6 flex justify-between items-center fixed top-0 left-0 z-50 pointer-events-none transition-opacity duration-500 ${step === 2 ? 'opacity-0' : 'opacity-100'}`}>
        <Link to={'/'} className="flex items-center gap-2 font-bold text-gray-900 tracking-tight text-lg select-none pointer-events-auto">
            <img src={MainLogo} alt="JobPilot" className='w-5 h-5' />
            JOBPILOT
        </Link>
        {step === 1 && (
          <Link to={'/login'} className="text-sm font-medium text-gray-500 pointer-events-auto cursor-pointer hover:text-black transition-colors">
            Have an account? <span className="text-black font-bold underline underline-offset-2 decoration-[#ffb6e6]">Log in</span>
          </Link>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full px-6 pt-20 pb-10">
        
        {/* --- STEP 1: ACCOUNT DETAILS --- */}
        {step === 1 && (
          <div className="w-full max-w-[500px] animate-enter">
            <h1 className="text-[2.5rem] font-bold tracking-tighter mb-3 leading-none">Get started</h1>
            <p className="text-gray-500 mb-8 text-lg font-medium">Create your JobPilot account.</p>

            <div className="space-y-4 mb-10">
              <SocialBtn component={<GoogleIcon />} label="Continue with Google" />
              <SocialBtn icon={Github} label="Continue with GitHub" />
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Or</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            {/* Inputs Grid */}
            <div className="space-y-8 mb-12">
              <div className="grid grid-cols-2 gap-8">
                 <MinimalInput placeholder="First Name" autoFocus />
                 <MinimalInput placeholder="Last Name" />
              </div>
              
              <div className="grid grid-cols-2 gap-8 items-end">
                <SplitDateInput />
                <CustomGenderSelect />
              </div>

              <MinimalInput placeholder="Email address" type="email" />
              <MinimalInput placeholder="Password" type="password" />
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full bg-black text-white h-14 rounded-xl font-bold text-base hover:bg-gray-900 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              Continue
              <ArrowRight size={18} className="text-[#ffb6e6] group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-center mt-6 text-xs text-gray-400 font-medium">
              By continuing, you agree to our <a href="/privacy" className="hover:text-black transition-colors">Terms</a> and <a href="/privacy" className="hover:text-black transition-colors">Privacy Policy</a>.
            </p>
          </div>
        )}

        {/* --- STEP 2: LOADING (Dark, Serif, Big) --- */}
        {step === 2 && (
          <div className="fixed inset-0 z-50 bg-[#111] flex flex-col items-center justify-center">
            <div className={`text-center transition-all duration-[800ms] ease-in-out px-6 ${isExiting ? 'opacity-0 blur-lg scale-95 translate-y-8' : 'opacity-100 blur-0 scale-100 translate-y-0'}`}>
              <div className="flex flex-col items-center gap-2">
                 <h2 className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-gray-500 leading-tight">
                   {loadingText.line1}
                 </h2>
                 <h2 className="text-4xl md:text-6xl font-serif font-medium tracking-tight shiny-text-dark leading-tight">
                   {loadingText.line2}
                 </h2>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 h-[2px] bg-[#222] w-full">
              <div className="h-full bg-white animate-[width_6s_ease-in-out_forwards] w-0"></div>
            </div>
          </div>
        )}

        {/* --- STEP 3: ACCESS SELECTION --- */}
        {step === 3 && (
          <div className="w-full max-w-[500px] animate-enter">
            
            {/* VIEW: MAIN SELECTION */}
            {accessMode !== 'invite_code_mode' && (
              <>
                <h1 className="text-[2.5rem] font-bold tracking-tighter mb-3 leading-none">Select access</h1>
                <p className="text-gray-500 mb-10 text-lg font-medium">Choose how you want to join JobPilot.</p>

                <div className="w-full mb-10">
                  <OptionRow 
                    title="Join the Waitlist" 
                    sub="Secure your spot. Current wait time is approximately 2 weeks."
                    active={accessMode === 'waitlist'}
                    onClick={() => setAccessMode('waitlist')}
                    badge="Free"
                  />
                  <OptionRow 
                    title="Priority Access" 
                    sub="Skip the line (Sold Out)."
                    active={false}
                    disabled={true}
                    badge="Sold Out"
                  />
                </div>

                {/* ENHANCED Waitlist Form */}
                {accessMode === 'waitlist' && (
                  <div className="mb-10 animate-enter space-y-6">
                    <div className="p-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
                        <User size={12} className="text-[#ffb6e6]" /> Tell us about you
                      </label>
                      <div className="space-y-6">
                        <MinimalInput icon={Search} placeholder="How did you find us?" />
                        <MinimalInput icon={MessageSquare} placeholder="Why do you want early access?" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-6">
                   {/* Invite Code Trigger */}
                   <div 
                      onClick={() => setAccessMode('invite_code_mode')}
                      className="flex items-center justify-between group cursor-pointer py-2 px-1 hover:bg-gray-50 rounded-lg transition-colors"
                   >
                      <span className="text-sm font-semibold text-gray-500 group-hover:text-black transition-colors flex items-center gap-2">
                        <Zap size={16} className="text-[#ffb6e6]" /> I have an invite code
                      </span>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors group-hover:translate-x-1" />
                   </div>

                  <button 
                    onClick={() => alert("Application Submitted!")}
                    className="w-full bg-black text-white h-14 rounded-xl font-bold text-base hover:bg-gray-900 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                  >
                    {accessMode === 'waitlist' ? 'Join Waitlist' : 'Complete Setup'}
                  </button>
                </div>
              </>
            )}

            {/* VIEW: INVITE CODE INPUT */}
            {accessMode === 'invite_code_mode' && (
              <div className="animate-enter">
                <button 
                  onClick={() => setAccessMode('waitlist')}
                  className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors group"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                </button>

                <h1 className="text-[2.5rem] font-bold tracking-tighter mb-3 leading-none">Enter invite code</h1>
                <p className="text-gray-500 mb-12 text-lg font-medium">Please enter your 8-digit access code.</p>

                <div className="mb-12">
                   <div className="group relative w-full">
                      <input 
                        type="text" 
                        placeholder="JP-XXXX-XXXX"
                        autoFocus
                        className="w-full py-6 bg-transparent border-b-2 border-gray-200 text-3xl font-mono font-bold text-gray-900 placeholder-gray-300 outline-none transition-colors duration-300 rounded-none focus:border-[#ffb6e6] uppercase tracking-widest text-center"
                      />
                   </div>
                </div>

                <button 
                    onClick={() => alert("Code Validated!")}
                    className="w-full bg-black text-white h-14 rounded-xl font-bold text-base hover:bg-gray-900 hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    Validate Code
                    <ArrowRight size={18} className="text-[#ffb6e6]" />
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default SignUpFlow;