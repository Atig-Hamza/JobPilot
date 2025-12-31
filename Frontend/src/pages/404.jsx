import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, X, XCircle, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MainLogo from '../assets/Main/logo-without-bg.png';


const premiumStyles = `
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
    perspective: 1200px; /* Strong 3D perspective */
  }

  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 10s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
`;

const NotFound = () => {
  const [text, setText] = useState("");
  const [showStamp, setShowStamp] = useState(false);

  
  const fullText = `Dear User,

Thank you for your interest in "This Page". We have reviewed your request, and while your URL structure was impressive, we have decided to move forward with other candidates (Existing Pages).

This position has been closed (404). We will keep your request on file in our server logs.

Best regards,
The Server Team.`;

  
  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        
        setTimeout(() => setShowStamp(true), 500);
      }
    }, 30); 

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="h-screen w-full bg-white text-gray-900 font-sans flex flex-col relative selection:bg-[#ffb6e6] selection:text-black">
      <style>{premiumStyles}</style>

      {/* Navbar - Logo Only */}
      <div className="absolute top-0 left-0 w-full px-8 py-6 z-50">
        <Link to={'/'} className="inline-flex items-center gap-2 font-bold text-gray-900 tracking-tight text-lg select-none hover:opacity-70 transition-opacity">
            <img src={MainLogo} alt="JobPilot" className='w-5 h-5' />
            JOBPILOT
        </Link>
      </div>

      {/* Background Blobs */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-[#ffb6e6]/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
          <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-purple-100 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 z-10">
        <div className="max-w-2xl w-full flex flex-col items-center">
          
          {/* --- THE 3D EMAIL CARD --- */}
          <motion.div 
            initial={{ rotateX: 20, rotateY: -10, opacity: 0, y: 50 }}
            animate={{ rotateX: 10, rotateY: 0, opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-white/50 relative overflow-hidden mb-12"
            style={{ transformStyle: 'preserve-3d' }}
          >
             {/* Window Controls */}
             <div className="h-10 border-b border-gray-100 flex items-center justify-between px-4 bg-gray-50/50">
                <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-400"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                   <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                   System Notification
                </div>
                <div className="w-10"></div> {/* Spacer */}
             </div>

             {/* Email Header */}
             <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                   <Mail size={18} />
                </div>
                <div>
                   <div className="font-bold text-sm text-gray-900">JobPilot Server</div>
                   <div className="text-xs text-gray-400">To: Browser (You)</div>
                </div>
                <div className="ml-auto text-xs text-gray-400">Just now</div>
             </div>

             {/* Email Body */}
             <div className="p-8 min-h-[220px] relative">
                <pre className="font-sans text-sm md:text-base text-gray-600 whitespace-pre-wrap leading-relaxed">
                   {text}
                </pre>

                {/* THE GIANT STAMP */}
                {showStamp && (
                    <motion.div 
                        initial={{ scale: 2, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1, opacity: 1, rotate: -15 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="absolute bottom-8 right-8 border-4 border-red-500 text-red-500 font-black text-6xl md:text-8xl px-6 py-2 rounded-xl opacity-80 select-none mix-blend-multiply"
                        style={{ maskImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }} 
                    >
                        404
                    </motion.div>
                )}
             </div>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[3rem] md:text-[4rem] font-bold tracking-tighter leading-[0.95] text-center mb-6"
          >
            We decided to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">move forward without you.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 text-lg font-medium text-center mb-10 max-w-lg"
          >
            Just kidding. The page actually just doesn't exist. Don't take it personally, it happens to the best URLs.
          </motion.p>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link 
              to="/"
              className="inline-flex items-center justify-center gap-3 bg-black text-white h-16 px-10 rounded-xl font-bold text-lg hover:bg-gray-900 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 group"
            >
              <ArrowLeft size={20} className="text-[#ffb6e6] group-hover:-translate-x-1 transition-transform" />
              Return to Home
            </Link>
          </motion.div>

        </div>
      </div>

    </div>
  );
};

export default NotFound;