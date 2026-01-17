import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';

const UserLayout = ({ children, activeMode }) => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('user')) || { fullName: 'User', email: 'user@example.com' };
    const credits = localStorage.getItem('credits') || '0';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="flex w-full h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-[#EDEDED] font-sans antialiased overflow-hidden transition-colors duration-300">
            <aside 
                className={`h-full bg-gray-50 dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-[#222222] flex flex-col flex-shrink-0 z-20 transition-all duration-300 relative ${isSidebarCollapsed ? 'w-[68px]' : 'w-[260px]'}`}
            >
                <div className={`p-4 flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'}`}>
                    <button 
                        className="p-2 text-gray-500 dark:text-[#888888] hover:text-black dark:hover:text-white transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-[#1a1a1a]" 
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    >
                        <i className={`ph ${isSidebarCollapsed ? 'ph-list' : 'ph-sidebar-simple'} text-xl`}></i>
                    </button>
                    {!isSidebarCollapsed && (
                        <button className="p-2 text-gray-500 dark:text-[#888888] hover:text-black dark:hover:text-white transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-[#1a1a1a]">
                            <i className="ph ph-magnifying-glass text-xl"></i>
                        </button>
                    )}
                </div>

                <div className={`px-2 mb-6 space-y-2 mt-2 ${isSidebarCollapsed ? 'flex flex-col items-center' : 'px-4'}`}>
                    <button 
                        onClick={() => navigate('/user/dashboard')}
                        className={`flex items-center justify-center bg-white dark:bg-[#121111] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-[#222222] text-gray-900 dark:text-white transition-all group shadow-sm ${isSidebarCollapsed ? 'w-10 h-10 rounded-xl p-0' : 'w-full py-2.5 px-4 rounded-lg justify-between'}`}
                        title="New Chat"
                    >
                        {isSidebarCollapsed ? (
                             <i className="ph ph-plus text-lg"></i>
                        ) : (
                            <>
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <i className="ph ph-plus"></i> New Chat
                                </span>
                                <span className="text-[10px] text-gray-400 dark:text-[#888888] border border-gray-200 dark:border-zinc-800 rounded px-1.5 py-0.5">⌥N</span>
                            </>
                        )}
                    </button>

                    <button 
                        onClick={() => navigate('/user/interview-coach')}
                        className={`flex items-center justify-center border hover:border-gray-300 dark:hover:border-zinc-700 hover:text-black dark:hover:text-white transition-all group ${activeMode === 'interview-coach' ? 'bg-gray-100 dark:bg-[#151515] border-gray-300 dark:border-zinc-700 text-black dark:text-white' : 'bg-transparent border-transparent text-gray-500 dark:text-zinc-400'} ${isSidebarCollapsed ? 'w-10 h-10 rounded-xl p-0' : 'w-full py-2.5 px-4 rounded-lg justify-between'}`}
                        title="Interview Coach"
                    >
                        {isSidebarCollapsed ? (
                            <i className="ph ph-microphone-stage text-lg"></i>
                        ) : (
                            <>
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <i className="ph ph-microphone-stage"></i> Interview Coach
                                </span>
                                <i className="ph-bold ph-caret-right text-xs text-gray-400 dark:text-zinc-600 group-hover:text-gray-600 dark:group-hover:text-zinc-400"></i>
                            </>
                        )}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-2 scrollbar-hide">
                    {!isSidebarCollapsed && (
                        <div className="px-2 space-y-1 fade-in">
                            <div className="text-xs font-medium text-gray-400 dark:text-[#888888] mb-3 pl-1">Recent</div>
                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#121212] text-left group transition-colors">
                                <i className="ph ph-chat-teardrop text-gray-400 dark:text-[#888888] group-hover:text-black dark:group-hover:text-white"></i>
                                <span className="text-sm text-gray-500 dark:text-[#888888] group-hover:text-black dark:group-hover:text-white truncate">Google PM Interview</span>
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-gray-400 dark:text-[#888888] hover:text-black dark:hover:text-white text-xs transition-colors">
                                <i className="ph ph-caret-down"></i> Show more
                            </button>
                        </div>
                    )}
                </div>

                {!isSidebarCollapsed && (
                    <div className="px-4 pt-2 pb-2">
                        <div className="bg-gray-100 dark:bg-[#151515] border border-gray-200 dark:border-[#222222] rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Redeem Access</h4>
                            <p className="text-[10px] text-gray-500 dark:text-[#888888] mb-3">Enter your voucher code to add credits.</p>
                            <button className="w-full bg-white dark:bg-white text-black text-xs font-bold py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-200 border border-gray-200 dark:border-transparent transition-colors shadow-sm">
                                Enter Code
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-auto" ref={profileRef}>
                    {!isSidebarCollapsed && (
                        <div className="px-4 py-2 space-y-1 mb-2">
                             <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#121212] text-left text-gray-500 dark:text-[#888888] hover:text-black dark:hover:text-white transition-colors">
                                <i className="ph ph-briefcase"></i> <span className="text-sm">Jobs</span>
                            </button>
                        </div>
                    )}

                    <div className={`p-4 border-t border-gray-200 dark:border-[#222222] relative`}>
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={`w-full flex items-center hover:bg-gray-100 dark:hover:bg-[#121212] p-2 rounded-lg transition-colors ${isSidebarCollapsed ? 'justify-center' : 'justify-between -ml-2'}`}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white uppercase overflow-hidden">
                                     {user.fullName ? user.fullName.substring(0, 2) : <i className="ph ph-user"></i>}
                                </div>
                                {!isSidebarCollapsed && (
                                    <span className="text-xs text-gray-500 dark:text-[#888888] truncate max-w-[120px]">{user.email}</span>
                                )}
                            </div>
                            {!isSidebarCollapsed && (
                                <i className="ph ph-caret-down text-gray-400 dark:text-[#888888] text-xs"></i>
                            )}
                        </button>

                        {isProfileOpen && (
                            <div className="absolute bottom-full left-4 w-[240px] bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] rounded-xl shadow-2xl mb-2 p-1 overflow-hidden z-50 animate-in slide-in-from-bottom-2">
                                <div className="p-3 border-b border-gray-100 dark:border-[#222]">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.fullName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                </div>
                                
                                <div className="p-2 space-y-1">
                                    <div className="px-2 py-1.5 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                                        <span>Plan</span>
                                        <span className="font-bold text-indigo-500">Free</span>
                                    </div>
                                    <div className="px-2 py-1.5 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                                        <span>Credits</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{credits}</span>
                                    </div>
                                </div>
                                
                                <div className="h-px bg-gray-100 dark:bg-[#222] mx-2 my-1"></div>

                                <button 
                                    onClick={toggleTheme}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors"
                                >
                                    <i className={`ph ${theme === 'dark' ? 'ph-sun' : 'ph-moon'} text-lg`}></i>
                                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                                </button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors">
                                    <i className="ph ph-gear text-lg"></i>
                                    <span>Settings</span>
                                </button>
                                
                                <div className="h-px bg-gray-100 dark:bg-[#222] mx-2 my-1"></div>

                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                >
                                    <i className="ph ph-sign-out text-lg"></i>
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col relative w-full h-full bg-white dark:bg-[#050505]">
                <div className="absolute top-6 right-6 z-30 flex items-center gap-3 pointer-events-none">
                     <div className="bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border border-gray-200 dark:border-[#333] px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 transition-colors pointer-events-auto">
                         <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Credits: <span className="font-bold text-gray-900 dark:text-white">{credits}</span></span>
                     </div>
                </div>

                {children}
            </main>
        </div>
    );
};

export default UserLayout;
