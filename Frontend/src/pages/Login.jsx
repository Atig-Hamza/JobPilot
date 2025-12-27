import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// --- ICONS ---
const Icons = {
  Compass: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"/>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  ),
  ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>,
  Shield: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Lock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  Alert: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line><circle cx="12" cy="12" r="10"></circle></svg>,
  Cpu: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
};

// --- UI COMPONENTS ---
const GridBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <svg className="absolute w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
    <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF9] via-transparent to-transparent h-full w-full" />
  </div>
);

const MagneticButton = ({ children, onClick, type = "button", disabled = false }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    return (
        <motion.button
            ref={ref}
            type={type}
            onClick={onClick}
            disabled={disabled}
            onMouseMove={(e) => {
                const { left, top, width, height } = ref.current.getBoundingClientRect();
                x.set(e.clientX - (left + width / 2));
                y.set(e.clientY - (top + height / 2));
            }}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            style={{ x: mouseX, y: mouseY, opacity: disabled ? 0.5 : 1 }}
            className="group relative px-8 py-4 bg-[#1A1A18] text-white overflow-hidden rounded-sm transition-all hover:pr-12 w-full flex justify-center shadow-xl cursor-pointer disabled:cursor-not-allowed"
        >
            <div className="relative z-10 flex items-center gap-3">{children}</div>
            <div className="absolute inset-0 bg-amber-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[0.22, 1, 0.36, 1]" />
        </motion.button>
    );
};

// --- ANIMATION VISUAL ENGINE ---

const SkeletonBar = ({ width, height = "h-2", color = "bg-stone-200", className = "" }) => (
    <div className={`${height} ${color} rounded-sm ${className}`} style={{ width }} />
);

const FloatingParticle = ({ delay }) => (
    <motion.div 
        animate={{ 
            y: [0, -40, 0], 
            x: [0, 20, 0], 
            opacity: [0, 0.5, 0],
            scale: [0.5, 1.2, 0.5]
        }}
        transition={{ duration: 4, repeat: Infinity, delay: delay, ease: "easeInOut" }}
        className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full"
        style={{ 
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%` 
        }}
    />
);

const VisualEngine = () => {
    const [isOptimized, setIsOptimized] = useState(false);
    
    useEffect(() => {
        const timer = setInterval(() => setIsOptimized(p => !p), 5000); // 5 Seconds cycle
        return () => clearInterval(timer);
    }, []);

    // 3D Tilt Logic
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-300, 300], [5, -5]), { stiffness: 100, damping: 20 });
    const rotateY = useSpring(useTransform(x, [-300, 300], [-5, 5]), { stiffness: 100, damping: 20 });

    return (
        <div 
            ref={ref}
            onMouseMove={(e) => {
                const rect = ref.current.getBoundingClientRect();
                x.set(e.clientX - rect.left - rect.width/2);
                y.set(e.clientY - rect.top - rect.height/2);
            }}
            className="relative w-full h-full min-h-[600px] bg-[#FDFBF9] overflow-hidden flex flex-col items-center justify-center border-l border-stone-100 perspective-[1200px]"
        >
            <GridBackground />
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-50/30 via-transparent to-blue-50/10 pointer-events-none" />

            {/* Background Particles */}
            {[...Array(8)].map((_, i) => <FloatingParticle key={i} delay={i * 0.5} />)}

            {/* --- MAIN 3D CONTAINER --- */}
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative w-[340px] h-[500px]"
            >
                {/* --- DYNAMIC STATUS HUD --- */}
                <div className="absolute -top-16 left-0 right-0 flex justify-center z-50">
                    <motion.div 
                        initial={false}
                        animate={{ 
                            backgroundColor: isOptimized ? "#1A1A18" : "#FFFFFF",
                            borderColor: isOptimized ? "#1A1A18" : "#E5E7EB",
                            color: isOptimized ? "#FFFFFF" : "#6B7280"
                        }}
                        className="px-4 py-2 rounded-lg border shadow-xl flex items-center gap-3 min-w-[200px] justify-center"
                    >
                         {/* Icon Switcher */}
                         <div className="relative w-4 h-4 flex items-center justify-center">
                             <AnimatePresence mode="wait">
                                {isOptimized ? (
                                    <motion.div 
                                        key="check" 
                                        initial={{ scale: 0 }} 
                                        animate={{ scale: 1 }} 
                                        exit={{ scale: 0 }}
                                        className="text-green-400"
                                    >
                                        <Icons.Check />
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="alert" 
                                        initial={{ scale: 0 }} 
                                        animate={{ scale: 1 }} 
                                        exit={{ scale: 0 }}
                                        className="text-amber-500"
                                    >
                                        <Icons.Alert />
                                    </motion.div>
                                )}
                             </AnimatePresence>
                         </div>
                         
                         {/* Text Switcher */}
                         <div className="text-[10px] font-bold tracking-widest uppercase">
                             <AnimatePresence mode="wait">
                                {isOptimized ? (
                                    <motion.span 
                                        key="opt"
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -10, opacity: 0 }}
                                    >
                                        Optimization Complete
                                    </motion.span>
                                ) : (
                                    <motion.span 
                                        key="raw"
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -10, opacity: 0 }}
                                    >
                                        Raw Input Detected
                                    </motion.span>
                                )}
                             </AnimatePresence>
                         </div>
                    </motion.div>
                </div>

                {/* Card Surface */}
                <motion.div 
                    animate={{ 
                        boxShadow: isOptimized 
                            ? "0 30px 60px -15px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.8)" 
                            : "0 5px 15px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.05)",
                        scale: isOptimized ? 1.02 : 1
                    }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 bg-white rounded-xl z-0 overflow-hidden flex"
                >
                    
                    {/* --- LEFT SIDEBAR (Collapsible) --- */}
                    <motion.div 
                        animate={{ width: isOptimized ? "30%" : "0%" }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full bg-[#1A1A18] relative overflow-hidden flex-shrink-0"
                    >
                         <motion.div 
                            animate={{ opacity: isOptimized ? 1 : 0, x: isOptimized ? 0 : -20 }}
                            transition={{ delay: 0.2 }}
                            className="p-4 flex flex-col items-center h-full w-full"
                        >
                            {/* Animated Logo */}
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="w-10 h-10 bg-amber-500 rounded-lg mb-6 mt-2 opacity-90 shadow-lg" 
                            />
                            
                            <div className="w-full space-y-3">
                                <SkeletonBar width="100%" height="h-[1px]" color="bg-stone-800" />
                                <div className="flex gap-2"><div className="w-2 h-2 rounded-full bg-stone-700"/><SkeletonBar width="60%" color="bg-stone-800" /></div>
                                <div className="flex gap-2"><div className="w-2 h-2 rounded-full bg-stone-700"/><SkeletonBar width="40%" color="bg-stone-800" /></div>
                            </div>
                            <div className="mt-auto w-full space-y-2">
                                {[1,2,3].map(i => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 + (i * 0.1) }}
                                    >
                                        <SkeletonBar width="100%" height="h-3" color="bg-stone-800" className="rounded-sm" />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* --- MAIN CONTENT AREA --- */}
                    <div className="flex-1 relative p-6 flex flex-col">
                        
                        <motion.div 
                            layout
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col h-full gap-5"
                        >
                            {/* Header Skeleton */}
                            <div className="w-full space-y-2">
                                <motion.div 
                                    animate={{ 
                                        height: isOptimized ? 20 : 12, 
                                        width: isOptimized ? "70%" : "40%",
                                        backgroundColor: isOptimized ? "#1A1A18" : "#A8A29E" 
                                    }} 
                                    className="rounded-sm"
                                />
                                <motion.div 
                                    animate={{ 
                                        width: isOptimized ? "40%" : "100%",
                                        marginBottom: isOptimized ? 20 : 0
                                    }} 
                                    className="h-2 bg-stone-200 rounded-sm"
                                />
                                <motion.div animate={{ opacity: isOptimized ? 0 : 1, height: isOptimized ? 0 : 8 }} className="w-full h-2 bg-stone-200 rounded-sm" />
                            </div>

                            {/* Body Paragraphs / Blocks */}
                            <div className="space-y-4 flex-1">
                                {[1, 2].map((i) => (
                                    <div key={i} className="space-y-2">
                                        <motion.div 
                                            animate={{ width: isOptimized ? "30%" : "20%" }} 
                                            className="h-2 bg-stone-400 rounded-sm" 
                                        />
                                        <div className="space-y-1">
                                            {[...Array(3)].map((_, j) => (
                                                <motion.div
                                                    key={j}
                                                    animate={{ opacity: isOptimized ? 1 : 0.6 }}
                                                >
                                                    <SkeletonBar width={`${100 - (j * 15)}%`} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Skeleton */}
                            <div className="mt-auto pt-4 border-t border-stone-100 flex justify-end">
                                <motion.div 
                                    animate={{ 
                                        width: isOptimized ? 80 : 0, 
                                        opacity: isOptimized ? 1 : 0,
                                        scale: isOptimized ? 1 : 0
                                    }}
                                    className="h-4 bg-green-100 rounded-full"
                                />
                            </div>
                        </motion.div>

                    </div>

                    {/* --- SCANNER BEAM WITH PARTICLES --- */}
                    <motion.div
                        animate={{ 
                            top: isOptimized ? ["-10%", "120%"] : "-10%",
                            opacity: isOptimized ? [0, 1, 0] : 0 
                        }}
                        transition={{ duration: 1.5, ease: "easeInOut", times: [0, 0.4, 1] }}
                        className="absolute left-0 right-0 h-[2px] bg-amber-500 shadow-[0_0_25px_4px_rgba(245,158,11,0.6)] z-30 pointer-events-none"
                    >
                         {/* Scanner Emission Particles */}
                         {[...Array(5)].map((_, i) => (
                             <motion.div
                                key={i}
                                animate={{ y: [0, 20], opacity: [1, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                className="absolute top-0 w-[1px] h-2 bg-amber-400"
                                style={{ left: `${20 * i}%` }}
                             />
                         ))}
                    </motion.div>

                </motion.div>
            </motion.div>
        </div>
    );
};

// --- MAIN PAGE ---
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!termsAccepted) return;
    console.log("Login", email, password);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#1A1A18] font-sans selection:bg-amber-200 selection:text-amber-900 overflow-hidden flex flex-col relative">
      
      <GridBackground />

      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 cursor-pointer" onClick={() => navigate('/')}>
        <div className="flex items-center gap-2">
            <div className="w-10 h-10 text-[#1A1A18] flex items-center justify-center rounded-sm">
              <Icons.Compass className="w-full h-full" />
            </div>
            <span className="font-serif font-bold text-xl tracking-tighter">JobPilot</span>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 relative z-10">
        
        {/* Left Column - Form */}
        <div className="flex flex-col justify-center px-6 md:px-20 lg:px-32 py-20 min-h-[600px]">
            <div className="max-w-md w-full mx-auto lg:mx-0">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-10"
                >
                  <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight text-[#1A1A18]">Welcome Back</h1>
                  <p className="text-stone-500 text-lg">Enter your credentials to access the cockpit.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="relative group">
                            <input 
                                type="email" 
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white border border-stone-200 px-6 py-4 rounded-sm outline-none focus:border-amber-600 transition-colors text-[#1A1A18] placeholder:text-stone-300"
                            />
                            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-amber-600 transition-all duration-500 group-focus-within:w-full" />
                        </div>

                        <div className="relative group">
                            <input 
                                type="password" 
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-white border border-stone-200 px-6 py-4 rounded-sm outline-none focus:border-amber-600 transition-colors text-[#1A1A18] placeholder:text-stone-300"
                            />
                            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-amber-600 transition-all duration-500 group-focus-within:w-full" />
                        </div>
                        
                        {/* Terms & Privacy Checkbox */}
                        <div className="flex items-start gap-3 py-2">
                            <div className="relative flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="terms"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-sm border border-stone-300 checked:border-amber-600 checked:bg-amber-600 transition-all"
                                />
                                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                    <Icons.Check className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <label htmlFor="terms" className="text-sm text-stone-500 cursor-pointer select-none leading-tight">
                                I agree to the <a href="/terms" className="text-[#1A1A18] font-bold underline decoration-amber-400 decoration-2 underline-offset-2 hover:text-amber-600">Terms of Service</a> and <a href="/privacy" className="text-[#1A1A18] font-bold underline decoration-amber-400 decoration-2 underline-offset-2 hover:text-amber-600">Privacy Policy</a>.
                            </label>
                        </div>

                        <MagneticButton type="submit" disabled={!termsAccepted}>
                            <span>LOGIN</span>
                            <Icons.ArrowRight />
                        </MagneticButton>
                    </form>
                </motion.div>
            </div>
            
            {/* Deployment Ready Footer (Simplified) */}
            <div className="mt-20 pt-6 border-t border-stone-200 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-stone-400 font-medium">
                <span className="w-full md:w-auto mb-2 md:mb-0">© 2025 JobPilot Systems Inc.</span>
                <div className="ml-auto flex items-center gap-1 text-stone-300">
                    <Icons.Lock />
                    <span>256-bit SSL Secure</span>
                </div>
            </div>
        </div>

        {/* Right Column - Visual Engine */}
        <div className="hidden lg:flex items-center justify-center relative overflow-hidden bg-stone-50/50">
            <VisualEngine />
        </div>

      </main>

      {/* Ambient Orbs */}
      <div className="absolute -right-24 top-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl -z-10" />
      <div className="absolute -left-24 bottom-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10" />

    </div>
  );
};

export default Login;