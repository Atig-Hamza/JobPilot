import React, { useState, useEffect } from 'react';
import { ArrowLeft, Cpu, Zap, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MainLogo from '../assets/Main/logo-without-bg.png';


const premiumStyles = `
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
    perspective: 1000px; /* Essential for 3D effect */
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


const rows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

const ComingSoon = () => {
  const [activeKey, setActiveKey] = useState(null);

  
  useEffect(() => {
    const interval = setInterval(() => {
      const randomRow = rows[Math.floor(Math.random() * rows.length)];
      const randomKey = randomRow[Math.floor(Math.random() * randomRow.length)];
      
      
      if (Math.random() > 0.85) {
        setActiveKey('SPACE');
      } else {
        setActiveKey(randomKey);
      }

      setTimeout(() => setActiveKey(null), 120);

    }, 80); 

    return () => clearInterval(interval);
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
        <div className="max-w-4xl w-full flex flex-col items-center">
          
          {/* --- HIGH FIDELITY KEYBOARD ANIMATION --- */}
          {/* Scaled down (scale-75) and rotated in 3D space */}
          <div className="relative mb-12 scale-[0.6] md:scale-75 transition-transform duration-500" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(25deg)' }}>
            
            {/* Keyboard Chassis */}
            <div className="bg-gray-200 p-5 rounded-[2rem] shadow-[0_50px_60px_-15px_rgba(0,0,0,0.3),inset_0_-8px_0_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.8)] relative z-10 border border-gray-100">
               
               {/* Inner Plate (Darker for contrast) */}
               <div className="bg-[#e0e0e0] p-4 rounded-[1.2rem] shadow-inner">
                   <div className="flex flex-col gap-3">
                      
                      {rows.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center gap-3">
                          {row.map((key) => {
                            const isActive = activeKey === key;
                            return (
                              <div key={key} className="relative w-12 h-12">
                                {/* Underglow Light (Only visible when active) */}
                                <div className={`absolute inset-0 rounded-xl bg-pink-500 blur-md transition-opacity duration-75 ${isActive ? 'opacity-80' : 'opacity-0'}`}></div>
                                
                                {/* The Keycap */}
                                <motion.div
                                  animate={isActive ? { y: 6 } : { y: 0 }}
                                  transition={{ duration: 0.05, ease: "easeInOut" }}
                                  className={`
                                    relative w-full h-full rounded-xl flex items-center justify-center font-bold text-sm select-none
                                    bg-gradient-to-b from-white to-gray-50
                                    shadow-[0_6px_0_#c0c0c0,0_8px_4px_rgba(0,0,0,0.2)] 
                                    border-t border-white
                                    ${isActive ? 'shadow-[0_0_0_#c0c0c0,0_0_0_rgba(0,0,0,0)] !bg-gray-50' : ''}
                                  `}
                                >
                                  <span className={`text-gray-500 transition-colors ${isActive ? 'text-pink-600 scale-95' : ''}`}>{key}</span>
                                  {/* Keycap concave shine */}
                                  <div className="absolute top-1 left-1 right-1 h-1/2 bg-gradient-to-b from-white/80 to-transparent rounded-t-lg opacity-50"></div>
                                </motion.div>
                              </div>
                            );
                          })}
                        </div>
                      ))}

                      {/* Spacebar Row */}
                      <div className="flex justify-center mt-1">
                         <div className="relative w-80 h-12">
                            <div className={`absolute inset-0 rounded-xl bg-pink-500 blur-md transition-opacity duration-75 ${activeKey === 'SPACE' ? 'opacity-80' : 'opacity-0'}`}></div>
                            <motion.div 
                                animate={activeKey === 'SPACE' ? { y: 6 } : { y: 0 }}
                                transition={{ duration: 0.05 }}
                                className={`
                                  relative w-full h-full rounded-xl flex items-center justify-center
                                  bg-gradient-to-b from-white to-gray-50
                                  shadow-[0_6px_0_#c0c0c0,0_8px_4px_rgba(0,0,0,0.2)] 
                                  border-t border-white
                                  ${activeKey === 'SPACE' ? 'shadow-[0_0_0_#c0c0c0] !bg-gray-50' : ''}
                                `}
                            >
                                <div className={`w-12 h-1 rounded-full bg-gray-300 ${activeKey === 'SPACE' ? 'bg-pink-300' : ''}`}></div>
                            </motion.div>
                         </div>
                      </div>

                   </div>
               </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center max-w-3xl mx-auto -mt-4">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 mb-8 px-5 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                Commit ID: <span className="font-mono text-gray-900">8f3a2c1</span> • Building Now
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[3.5rem] md:text-[5rem] font-bold tracking-tighter leading-[0.9] mb-8"
            >
              Hamza is in the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">flow state.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed mb-12"
            >
              You are witnessing real-time development intensity. <strong className="text-gray-900">Hamza Atig</strong> is currently typing at 120 WPM to ship this feature before his keyboard melts.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link 
                to="/"
                className="inline-flex items-center justify-center gap-3 bg-black text-white h-16 px-10 rounded-xl font-bold text-lg hover:bg-gray-900 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 group"
              >
                <ArrowLeft size={20} className="text-[#ffb6e6] group-hover:-translate-x-1 transition-transform" />
                Let Him Cook (Return Home)
              </Link>
            </motion.div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ComingSoon;