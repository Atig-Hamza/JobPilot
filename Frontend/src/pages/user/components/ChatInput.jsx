import React from 'react';
import { Sparkles, Globe, FileCheck, Trash2, UploadCloud, Plus, ArrowRight, AlertCircle } from 'lucide-react';
import ModeBadge from './ModeBadge';

const ChatInput = ({
    activeMode,
    handleModeChange,
    uploadedFile,
    fileInputRef,
    handleFileChange,
    handleUploadClick,
    removeFile,
    inputValue,
    setInputValue,
    handleKeyDown,
    handleSendMessage,
    selectedCountry,
    setSelectedCountry,
    isGenerating,
    isMobile
}) => {
    const paddingClass = isMobile ? 'pt-4 pb-4 px-4' : 'pt-16 pb-8 px-6';
    
    const countries = [
        { code: 'all', name: 'Worldwide', flag: '🌐' },
        { code: 'us', name: 'United States', flag: '🇺🇸' },
        { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
        { code: 'ca', name: 'Canada', flag: '🇨🇦' },
        { code: 'de', name: 'Germany', flag: '🇩🇪' },
        { code: 'fr', name: 'France', flag: '🇫🇷' },
        { code: 'au', name: 'Australia', flag: '🇦🇺' },
        { code: 'ma', name: 'Morocco', flag: '🇲🇦' },
        { code: 'es', name: 'Spain', flag: '🇪🇸' },
        { code: 'it', name: 'Italy', flag: '🇮🇹' },
        { code: 'nl', name: 'Netherlands', flag: '🇳🇱' },
        { code: 'br', name: 'Brazil', flag: '🇧🇷' },
        { code: 'in', name: 'India', flag: '🇮🇳' },
        { code: 'jp', name: 'Japan', flag: '🇯🇵' },
        { code: 'cn', name: 'China', flag: '🇨🇳' },
    ];

    return (
        <div className={`${isMobile ? 'fixed' : 'absolute'} bottom-0 left-0 w-full bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 to-transparent dark:from-[#09090b] dark:via-[#09090b]/90 dark:to-transparent ${paddingClass} z-30 pointer-events-none`}>
            <div className={`max-w-3xl mx-auto pointer-events-auto ${isMobile ? 'w-full' : ''}`}>
                <div className={`flex justify-center gap-2 ${isMobile ? 'mb-2' : 'mb-4'}`}>
                    <ModeBadge
                        active={activeMode === 'general'}
                        label="Chat"
                        onClick={() => handleModeChange('general')}
                    />
                    <ModeBadge
                        active={activeMode === 'resume_opt'}
                        label="CV Optimization"
                        icon={<Sparkles size={10} />}
                        onClick={() => handleModeChange('resume_opt')}
                    />
                    <ModeBadge
                        active={activeMode === 'jop1_scrape'}
                        label="JOP-1 Search"
                        icon={<Globe size={10} />}
                        onClick={() => handleModeChange('jop1_scrape')}
                    />
                </div>
                <div className={`bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] rounded-[1.5rem] transition-all duration-300 relative overflow-hidden border ${activeMode === 'resume_opt' ? 'border-pink-200 ring-4 ring-pink-50/50 dark:border-pink-900/50 dark:ring-pink-900/10' : 'border-gray-200 dark:border-gray-800 ring-4 ring-white/50 dark:ring-black/50'}`}>
                    {activeMode === 'resume_opt' ? (
                        <div className={`p-2.5 flex items-center gap-3 ${isMobile ? 'h-[56px]' : 'h-[76px]'}`}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                            />
                            <div
                                onClick={!uploadedFile ? handleUploadClick : undefined}
                                className={`flex-1 h-full rounded-2xl flex items-center px-4 gap-4 transition-all duration-200 ${uploadedFile
                                    ? 'bg-green-50 border border-green-200 cursor-default dark:bg-green-900/10 dark:border-green-800'
                                    : 'bg-gray-50 border border-dashed border-gray-300 hover:border-pink-300 hover:bg-pink-50/50 cursor-pointer group dark:bg-gray-900/30 dark:border-gray-700 dark:hover:border-pink-700 dark:hover:bg-pink-900/10'
                                    }`}
                            >
                                {uploadedFile ? (
                                    <>
                                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                                            <FileCheck size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{uploadedFile.name}</h4>
                                            <p className="text-[10px] font-medium text-gray-500 uppercase">{uploadedFile.size}</p>
                                        </div>
                                        <button
                                            onClick={removeFile}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-200/50 text-green-700 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#111111] flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-pink-500 shadow-sm transition-colors">
                                            <UploadCloud size={20} />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Click to upload CV</span>
                                            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">PDF, DOCX up to 10MB</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <button
                                disabled={!uploadedFile}
                                className={`h-full px-6 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm shrink-0 ${uploadedFile
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                    }`}
                            >
                                <Sparkles size={16} className={uploadedFile ? "animate-pulse" : ""} />
                                <span>Enhance</span>
                            </button>
                        </div>
                    ) : (
                        <div className={`flex items-center gap-2 p-2.5 ${isMobile ? 'h-[56px]' : 'h-[76px]'}`}>
                            {activeMode === 'jop1_scrape' && (
                                <div className="h-full pl-2 transition-all animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="relative h-full">
                                        <select
                                            value={selectedCountry}
                                            onChange={(e) => setSelectedCountry(e.target.value)}
                                            className="h-full appearance-none bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-bold rounded-2xl pl-4 pr-8 hover:bg-white dark:hover:bg-[#202023] hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 cursor-pointer transition-all"
                                        >
                                            {countries.map(country => (
                                                <option key={country.code} value={country.code}>
                                                    {country.flag} {country.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 1L5 5L9 1" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeMode !== 'jop1_scrape' && (
                                <button className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0">
                                    <Plus size={24} />
                                </button>
                            )}

                            <input
                                type="text"
                                autoFocus
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isGenerating}
                                placeholder={activeMode === 'jop1_scrape' ? "Paste job keyword here..." : "Ask JobPilot to find leads..."}
                                className={`flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 h-full ${isMobile ? 'text-base' : 'text-lg'} font-medium px-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isGenerating || (!inputValue.trim() && activeMode !== 'resume_opt')}
                                className={`${isMobile ? 'h-9 w-9' : 'h-12'} flex items-center justify-center font-bold text-sm transition-all shadow-sm group shrink-0 ${
                                    isMobile 
                                        ? 'rounded-full' 
                                        : 'px-6 rounded-2xl gap-2 min-w-[100px]'
                                } ${isGenerating || !inputValue.trim()
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                        : activeMode === 'jop1_scrape'
                                            ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                                            : 'bg-[#ffb6e6] hover:bg-pink-300 text-gray-900'
                                    }`}>
                                {isGenerating ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {!isMobile && <span>{activeMode === 'jop1_scrape' ? 'Scrape' : 'Send'}</span>}
                                        <ArrowRight size={18} className={!isMobile ? "group-hover:translate-x-1 transition-transform" : ""} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
                <div className="text-center mt-3">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 flex items-center justify-center gap-1.5">
                        <AlertCircle size={10} />
                        AI can make mistakes. Verify important info.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
