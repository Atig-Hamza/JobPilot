import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';

const SettingsModal = ({ isOpen, onClose }) => {
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('general');
    const [user, setUser] = useState({});
    const [profile, setProfile] = useState({ contactEmail: '', phoneNumber: '', bio: '', skills: [] });
    const [isSaving, setIsSaving] = useState(false);

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
                    setProfile(data.data.profile || {});
                }
            } catch (e) {
                console.error("Failed to fetch profile in settings", e);
            }
        };
        fetchProfile();
    }, []);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_BACKEND_API_URL;
            await fetch(`${API_URL}/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profile)
            });
        } catch (e) {
            console.error("Failed to save profile", e);
        } finally {
            setIsSaving(false);
        }
    };

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
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <section>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-zinc-200 mb-3">Appearance</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => theme !== 'light' && toggleTheme()}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'border-primary bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'}`}
                                >
                                    <div className="w-full h-24 bg-gray-100 rounded-lg border border-gray-200 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                                        <div className="absolute top-2 left-2 w-16 h-8 bg-white rounded shadow-sm"></div>
                                        <div className="absolute top-12 left-2 w-24 h-2 bg-gray-200 rounded"></div>
                                        <div className="absolute top-16 left-2 w-20 h-2 bg-gray-200 rounded"></div>
                                        {theme === 'light' && <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"><i className="ph-bold ph-check text-white text-[10px]"></i></div>}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Light</span>
                                </button>
                                <button
                                    onClick={() => theme !== 'dark' && toggleTheme()}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'border-primary bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'}`}
                                >
                                    <div className="w-full h-24 bg-[#1a1a1a] rounded-lg border border-zinc-800 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                                        <div className="absolute top-2 left-2 w-16 h-8 bg-[#2a2a2a] rounded shadow-sm"></div>
                                        <div className="absolute top-12 left-2 w-24 h-2 bg-[#333] rounded"></div>
                                        <div className="absolute top-16 left-2 w-20 h-2 bg-[#333] rounded"></div>
                                        {theme === 'dark' && <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"><i className="ph-bold ph-check text-white text-[10px]"></i></div>}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark</span>
                                </button>
                            </div>
                        </section>

                        <div className="h-px bg-gray-200 dark:bg-[#222] w-full"></div>

                        <section>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-zinc-200 mb-3">Language</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <button className="p-2 rounded-lg border border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center justify-center gap-2">
                                    <span>English (US)</span>
                                    <i className="ph-bold ph-check"></i>
                                </button>
                                <button className="p-2 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 text-sm hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                                    Français
                                </button>
                                <button className="p-2 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 text-sm hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                                    Español
                                </button>
                            </div>
                        </section>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-zinc-500 mb-1 uppercase tracking-wider">Contact Email</label>
                                    <input
                                        type="email"
                                        value={profile.contactEmail || ''}
                                        onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                                        className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] text-sm focus:border-black dark:focus:border-white outline-none transition-colors"
                                        placeholder="Add email..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-zinc-500 mb-1 uppercase tracking-wider">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={profile.phoneNumber || ''}
                                        onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                                        className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] text-sm focus:border-black dark:focus:border-white outline-none transition-colors"
                                        placeholder="Add phone..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-500 mb-1 uppercase tracking-wider">Bio</label>
                                <textarea
                                    value={profile.bio || ''}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] text-sm min-h-[100px] focus:border-black dark:focus:border-white outline-none transition-colors"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-500 mb-1 uppercase tracking-wider">Top Skills</label>
                                <div className="flex flex-wrap gap-2 mt-2">
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="w-full max-w-[850px] h-[600px] bg-white dark:bg-[#09090b] border border-gray-200 dark:border-[#27272a] rounded-2xl flex shadow-2xl overflow-hidden relative font-sans animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
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
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
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
