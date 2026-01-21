import React, { useState } from 'react';
import {
    ArrowRight,
    ArrowLeft,
    Lock,
    Check,
    ChevronRight,
    ShieldCheck,
    Eye,
    EyeOff
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
`;

const MinimalInput = ({ type = "text", placeholder, autoFocus, value, onChange, icon: Icon, showPasswordToggle, onTogglePassword }) => (
    <div className="group relative w-full">
        <div className="relative flex items-center">
            {Icon && <Icon size={20} className="absolute left-0 text-gray-400 group-focus-within:text-[#ffb6e6] transition-colors" />}
            <input
                type={type}
                placeholder={placeholder}
                autoFocus={autoFocus}
                value={value}
                onChange={onChange}
                className={`w-full py-5 bg-transparent border-b border-gray-200 text-xl font-medium text-gray-900 placeholder-gray-300 outline-none transition-colors duration-300 rounded-none focus:border-transparent ${Icon ? 'pl-9' : ''} pr-10`}
            />
            {showPasswordToggle && (
                <button
                    type="button"
                    onClick={onTogglePassword}
                    className="absolute right-0 text-gray-400 hover:text-black transition-colors"
                >
                    {type === 'password' ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
            )}
        </div>
        <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#ffb6e6] group-focus-within:w-full transition-all duration-500 ease-[cubic-bezier(0.2,1,0.3,1)]"></div>
    </div>
);

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loadingText, setLoadingText] = useState({ line1: "Updating", line2: "security..." });
    const [isExiting, setIsExiting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (password) {
            setStep(2);

            try {
                const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });

                if (response.ok) {
                    setLoadingText({ line1: " securing", line2: "account..." });
                    setTimeout(() => {
                        setStep(3);
                    }, 1500);
                } else {
                    console.error("Failed to reset password");
                    setStep(1);
                    alert("Failed to reset password. Token may be invalid or expired.");
                }
            } catch (error) {
                console.error("Error resetting password:", error);
                setStep(1);
                alert("An error occurred. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col selection:bg-[#ffb6e6] selection:text-black relative overflow-hidden">
            <style>{premiumStyles}</style>

            <div className={`w-full px-8 py-6 flex justify-between items-center fixed top-0 left-0 z-50 pointer-events-none transition-opacity duration-500 ${step === 2 ? 'opacity-0' : 'opacity-100'}`}>
                <Link to={'/'} className="flex items-center gap-2 font-bold text-gray-900 tracking-tight text-lg select-none pointer-events-auto">
                    <img src={MainLogo} alt="JobPilot" className='w-5 h-5' />
                    JOBPILOT
                </Link>
                <Link to={'/login'} className="text-sm font-bold text-gray-400 pointer-events-auto cursor-pointer hover:text-black transition-colors flex items-center gap-2 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
                </Link>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full px-6 pt-20 pb-10">

                {step === 1 && (
                    <div className="w-full max-w-[480px] animate-enter">
                        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                            <ShieldCheck size={12} className="text-[#ffb6e6]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Secure Reset</span>
                        </div>
                        <h1 className="text-[3rem] font-bold tracking-tighter mb-4 leading-none">New Password</h1>
                        <p className="text-gray-500 mb-12 text-lg font-medium leading-relaxed">
                            Create a new, strong password for your account.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <MinimalInput
                                icon={Lock}
                                placeholder="New Password"
                                type={showPassword ? "text" : "password"}
                                autoFocus
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                showPasswordToggle={true}
                                onTogglePassword={() => setShowPassword(!showPassword)}
                            />

                            <MinimalInput
                                icon={Lock}
                                placeholder="Confirm New Password"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />

                            <button
                                type="submit"
                                className="w-full bg-black text-white h-16 rounded-xl font-bold text-lg hover:bg-gray-900 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 group mt-4"
                            >
                                Reset Password
                                <ArrowRight size={20} className="text-[#ffb6e6] group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center">
                        <div className={`text-center transition-all duration-[600ms] ease-in-out px-6 ${isExiting ? 'opacity-0 blur-xl scale-95 translate-y-8' : 'opacity-100 blur-0 scale-100 translate-y-0'}`}>
                            <div className="flex flex-col items-center gap-3">
                                <h2 className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-gray-600 leading-tight">
                                    {loadingText.line1}
                                </h2>
                                <h2 className="text-4xl md:text-6xl font-serif font-medium tracking-tight shiny-text-dark leading-tight">
                                    {loadingText.line2}
                                </h2>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 h-[3px] bg-[#222] w-full">
                            <div className="h-full bg-white animate-[width_5s_ease-in-out_forwards] w-0"></div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="w-full max-w-[480px] animate-enter text-center md:text-left">
                        <div className="w-16 h-16 bg-[#ffb6e6]/20 rounded-full flex items-center justify-center mb-8 mx-auto md:mx-0">
                            <Check size={32} className="text-[#ffb6e6]" strokeWidth={3} />
                        </div>

                        <h1 className="text-[3rem] font-bold tracking-tighter mb-4 leading-none">All set!</h1>
                        <p className="text-gray-500 mb-10 text-xl font-medium leading-relaxed">
                            Your password has been successfully reset. You can now log in with your new credentials.
                        </p>

                        <div className="space-y-4">
                            <Link
                                to="/login"
                                className="w-full bg-black text-white h-16 rounded-xl font-bold text-lg hover:bg-gray-900 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 group"
                            >
                                Log In Now
                                <ChevronRight size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                            </Link>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ResetPassword;
