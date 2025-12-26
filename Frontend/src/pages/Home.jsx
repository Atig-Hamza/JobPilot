import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';

// --- ICONS ---
const Icons = {
  ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>,
  Compass: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
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
  
  return (
    <motion.div 
      style={{ rotateX, rotateY, perspective: 1000 }}
      className="relative w-full h-[600px] flex items-center justify-center"
    >
      {/* Main Glass Panel */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Header Bar */}
        <div className="absolute top-0 left-0 right-0 h-12 border-b border-white/50 flex items-center px-6 justify-between bg-white/20">
           <div className="flex gap-2">
             <div className="w-3 h-3 rounded-full bg-red-400/80" />
             <div className="w-3 h-3 rounded-full bg-amber-400/80" />
             <div className="w-3 h-3 rounded-full bg-green-400/80" />
           </div>
           <div className="font-mono text-xs text-stone-500 tracking-widest">JOBPILOT_CORE_V2.4</div>
        </div>

        {/* Content Area */}
        <div className="p-8 pt-20 h-full flex flex-col gap-6">
           
           {/* 1. Processing Status */}
           <div className="flex justify-between items-end">
              <div>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Status</div>
                <div className="text-2xl font-serif text-[#1A1A18]">Analyzing Market...</div>
              </div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ height: [10, 24, 10] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1 bg-amber-600 rounded-full"
                  />
                ))}
              </div>
           </div>

           {/* 2. Data Stream Visualization */}
           <div className="flex-1 bg-white/50 rounded-lg border border-white/60 p-4 font-mono text-[10px] text-stone-500 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80 z-10" />
              <motion.div 
                animate={{ y: [-200, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="space-y-1 opacity-70"
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-stone-300">0{i + 1}</span>
                    <span className="text-amber-600/80">GET /api/jobs/match</span>
                    <span className="text-stone-400">200 OK</span>
                    <span className="text-stone-300">{Math.floor(Math.random() * 50)}ms</span>
                  </div>
                ))}
                 {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i + 20} className="flex gap-4">
                    <span className="text-stone-300">0{i + 21}</span>
                    <span className="text-amber-600/80">POST /api/analyze</span>
                    <span className="text-stone-400">PROCESSING</span>
                    <span className="text-stone-300">...</span>
                  </div>
                ))}
              </motion.div>
           </div>

           {/* 3. Match Cards (Floating) */}
           <div className="relative h-32">
              <motion.div 
                animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 bg-[#1A1A18] text-white p-4 rounded-lg shadow-xl w-64 z-20"
              >
                 <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                     <span className="text-xs font-bold tracking-widest">MATCH FOUND</span>
                   </div>
                   <span className="text-amber-500 font-mono text-xs">98%</span>
                 </div>
                 <div className="text-sm font-serif mb-1">Senior Frontend Engineer</div>
                 <div className="text-xs text-stone-400">San Francisco • $180k - $220k</div>
              </motion.div>

              <motion.div 
                animate={{ x: [0, -5, 0], y: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-0 left-0 bg-white border border-stone-200 p-4 rounded-lg shadow-lg w-56 z-10 opacity-90"
              >
                 <div className="flex items-center gap-2 mb-2">
                   <Icons.Compass className="w-4 h-4 text-stone-400" />
                   <span className="text-xs font-bold tracking-widest text-stone-500">CULTURE FIT</span>
                 </div>
                 <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "92%" }}
                     transition={{ duration: 1.5, delay: 0.5 }}
                     className="h-full bg-amber-600" 
                   />
                 </div>
              </motion.div>
           </div>

        </div>
      </div>
      
      {/* Decorative Elements behind */}
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl -z-10" />
      <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl -z-10" />

    </motion.div>
  );
};

// 3. Magnetic Button
const MagneticButton = ({ children }) => {
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
      { title: "Semantic Matching", desc: "Mapping intent, not just keyword density.", icon: <Icons.Compass /> },
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out px-6 md:px-12 py-6 border-b ${scrolled || activeNav ? 'bg-[#FDFBF9] border-stone-200' : 'bg-transparent border-transparent'}`}
        onMouseLeave={() => setActiveNav(null)}
      >
        <div className="flex justify-between items-center max-w-[1800px] mx-auto relative z-50">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-[#1A1A18] text-[#FDFBF9] flex items-center justify-center rounded-sm transition-transform duration-500 group-hover:rotate-180">
              <Icons.Compass />
            </div>
            <span className="font-serif font-bold text-2xl tracking-tighter">JobPilot</span>
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

          <button className="hidden md:block px-8 py-3 bg-[#1A1A18] text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-amber-600 transition-colors">
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
                <MagneticButton>
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