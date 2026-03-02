import React, { useState, useEffect, useRef, useCallback } from 'react';
import UserLayout from './components/UserLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, animate } from 'framer-motion';
import axios from 'axios';

const Meet = () => {
    const [micOn, setMicOn] = useState(false);
    const [camOn, setCamOn] = useState(true);
    const [chatOpen, setChatOpen] = useState(true);
    const [time, setTime] = useState("");
    const [messages, setMessages] = useState([
        { sender: 'Sarah Jenkins', time: '10:01 AM', text: 'Hi David, thank you for having me today! 👋', isLocal: false },
        { sender: 'David (You)', time: '10:02 AM', text: 'Great to meet you Sarah. Can you start by sharing your screen and pulling up the architecture diagram we discussed?', isLocal: true },
        { sender: 'Sarah Jenkins', time: '10:03 AM', text: 'Sure, pulling it up now.', isLocal: false },
    ]);
    const [inputText, setInputText] = useState("");

    // camera ref
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const videoGridRef = useRef(null);
    const pipRef = useRef(null);
    const [cameraState, setCameraState] = useState('loading'); // loading, ready, error

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const isDragging = useRef(false);

    const handleDragStart = useCallback(() => {
        isDragging.current = true;
    }, []);

    const handleDragEnd = useCallback((_, info) => {
        isDragging.current = false;
        if (!videoGridRef.current || !pipRef.current) return;

        const gridRect = videoGridRef.current.getBoundingClientRect();
        const pipRect = pipRef.current.getBoundingClientRect();
        const gridWidth = gridRect.width;
        const gridHeight = gridRect.height;
        const pipWidth = pipRect.width;
        const pipHeight = pipRect.height;

        const currentX = x.get();
        const currentY = y.get();

        // Project where the PIP would end up based on release velocity
        const velocityScale = 0.08;
        const projectedX = currentX + info.velocity.x * velocityScale;
        const projectedY = currentY + info.velocity.y * velocityScale;

        // PIP is positioned absolute bottom-8 right-8 (32px from edge)
        const padding = 32;
        const minX = -(gridWidth - pipWidth - padding * 2);
        const maxX = 0;
        const minY = -(gridHeight - pipHeight - padding * 2);
        const maxY = 0;

        // Snap to closest corner using projected position
        const snapX = Math.abs(projectedX - minX) < Math.abs(projectedX - maxX) ? minX : maxX;
        const snapY = Math.abs(projectedY - minY) < Math.abs(projectedY - maxY) ? minY : maxY;

        const springConfig = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8, restSpeed: 0.5 };
        animate(x, snapX, springConfig);
        animate(y, snapY, springConfig);
    }, [x, y]);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userFirstName = user.fullName ? user.fullName.split(' ')[0] : 'David';

    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const jobId = queryParams.get('jobId');
    const [jobTitle, setJobTitle] = useState('Interview Session');

    useEffect(() => {
        const fetchJob = async () => {
            if (jobId) {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/jobs/${jobId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data.status === 'success') {
                        setJobTitle(response.data.data.job.title);
                    }
                } catch (e) {
                    console.error('Error fetching job:', e);
                }
            }
        };
        fetchJob();
    }, [jobId]);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
        };
        updateClock();
        let interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, facingMode: 'user' },
                    audio: false
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                streamRef.current = stream;
                setCameraState('ready');
            } catch (err) {
                console.log('Camera not available:', err.message);
                setCameraState('error');
            }
        };
        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const toggleMic = () => setMicOn(!micOn);

    const toggleCam = () => {
        const newState = !camOn;
        setCamOn(newState);
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach(t => t.enabled = newState);
        }
    };

    const handleSendMessage = () => {
        if (!inputText.trim()) return;
        setMessages(prev => [...prev, {
            sender: `${userFirstName} (You)`,
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            text: inputText.trim(),
            isLocal: true
        }]);
        setInputText("");
    };

    const leaveCall = () => {
        navigate('/user/interview-coach');
    };

    return (
        <>
            <style>{`
                .meet-bg { background-color: #202124; }
                .meet-surface { background-color: #3c4043; }
                .meet-hover { background-color: #424548; }
                .meet-danger { background-color: #ea4335; }
                .meet-danger-hover { background-color: #d93025; }
                .meet-text { color: #e8eaed; }
                .meet-text-muted { color: #9aa0a6; }
                .meet-active-text { color: #8ab4f8; }
                .meet-active-bg { background-color: #394457; }
                
                .ctrl-btn i { font-size: 1.35rem; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15)); transition: transform 0.15s ease, filter 0.15s ease; }
                .ctrl-btn:hover i { transform: scale(1.1); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25)); }
                .ctrl-btn:active i { transform: scale(0.95); }
                
                .sec-btn { position: relative; transition: all 0.2s ease; }
                .sec-btn i { font-size: 1.5rem; transition: transform 0.2s ease, color 0.2s ease; }
                .sec-btn::before { content: ''; position: absolute; inset: 0; border-radius: 9999px; background: transparent; transition: all 0.25s ease; }
                .sec-btn:hover::before { background: rgba(232, 234, 237, 0.08); box-shadow: 0 0 0 4px rgba(232, 234, 237, 0.04); }
                .sec-btn:hover i { transform: scale(1.1); }
                .sec-btn:active i { transform: scale(0.92); }
                .sec-btn:active::before { background: rgba(232, 234, 237, 0.14); }
                
                .sec-active { background: rgba(138, 180, 248, 0.12); }
                .sec-active::before { background: transparent; }
                .sec-active:hover::before { background: rgba(138, 180, 248, 0.08); box-shadow: 0 0 0 4px rgba(138, 180, 248, 0.04); }
                .sec-active::after { content: ''; position: absolute; bottom: 0px; left: 50%; transform: translateX(-50%); width: 20px; height: 3px; background: #8ab4f8; border-radius: 2px 2px 0 0; }
                
                .overlay-icon i { filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5)); }
                
                .mic-muted { animation: mic-pulse 2.5s ease-in-out infinite; }
                @keyframes mic-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.3); } 50% { box-shadow: 0 0 0 8px rgba(234, 67, 53, 0); } }
                
                .speaking-ring { animation: speaking 1.8s ease-in-out infinite; }
                @keyframes speaking { 0%, 100% { border-color: #1a73e8; } 50% { border-color: #8ab4f8; box-shadow: 0 0 0 4px rgba(138, 180, 248, 0.15); } }
                
                .wave-bar { animation: wave 0.8s ease-in-out infinite alternate; }
                .wave-bar:nth-child(1) { animation-delay: 0s; }
                .wave-bar:nth-child(2) { animation-delay: 0.15s; }
                .wave-bar:nth-child(3) { animation-delay: 0.3s; }
                @keyframes wave { 0% { height: 4px; } 100% { height: 14px; } }
                
                .tooltip { pointer-events: none; transition: opacity 0.2s ease, transform 0.2s ease; transform: translateY(4px); }
                .ctrl-btn:hover .tooltip, .sec-btn:hover .tooltip, .leave-btn:hover .tooltip { opacity: 1 !important; transform: translateY(0); }
                
                .send-btn { transition: color 0.15s ease, transform 0.15s ease, background 0.15s ease; }
                .send-btn:hover { color: #1a73e8; background: rgba(26, 115, 232, 0.08); transform: scale(1.12); border-radius: 50%; }
                .send-btn:active { transform: scale(0.9); }
                
                .leave-btn { transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease; }
                .leave-btn:hover { box-shadow: 0 4px 12px rgba(234, 67, 53, 0.4); transform: scale(1.03); }
                .leave-btn:active { transform: scale(0.97); }
                .leave-btn i { font-size: 1.5rem; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.2)); transition: transform 0.2s ease; }
                .leave-btn:hover i { transform: rotate(-135deg) scale(1.05); }
                
                .pin-btn { transition: opacity 0.25s ease, transform 0.25s ease, background 0.2s ease; transform: scale(0.9); }
                .group:hover .pin-btn { opacity: 100; transform: scale(1); }
                .pin-btn:hover { background: rgba(32, 33, 36, 0.9) !important; }
                .pin-btn i { transition: transform 0.2s ease; }
                .pin-btn:hover i { transform: rotate(-45deg); }
                
                .video-badge i { filter: drop-shadow(0 1px 4px rgba(0,0,0,0.6)); }
                
                .count-badge { font-variant-numeric: tabular-nums; min-width: 18px; text-align: center; }
                
                .self-video { will-change: transform; backface-visibility: hidden; -webkit-backface-visibility: hidden; transform: translateZ(0); }
                .self-video:not(:active):hover { box-shadow: 0 8px 25px rgba(0,0,0,0.5); }
                
                .cam-shimmer { background: linear-gradient(110deg, #2d2d30 8%, #3a3a3d 18%, #2d2d30 33%); background-size: 200% 100%; animation: shimmer 1.5s linear infinite; }
                @keyframes shimmer { to { background-position: -200% 0; } }
            `}</style>

            <div className="flex flex-col h-screen w-screen overflow-hidden meet-bg meet-text">
                {/* Top Section (Video Grid & Chat) */}
                <div className="flex-1 flex overflow-hidden p-4 gap-4">

                    {/* Video Grid Area */}
                    <div ref={videoGridRef} className="flex-1 flex flex-col h-full justify-center relative w-full overflow-hidden">

                        {/* Main Video: Candidate (Full area) */}
                        <div className="h-[80vh] w-full max-w-5xl mx-auto meet-surface rounded-xl overflow-hidden relative shadow-lg group border-2 speaking-ring">
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" alt="Candidate" className="w-full h-full object-cover" />

                            {/* Top Right: Speaking Indicator */}
                            <div className="absolute top-4 right-4 flex gap-2 overlay-icon">
                                <div className="bg-[#202124]/70 px-2.5 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1 h-8">
                                    <div className="flex items-end gap-[3px] h-4">
                                        <div className="w-[3px] meet-active-text rounded-full wave-bar" style={{ height: '4px', backgroundColor: '#8ab4f8' }}></div>
                                        <div className="w-[3px] meet-active-text rounded-full wave-bar" style={{ height: '8px', backgroundColor: '#8ab4f8' }}></div>
                                        <div className="w-[3px] meet-active-text rounded-full wave-bar" style={{ height: '4px', backgroundColor: '#8ab4f8' }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Left: Name Tag */}
                            <div className="absolute bottom-4 left-4 bg-[#202124]/70 backdrop-blur-sm px-3.5 py-2 rounded-lg flex items-center gap-2.5 overlay-icon">
                                <i className="ph-fill ph-microphone text-green-400 text-xs"></i>
                                <span className="text-sm font-medium tracking-wide">Sarah Jenkins</span>
                                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-medium ml-1">AI Agent</span>
                            </div>

                            {/* Center: Pin Icon (hover) */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button className="pin-btn opacity-0 bg-[#202124]/70 p-3.5 rounded-full backdrop-blur-sm flex items-center justify-center w-12 h-12">
                                    <i className="ph ph-push-pin text-xl text-white"></i>
                                </button>
                            </div>
                        </div>

                        {/* Self Camera (Picture-in-Picture) */}
                        <motion.div
                            ref={pipRef}
                            drag
                            dragConstraints={videoGridRef}
                            dragElastic={0.08}
                            dragMomentum={false}
                            dragTransition={{ bounceStiffness: 500, bounceDamping: 35 }}
                            style={{ x, y, willChange: 'transform' }}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            whileDrag={{ scale: 1.04, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                            transition={{ scale: { type: 'spring', stiffness: 500, damping: 30 }, boxShadow: { duration: 0.2 } }}
                            className="self-video absolute bottom-8 right-8 w-72 h-48 rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 cursor-grab active:cursor-grabbing group z-50"
                        >
                            {/* Webcam Feed */}
                            <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover scale-x-[-1] ${(camOn && cameraState === 'ready') ? '' : 'hidden'}`}></video>

                            {/* Fallback if no camera */}
                            <div className={`absolute inset-0 meet-surface flex items-center justify-center ${(!camOn || cameraState === 'error') ? '' : 'hidden'}`}>
                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mx-auto text-2xl font-bold mb-2">
                                        {userFirstName[0] || 'U'}
                                    </div>
                                    <span className="text-sm text-gray-300">{user.fullName || 'You'}</span>
                                </div>
                            </div>

                            {/* Shimmer loading */}
                            <div className={`absolute inset-0 cam-shimmer flex items-center justify-center ${cameraState === 'loading' ? '' : 'hidden'}`}>
                                <div className="text-center">
                                    <i className="ph ph-video-camera text-3xl text-gray-500 mb-2"></i>
                                    <p className="text-xs text-gray-500">Starting camera...</p>
                                </div>
                            </div>

                            {/* Muted Badge */}
                            {!micOn && (
                                <div className="absolute top-3 right-3 overlay-icon z-[60]">
                                    <div className="bg-[#202124]/70 p-1.5 rounded-full backdrop-blur-sm video-badge flex items-center justify-center w-7 h-7">
                                        <i className="ph-fill ph-microphone-slash text-[#ea4335] text-xs"></i>
                                    </div>
                                </div>
                            )}

                            {/* Name Tag */}
                            <div className="absolute bottom-3 left-3 bg-[#202124]/70 backdrop-blur-sm px-2.5 py-1.5 rounded-md flex items-center gap-2 overlay-icon z-[60]">
                                <span className="text-xs font-medium tracking-wide text-white">{userFirstName} (You)</span>
                            </div>

                            {/* Hover Controls */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                {/* Minimize */}
                                <button className="bg-[#202124]/80 hover:bg-[#202124] p-2 rounded-full backdrop-blur-sm transition-all">
                                    <i className="ph-bold ph-corners-in text-white text-sm"></i>
                                </button>
                                {/* Expand */}
                                <button className="bg-[#202124]/80 hover:bg-[#202124] p-2 rounded-full backdrop-blur-sm transition-all">
                                    <i className="ph-bold ph-corners-out text-white text-sm"></i>
                                </button>
                            </div>
                        </motion.div>

                    </div>

                    {/* Right Side Panel: Chat */}
                    <div className={`${chatOpen ? 'w-80' : 'w-0 opacity-0'} bg-white rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-300 flex-shrink-0`}>

                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center text-gray-800">
                            <div className="flex items-center gap-2.5">
                                <i className="ph-fill ph-chat-circle-dots text-gray-600 text-xl"></i>
                                <h2 className="text-lg font-normal">In-call messages</h2>
                            </div>
                            <button onClick={() => setChatOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-all">
                                <i className="ph-bold ph-x text-base"></i>
                            </button>
                        </div>

                        {/* Warning Notice */}
                        <div className="px-4 py-2">
                            <div className="bg-gray-50 text-gray-500 text-xs text-center p-3 rounded-lg leading-relaxed flex items-start gap-2 border border-gray-100">
                                <i className="ph-fill ph-shield-check text-gray-400 text-base flex-shrink-0 mt-0.5"></i>
                                <span>Messages can only be seen by people in the call and are deleted when the call ends.</span>
                            </div>
                        </div>

                        {/* Chat Messages Area */}
                        <div className="flex-1 overflow-y-auto px-6 py-2 flex flex-col gap-5">
                            {messages.map((msg, idx) => (
                                <div key={idx} className="group/msg">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-gray-900 font-medium text-sm">{msg.sender}</span>
                                        <span className="text-xs text-gray-400">{msg.time}</span>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed">{msg.text}</p>
                                    <div className="flex gap-1 mt-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                            <i className="ph ph-smiley text-gray-400 text-xs"></i>
                                        </button>
                                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                            <i className="ph ph-dots-three text-gray-400 text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chat Input Area */}
                        <div className="p-4 bg-white mt-auto">
                            <div className="bg-gray-100 rounded-3xl flex items-end px-4 py-1.5 border border-transparent focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-sm transition-all">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all mb-0.5 flex-shrink-0">
                                    <i className="ph ph-paperclip text-lg"></i>
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all mb-0.5 flex-shrink-0">
                                    <i className="ph ph-smiley text-lg"></i>
                                </button>
                                <textarea rows="1" placeholder="Send a message" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} className="bg-transparent text-gray-800 w-full outline-none resize-none text-sm py-2.5 px-2" style={{ minHeight: '40px' }}></textarea>
                                <button onClick={handleSendMessage} disabled={!inputText.trim()} className="send-btn p-2 text-gray-400 mb-0.5 flex-shrink-0">
                                    <i className="ph-fill ph-paper-plane-right text-xl"></i>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Bottom Control Bar */}
                <div className="h-24 px-6 flex items-center justify-between meet-bg pb-2 mt-auto flex-shrink-0 z-10">

                    {/* Left: Meeting Info */}
                    <div className="flex items-center gap-4 w-1/4">
                        <div className="flex items-center gap-2">
                            <i className="ph-fill ph-clock meet-text-muted text-lg"></i>
                            <span className="text-base font-medium tabular-nums text-gray-300">{time}</span>
                        </div>
                        <span className="meet-text-muted font-light text-gray-500">|</span>
                        <div className="flex items-center gap-2 max-w-[200px]">
                            <i className="ph-fill ph-briefcase meet-text-muted text-base text-gray-400"></i>
                            <span className="text-base font-medium tracking-wide truncate text-gray-200">{jobTitle}</span>
                        </div>
                    </div>

                    {/* Center: Primary Controls */}
                    <div className="flex items-center justify-center gap-3 w-2/4">

                        {/* Mic */}
                        <button onClick={toggleMic} className={`ctrl-btn ${!micOn ? 'mic-muted meet-danger hover:meet-danger-hover' : 'meet-surface meet-hover'} text-white p-3 rounded-full transition-colors w-12 h-12 flex items-center justify-center relative`}>
                            <i className={`ph-fill ${micOn ? 'ph-microphone' : 'ph-microphone-slash'}`}></i>
                            <div className="tooltip absolute -top-12 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 whitespace-nowrap shadow-xl z-50">
                                {micOn ? 'Turn off microphone' : 'Turn on microphone'}
                                <span className="text-gray-400 ml-1">⌘+d</span>
                            </div>
                        </button>

                        {/* Camera */}
                        <button onClick={toggleCam} className={`ctrl-btn ${!camOn ? 'meet-danger hover:meet-danger-hover' : 'meet-surface meet-hover'} text-white p-3 rounded-full transition-colors w-12 h-12 flex items-center justify-center relative`}>
                            <i className={`ph-fill ${camOn ? 'ph-video-camera' : 'ph-video-camera-slash'}`}></i>
                            <div className="tooltip absolute -top-12 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 whitespace-nowrap shadow-xl z-50">
                                {camOn ? 'Turn off camera' : 'Turn on camera'}
                                <span className="text-gray-400 ml-1">⌘+e</span>
                            </div>
                        </button>

                        {/* Closed Captions */}
                        <button className="ctrl-btn meet-surface meet-hover text-white p-3 rounded-full transition-colors w-12 h-12 items-center justify-center relative hidden md:flex">
                            <i className="ph-bold ph-closed-captioning"></i>
                            <div className="tooltip absolute -top-12 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 whitespace-nowrap shadow-xl z-50">
                                Turn on captions
                                <span className="text-gray-400 ml-1">c</span>
                            </div>
                        </button>

                        {/* Reactions */}
                        <button className="ctrl-btn meet-surface meet-hover text-white p-3 rounded-full transition-colors w-12 h-12 items-center justify-center relative hidden md:flex">
                            <i className="ph-bold ph-smiley"></i>
                            <div className="tooltip absolute -top-12 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 whitespace-nowrap shadow-xl z-50">Send a reaction</div>
                        </button>

                        {/* Screen Share */}
                        <button className="ctrl-btn meet-surface meet-hover text-white p-3 rounded-full transition-colors w-12 h-12 flex items-center justify-center relative">
                            <i className="ph-bold ph-presentation-chart"></i>
                            <div className="tooltip absolute -top-12 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 whitespace-nowrap shadow-xl z-50">Present now</div>
                        </button>

                        {/* Raise Hand */}
                        <button className="ctrl-btn meet-surface meet-hover text-white p-3 rounded-full transition-colors w-12 h-12 flex items-center justify-center relative">
                            <i className="ph-bold ph-hand"></i>
                            <div className="tooltip absolute -top-12 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 whitespace-nowrap shadow-xl z-50">Raise hand</div>
                        </button>

                        {/* More Options */}
                        <button className="ctrl-btn meet-surface meet-hover text-white p-3 rounded-full transition-colors w-12 h-12 flex items-center justify-center relative">
                            <i className="ph-bold ph-dots-three-vertical"></i>
                            <div className="tooltip absolute -top-12 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 whitespace-nowrap shadow-xl z-50">More options</div>
                        </button>

                        {/* Leave Call */}
                        <button onClick={leaveCall} className="leave-btn meet-danger hover:meet-danger-hover text-white px-6 py-3 rounded-full h-12 flex items-center justify-center ml-2 relative">
                            <i className="ph-fill ph-phone-disconnect"></i>
                            <div className="tooltip absolute -top-12 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 whitespace-nowrap shadow-xl z-50">Leave call</div>
                        </button>
                    </div>

                    {/* Right: Secondary Controls */}
                    <div className="flex items-center justify-end gap-1.5 w-1/4">
                        {/* Info */}
                        <button className="sec-btn meet-text-muted p-3 rounded-full relative text-gray-400">
                            <i className="ph-bold ph-info"></i>
                            <div className="tooltip absolute -top-12 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 whitespace-nowrap shadow-xl z-50">Meeting details</div>
                        </button>

                        {/* Participants */}
                        <button className="sec-btn meet-text-muted p-3 rounded-full relative text-gray-400">
                            <i className="ph-bold ph-users-three"></i>
                            <span className="count-badge absolute top-0.5 right-0.5 meet-surface text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#202124] text-white z-10" style={{ backgroundColor: '#3c4043' }}>2</span>
                            <div className="tooltip absolute -top-12 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 whitespace-nowrap shadow-xl z-50">People</div>
                        </button>

                        {/* Chat */}
                        <button onClick={() => setChatOpen(!chatOpen)} className={`sec-btn ${chatOpen ? 'sec-active meet-active-text text-[#8ab4f8]' : 'meet-text-muted text-gray-400'} p-3 rounded-full relative`}>
                            <i className="ph-fill ph-chat-circle-dots"></i>
                            <div className="tooltip absolute -top-12 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 whitespace-nowrap shadow-xl z-50">Chat with everyone</div>
                        </button>

                        {/* Activities */}
                        <button className="sec-btn meet-text-muted p-3 rounded-full relative hidden xl:flex items-center justify-center text-gray-400">
                            <i className="ph-bold ph-squares-four"></i>
                            <div className="tooltip absolute -top-12 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 whitespace-nowrap shadow-xl z-50">Activities</div>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Meet;
