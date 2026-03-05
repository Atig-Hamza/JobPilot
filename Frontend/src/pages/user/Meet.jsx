import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, animate, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API = import.meta.env.VITE_BACKEND_API_URL;

// ── Interviewer Profiles ───────────────────────────────────────────
const INTERVIEWERS = {
    sarah: {
        name: 'Sarah Jenkins',
        role: 'HR Recruiter',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
        ttsVoice: 'sarah',
    },
    alex: {
        name: 'Alex Chen',
        role: 'Technical Lead',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
        ttsVoice: 'alex',
    },
};

// ── Chrome Web Speech API STT Hook ─────────────────────────────────
function useSpeechRecognition() {
    const recognitionRef = useRef(null);
    const [transcript, setTranscript] = useState('');
    const [listening, setListening] = useState(false);
    const [supported, setSupported] = useState(false);
    const onResultRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { setSupported(false); return; }
        setSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) final += t;
                else interim += t;
            }
            setTranscript(interim || final);
            if (final && onResultRef.current) onResultRef.current(final.trim());
        };
        recognition.onerror = (e) => {
            console.warn('[STT] Error:', e.error);
            if (e.error !== 'no-speech') setListening(false);
        };
        recognition.onend = () => {
            if (recognitionRef.current?._shouldListen) {
                try { recognitionRef.current.start(); } catch (_) {}
            } else {
                setListening(false);
            }
        };

        recognitionRef.current = recognition;
        return () => { try { recognition.abort(); } catch (_) {} };
    }, []);

    const start = useCallback(() => {
        if (recognitionRef.current && !listening) {
            setTranscript('');
            recognitionRef.current._shouldListen = true;
            recognitionRef.current.start();
            setListening(true);
        }
    }, [listening]);

    const stop = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current._shouldListen = false;
            recognitionRef.current.stop();
            setListening(false);
        }
    }, []);

    const onFinalResult = useCallback((cb) => { onResultRef.current = cb; }, []);

    return { transcript, listening, supported, start, stop, onFinalResult };
}

// ═══════════════════════════════════════════════════════════════════
// MEET COMPONENT
// ═══════════════════════════════════════════════════════════════════
const Meet = () => {
    // ── Core State ──
    const [micOn, setMicOn] = useState(false);
    const [camOn, setCamOn] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [time, setTime] = useState('');
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [pipExpanded, setPipExpanded] = useState(false);

    // ── Interview Flow State ──
    // Phases: 'waiting' → 'hr_joining' → 'hr' → 'hr_leaving' → 'tech_joining' → 'technical' → 'tech_leaving' → 'generating' → 'report'
    const [meetPhase, setMeetPhase] = useState('waiting');
    const [sessionId, setSessionId] = useState(null);
    const [aiSpeaking, setAiSpeaking] = useState(false);
    const [aiTyping, setAiTyping] = useState(false);
    const [sttActive, setSttActive] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [ccEnabled, setCcEnabled] = useState(true);
    const [report, setReport] = useState(null);
    const [waitTimer, setWaitTimer] = useState(5);

    const audioRef = useRef(null);
    const chatEndRef = useRef(null);
    const phaseRef = useRef('waiting');
    const initCalledRef = useRef(false);
    const msgIdRef = useRef(0);

    // Keep phaseRef in sync
    useEffect(() => { phaseRef.current = meetPhase; }, [meetPhase]);

    const stt = useSpeechRecognition();

    // ── Camera Refs ──
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const videoGridRef = useRef(null);
    const pipRef = useRef(null);
    const [cameraState, setCameraState] = useState('loading');

    // ── Drag PIP ──
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const isDragging = useRef(false);

    const handleDragStart = useCallback(() => { isDragging.current = true; }, []);

    const handleDragEnd = useCallback((_, info) => {
        isDragging.current = false;
        if (!videoGridRef.current || !pipRef.current) return;
        const gridRect = videoGridRef.current.getBoundingClientRect();
        const pipRect = pipRef.current.getBoundingClientRect();
        const padding = 32;
        const minX = -(gridRect.width - pipRect.width - padding * 2);
        const maxX = 0;
        const minY = -(gridRect.height - pipRect.height - padding * 2);
        const maxY = 0;
        const velocityScale = 0.08;
        const projectedX = x.get() + info.velocity.x * velocityScale;
        const projectedY = y.get() + info.velocity.y * velocityScale;
        const snapX = Math.abs(projectedX - minX) < Math.abs(projectedX - maxX) ? minX : maxX;
        const snapY = Math.abs(projectedY - minY) < Math.abs(projectedY - maxY) ? minY : maxY;
        const springConfig = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8, restSpeed: 0.5 };
        animate(x, snapX, springConfig);
        animate(y, snapY, springConfig);
    }, [x, y]);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userFirstName = user.fullName ? user.fullName.split(' ')[0] : 'You';
    const token = localStorage.getItem('token');

    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const jobId = queryParams.get('jobId');
    const [jobTitle, setJobTitle] = useState('Interview Session');

    // ── Get current interviewer based on phase ──
    const currentInterviewer = (meetPhase.startsWith('tech') || meetPhase === 'generating')
        ? INTERVIEWERS.alex
        : INTERVIEWERS.sarah;

    // ── Helpers ──
    const nowTime = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const addMessage = useCallback((sender, text, isLocal = false, type = 'chat') => {
        const id = ++msgIdRef.current;
        setMessages(prev => [...prev, { sender, time: nowTime(), text, isLocal, type, _id: id }]);
        return id;
    }, []);

    // ── TTS: Play AI audio via backend Edge TTS ──
    const playTTS = useCallback(async (text, speaker = 'sarah') => {
        if (!text || text.length < 3) return;
        if (audioRef.current) {
            if (audioRef.current instanceof Audio) {
                audioRef.current.onended = null;
                audioRef.current.onerror = null;
                audioRef.current.pause();
                audioRef.current.src = '';
            } else {
                window.speechSynthesis?.cancel();
            }
            audioRef.current = null;
        }

        setSubtitle(text);
        setAiSpeaking(true);

        try {
            const res = await axios.post(`${API}/meet/tts`, { text: text.slice(0, 2000), speaker }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.status === 'success' && res.data.data.audio) {
                const audio = new Audio(`data:${res.data.data.contentType};base64,${res.data.data.audio}`);
                audioRef.current = audio;
                audio.onended = () => { setAiSpeaking(false); setSubtitle(''); };
                audio.onerror = () => { setAiSpeaking(false); setSubtitle(''); };
                await audio.play();
                return; // success
            }
        } catch (err) {
            console.warn('[TTS] Backend failed, using browser fallback:', err.message);
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.95;
            const voices = window.speechSynthesis.getVoices();
            const isAlex = speaker === 'alex';
            const preferred = voices.find(v => {
                const n = v.name.toLowerCase();
                return v.lang.startsWith('en') && (isAlex ? /guy|david|male|james/.test(n) : /aria|zira|samantha|jenny|female/.test(n));
            }) || voices.find(v => v.lang.startsWith('en'));
            if (preferred) utterance.voice = preferred;
            utterance.onend = () => { setAiSpeaking(false); setSubtitle(''); };
            utterance.onerror = () => { setAiSpeaking(false); setSubtitle(''); };
            audioRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        } else {
            setTimeout(() => { setAiSpeaking(false); setSubtitle(''); }, 4000);
        }
    }, [token]);

    // ── Send message to AI (streaming SSE) ──
    const sendToAI = useCallback(async (text, inputType, overrideSessionId = null) => {
        const sid = overrideSessionId || sessionId;
        if (!sid || !text.trim()) return null;

        setAiTyping(true);

        const speaker = phaseRef.current.startsWith('tech') ? 'alex' : 'sarah';
        const interviewerName = speaker === 'alex' ? 'Alex Chen' : 'Sarah Jenkins';
        let aiMsgIndex = null;
        if (inputType === 'chat') {
            aiMsgIndex = ++msgIdRef.current;
            setMessages(prev => [...prev, {
                sender: interviewerName,
                time: nowTime(),
                text: '',
                isLocal: false,
                streaming: true,
                _id: aiMsgIndex,
                type: 'chat',
            }]);
        }

        let fullText = '';
        let phaseComplete = false;
        let completedPhase = null;

        try {
            const response = await fetch(`${API}/meet/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ sessionId: sid, message: text, inputType }),
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.type === 'token') {
                            fullText += data.content;
                            if (aiMsgIndex) {
                                setMessages(prev => prev.map(m =>
                                    m._id === aiMsgIndex ? { ...m, text: fullText } : m
                                ));
                            }
                        } else if (data.type === 'done') {
                            fullText = data.fullResponse || fullText;
                            phaseComplete = data.phaseComplete || false;
                            completedPhase = data.completedPhase || null;
                            if (aiMsgIndex) {
                                setMessages(prev => prev.map(m =>
                                    m._id === aiMsgIndex ? { ...m, text: fullText, streaming: false } : m
                                ));
                            }
                        } else if (data.type === 'error') {
                            if (aiMsgIndex) {
                                setMessages(prev => prev.map(m =>
                                    m._id === aiMsgIndex ? { ...m, text: 'Something went wrong.', streaming: false } : m
                                ));
                            }
                        }
                    } catch (_) {}
                }
            }
        } catch (err) {
            console.error('[Meet] AI error:', err);
        }

        setAiTyping(false);

        if (fullText && inputType === 'voice') {
            await playTTS(fullText, speaker);
        }

        return { fullText, phaseComplete, completedPhase };
    }, [sessionId, token, playTTS]);

    // ── Phase Transition: HR → Technical ──
    const handlePhaseTransition = useCallback(async (sid) => {
        setMeetPhase('hr_leaving');
        addMessage('System', 'Sarah Jenkins has left the meeting.', false, 'system');

        await new Promise(r => setTimeout(r, 3000));

        try {
            await axios.post(`${API}/meet/transition`, { sessionId: sid }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            console.error('[Meet] Transition error:', err);
        }

        setMeetPhase('tech_joining');
        addMessage('System', 'Alex Chen is joining the meeting...', false, 'system');

        await new Promise(r => setTimeout(r, 3500));
        setMeetPhase('technical');

        const result = await sendToAI('The technical interview is starting now. Please greet the candidate and begin.', 'voice', sid);

        if (result?.phaseComplete && result?.completedPhase === 'technical') {
            handleInterviewEnd(sid);
        }
    }, [token, sendToAI, addMessage]);

    // ── Interview End → Generate Report ──
    const handleInterviewEnd = useCallback(async (sid) => {
        setMeetPhase('tech_leaving');
        addMessage('System', 'Alex Chen has left the meeting.', false, 'system');

        await new Promise(r => setTimeout(r, 2000));
        setMeetPhase('generating');

        try {
            const res = await axios.post(`${API}/meet/report`, { sessionId: sid }, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 60000,
            });
            if (res.data.status === 'success') {
                setReport(res.data.data.report);
                setMeetPhase('report');
            } else {
                throw new Error('Report generation failed');
            }
        } catch (err) {
            console.error('[Meet] Report error:', err);
            setReport({ detailed_feedback: 'Failed to generate report. Please try again.', overall_score: 0 });
            setMeetPhase('report');
        }
    }, [token, addMessage]);

    // ── Initialize Session on Mount ──
    useEffect(() => {
        if (initCalledRef.current) return;
        initCalledRef.current = true;

        const init = async () => {
            if (jobId) {
                try {
                    const res = await axios.get(`${API}/jobs/${jobId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.data.status === 'success') setJobTitle(res.data.data.job.title);
                } catch (_) {}
            }

            // Init session
            try {
                const res = await axios.post(`${API}/meet/init`, { jobTitle }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data.status === 'success') {
                    const sid = res.data.data.sessionId;
                    setSessionId(sid);
                    setMeetPhase('waiting');
                    let count = 5;
                    const timer = setInterval(() => {
                        count--;
                        setWaitTimer(count);
                        if (count <= 0) {
                            clearInterval(timer);
                            // Sarah joining
                            setMeetPhase('hr_joining');
                            addMessage('System', 'Sarah Jenkins is joining the meeting...', false, 'system');

                            setTimeout(async () => {
                                setMeetPhase('hr');
                                const result = await sendToAI(
                                    'The interview is starting now. Please introduce yourself and the interview format, then ask your first question.',
                                    'voice',
                                    sid
                                );
                                if (result?.phaseComplete && result?.completedPhase === 'hr') {
                                    handlePhaseTransition(sid);
                                }
                            }, 3000);
                        }
                    }, 1000);

                    return () => clearInterval(timer);
                }
            } catch (err) {
                console.error('[Meet] Init failed:', err);
                addMessage('System', 'Failed to connect. Please refresh.', false, 'system');
            }
        };

        if (token) init();
    }, []);

    // ── Preload TTS voices ──
    useEffect(() => {
        window.speechSynthesis?.getVoices();
        const h = () => window.speechSynthesis?.getVoices();
        window.speechSynthesis?.addEventListener?.('voiceschanged', h);
        return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', h);
    }, []);

    // ── Clock ──
    useEffect(() => {
        const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
        update();
        const i = setInterval(update, 1000);
        return () => clearInterval(i);
    }, []);

    // ── Camera ──
    useEffect(() => {
        const startCam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false });
                if (videoRef.current) videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setCameraState('ready');
            } catch (err) {
                console.log('Camera unavailable:', err.message);
                setCameraState('error');
            }
        };
        startCam();
        return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
    }, []);

    // ── STT: Wire up final result handler ──
    useEffect(() => {
        stt.onFinalResult(async (finalText) => {
            if (!finalText.trim()) return;
            setLiveTranscript('');

            // Send to AI as voice input
            const result = await sendToAI(finalText, 'voice');

            if (result?.phaseComplete) {
                if (result.completedPhase === 'hr') {
                    handlePhaseTransition(sessionId);
                } else if (result.completedPhase === 'technical') {
                    handleInterviewEnd(sessionId);
                }
            }
        });
    }, [stt.onFinalResult, sendToAI, sessionId, handlePhaseTransition, handleInterviewEnd]);

    // ── STT: Live transcript ──
    useEffect(() => {
        if (stt.listening) setLiveTranscript(stt.transcript);
    }, [stt.transcript, stt.listening]);

    // ── Auto-scroll chat ──
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Controls ──
    const toggleMic = useCallback(() => {
        if (!['hr', 'technical'].includes(meetPhase)) return;
        const on = !micOn;
        setMicOn(on);
        if (on) {
            if (audioRef.current) {
                if (audioRef.current instanceof Audio) audioRef.current.pause();
                else window.speechSynthesis?.cancel();
                audioRef.current = null;
            }
            setAiSpeaking(false);
            setSubtitle('');
            stt.start();
            setSttActive(true);
        } else {
            stt.stop();
            setSttActive(false);
            setLiveTranscript('');
        }
    }, [micOn, stt, meetPhase]);

    const toggleCam = () => {
        const s = !camOn;
        setCamOn(s);
        streamRef.current?.getVideoTracks().forEach(t => t.enabled = s);
    };

    const handleSendMessage = useCallback(async () => {
        if (!inputText.trim() || !['hr', 'technical'].includes(meetPhase)) return;
        const text = inputText.trim();
        addMessage(`${userFirstName} (You)`, text, true, 'chat');
        setInputText('');
        const result = await sendToAI(text, 'chat');

        if (result?.phaseComplete) {
            if (result.completedPhase === 'hr') handlePhaseTransition(sessionId);
            else if (result.completedPhase === 'technical') handleInterviewEnd(sessionId);
        }
    }, [inputText, meetPhase, addMessage, userFirstName, sendToAI, sessionId, handlePhaseTransition, handleInterviewEnd]);

    const togglePipSize = useCallback(() => {
        const spring = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 };
        animate(x, 0, spring);
        animate(y, 0, spring);
        setPipExpanded(p => !p);
    }, [x, y]);

    const leaveCall = useCallback(async () => {
        stt.stop();
        if (audioRef.current) {
            if (audioRef.current instanceof Audio) audioRef.current.pause();
            else window.speechSynthesis?.cancel();
        }
        if (sessionId) {
            try {
                await axios.post(`${API}/meet/end`, { sessionId }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (_) {}
        }
        navigate('/user/interview-coach');
    }, [sessionId, token, navigate, stt]);

    // ── Current phase label ──
    const phaseLabel = {
        waiting: 'Waiting for interviewer...',
        hr_joining: 'Sarah Jenkins is joining...',
        hr: 'HR Round — Sarah Jenkins',
        hr_leaving: 'Sarah Jenkins has left',
        tech_joining: 'Alex Chen is joining...',
        technical: 'Technical Round — Alex Chen',
        tech_leaving: 'Alex Chen has left',
        generating: 'Generating your report...',
        report: 'Interview Complete',
    }[meetPhase] || '';

    // ═══════════════════════════════════════════════════════════════
    // REPORT VIEW
    // ═══════════════════════════════════════════════════════════════
    if (meetPhase === 'report' && report) {
        return (
            <div className="min-h-screen bg-[#0f0f10] text-white p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full text-sm mb-4">
                            <i className="ph-fill ph-check-circle"></i>
                            Interview Complete
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Interview Report</h1>
                        <p className="text-gray-400">{jobTitle} — {user.fullName || 'Candidate'}</p>
                    </div>

                    {/* Overall Score */}
                    <div className="bg-[#1a1a1d] rounded-2xl p-8 mb-6 text-center border border-gray-800">
                        <div className="text-6xl font-bold mb-2" style={{
                            color: report.overall_score >= 7 ? '#4ade80' : report.overall_score >= 5 ? '#facc15' : '#f87171'
                        }}>
                            {report.overall_score}/10
                        </div>
                        <div className="text-lg text-gray-400 mb-4">Overall Score</div>
                        <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
                            report.recommendation === 'strong_hire' ? 'bg-green-500/20 text-green-400' :
                            report.recommendation === 'hire' ? 'bg-blue-500/20 text-blue-400' :
                            report.recommendation === 'maybe' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                        }`}>
                            {(report.recommendation || 'unknown').replace('_', ' ').toUpperCase()}
                        </div>
                    </div>

                    {/* Two-column: HR + Technical */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* HR Assessment */}
                        <div className="bg-[#1a1a1d] rounded-2xl p-6 border border-gray-800">
                            <div className="flex items-center gap-3 mb-4">
                                <img src={INTERVIEWERS.sarah.avatar} alt="Sarah" className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <div className="font-medium">HR Assessment</div>
                                    <div className="text-xs text-gray-500">Sarah Jenkins</div>
                                </div>
                                <div className="ml-auto text-2xl font-bold" style={{
                                    color: (report.hr_assessment?.score || 0) >= 7 ? '#4ade80' : (report.hr_assessment?.score || 0) >= 5 ? '#facc15' : '#f87171'
                                }}>{report.hr_assessment?.score || 0}/10</div>
                            </div>

                            {report.hr_assessment?.summary && (
                                <p className="text-sm text-gray-400 mb-4 leading-relaxed">{report.hr_assessment.summary}</p>
                            )}

                            {/* Sub-scores */}
                            <div className="space-y-2 mb-4">
                                {[
                                    ['Communication', report.hr_assessment?.communication_score],
                                    ['Motivation', report.hr_assessment?.motivation_score],
                                    ['Cultural Fit', report.hr_assessment?.cultural_fit_score],
                                ].map(([label, score]) => (
                                    <div key={label} className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 w-24">{label}</span>
                                        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all" style={{
                                                width: `${(score || 0) * 10}%`,
                                                backgroundColor: (score || 0) >= 7 ? '#4ade80' : (score || 0) >= 5 ? '#facc15' : '#f87171',
                                            }}></div>
                                        </div>
                                        <span className="text-xs text-gray-400 w-6 text-right">{score || 0}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Strengths */}
                            {report.hr_assessment?.strengths?.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-xs font-medium text-green-400 mb-2">Strengths</div>
                                    {report.hr_assessment.strengths.map((s, i) => (
                                        <div key={i} className="flex items-start gap-2 mb-1.5">
                                            <i className="ph-fill ph-check-circle text-green-500 text-sm mt-0.5"></i>
                                            <span className="text-xs text-gray-300 leading-relaxed">{s}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Weaknesses */}
                            {report.hr_assessment?.weaknesses?.length > 0 && (
                                <div>
                                    <div className="text-xs font-medium text-red-400 mb-2">Areas to Improve</div>
                                    {report.hr_assessment.weaknesses.map((w, i) => (
                                        <div key={i} className="flex items-start gap-2 mb-1.5">
                                            <i className="ph-fill ph-warning-circle text-red-400 text-sm mt-0.5"></i>
                                            <span className="text-xs text-gray-300 leading-relaxed">{w}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Technical Assessment */}
                        <div className="bg-[#1a1a1d] rounded-2xl p-6 border border-gray-800">
                            <div className="flex items-center gap-3 mb-4">
                                <img src={INTERVIEWERS.alex.avatar} alt="Alex" className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <div className="font-medium">Technical Assessment</div>
                                    <div className="text-xs text-gray-500">Alex Chen</div>
                                </div>
                                <div className="ml-auto text-2xl font-bold" style={{
                                    color: (report.technical_assessment?.score || 0) >= 7 ? '#4ade80' : (report.technical_assessment?.score || 0) >= 5 ? '#facc15' : '#f87171'
                                }}>{report.technical_assessment?.score || 0}/10</div>
                            </div>

                            {report.technical_assessment?.summary && (
                                <p className="text-sm text-gray-400 mb-4 leading-relaxed">{report.technical_assessment.summary}</p>
                            )}

                            <div className="space-y-2 mb-4">
                                {[
                                    ['Problem Solving', report.technical_assessment?.problem_solving_score],
                                    ['Depth of Knowledge', report.technical_assessment?.depth_of_knowledge_score],
                                    ['Architecture', report.technical_assessment?.architecture_score],
                                ].map(([label, score]) => (
                                    <div key={label} className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 w-32">{label}</span>
                                        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all" style={{
                                                width: `${(score || 0) * 10}%`,
                                                backgroundColor: (score || 0) >= 7 ? '#4ade80' : (score || 0) >= 5 ? '#facc15' : '#f87171',
                                            }}></div>
                                        </div>
                                        <span className="text-xs text-gray-400 w-6 text-right">{score || 0}</span>
                                    </div>
                                ))}
                            </div>

                            {report.technical_assessment?.strengths?.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-xs font-medium text-green-400 mb-2">Strengths</div>
                                    {report.technical_assessment.strengths.map((s, i) => (
                                        <div key={i} className="flex items-start gap-2 mb-1.5">
                                            <i className="ph-fill ph-check-circle text-green-500 text-sm mt-0.5"></i>
                                            <span className="text-xs text-gray-300 leading-relaxed">{s}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {report.technical_assessment?.weaknesses?.length > 0 && (
                                <div>
                                    <div className="text-xs font-medium text-red-400 mb-2">Areas to Improve</div>
                                    {report.technical_assessment.weaknesses.map((w, i) => (
                                        <div key={i} className="flex items-start gap-2 mb-1.5">
                                            <i className="ph-fill ph-warning-circle text-red-400 text-sm mt-0.5"></i>
                                            <span className="text-xs text-gray-300 leading-relaxed">{w}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detailed Feedback */}
                    {report.detailed_feedback && (
                        <div className="bg-[#1a1a1d] rounded-2xl p-6 mb-6 border border-gray-800">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <i className="ph-fill ph-chat-circle-text text-blue-400"></i>
                                Detailed Feedback
                            </h3>
                            <p className="text-sm text-gray-300 leading-relaxed">{report.detailed_feedback}</p>
                        </div>
                    )}

                    {/* Standout & Improvements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {report.standout_moments?.length > 0 && (
                            <div className="bg-[#1a1a1d] rounded-2xl p-6 border border-gray-800">
                                <h3 className="font-medium mb-3 flex items-center gap-2">
                                    <i className="ph-fill ph-star text-yellow-400"></i>
                                    Standout Moments
                                </h3>
                                <div className="space-y-2">
                                    {report.standout_moments.map((m, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <i className="ph-fill ph-sparkle text-yellow-400 text-sm mt-0.5"></i>
                                            <span className="text-sm text-gray-300">{m}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {report.improvement_areas?.length > 0 && (
                            <div className="bg-[#1a1a1d] rounded-2xl p-6 border border-gray-800">
                                <h3 className="font-medium mb-3 flex items-center gap-2">
                                    <i className="ph-fill ph-target text-orange-400"></i>
                                    Action Items
                                </h3>
                                <div className="space-y-2">
                                    {report.improvement_areas.map((a, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <i className="ph-fill ph-arrow-right text-orange-400 text-sm mt-0.5"></i>
                                            <span className="text-sm text-gray-300">{a}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Back Button */}
                    <div className="text-center pb-10">
                        <button
                            onClick={() => navigate('/user/interview-coach')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all"
                        >
                            <i className="ph-bold ph-arrow-left mr-2"></i>
                            Back to Interview Coach
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // MEET VIEW (Main Interview UI)
    // ═══════════════════════════════════════════════════════════════
    return (
        <>
            <style>{`
                .meet-bg { background-color: #050505; }
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
                
                .self-video { will-change: transform; backface-visibility: hidden; -webkit-backface-visibility: hidden; transform: translateZ(0); }
                .self-video:not(:active):hover { box-shadow: 0 8px 25px rgba(0,0,0,0.5); }
                
                .cam-shimmer { background: linear-gradient(110deg, #2d2d30 8%, #3a3a3d 18%, #2d2d30 33%); background-size: 200% 100%; animation: shimmer 1.5s linear infinite; }
                @keyframes shimmer { to { background-position: -200% 0; } }

                @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .fade-slide-up { animation: fadeSlideUp 0.6s ease-out; }
            `}</style>

            <div className="flex flex-col h-screen w-screen overflow-hidden meet-bg meet-text">
                {/* Top Section: Video Grid + Chat */}
                <div className="flex-1 flex overflow-hidden p-4 gap-4">

                    {/* Video Grid Area */}
                    <div ref={videoGridRef} className="flex-1 flex flex-col h-full justify-center relative w-full overflow-hidden">

                        {/* Main Video Area */}
                        <div className={`h-[80vh] w-full max-w-5xl mx-auto meet-surface rounded-xl overflow-hidden relative shadow-lg group border-2 transition-colors duration-500 ${
                            aiSpeaking ? 'speaking-ring' : 'border-gray-600/30'
                        }`}>

                            {/* ── WAITING STATE ── */}
                            <AnimatePresence mode="wait">
                                {meetPhase === 'waiting' && (
                                    <motion.div
                                        key="waiting"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-10"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-6">
                                            <i className="ph ph-users-three text-3xl text-gray-400"></i>
                                        </div>
                                        <p className="text-xl text-gray-300 mb-2">Waiting for interviewer to join...</p>
                                        <p className="text-4xl font-bold text-white tabular-nums">{waitTimer}</p>
                                        <div className="mt-6 flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <div key={i} className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }}></div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── JOINING ANIMATION ── */}
                                {(meetPhase === 'hr_joining' || meetPhase === 'tech_joining') && (
                                    <motion.div
                                        key={meetPhase}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-10"
                                    >
                                        <motion.img
                                            src={currentInterviewer.avatar}
                                            alt={currentInterviewer.name}
                                            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 mb-4"
                                            initial={{ scale: 0.6, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                                        />
                                        <p className="text-xl font-medium text-white mb-1">{currentInterviewer.name}</p>
                                        <p className="text-sm text-gray-400 mb-4">{currentInterviewer.role}</p>
                                        <div className="flex items-center gap-2 text-blue-400 text-sm">
                                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                                            Joining the meeting...
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── LEAVING ANIMATION ── */}
                                {(meetPhase === 'hr_leaving' || meetPhase === 'tech_leaving') && (
                                    <motion.div
                                        key={meetPhase}
                                        initial={{ opacity: 1 }}
                                        animate={{ opacity: 0.3 }}
                                        transition={{ duration: 2 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-10"
                                    >
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-600 mb-4 opacity-50">
                                            <img src={currentInterviewer.avatar} alt="" className="w-full h-full object-cover grayscale" />
                                        </div>
                                        <p className="text-lg text-gray-400">{currentInterviewer.name} has left the meeting</p>
                                    </motion.div>
                                )}

                                {/* ── GENERATING REPORT ── */}
                                {meetPhase === 'generating' && (
                                    <motion.div
                                        key="generating"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-10"
                                    >
                                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                                        <p className="text-xl text-white mb-2">Generating your interview report...</p>
                                        <p className="text-sm text-gray-400">Analyzing both HR and Technical rounds</p>
                                    </motion.div>
                                )}

                                {/* ── ACTIVE INTERVIEW: Show interviewer ── */}
                                {(meetPhase === 'hr' || meetPhase === 'technical') && (
                                    <motion.div
                                        key={`active-${meetPhase}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.6 }}
                                        className="absolute inset-0"
                                    >
                                        <img
                                            src={currentInterviewer.avatar}
                                            alt={currentInterviewer.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Top Right: Speaking / Typing Indicator */}
                            {aiSpeaking && (meetPhase === 'hr' || meetPhase === 'technical') && (
                                <div className="absolute top-4 right-4 flex gap-2 overlay-icon z-20">
                                    <div className="bg-[#050505]/70 px-2.5 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1 h-8">
                                        <div className="flex items-end gap-[3px] h-4">
                                            <div className="w-[3px] rounded-full wave-bar" style={{ height: '4px', backgroundColor: '#8ab4f8' }}></div>
                                            <div className="w-[3px] rounded-full wave-bar" style={{ height: '8px', backgroundColor: '#8ab4f8' }}></div>
                                            <div className="w-[3px] rounded-full wave-bar" style={{ height: '4px', backgroundColor: '#8ab4f8' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {aiTyping && !aiSpeaking && (meetPhase === 'hr' || meetPhase === 'technical') && (
                                <div className="absolute top-4 right-4 flex gap-2 overlay-icon z-20">
                                    <div className="bg-[#050505]/70 px-3 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2 h-8">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                        <span className="text-xs text-gray-300">Thinking...</span>
                                    </div>
                                </div>
                            )}

                            {/* Top Left: Phase Badge */}
                            {(meetPhase === 'hr' || meetPhase === 'technical') && (
                                <div className="absolute top-4 left-4 z-20">
                                    <div className={`px-3 py-1.5 rounded-lg backdrop-blur-sm text-xs font-medium flex items-center gap-2 ${
                                        meetPhase === 'hr' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                    }`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                                        {meetPhase === 'hr' ? 'HR Round' : 'Technical Round'}
                                    </div>
                                </div>
                            )}

                            {/* Bottom: Name Tag */}
                            {(meetPhase === 'hr' || meetPhase === 'technical') && (
                                <div className="absolute bottom-4 left-4 bg-[#050505]/70 backdrop-blur-sm px-3.5 py-2 rounded-lg flex items-center gap-2.5 overlay-icon z-20">
                                    <i className={`ph-fill ph-microphone text-xs ${aiSpeaking ? 'text-green-400' : 'text-gray-400'}`}></i>
                                    <span className="text-sm font-medium tracking-wide">{currentInterviewer.name}</span>
                                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-medium">{currentInterviewer.role}</span>
                                </div>
                            )}

                            {/* CC Bar — AI speech + user live transcript */}
                            <AnimatePresence>
                                {ccEnabled && (subtitle || (sttActive && liveTranscript)) && (meetPhase === 'hr' || meetPhase === 'technical') && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-16 left-4 right-4 z-20"
                                    >
                                        <div className="bg-black/80 backdrop-blur-md rounded-xl px-5 py-3 max-h-32 overflow-y-auto border border-white/10">
                                            {subtitle && (
                                                <div className="flex items-start gap-2 mb-1">
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 shrink-0 mt-0.5">{currentInterviewer.name.split(' ')[0]}</span>
                                                    <p className="text-sm text-white leading-relaxed">{subtitle}</p>
                                                </div>
                                            )}
                                            {sttActive && liveTranscript && (
                                                <div className="flex items-start gap-2 mt-1">
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-green-400 shrink-0 mt-0.5">You</span>
                                                    <p className="text-sm text-gray-300 leading-relaxed italic">{liveTranscript}</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Self Camera PIP */}
                        <motion.div
                            ref={pipRef}
                            drag
                            dragConstraints={videoGridRef}
                            dragElastic={0.08}
                            dragMomentum={false}
                            dragTransition={{ bounceStiffness: 500, bounceDamping: 35 }}
                            layout
                            style={{ x, y, willChange: 'transform' }}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            whileDrag={{ scale: 1.04, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                            animate={{ width: pipExpanded ? 480 : 288, height: pipExpanded ? 320 : 192 }}
                            transition={{
                                width: { type: 'spring', stiffness: 400, damping: 32, mass: 0.8 },
                                height: { type: 'spring', stiffness: 400, damping: 32, mass: 0.8 },
                                scale: { type: 'spring', stiffness: 500, damping: 30 },
                                boxShadow: { duration: 0.2 },
                            }}
                            className="self-video absolute bottom-8 right-8 rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 cursor-grab active:cursor-grabbing group z-50"
                        >
                            <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover scale-x-[-1] ${(camOn && cameraState === 'ready') ? '' : 'hidden'}`} />
                            <div className={`absolute inset-0 meet-surface flex items-center justify-center ${(!camOn || cameraState === 'error') ? '' : 'hidden'}`}>
                                <div className="text-center">
                                    <div className={`${pipExpanded ? 'w-24 h-24 text-3xl' : 'w-20 h-20 text-2xl'} rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mx-auto font-bold mb-2 transition-all duration-300`}>
                                        {userFirstName[0] || 'U'}
                                    </div>
                                    <span className={`${pipExpanded ? 'text-base' : 'text-sm'} text-gray-300`}>{user.fullName || 'You'}</span>
                                </div>
                            </div>
                            <div className={`absolute inset-0 cam-shimmer flex items-center justify-center ${cameraState === 'loading' ? '' : 'hidden'}`}>
                                <div className="text-center">
                                    <i className="ph ph-video-camera text-3xl text-gray-500 mb-2"></i>
                                    <p className="text-xs text-gray-500">Starting camera...</p>
                                </div>
                            </div>
                            {!micOn && (
                                <div className="absolute top-3 right-3 overlay-icon z-[60]">
                                    <div className="bg-[#050505]/70 p-1.5 rounded-full backdrop-blur-sm video-badge flex items-center justify-center w-7 h-7">
                                        <i className="ph-fill ph-microphone-slash text-[#ea4335] text-xs"></i>
                                    </div>
                                </div>
                            )}
                            <div className="absolute bottom-3 left-3 bg-[#050505]/70 backdrop-blur-sm px-2.5 py-1.5 rounded-md flex items-center gap-2 overlay-icon z-[60]">
                                <span className="text-xs font-medium tracking-wide text-white">{userFirstName} (You)</span>
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                <button onClick={(e) => { e.stopPropagation(); togglePipSize(); }} className="bg-[#050505]/80 hover:bg-[#050505] p-2.5 rounded-full backdrop-blur-sm transition-all" title={pipExpanded ? 'Minimize' : 'Expand'}>
                                    <i className={`ph-bold ${pipExpanded ? 'ph-corners-in' : 'ph-corners-out'} text-white text-sm`}></i>
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Chat Panel */}
                    <AnimatePresence mode="popLayout">
                        {chatOpen && (
                            <motion.div
                                key="chat-panel"
                                initial={{ width: 0, opacity: 0, x: 40 }}
                                animate={{ width: 320, opacity: 1, x: 0 }}
                                exit={{ width: 0, opacity: 0, x: 40 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 32, mass: 0.8 }}
                                className="bg-white rounded-2xl flex flex-col shadow-2xl overflow-hidden shrink-0"
                            >
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center text-gray-800">
                                    <div className="flex items-center gap-2.5">
                                        <i className="ph-fill ph-chat-circle-dots text-gray-600 text-xl"></i>
                                        <h2 className="text-lg font-normal whitespace-nowrap">In-call messages</h2>
                                    </div>
                                    <button onClick={() => setChatOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-all shrink-0">
                                        <i className="ph-bold ph-x text-base"></i>
                                    </button>
                                </div>

                                <div className="px-4 py-2">
                                    <div className="bg-blue-50 text-blue-600 text-xs text-center p-2.5 rounded-xl leading-relaxed flex items-center gap-2 border border-blue-100">
                                        <i className="ph-fill ph-chat-circle text-blue-400 text-sm shrink-0"></i>
                                        <span>Side chat — ask anything, get tips, or just chat casually.</span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-2.5">
                                    {messages.map((msg, idx) => (
                                        <div key={msg._id || idx}>
                                            {msg.type === 'system' ? (
                                                <div className="text-center py-1.5">
                                                    <span className="text-[11px] text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{msg.text}</span>
                                                </div>
                                            ) : msg.isLocal ? (
                                                /* User bubble — right aligned */
                                                <div className="flex justify-end">
                                                    <div className="max-w-[85%]">
                                                        <div className="bg-blue-600 text-white px-3.5 py-2 rounded-2xl rounded-br-md shadow-sm">
                                                            <p className="text-[13px] leading-relaxed">{msg.text}</p>
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 mt-0.5 block text-right pr-1">{msg.time}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* AI bubble — left aligned with avatar */
                                                <div className="flex items-end gap-2">
                                                    <img src={currentInterviewer.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 mb-4" />
                                                    <div className="max-w-[85%]">
                                                        <span className="text-[10px] text-gray-400 ml-1 mb-0.5 block">{msg.sender}</span>
                                                        <div className="bg-gray-100 text-gray-800 px-3.5 py-2 rounded-2xl rounded-bl-md shadow-sm">
                                                            <p className="text-[13px] leading-relaxed">
                                                                {msg.text || (msg.streaming ? '' : '...')}
                                                            </p>
                                                            {msg.streaming && (
                                                                <span className="inline-flex gap-0.5 ml-1">
                                                                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 mt-0.5 block ml-1">{msg.time}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="p-3 bg-white mt-auto border-t border-gray-100">
                                    <div className="bg-gray-50 rounded-2xl flex items-end px-3 py-1 border border-gray-200 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm transition-all">
                                        <textarea
                                            rows="1"
                                            placeholder={['hr', 'technical'].includes(meetPhase) ? `Message ${currentInterviewer.name.split(' ')[0]}...` : 'Waiting for interview to start...'}
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                            className="bg-transparent text-gray-800 w-full outline-none resize-none text-[13px] py-2 px-1.5"
                                            style={{ minHeight: '36px', maxHeight: '80px' }}
                                            disabled={!['hr', 'technical'].includes(meetPhase)}
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!inputText.trim() || aiTyping || !['hr', 'technical'].includes(meetPhase)}
                                            className={`send-btn p-1.5 mb-0.5 shrink-0 rounded-full transition-all ${inputText.trim() && !aiTyping ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-300'}`}
                                        >
                                            <i className="ph-fill ph-paper-plane-right text-lg"></i>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Live Transcript Bar (fallback when CC is off) */}
                <AnimatePresence>
                    {!ccEnabled && sttActive && liveTranscript && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mx-auto mb-2 px-6 py-2.5 bg-[#151516] rounded-2xl max-w-2xl text-center shadow-lg border border-gray-700/30"
                        >
                            <div className="flex items-center gap-3 justify-center">
                                <div className="flex gap-0.5">
                                    <div className="w-1 h-3 bg-red-400 rounded-full animate-pulse"></div>
                                    <div className="w-1 h-4 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></div>
                                    <div className="w-1 h-3 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                                </div>
                                <span className="text-gray-300 text-sm italic">{liveTranscript}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Control Bar */}
                <div className="h-24 px-6 flex items-center justify-between meet-bg pb-2 mt-auto shrink-0 z-10">

                    {/* Left: Meeting Info */}
                    <div className="flex items-center gap-4 w-1/4">
                        <div className="flex items-center gap-2">
                            <i className="ph-fill ph-clock meet-text-muted text-lg"></i>
                            <span className="text-base font-medium tabular-nums text-gray-300">{time}</span>
                        </div>
                        <span className="text-gray-500">|</span>
                        <div className="flex items-center gap-2 max-w-[200px]">
                            <span className="text-sm font-medium text-gray-400 truncate">{phaseLabel}</span>
                        </div>
                    </div>

                    {/* Center: Controls */}
                    <div className="flex items-center justify-center gap-3 w-2/4">
                        <button onClick={toggleMic} className={`ctrl-btn ${
                            !micOn ? 'mic-muted meet-danger hover:meet-danger-hover' :
                            sttActive ? 'bg-green-600 hover:bg-green-700 ring-2 ring-green-400/50' :
                            'meet-surface meet-hover'
                        } text-white p-3 rounded-full transition-colors w-12 h-12 flex items-center justify-center relative`}>
                            <i className={`ph-fill ${micOn ? 'ph-microphone' : 'ph-microphone-slash'} ${sttActive ? 'animate-pulse' : ''}`}></i>
                            <div className="tooltip absolute -top-12 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 whitespace-nowrap shadow-xl z-50">
                                {micOn ? 'Turn off mic' : 'Turn on mic'}
                            </div>
                        </button>

                        <button onClick={toggleCam} className={`ctrl-btn ${!camOn ? 'meet-danger hover:meet-danger-hover' : 'meet-surface meet-hover'} text-white p-3 rounded-full transition-colors w-12 h-12 flex items-center justify-center relative`}>
                            <i className={`ph-fill ${camOn ? 'ph-video-camera' : 'ph-video-camera-slash'}`}></i>
                            <div className="tooltip absolute -top-12 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 whitespace-nowrap shadow-xl z-50">
                                {camOn ? 'Turn off camera' : 'Turn on camera'}
                            </div>
                        </button>

                        <button onClick={() => setCcEnabled(c => !c)} className={`ctrl-btn ${ccEnabled ? 'meet-active-bg meet-active-text' : 'meet-surface meet-hover text-white'} p-3 rounded-full transition-colors w-12 h-12 items-center justify-center relative hidden md:flex`}>
                            <i className="ph-bold ph-closed-captioning"></i>
                            <div className="tooltip absolute -top-12 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 whitespace-nowrap shadow-xl z-50">
                                {ccEnabled ? 'Turn off captions' : 'Turn on captions'}
                            </div>
                        </button>

                        <button onClick={leaveCall} className="leave-btn meet-danger hover:meet-danger-hover text-white px-6 py-3 rounded-full h-12 flex items-center justify-center ml-2 relative">
                            <i className="ph-fill ph-phone-disconnect"></i>
                            <div className="tooltip absolute -top-12 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 whitespace-nowrap shadow-xl z-50">Leave call</div>
                        </button>
                    </div>

                    {/* Right: Secondary Controls */}
                    <div className="flex items-center justify-end gap-1.5 w-1/4">
                        <button className="sec-btn meet-text-muted p-3 rounded-full relative text-gray-400">
                            <i className="ph-bold ph-users-three"></i>
                            <span className="absolute top-0.5 right-0.5 meet-surface text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#050505] text-white z-10" style={{ backgroundColor: '#3c4043' }}>2</span>
                        </button>

                        <button onClick={() => setChatOpen(!chatOpen)} className={`sec-btn ${chatOpen ? 'sec-active meet-active-text text-[#8ab4f8]' : 'meet-text-muted text-gray-400'} p-3 rounded-full relative`}>
                            <i className="ph-fill ph-chat-circle-dots"></i>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Meet;
