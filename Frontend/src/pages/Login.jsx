import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Mail,
  Lock,
  Github,
  Loader2,
  Check,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import MainWhiteLogo from '../assets/Main/logo-white-without-bg.png';
import MainLogo from '../assets/Main/logo-without-bg.png';


const styles = `
  /* 1. Subtle Grain/Noise Texture */
  .bg-noise {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.05;
    pointer-events: none;
    z-index: 1;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }

  /* 2. Input Autofill Reset */
  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus, 
  input:-webkit-autofill:active{
      -webkit-box-shadow: 0 0 0 30px #ffffff inset !important;
      transition: background-color 5000s ease-in-out 0s;
  }
`;




const GoogleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.221,0-9.652-3.343-11.303-8l-6.571,4.819C9.656,39.663,16.318,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);


const SplitTextReveal = () => {
  const words = ["Cockpit.", "Future.", "Workflow.", "Legacy."];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentWord = words[index];

  const containerVars = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
    exit: {
      opacity: 1,
      transition: { staggerChildren: 0.03, staggerDirection: -1 }
    }
  };

  const charVars = {
    hidden: { y: "100%" },
    visible: {
      y: "0%",
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      y: "-100%",
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="inline-flex relative h-[1.1em] overflow-hidden ml-3 align-bottom">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          variants={containerVars}
          initial="hidden"
          animate="visible"
          exit="exit"

          className="flex whitespace-nowrap text-[#ffb6e6]"
        >
          {currentWord.split("").map((char, i) => (
            <motion.span key={`${index}-${i}`} variants={charVars} className="inline-block">
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};


const MinimalInput = ({ label, type, placeholder, icon: Icon, value, onChange, name }) => (
  <div className="group space-y-2">
    <div className="relative flex items-center">
      <div className="absolute left-0 text-gray-400 group-focus-within:text-black transition-colors duration-300">
        <Icon size={18} />
      </div>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent border-b border-gray-200 py-3 pl-8 pr-4 text-base font-medium text-gray-900 outline-none placeholder:text-gray-400 transition-all duration-300 group-focus-within:border-[#ffb6e6]"
      />
      <span className="absolute right-0 text-[10px] font-bold uppercase tracking-widest text-gray-300 opacity-0 -translate-y-2 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-500 delay-100 pointer-events-none">
        {label}
      </span>
    </div>
  </div>
);


const MinimalSocialButton = ({ icon: Icon, label }) => (
  <button type="button" className="flex-1 flex items-center justify-center gap-3 bg-gray-50/50 hover:bg-gray-100 py-3 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 transition-all duration-200 active:scale-[0.98]">
    {Icon && <Icon size={18} />}
    <span>{label}</span>
  </button>
);


const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const processLoginSuccess = async (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    if (user.role === 'admin') {
      navigate('/admin/portal');
    } else {
      try {
        const API_URL = import.meta.env.VITE_BACKEND_API_URL;
        const profileRes = await axios.get(`${API_URL}/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.data.status === 'success') {
          navigate('/user/dashboard');
        } else {
          navigate('/user/onboarding');
        }
      } catch (e) {
        navigate('/user/onboarding');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/auth/login`, loginData);

      if (response.data.status === '2FA_REQUIRED') {
        setTwoFactorToken(response.data.tempToken);
        setIs2FARequired(true);
        setIsLoading(false);
        return;
      }

      const { token, user } = response.data.data;
      await processLoginSuccess(token, user);

    } catch (err) {
      console.error("Login failed", err);
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying2FA(true);
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/auth/2fa/login`, {
        tempToken: twoFactorToken,
        code: twoFactorCode
      });
      const { token, user } = response.data.data;
      await processLoginSuccess(token, user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code');
      setIsVerifying2FA(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex lg:flex-row bg-white font-sans text-gray-900">
      <style>{styles}</style>

      <div className="hidden lg:flex relative w-full lg:w-[60%] bg-[#080808] text-white flex-col justify-between p-12 lg:p-24 overflow-hidden z-0">
        <div className="bg-noise"></div>

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ffb6e6] opacity-[0.1] blur-[150px] rounded-full pointer-events-none z-0"></div>

        <div className="relative z-10 flex items-center gap-3">
          <img src={MainWhiteLogo} alt="JobPilot Logo" className='w-5 h-5' />
          <span className="font-semibold tracking-tight text-lg">JobPilot</span>
        </div>

        <div className="relative z-10 my-auto">
          <h1 className="text-6xl lg:text-8xl font-medium tracking-tighter leading-[1] text-white/90">
            Design your
            <br />
            <SplitTextReveal />
          </h1>

          <div className="mt-8 h-px w-24 bg-[#ffb6e6]/30"></div>

          <p className="mt-8 text-lg text-gray-400 max-w-md leading-relaxed">
            A workspace designed to help you navigate your career with precision, speed, and automation.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[40%] bg-white flex flex-col relative z-10">
        <div className="hidden lg:block absolute top-8 left-20 z-20">
          <Link to="/" className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
            <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-black transition-colors">
              <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
            </div>
            <span>Go Back</span>
          </Link>
        </div>
        <div className="lg:hidden flex justify-between items-center p-6 z-20">
          <div className="flex items-center gap-2">
            <img src={MainLogo} alt="JobPilot Logo" className='w-5 h-5' />
            <span className="font-bold tracking-tight text-lg text-gray-900">JobPilot</span>
          </div>

          <Link to="/" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
            <span>Go Back</span>
            <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-black transition-colors">
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300" />
            </div>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 py-12">
          <div className="w-full max-w-sm mx-auto space-y-12">

            <div className="space-y-2 mt-8">
              <h2 className="text-3xl font-semibold tracking-tight text-black">Sign in</h2>
              <p className="text-gray-400 text-sm">Welcome back to the cockpit.</p>
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
                  {error}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MinimalSocialButton icon={GoogleIcon} label="Google" />
              <MinimalSocialButton icon={Github} label="GitHub" />
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-100"></div>
              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Or</span>
              <div className="h-px flex-1 bg-gray-100"></div>
            </div>

            {is2FARequired ? (
              <form onSubmit={handleTwoFactorSubmit} className="space-y-8 animate-in slide-in-from-right duration-300">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-black">
                    <ShieldCheck className="w-6 h-6" />
                    <h2 className="text-xl font-semibold">Security Check</h2>
                  </div>
                  <p className="text-gray-500 text-sm">Enter the 6-digit code from your authenticator app or a recovery code.</p>
                </div>

                <MinimalInput
                  label="Authentication Code"
                  type="text"
                  name="code"
                  placeholder="000000"
                  icon={Lock}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                />

                <button type="submit" disabled={isVerifying2FA} className="w-full bg-[#ffb6e6] text-black h-12 rounded-lg font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-[#ffb6e6]/90 hover:shadow-lg hover:shadow-[#ffb6e6]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                  {isVerifying2FA ? <Loader2 size={18} className="animate-spin" /> : <>Verify <ArrowRight size={16} /></>}
                </button>

                <button type="button" onClick={() => setIs2FARequired(false)} className="w-full text-center text-xs text-gray-400 hover:text-black transition-colors">
                  Back to login
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-left duration-300">
                <div className="space-y-6">
                  <MinimalInput
                    label="Work Email"
                    type="email"
                    name="email"
                    placeholder="Email address"
                    icon={Mail}
                    value={loginData.email}
                    onChange={handleChange}
                  />
                  <MinimalInput
                    label="Password"
                    type="password"
                    name="password"
                    placeholder="Password"
                    icon={Lock}
                    value={loginData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 ${rememberMe ? 'bg-[#ffb6e6] border-[#ffb6e6]' : 'border-gray-300 group-hover:border-gray-500'}`}>
                      {rememberMe && <Check size={10} className="text-black" strokeWidth={3} />}
                    </div>
                    <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                    <span className="text-xs font-medium text-gray-500 group-hover:text-black transition-colors">Keep me signed in</span>
                  </label>
                  <a href="/password-recovery" className="text-xs font-bold text-black hover:text-[#ffb6e6] transition-colors">Recover Password</a>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-[#ffb6e6] text-black h-12 rounded-lg font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-[#ffb6e6]/90 hover:shadow-lg hover:shadow-[#ffb6e6]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Enter Workspace <ArrowRight size={16} /></>}
                </button>
              </form>
            )}

            <Link to={'/signup'} className="text-center text-xs text-gray-400">
              No account? <a href="#" className="text-black font-semibold hover:underline decoration-[#ffb6e6] decoration-2 underline-offset-4">Request access</a>
            </Link>
          </div>
        </div>

        <div className="w-full bg-white pb-6 pt-2 px-8 lg:px-20 hidden md:block">
          <div className="flex flex-col items-center gap-3">

            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
              <ShieldCheck size={12} className="text-gray-400" />
              <span className="text-[10px] font-medium text-gray-500 tracking-tight">
                End-to-end encrypted. Your data is hashed & secure.
              </span>
            </div>

            <div className="flex gap-5 text-[11px] font-medium text-gray-400">
              <a href="/privacy" className="hover:text-black transition-colors">Privacy Policy</a>
              <a href="/privacy" className="hover:text-black transition-colors">Terms of Service</a>
              <a href="/privacy" className="hover:text-black transition-colors">Security</a>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;