import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';

const SettingsModal = ({ isOpen, onClose }) => {
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('general');
    const [user, setUser] = useState({});
    const [profile, setProfile] = useState({});

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user')) || {};
        setUser(storedUser);
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const API_URL = import.meta.env.VITE_BACKEND_API_URL;
                const res = await fetch(`${API_URL}/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.data.profile);
                }
            } catch (e) {
                console.error("Failed to fetch profile in settings", e);
            }
        };
        fetchProfile();
    }, []);

    if (!isOpen) return null;

    const tabs = [
        { id: 'general', label: 'General', icon: 'ph-gear' },
        { id: 'account', label: 'Account', icon: 'ph-user-circle' },
        { id: 'notifications', label: 'Notifications', icon: 'ph-bell' },
        { id: 'personalization', label: 'Personalization', icon: 'ph-paint-brush' },
        { id: 'data', label: 'Data Controls', icon: 'ph-database' },
        { id: 'security', label: 'Security', icon: 'ph-shield-check' },
        { id: 'billing', label: 'Billing', icon: 'ph-credit-card' },
        { id: 'integrations', label: 'Integrations', icon: 'ph-plug' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-3 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between group cursor-pointer" onClick={toggleTheme}>
                            <span className="text-sm font-medium text-gray-900 dark:text-zinc-200">Appearance</span>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-zinc-200 transition-colors">
                                {theme === 'dark' ? 'Dark' : 'Light'}
                                <i className="ph ph-caret-down text-gray-400 dark:text-zinc-500"></i>
                            </div>
                        </div>
                        <div className="h-px bg-gray-200 dark:bg-[#222] w-full"></div>
                        <div className="flex items-center justify-between group cursor-pointer">
                            <span className="text-sm font-medium text-gray-900 dark:text-zinc-200">Language</span>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-zinc-200 transition-colors">
                                English (US)
                                <i className="ph ph-caret-down text-gray-400 dark:text-zinc-500"></i>
                            </div>
                        </div>
                        <div className="h-px bg-gray-200 dark:bg-[#222] w-full"></div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-zinc-200">Main Color</span>
                            <div className="flex items-center gap-2">
                                <div className='h-2 w-2 rounded-full bg-gray-700'></div>
                                <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                                    Gray
                                    <i className="ph ph-caret-down text-gray-400 dark:text-zinc-500"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'account':
                return (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-[#222] flex items-center justify-center text-2xl font-bold">
                                {user.fullName ? user.fullName[0] : 'U'}
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user.fullName}</h3>
                                <p className="text-sm text-gray-500 dark:text-zinc-500">{user.email}</p>
                            </div>
                        </div>

                        <div className="h-px bg-gray-200 dark:bg-[#222] w-full"></div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-500 mb-1 uppercase tracking-wider">Bio</label>
                                <p className="text-sm text-gray-800 dark:text-zinc-300 bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-gray-200 dark:border-[#333]">
                                    {profile.bio || "No bio set."}
                                </p>
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-500 mb-1 uppercase tracking-wider">Top Skills</label>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills && profile.skills.length > 0 ? (
                                        profile.skills.map((skill, i) => (
                                            <span key={i} className="px-2 py-1 rounded bg-gray-100 dark:bg-[#1a1a1a] text-xs text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-[#333]">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">No skills listed</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-zinc-600">
                        <i className="ph ph-wrench text-4xl mb-2"></i>
                        <p>This section is under development.</p>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-[850px] h-[600px] bg-white dark:bg-[#09090b] border border-gray-200 dark:border-[#27272a] rounded-2xl flex shadow-2xl overflow-hidden relative font-sans">
                <div className="w-[240px] bg-gray-50 dark:bg-[#0c0c0e] border-r border-gray-200 dark:border-[#27272a] flex flex-col p-2 pt-14 relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 left-4 p-1.5 rounded-md text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-[#1a1a1a] transition-colors"
                        title="Close Settings"
                    >
                        <i className="ph ph-x text-lg"></i>
                    </button>

                    <div className="space-y-1 mt-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-gray-200 dark:bg-[#27272a] text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-[#1a1a1a]'
                                }`}
                            >
                                <i className={`ph ${tab.icon} text-lg`}></i>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#09090b]">
                    <div className="p-8 max-w-2xl mx-auto">
                        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8 capitalize">{activeTab}</h2>
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
