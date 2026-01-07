import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import DashboardHome from './components/DashboardHome';
import ChatInterface from './components/ChatInterface';
import ChatInput from './components/ChatInput';

const generateRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'CROM-';
    for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const JobPilotDashboard = () => {
    const [activeMode, setActiveMode] = useState('general');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [chatStarted, setChatStarted] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [roomId] = useState(() => generateRoomId());
    const [selectedCountry, setSelectedCountry] = useState('all'); // Default country
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        let userMsg = inputValue;
        if (activeMode === 'jop1_scrape') {
            userMsg = `Scrape Request:\nKeywords: ${inputValue}\nCountry Code: ${selectedCountry.toUpperCase()}`;
        }

        setChatStarted(true);
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInputValue("");
        setIsLoading(true);

        let aiText = '';
        let isResponseStarted = false;

        if (activeMode === 'jop1_scrape') {
            // Mock response for scraper since backend is building
            setTimeout(() => {
                setIsLoading(false);
                setMessages(prev => [...prev, { role: 'ai', content: "Backend is under building." }]);
            }, 1500);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/llm/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userMsg, roomId: roomId })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                if (!isResponseStarted) {
                    setIsLoading(false);
                    isResponseStarted = true;
                    setMessages(prev => [...prev, { role: 'ai', content: '' }]);
                }

                const text = decoder.decode(value, { stream: true });
                aiText += text;

                setMessages(prev => {
                    const newMessages = [...prev];
                    if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'ai') {
                        newMessages[newMessages.length - 1] = { role: 'ai', content: aiText };
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error fetching AI response:", error);
            setIsLoading(false);

            setMessages(prev => {
                if (isResponseStarted) {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'ai', content: aiText + "\n\n[System Error: Response interrupted]" };
                    return newMessages;
                } else {
                    return [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please check your connection and try again." }];
                }
            });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const creditBalance = 1250;
    const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const fileInputRef = useRef(null);

    const handleModeChange = (mode) => {
        setActiveMode(mode);
        setUploadedFile(null);
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedFile({
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                type: file.type
            });
        }
    };

    const removeFile = (e) => {
        e.stopPropagation();
        setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="flex h-screen w-screen bg-[#FAFAFA] font-sans text-gray-900 overflow-hidden selection:bg-pink-200 selection:text-pink-900">
            <Sidebar />
            <main className="flex-1 flex flex-col relative h-full">
                <div className="flex-1 overflow-y-auto w-full scroll-smooth">
                    <div className="min-h-full flex flex-col items-center p-6 md:p-8 pb-44">
                        {!chatStarted ? (
                            <DashboardHome
                                activeMode={activeMode}
                                handleModeChange={handleModeChange}
                                todayDate={todayDate}
                                creditBalance={creditBalance}
                            />
                        ) : (
                            <>
                                <ChatInterface messages={messages} isLoading={isLoading} />
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>
                </div>
                <ChatInput
                    activeMode={activeMode}
                    handleModeChange={handleModeChange}
                    uploadedFile={uploadedFile}
                    fileInputRef={fileInputRef}
                    handleFileChange={handleFileChange}
                    handleUploadClick={handleUploadClick}
                    removeFile={removeFile}
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    handleKeyDown={handleKeyDown}
                    handleSendMessage={handleSendMessage}
                    selectedCountry={selectedCountry}
                    setSelectedCountry={setSelectedCountry}
                />
            </main>
        </div>
    );
};

export default JobPilotDashboard;
