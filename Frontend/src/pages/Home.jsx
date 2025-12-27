import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// --- ICONS ---
const Icons = {
  ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>,
  Compass: (props) => <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="40" height="40" viewBox="0 0 600.000000 600.000000" {...props}>
<g transform="translate(0.000000,600.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none">
<path d="M3380 4176 c-224 -79 -522 -288 -780 -546 -356 -355 -560 -722 -560 -1007 0 -64 5 -99 19 -129 19 -41 63 -84 86 -84 7 0 38 45 69 100 118 208 283 389 391 429 79 30 136 28 175 -5 65 -55 89 -143 115 -419 18 -201 30 -274 57 -375 103 -380 400 -451 692 -165 192 189 316 483 316 749 0 212 -91 413 -219 484 l-41 23 0 -78 c-1 -238 -95 -454 -241 -553 -100 -69 -180 -75 -243 -20 -44 39 -62 102 -59 210 3 167 83 409 274 833 170 375 202 503 143 561 -23 24 -116 20 -194 -8z"/>
</g>
</svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  Github: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>,
  Code: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Star: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Terminal: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>,
  FileText: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Chart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
  Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  DollarSign: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
  EyeOff: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Briefcase: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
  Building: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line><line x1="9" y1="18" x2="9" y2="18.01"></line><line x1="15" y1="18" x2="15" y2="18.01"></line><line x1="9" y1="14" x2="9" y2="14.01"></line><line x1="15" y1="14" x2="15" y2="14.01"></line><line x1="9" y1="10" x2="9" y2="10.01"></line><line x1="15" y1="10" x2="15" y2="10.01"></line><line x1="9" y1="6" x2="9" y2="6.01"></line><line x1="15" y1="6" x2="15" y2="6.01"></line></svg>,
  Book: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
  Mail: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
};

// --- SUB-COMPONENTS FOR HERO ---

// 1. Grid Background
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

// 2. Advanced System Visual Animation (Processing Style)
const RadarVisual = ({ mouseX, mouseY }) => {
  const rotateX = useTransform(mouseY, [-500, 500], [5, -5]);
  const rotateY = useTransform(mouseX, [-500, 500], [-5, 5]);
  
  const [step, setStep] = useState(0);
  
  // Cycle through steps
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { id: 0, label: "ANALYSIS", color: "bg-stone-400" },
    { id: 1, label: "OPTIMIZE", color: "bg-blue-400" },
    { id: 2, label: "SOURCING", color: "bg-amber-400" },
    { id: 3, label: "APPLYING", color: "bg-purple-400" },
    { id: 4, label: "TRACKING", color: "bg-indigo-400" },
    { id: 5, label: "HIRED", color: "bg-green-400" },
  ];

  return (
    <motion.div 
      style={{ rotateX, rotateY, perspective: 1000 }}
      className="relative w-full h-[600px] flex items-center justify-center"
    >
      {/* Main Glass Panel */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        {/* Header Bar */}
        <div className="h-12 border-b border-white/50 flex items-center px-6 justify-between bg-white/20 shrink-0 z-20">
           <div className="flex gap-2">
             <div className="w-3 h-3 rounded-full bg-red-400/80" />
             <div className="w-3 h-3 rounded-full bg-amber-400/80" />
             <div className="w-3 h-3 rounded-full bg-green-400/80" />
           </div>
           <div className="flex items-center gap-4">
             <div className="flex gap-1">
                {steps.map((s, i) => (
                    <div key={s.id} className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === step ? s.color : "bg-stone-300"}`} />
                ))}
             </div>
             <div className="font-mono text-xs text-stone-500 tracking-widest">JOBPILOT_CORE_V2.5</div>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative p-8 overflow-hidden">
            <AnimatePresence mode="wait">
                
                {/* STEP 1: ANALYZING CV */}
                {step === 0 && (
                    <motion.div 
                        key="analyzing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col"
                    >
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Phase 01</div>
                                <div className="text-2xl font-serif text-[#1A1A18]">CV Analysis</div>
                            </div>
                            <div className="font-mono text-xs text-stone-400">Parsing Structure...</div>
                        </div>
                        
                        <div className="flex-1 flex items-center justify-center relative">
                            <div className="w-48 h-64 bg-white border border-stone-200 shadow-lg rounded-lg p-4 relative overflow-hidden">
                                <div className="space-y-3">
                                    <div className="w-12 h-12 bg-stone-100 rounded-full mb-4" />
                                    <div className="h-2 w-3/4 bg-stone-200 rounded" />
                                    <div className="h-2 w-1/2 bg-stone-200 rounded" />
                                    <div className="h-2 w-full bg-stone-100 rounded" />
                                    <div className="h-2 w-full bg-stone-100 rounded" />
                                    <div className="h-2 w-2/3 bg-stone-100 rounded" />
                                </div>
                                {/* Scanning Line */}
                                <motion.div 
                                    animate={{ top: ["0%", "120%"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-1 bg-blue-400/50 shadow-[0_0_15px_rgba(96,165,250,0.5)] z-10"
                                />
                            </div>
                            {/* Floating Data Points */}
                            <motion.div 
                                animate={{ x: [0, 20], opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute right-10 top-1/3 bg-stone-800 text-white text-[10px] px-2 py-1 rounded font-mono"
                            >
                                EXPERIENCE_DETECTED
                            </motion.div>
                             <motion.div 
                                animate={{ x: [0, -20], opacity: [0, 1, 0] }}
                                transition={{ duration: 2, delay: 1, repeat: Infinity }}
                                className="absolute left-10 bottom-1/3 bg-stone-800 text-white text-[10px] px-2 py-1 rounded font-mono"
                            >
                                SKILLS_PARSED
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: OPTIMIZE IT */}
                {step === 1 && (
                    <motion.div 
                        key="optimize"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col"
                    >
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Phase 02</div>
                                <div className="text-2xl font-serif text-[#1A1A18]">AI Optimization</div>
                            </div>
                            <div className="font-mono text-xs text-stone-400">Enhancing Keywords...</div>
                        </div>

                        <div className="flex-1 flex items-center justify-center gap-8">
                            {/* Before */}
                            <div className="w-32 h-40 bg-stone-50 border border-stone-200 rounded p-2 opacity-50 scale-90 blur-[1px]">
                                <div className="h-1.5 w-full bg-stone-200 mb-2 rounded" />
                                <div className="h-1.5 w-2/3 bg-stone-200 mb-2 rounded" />
                            </div>
                            
                            <div className="flex flex-col items-center gap-2">
                                <Icons.ArrowRight />
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="text-xs font-bold text-blue-500"
                                >
                                    AI MAGIC
                                </motion.div>
                            </div>

                            {/* After */}
                            <div className="w-40 h-52 bg-white border-2 border-blue-400 shadow-xl rounded-lg p-4 relative">
                                <motion.div 
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.5 }}
                                    className="absolute top-0 left-0 h-1 bg-blue-500"
                                />
                                <div className="space-y-2">
                                    <motion.div 
                                        animate={{ backgroundColor: ["#e7e5e4", "#60a5fa", "#1e3a8a"] }}
                                        className="h-2 w-full rounded"
                                    />
                                    <div className="h-2 w-full bg-stone-100 rounded" />
                                    <div className="h-2 w-3/4 bg-stone-100 rounded" />
                                    <div className="mt-4 p-2 bg-blue-50 rounded border border-blue-100">
                                        <div className="flex gap-1 mb-1">
                                            <Icons.Star className="w-3 h-3 text-amber-400" />
                                            <Icons.Star className="w-3 h-3 text-amber-400" />
                                            <Icons.Star className="w-3 h-3 text-amber-400" />
                                        </div>
                                        <div className="h-1.5 w-full bg-blue-200 rounded" />
                                    </div>
                                </div>
                                <div className="absolute -right-3 -top-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                                    +45% SCORE
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: GETTING JOBS (SOURCING) */}
                {step === 2 && (
                    <motion.div 
                        key="sourcing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col"
                    >
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Phase 03</div>
                                <div className="text-2xl font-serif text-[#1A1A18]">Job Sourcing</div>
                            </div>
                            <div className="font-mono text-xs text-stone-400">Scanning Market...</div>
                        </div>

                        <div className="flex-1 relative border border-stone-200/50 rounded-lg bg-stone-900 overflow-hidden">
                            {/* Radar Grid */}
                            <div className="absolute inset-0 opacity-20" 
                                style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                            />
                            
                            {/* Radar Sweep */}
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute top-1/2 left-1/2 w-[150%] h-[150%] origin-top-left bg-gradient-to-r from-transparent via-amber-500/10 to-amber-500/40 -translate-y-1/2 -translate-x-1/2"
                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)' }}
                            />

                            {/* Job Nodes */}
                            {Array.from({ length: 8 }).map((_, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.3, duration: 0.5 }}
                                    className="absolute w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_10px_#f59e0b]"
                                    style={{ 
                                        top: `${20 + Math.random() * 60}%`, 
                                        left: `${20 + Math.random() * 60}%` 
                                    }}
                                >
                                    <div className="absolute top-4 left-4 bg-stone-800 text-amber-500 text-[8px] px-1 rounded whitespace-nowrap">
                                        MATCH FOUND
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* STEP 4: AUTO APPLY */}
                {step === 3 && (
                    <motion.div 
                        key="applying"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col"
                    >
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Phase 04</div>
                                <div className="text-2xl font-serif text-[#1A1A18]">Auto-Applying</div>
                            </div>
                            <div className="font-mono text-xs text-stone-400">Sending Applications...</div>
                        </div>

                        <div className="flex-1 flex items-center justify-center gap-12">
                            {/* User Node */}
                            <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center text-white z-10 shadow-xl">
                                <Icons.Users />
                            </div>

                            {/* Connection Lines */}
                            <div className="flex-1 relative h-32">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <motion.div 
                                        key={i}
                                        className="absolute left-0 top-1/2 h-0.5 bg-purple-200 w-full origin-left"
                                        style={{ rotate: (i - 1) * 15 }}
                                    >
                                        <motion.div 
                                            animate={{ offsetDistance: "100%", left: ["0%", "100%"] }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: "linear" }}
                                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-600 rounded-full shadow-lg"
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Company Nodes */}
                            <div className="flex flex-col gap-4">
                                {['Google', 'Meta', 'Netflix'].map((company, i) => (
                                    <motion.div 
                                        key={company}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.2 }}
                                        className="bg-white border border-stone-200 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 w-32"
                                    >
                                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                                        <span className="text-xs font-bold">{company}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 5: TRACKING */}
                {step === 4 && (
                    <motion.div 
                        key="tracking"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col"
                    >
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Phase 05</div>
                                <div className="text-2xl font-serif text-[#1A1A18]">Status Tracking</div>
                            </div>
                            <div className="font-mono text-xs text-stone-400">Real-time Updates...</div>
                        </div>

                        <div className="flex-1 grid grid-cols-3 gap-4">
                            {/* Columns */}
                            {[
                                { title: "APPLIED", color: "bg-stone-100", count: 12 },
                                { title: "INTERVIEW", color: "bg-blue-50", count: 3 },
                                { title: "OFFER", color: "bg-green-50", count: 1 }
                            ].map((col, i) => (
                                <div key={col.title} className={`rounded-lg p-3 ${col.color} flex flex-col gap-3`}>
                                    <div className="text-[10px] font-bold text-stone-500 flex justify-between">
                                        {col.title}
                                        <span className="bg-white px-1.5 rounded text-stone-800">{col.count}</span>
                                    </div>
                                    {/* Cards */}
                                    <motion.div 
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.3 }}
                                        className="bg-white p-2 rounded shadow-sm border border-stone-200/50"
                                    >
                                        <div className="h-2 w-12 bg-stone-200 rounded mb-2" />
                                        <div className="h-1.5 w-full bg-stone-100 rounded" />
                                    </motion.div>
                                    {i === 1 && (
                                        <motion.div 
                                            initial={{ y: 10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="bg-white p-2 rounded shadow-sm border border-stone-200/50"
                                        >
                                            <div className="h-2 w-16 bg-blue-200 rounded mb-2" />
                                            <div className="h-1.5 w-3/4 bg-stone-100 rounded" />
                                        </motion.div>
                                    )}
                                    {i === 2 && (
                                        <motion.div 
                                            layoutId="offer-card"
                                            className="bg-white p-2 rounded shadow-md border border-green-200"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="h-2 w-16 bg-green-600 rounded" />
                                                <Icons.Star className="w-3 h-3 text-amber-400" />
                                            </div>
                                            <div className="h-1.5 w-full bg-stone-100 rounded" />
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* STEP 6: HIRED */}
                {step === 5 && (
                    <motion.div 
                        key="hired"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col items-center justify-center relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-transparent" />
                        
                        {/* Confetti / Particles */}
                        {Array.from({ length: 20 }).map((_, i) => (
                            <motion.div 
                                key={i}
                                initial={{ y: 0, opacity: 1 }}
                                animate={{ y: -100, x: (Math.random() - 0.5) * 200, opacity: 0 }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                className="absolute w-2 h-2 rounded-full"
                                style={{ 
                                    backgroundColor: ['#fca5a5', '#fcd34d', '#86efac', '#93c5fd'][Math.floor(Math.random() * 4)],
                                    left: '50%',
                                    top: '50%'
                                }}
                            />
                        ))}

                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white border border-stone-200 p-8 rounded-xl shadow-2xl w-3/4 z-10 text-center"
                        >
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icons.Check />
                            </div>
                            
                            <h3 className="text-2xl font-serif font-bold text-[#1A1A18] mb-2">You're Hired!</h3>
                            <p className="text-stone-500 text-sm mb-6">Offer accepted at TechCorp Inc.</p>
                            
                            <div className="bg-stone-50 rounded-lg p-4 mb-6">
                                <div className="text-xs text-stone-400 uppercase tracking-widest mb-1">Total Compensation</div>
                                <div className="text-3xl font-mono font-bold text-[#1A1A18]">$220,000</div>
                            </div>

                            <button className="w-full bg-[#1A1A18] text-white py-3 rounded-lg text-sm font-bold tracking-wide hover:bg-green-600 transition-colors">
                                VIEW OFFER DETAILS
                            </button>
                        </motion.div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
      </div>
      
      {/* Decorative Elements behind */}
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl -z-10" />
      <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl -z-10" />

    </motion.div>
  );
};

// 3. Magnetic Button
const MagneticButton = ({ children, onClick, ...props }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const center = { x: left + width / 2, y: top + height / 2 };
        x.set(clientX - center.x);
        y.set(clientY - center.y);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            {...props}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: mouseX, y: mouseY }}
            className="group relative px-8 py-4 bg-[#1A1A18] text-white overflow-hidden rounded-sm transition-all hover:pr-12"
        >
            <div className="relative z-10 flex items-center gap-3">
                {children}
            </div>
            <div className="absolute inset-0 bg-amber-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[0.22, 1, 0.36, 1]" />
        </motion.button>
    );
};


// --- DATA ---
const menuData = {
  technology: {
    title: "The Engine",
    description: "A proprietary blend of Large Language Models and behavioral psychology designed to decode job descriptions.",
    items: [
      { title: "Semantic Matching", desc: "Mapping intent, not just keyword density.", icon: <Icons.Compass width="20" height="20" /> },
      { title: "Automated Outreach", desc: "Draft personalized cover letters in ms.", icon: <Icons.Code /> },
      { title: "Resume Optimization", desc: "Tailor your CV for every single application.", icon: <Icons.FileText /> },
      { title: "Market Analytics", desc: "Real-time insights on salary and demand.", icon: <Icons.Chart /> }
    ]
  },
  manifesto: {
    title: "Our Why",
    description: "We believe the job hunt strips away humanity. We are using code to bring it back.",
    items: [
      { title: "Privacy First", desc: "Your current employer will never see you.", icon: <Icons.Lock /> },
      { title: "Salary Transparent", desc: "We calculate real market value, not guesses.", icon: <Icons.DollarSign /> },
      { title: "Bias Elimination", desc: "Focus on skills, ignoring the noise.", icon: <Icons.EyeOff /> },
      { title: "Community Driven", desc: "Built by engineers, for engineers.", icon: <Icons.Users /> }
    ]
  },
  membership: {
    title: "Invest in You",
    description: "Pricing designed for the individual, not the enterprise. High-leverage tools for career ascension.",
    items: [
      { title: "Pro Plan", desc: "Unlimited applications and AI credits.", icon: <Icons.Star /> },
      { title: "Team Access", desc: "For recruitment agencies and small teams.", icon: <Icons.Briefcase /> },
      { title: "Enterprise", desc: "Custom solutions for large organizations.", icon: <Icons.Building /> },
      { title: "Student Tier", desc: "Free access for verified students.", icon: <Icons.Book /> }
    ]
  }
};

const JobPilot = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(0);

  // Mouse tracking for hero parallax
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    // Normalize coordinates relative to center
    x.set(clientX - window.innerWidth / 2);
    y.set(clientY - window.innerHeight / 2);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // --- ADVANCED ANIMATION VARIANTS ---
  const heroContainer = {
    visible: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  const heroItem = {
    hidden: { 
      y: "130%", 
      skewY: 5,
      opacity: 0,
      filter: "blur(10px)"
    },
    visible: { 
      y: "0%", 
      skewY: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { 
        duration: 1.2, 
        ease: [0.19, 1, 0.22, 1] 
      } 
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#1A1A18] font-sans selection:bg-amber-200 selection:text-amber-900 overflow-x-hidden">
      
      {/* 1. NAVIGATION & MEGA MENU */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out px-6 md:px-12 py-3 border-b ${scrolled || activeNav ? 'bg-[#FDFBF9] border-stone-200' : 'bg-transparent border-transparent'}`}
        onMouseLeave={() => setActiveNav(null)}
      >
        <div className="flex justify-between items-center max-w-[1800px] mx-auto relative z-50">
          <div className="flex items-center group cursor-pointer gap-2">
            <div className="w-10 h-10 text-[#1A1A18] flex items-center justify-center rounded-sm transition-transform duration-500">
              <Icons.Compass className="w-full h-full" />
            </div>
            <span className="font-serif font-bold text-xl tracking-tighter">JobPilot</span>
          </div>
          
          <div className="hidden md:flex items-center gap-12 text-sm font-bold tracking-widest uppercase">
            {['Technology', 'Manifesto', 'Membership'].map((item) => (
              <button 
                key={item}
                onMouseEnter={() => setActiveNav(item.toLowerCase())}
                className={`py-4 border-b-2 transition-all ${activeNav === item.toLowerCase() ? 'border-amber-600 text-[#1A1A18]' : 'border-transparent text-stone-400 hover:text-[#1A1A18]'}`}
              >
                {item}
              </button>
            ))}
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="hidden md:block px-8 py-3 bg-[#1A1A18] text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-amber-600 transition-colors"
          >
            Login
          </button>
        </div>

        {/* Mega Menu Content */}
        <AnimatePresence>
          {activeNav && menuData[activeNav] && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 w-full bg-[#FDFBF9] border-b border-stone-200 shadow-2xl overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-12 py-16 grid grid-cols-12 gap-12">
                <div className="col-span-4 border-r border-stone-100">
                  <h3 className="font-serif text-4xl mb-4 text-[#1A1A18]">
                    {menuData[activeNav].title}
                  </h3>
                  <p className="text-stone-500 leading-relaxed pr-8">
                    {menuData[activeNav].description}
                  </p>
                </div>
                <div className="col-span-8 grid grid-cols-2 gap-8 pl-8">
                  {menuData[activeNav].items.map((item, index) => (
                    <div key={index} className="group cursor-pointer p-6 hover:bg-stone-100 rounded-sm transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="text-stone-400 group-hover:text-amber-600 transition-colors mt-1">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-bold mb-2 flex items-center gap-2 text-lg">
                            {item.title}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity transform -rotate-45"><Icons.ArrowRight /></div>
                          </h4>
                          <p className="text-sm text-stone-500">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. HERO / WELCOME (HIGH-END ANIMATION) */}
      <section className="relative pt-48 pb-20 px-6 md:px-12 max-w-[1800px] mx-auto min-h-[95vh] flex flex-col justify-center overflow-hidden">
        
        {/* Background Layer */}
        <GridBackground />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Typography Column */}
          <div className="lg:col-span-8 relative">
            
            {/* Semantic Label */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-[1px] w-12 bg-amber-600"></div>
              <span className="text-xs font-mono text-amber-600 tracking-[0.2em] uppercase flex gap-2">
                System Online <span className="animate-pulse">_</span>
              </span>
            </motion.div>

            {/* Headline with Staggered Word Reveal */}
            <motion.h1 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={heroContainer}
              className="relative z-30 font-serif text-[14vw] lg:text-[10rem] leading-[0.85] tracking-tighter text-[#1A1A18] mb-10 flex flex-col"
            >
              {/* Line 1 */}
              <div className="overflow-hidden flex gap-[0.2em] pb-2">
                 {["Don’t", "Search."].map((word, i) => (
                     <motion.span key={i} variants={heroItem} className="block origin-bottom-left">{word}</motion.span>
                 ))}
              </div>
              
              {/* Line 2 */}
              <div className="overflow-hidden flex items-baseline pb-12 -mb-12 relative z-30">
                <motion.span variants={heroItem} className="italic text-stone-300 flex items-center origin-bottom-left">
                  <span className="text-amber-600/30 mr-4 font-sans not-italic text-[0.4em] align-middle tracking-tighter">{'//'}</span>
                  Navigate.
                </motion.span>
              </div>
            </motion.h1>

            {/* Sub-content Container */}
            <div className="flex flex-col md:flex-row gap-12 md:items-end max-w-3xl relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex-1"
              >
                 <p className="text-xl leading-relaxed text-stone-600 font-medium">
                  The career co-pilot that decodes culture, negotiates salary, and routes you to the top 1% of opportunities.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <MagneticButton onClick={() => navigate('/waitlist')}>
                    <span className="text-sm font-bold uppercase tracking-widest">Start Engine</span>
                    <Icons.ArrowRight />
                </MagneticButton>
              </motion.div>
            </div>
          </div>

          {/* Visual/Tech Column with Parallax Radar */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center relative perspective-1000">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-full"
            >
              <RadarVisual mouseX={x} mouseY={y} />
            </motion.div>

            {/* Floating Stats Card - Glassmorphism */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute -bottom-12 -left-12 bg-white/80 backdrop-blur-md p-6 border border-stone-200 shadow-xl max-w-[240px]"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-stone-200 border-2 border-white" />
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-600">+424 hired</span>
              </div>
              <p className="text-xs text-stone-500 leading-tight">
                "This tool found my role at Vercel in 48 hours."
              </p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 2.5 SCROLLING MARQUEE (Social Proof) */}
      <div className="border-t border-b border-stone-200 py-6 overflow-hidden bg-white whitespace-nowrap">
        <div className="inline-block animate-marquee pl-12">
          {["TECHCRUNCH", "WIRED", "THE VERGE", "PRODUCT HUNT #1", "Y COMBINATOR", "TECHCRUNCH", "WIRED", "THE VERGE"].map((brand, i) => (
            <span key={i} className="text-4xl font-serif text-stone-300 mx-12 italic">{brand}</span>
          ))}
        </div>
      </div>

      {/* 3. HOW IT WORKS / FEATURES */}
      <section className="py-40 px-6 md:px-12 bg-white">
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-32">
            <span className="text-amber-600 font-mono text-sm tracking-widest mb-4 block">THE ALGORITHM</span>
            <h2 className="font-serif text-6xl md:text-8xl text-[#1A1A18]">Precision over volume.</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-stone-200 border border-stone-200">
            {[
              { 
                step: "01",
                title: "Signal Filtering", 
                desc: "We scrape 50+ diverse platforms, utilizing negative-keyword filters to eliminate 98% of low-quality or 'ghost' listings instantly." 
              },
              { 
                step: "02",
                title: "Semantic Mapping", 
                desc: "Our LLM doesn't look for keywords. It maps your behavioral DNA and project history to the company's engineering culture." 
              },
              { 
                step: "03",
                title: "Priority Routing", 
                desc: "Skip the ATS black hole. We identify the hiring manager and route your optimized profile directly to their inbox." 
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-12 lg:p-16 min-h-[450px] flex flex-col justify-between hover:bg-stone-50 transition-colors duration-500 group"
              >
                <div>
                  <span className="font-mono text-amber-600 text-sm tracking-widest mb-6 block opacity-50 group-hover:opacity-100 transition-opacity">{feature.step}</span>
                  <h3 className="font-serif text-4xl mb-6">{feature.title}</h3>
                </div>
                <p className="text-stone-500 text-lg leading-relaxed max-w-xs">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ABOUT / STORY (Accordion) */}
      <section className="py-40 bg-[#1A1A18] text-[#FDFBF9]">
        <div className="px-6 md:px-12 max-w-6xl mx-auto">
          <div className="mb-24">
            <h2 className="font-serif text-5xl md:text-7xl mb-8">The Philosophy</h2>
            <p className="text-stone-400 text-xl max-w-2xl leading-relaxed">
              Recruitment is fundamentally broken. It lacks humanity. We are rebuilding the infrastructure with empathy at the core.
            </p>
          </div>

          <div className="border-t border-stone-800">
            {[
              { title: "Privacy Shield", text: "Your data is yours. We automatically mask your profile from your current employer and never sell data to recruiters. You remain a ghost until you choose to manifest." },
              { title: "Zero Ghosting", text: "Our AI automates the follow-up cadence. We track response times and flag companies that don't respect your time, removing them from future searches." },
              { title: "Calm UX", text: "No red badges. No artificial urgency. Just clarity. A tool designed to lower cortisol, not spike dopamine. Job hunting shouldn't feel like a casino." }
            ].map((item, i) => (
              <div key={i} className="border-b border-stone-800">
                <button 
                  onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
                  className="w-full py-12 flex justify-between items-center text-left group"
                >
                  <span className="font-serif text-3xl md:text-5xl group-hover:text-amber-500 transition-colors">{item.title}</span>
                  <div className={`transition-transform duration-500 ${openAccordion === i ? 'rotate-45 text-amber-500' : 'text-stone-600'}`}>
                    <Icons.Plus />
                  </div>
                </button>
                <motion.div 
                  initial={false}
                  animate={{ height: openAccordion === i ? 'auto' : 0, opacity: openAccordion === i ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <p className="pb-12 text-stone-400 text-lg leading-relaxed max-w-3xl">
                    {item.text}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PLANS / PRICING */}
      <section className="py-40 px-6 md:px-12 bg-[#FDFBF9]">
        <div className="max-w-[1600px] mx-auto">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             className="flex flex-col md:flex-row justify-between items-end mb-24"
          >
            <h2 className="font-serif text-7xl md:text-8xl text-[#1A1A18]">Flight Plans</h2>
            <p className="text-stone-500 text-lg max-w-sm text-right">No hidden fees. Cancel anytime.<br/>Invest in your trajectory.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="p-12 border border-stone-200 bg-white flex flex-col justify-between min-h-[600px] hover:shadow-xl transition-shadow duration-500">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400">The Scout</span>
                <h3 className="font-serif text-5xl mt-4 mb-8">Free</h3>
                <ul className="space-y-6">
                  {['Anonymous Profile', 'Basic Market Data', '10 Applications/mo', 'Email Support'].map(item => (
                    <li key={item} className="flex items-center gap-4 text-stone-600 font-medium">
                      <Icons.Check /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button className="w-full py-5 border border-stone-300 text-sm font-bold uppercase hover:bg-[#1A1A18] hover:text-white transition-colors">Join Waitlist</button>
            </div>

            {/* Pro */}
            <div className="p-12 bg-[#1A1A18] text-[#FDFBF9] flex flex-col justify-between min-h-[600px] relative overflow-hidden transform md:-translate-y-8 shadow-2xl">
              <div className="absolute top-0 right-0 bg-amber-600 px-6 py-2 text-xs font-bold uppercase tracking-widest">Best Value</div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-stone-500">The Pilot</span>
                <h3 className="font-serif text-5xl mt-4 mb-8">$29<span className="text-2xl text-stone-600">/mo</span></h3>
                <ul className="space-y-6">
                  {['Unlimited Priority Applications', 'Full Salary Transparency', 'ATS-Proof Resume AI', 'Hiring Manager Lookup', 'Mock Interview Mode'].map(item => (
                    <li key={item} className="flex items-center gap-4 text-stone-300 font-medium">
                      <Icons.Check /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button className="w-full py-5 bg-white text-[#1A1A18] text-sm font-bold uppercase hover:bg-amber-600 hover:text-white transition-colors">Select Plan</button>
            </div>

            {/* Enterprise */}
            <div className="p-12 border border-stone-200 bg-white flex flex-col justify-between min-h-[600px] hover:shadow-xl transition-shadow duration-500">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400">The Fleet</span>
                <h3 className="font-serif text-5xl mt-4 mb-8">Custom</h3>
                <ul className="space-y-6">
                  {['API Access', 'White Labeling', 'Dedicated Account Manager', 'Custom Integrations', 'Team Analytics'].map(item => (
                    <li key={item} className="flex items-center gap-4 text-stone-600 font-medium">
                      <Icons.Check /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button className="w-full py-5 border border-stone-300 text-sm font-bold uppercase hover:bg-[#1A1A18] hover:text-white transition-colors">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DEVELOPER / TEAM (HAMZA ATIG) */}
      <section className="py-40 bg-[#1A1A18] text-[#FDFBF9] overflow-hidden relative">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-12">
                <div className="h-[1px] w-24 bg-amber-600"></div>
                <span className="text-xs font-mono text-amber-600 tracking-[0.2em]">THE ARCHITECT</span>
              </div>
              <h2 className="font-serif text-7xl md:text-9xl mb-12 leading-[0.9]">
                One Mind.<br/>
                Full Stack.
              </h2>
              <p className="text-stone-400 text-xl leading-relaxed max-w-lg mb-12">
                JobPilot wasn't built by a committee. It was engineered by a single developer obsessed with craft, performance, and user empathy.
              </p>

              {/* Tech Stack Section */}
              <div className="flex flex-wrap gap-2 mb-16 max-w-md">
                 {['React', 'Node.js', 'Next.js', 'Tailwind', 'MongoDB', 'OpenAI API'].map(tech => (
                   <span key={tech} className="px-3 py-1 border border-stone-800 text-xs text-stone-500 uppercase tracking-widest rounded-full">
                     {tech}
                   </span>
                 ))}
              </div>
              
              <div className="flex flex-col gap-2 border-l border-stone-800 pl-8">
                <div className="flex items-center gap-3">
                    <h3 className="text-3xl font-bold tracking-wide">HAMZA ATIG</h3>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <span className="text-sm font-mono text-stone-500">FULL STACK ENGINEER</span>
                
                <div className="flex gap-8 mt-8">
                  <a href="#" className="flex items-center gap-3 text-stone-400 hover:text-white transition-colors group">
                    <div className="p-2 border border-stone-700 rounded-full group-hover:border-white transition-colors"><Icons.Github /></div>
                    <span className="text-xs uppercase tracking-widest">Github</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 text-stone-400 hover:text-white transition-colors group">
                    <div className="p-2 border border-stone-700 rounded-full group-hover:border-white transition-colors"><Icons.Code /></div>
                    <span className="text-xs uppercase tracking-widest">Portfolio</span>
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-[3/4] bg-[#222] relative rounded-sm overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 group">
                {/* Placeholder for User Image - stylized */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <div className="absolute inset-0 flex items-center justify-center bg-stone-900 group-hover:scale-105 transition-transform duration-1000">
                    {/* This would be an actual image, using a text placeholder for style */}
                  <span className="font-serif italic text-[12rem] text-stone-800 opacity-20">HA</span>
                </div>
                
                <div className="absolute bottom-12 left-12 z-20">
                    <div className="flex items-center gap-2 mb-2 text-amber-500">
                        <Icons.Terminal />
                        <span className="text-xs font-mono tracking-widest uppercase">System Online</span>
                    </div>
                  <p className="text-white font-serif text-3xl italic">"Code is poetry written in logic."</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. NEWSLETTER (Updated for News/Updates) */}
      <section className="py-40 px-6 md:px-12 bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
          >
             <span className="font-mono text-amber-600 text-sm tracking-widest mb-4 block uppercase">The Signal</span>
            <h2 className="font-serif text-6xl md:text-9xl mb-12 text-[#1A1A18]">
                Market Intelligence.
            </h2>
          </motion.div>
          
          <p className="text-xl text-stone-500 mb-16 max-w-2xl mx-auto">
            Get the latest industry news, feature updates, and career insights directly to your inbox.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-0 max-w-xl mx-auto">
            <input 
              type="email" 
              placeholder="pilot@example.com" 
              className="bg-stone-5 border border-stone-300 border-r-0 py-6 px-8 outline-none focus:bg-white w-full text-lg placeholder:text-stone-400 focus:border-amber-600 transition-colors"
            />
            <button className="whitespace-nowrap px-12 py-6 bg-[#1A1A18] text-white font-bold tracking-widest uppercase hover:bg-amber-600 transition-colors flex items-center gap-2">
              <Icons.Mail />
              <span>Subscribe</span>
            </button>
          </div>
          <p className="text-xs text-stone-400 mt-6 uppercase tracking-widest">Low frequency. High signal.</p>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-[#1A1A18] text-[#FDFBF9] pt-32 pb-12 px-6 md:px-12 border-t border-stone-800">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
          
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 text-white"><Icons.Compass /></div>
              <span className="font-serif font-bold text-2xl">JobPilot</span>
            </div>
            <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-stone-500">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-4">
            <div className="flex gap-8 text-sm font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-amber-500 transition-colors">Twitter</a>
              <a href="#" className="hover:text-amber-500 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-amber-500 transition-colors">Instagram</a>
            </div>
            <span className="text-xs text-stone-600 uppercase tracking-widest">© 2024 JobPilot Inc. Engineered in Agadir.</span>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default JobPilot;