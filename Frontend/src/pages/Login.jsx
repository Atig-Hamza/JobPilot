import React, { useState } from "react";
import {
  ArrowRight,
  Mail,
  Lock,
  Github,
  Linkedin,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

// --- Styles for "Perfect" Organic Animations ---
const styles = `
  /* 1. Organic Movement Keyframes */
  @keyframes float-1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(20px, 50px) scale(1.1); }
    50% { transform: translate(-20px, 20px) scale(0.95); }
    75% { transform: translate(40px, -30px) scale(1.05); }
  }
  @keyframes float-2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-30px, 40px) scale(1.1); }
    66% { transform: translate(30px, -20px) scale(0.9); }
  }
  @keyframes float-3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(50px, 30px) scale(0.9); }
  }

  /* 2. Utility Classes for Animation */
  .animate-float-slow { animation: float-1 15s ease-in-out infinite; }
  .animate-float-medium { animation: float-2 12s ease-in-out infinite; }
  .animate-float-fast { animation: float-3 10s ease-in-out infinite; }

  /* 3. Delays to offset the starting points */
  .delay-2000 { animation-delay: 2s; }
  .delay-5000 { animation-delay: 5s; }

  /* 4. Subtle texture overlay for premium feel */
  .noise-overlay {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
    opacity: 0.4;
    mix-blend-mode: overlay;
    pointer-events: none;
  }
`;

// --- Google Icon SVG Component ---
const GoogleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="20px"
    height="20px"
    {...props}
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.221,0-9.652-3.343-11.303-8l-6.571,4.819C9.656,39.663,16.318,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

// --- UI Components ---
const InputField = ({ label, type, placeholder, icon: Icon }) => (
  <div className="space-y-1.5 group">
    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-white/70 border border-gray-200/80 text-gray-900 text-sm rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50 transition-all shadow-sm placeholder:text-gray-400 backdrop-blur-sm"
      />
    </div>
  </div>
);

const SocialButton = ({
  icon: Icon,
  label,
  colorClass = "hover:bg-gray-50 border-gray-200 text-gray-700",
}) => (
  <button
    type="button"
    className={`w-full flex items-center justify-center gap-3 bg-white border p-3.5 rounded-2xl text-sm font-bold transition-all hover:shadow-md active:scale-[0.98] ${colorClass} group`}
  >
    {Icon ? (
      <Icon size={20} className="group-hover:scale-110 transition-transform" />
    ) : null}
    <span>{label}</span>
  </button>
);

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-pink-200 selection:text-pink-900 overflow-hidden relative flex flex-col lg:flex-row">
      <style>{styles}</style>

      {/* --- Right Section (Fluid Aurora Animation) --- */}
      <div className="relative w-full lg:w-5/12 overflow-hidden bg-white">
        {/* 1. Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 z-0"></div>

        {/* 2. Fluid Moving Blobs (The "Perfect" Animation) */}
        <div className="absolute inset-0 z-0 opacity-80">
          {/* Large Cyan/Blue Blob - Top Left */}
          <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-cyan-300 rounded-full mix-blend-multiply filter blur-[80px] animate-float-slow"></div>

          {/* Large Purple Blob - Middle Right */}
          <div className="absolute top-[30%] -right-20 w-[400px] h-[400px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[80px] animate-float-medium delay-2000"></div>

          {/* Large Pink Blob - Bottom Left */}
          <div className="absolute -bottom-20 left-10 w-[450px] h-[450px] bg-pink-300 rounded-full mix-blend-multiply filter blur-[80px] animate-float-fast delay-5000"></div>

          {/* Optional: Add a subtle rotating gradient in center for depth */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-200/40 to-transparent rounded-full mix-blend-multiply filter blur-[100px] animate-pulse"></div>
        </div>

        {/* 3. Noise Overlay for Texture */}
        <div className="absolute inset-0 noise-overlay z-0"></div>

        {/* 4. Glass Overlay & Content */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 lg:p-16 bg-white/10 backdrop-blur-[1px]">
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold mb-6 border border-white/50 w-fit shadow-sm">
              <Sparkles size={16} className="text-purple-600" />
              <span className="text-purple-900">Privacy-first Career Agent</span>
            </div>

            <blockquote className="text-3xl lg:text-4xl font-bold tracking-tight leading-[1.1] mb-5 text-gray-900 drop-shadow-sm">
              “Stop managing your career in spreadsheets. Start piloting.”
            </blockquote>

            <p className="text-gray-600 text-lg leading-relaxed max-w-md">
              Join 10,000+ candidates automating their job search securely.
            </p>
          </div>
        </div>
      </div>

      {/* --- Left Section: Form --- */}
      <div className="relative flex flex-col justify-center items-center p-6 w-full lg:w-7/12 min-h-screen overflow-hidden">
        {/* Subtle Background Blobs for Left Side */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-100/60 rounded-full mix-blend-multiply filter blur-[120px] animate-float-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-100/60 rounded-full mix-blend-multiply filter blur-[120px] animate-float-medium delay-2000"></div>
        </div>

        {/* Header */}
        <header className="absolute top-0 left-0 p-8 z-20">
          <div className="flex items-center gap-2 font-bold text-gray-900 tracking-tight text-lg cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
            </div>
            JOBPILOT
          </div>
        </header>

        <div className="w-full max-w-[450px] space-y-8 z-10 mt-24 lg:mt-0">
          {/* Headline */}
          <div className="text-center space-y-3">
            <Link to={'/'}
              className="inline-flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-black transition-colors mb-4"
            >
              <ChevronLeft size={16} /> Back to Home
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 leading-tight">
              Welcome back to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                Cockpit.
              </span>
            </h1>
            <p className="text-gray-500 text-lg">
              Resume your automated job search.
            </p>
          </div>

          {/* Glass Card Container */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-pink-100/20 rounded-[2.5rem] p-8">
            {/* Social Auth */}
            <div className="flex flex-col gap-3 mb-8">
              <SocialButton
                icon={GoogleIcon}
                label="Continue with Google"
                colorClass="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              />
              <div className="grid grid-cols-2 gap-3">
                <SocialButton icon={Github} label="GitHub" />
                <SocialButton icon={Linkedin} label="LinkedIn" />
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex py-2 items-center mb-8">
              <div className="flex-grow border-t border-gray-200/60"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Or continue with email
              </span>
              <div className="flex-grow border-t border-gray-200/60"></div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                label="Work Email"
                type="email"
                placeholder="name@company.com"
                icon={Mail}
              />

              <div className="space-y-1.5">
                <InputField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                />
                <div className="flex justify-end pt-1">
                  <a
                    href="#"
                    className="text-xs font-bold text-gray-400 hover:text-pink-600 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white rounded-full py-4 font-bold text-base flex items-center justify-center gap-2 hover:bg-gray-900 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    Sign In
                    <div className="bg-white/20 rounded-full p-0.5 group-hover:translate-x-1 transition-transform">
                      <ArrowRight size={14} />
                    </div>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <a
                href="#"
                className="font-bold text-gray-900 hover:text-pink-600 transition-colors"
              >
                Start for free today
              </a>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest z-10">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={11} className="text-pink-500" /> Private Data
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={11} className="text-pink-500" /> End-to-End
            Encrypted
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;