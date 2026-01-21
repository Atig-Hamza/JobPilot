import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../../context/ThemeContext';
import { Lock, Trash, AlertTriangle, Eye, EyeOff, Shield, ChevronLeft } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('general');
    const [user, setUser] = useState({});
    const [profile, setProfile] = useState({ contactEmail: '', phoneNumber: '', bio: '', skills: [], socialLinks: [] });
    const [isSaving, setIsSaving] = useState(false);

    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);

    const [devices, setDevices] = useState([]);
    const [isLoadingDevices, setIsLoadingDevices] = useState(false);

    const [securityView, setSecurityView] = useState('menu');
    const [setupStep, setSetupStep] = useState(1);
    const [qrData, setQrData] = useState(null);
    const [verifyCode, setVerifyCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [isVerifying2FA, setIsVerifying2FA] = useState(false);

    useEffect(() => {
        if (activeTab === 'security') {
            fetchDevices();
        }
    }, [activeTab]);

    const fetchDevices = async () => {
        setIsLoadingDevices(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${API_URL}/users/devices`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setDevices(data.data.devices);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingDevices(false);
        }
    };

    const handleRemoveDevice = async (deviceId) => {
        const toastId = toast.loading("Removing device...");
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${API_URL}/users/devices/${deviceId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Device removed", { id: toastId });
                fetchDevices();
            } else {
                toast.error("Failed to remove device", { id: toastId });
            }
        } catch (e) {
            toast.error("An error occurred", { id: toastId });
        }
    };

    const handleInit2FA = async () => {
        const toastId = toast.loading("Initializing 2FA...");
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${API_URL}/users/2fa/setup`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setQrData(data.data);
                setSetupStep(1);
                setSecurityView('2fa_setup');
                toast.dismiss(toastId);
            } else {
                toast.error(data.message || "Failed to init 2FA", { id: toastId });
            }
        } catch (e) {
            toast.error("Error initializing 2FA", { id: toastId });
        }
    };

    const handleVerify2FA = async () => {
        if (!verifyCode || verifyCode.length !== 6) {
            toast.error("Please enter a valid 6-digit code");
            return;
        }
        setIsVerifying2FA(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${API_URL}/users/2fa/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ token: verifyCode })
            });
            const data = await res.json();
            if (res.ok) {
                setRecoveryCodes(data.data.recoveryCodes);
                setSetupStep(3);
                // Update local user state
                const updatedUser = { ...user, isTwoFactorEnabled: true };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser)); // Basic persist
                toast.success("2FA Enabled!");
            } else {
                toast.error(data.message || "Invalid code");
            }
        } catch (e) {
            toast.error("Verification failed");
        } finally {
            setIsVerifying2FA(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!confirm("Are you sure you want to disable 2FA? This will reduce your account security.")) return;

        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${API_URL}/users/2fa/disable`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const updatedUser = { ...user, isTwoFactorEnabled: false };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                toast.success("2FA Disabled");
            } else {
                toast.error("Failed to disable 2FA");
            }
        } catch (e) {
            toast.error("Error disabling 2FA");
        }
    };

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user')) || {};
        setUser(storedUser);
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
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
            const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
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

    const handleUpdatePassword = async () => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            toast.error("Please fill in all fields");
            return;
        }
        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match");
            return;
        }
        setIsUpdatingPassword(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${API_URL}/users/update-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Password updated successfully");
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                toast.error(data.message || "Failed to update password");
            }
        } catch (e) {
            console.error(e);
            toast.error("An error occurred");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        const toastId = toast.loading("Deleting account...");
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${API_URL}/users/delete-account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                toast.success("Account deleted successfully", { id: toastId });
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to delete account", { id: toastId });
            }
        } catch (e) {
            console.error(e);
            toast.error("An error occurred", { id: toastId });
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'general', label: 'General', icon: 'ph-gear' },
        { id: 'account', label: 'Account', icon: 'ph-user' },
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
                                    العربية
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
                            <div className="h-px bg-gray-200 dark:bg-[#222] w-full my-4"></div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Social Links</label>
                                    <button
                                        onClick={() => setProfile({ ...profile, socialLinks: [...(profile.socialLinks || []), { platform: '', url: '' }] })}
                                        className="text-xs flex items-center gap-1 hover:underline text-blue-600 dark:text-blue-400"
                                    >
                                        <i className="ph ph-plus"></i> Add Link
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {profile.socialLinks && profile.socialLinks.map((link, idx) => (
                                        <div key={idx} className="flex gap-2 items-center group">
                                            <input
                                                placeholder="Platform"
                                                value={link.platform}
                                                onChange={(e) => {
                                                    const newLinks = [...profile.socialLinks];
                                                    newLinks[idx].platform = e.target.value;
                                                    setProfile({ ...profile, socialLinks: newLinks });
                                                }}
                                                className="w-1/3 p-2.5 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] text-sm focus:border-black dark:focus:border-white outline-none"
                                            />
                                            <input
                                                placeholder="URL"
                                                value={link.url}
                                                onChange={(e) => {
                                                    const newLinks = [...profile.socialLinks];
                                                    newLinks[idx].url = e.target.value;
                                                    setProfile({ ...profile, socialLinks: newLinks });
                                                }}
                                                className="flex-1 p-2.5 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] text-sm focus:border-black dark:focus:border-white outline-none"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newLinks = profile.socialLinks.filter((_, i) => i !== idx);
                                                    setProfile({ ...profile, socialLinks: newLinks });
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <i className="ph ph-trash"></i>
                                            </button>
                                        </div>
                                    ))}
                                    {(!profile.socialLinks || profile.socialLinks.length === 0) && (
                                        <p className="text-xs text-gray-500 italic">No social links added.</p>
                                    )}
                                </div>
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
            case 'security':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {securityView === 'menu' ? (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Account Security</h2>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your access and security activity.</p>
                                </div>

                                {/* Security Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#161616] border border-gray-100 dark:border-[#222]">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Last Login</div>
                                        <div className="text-sm font-medium dark:text-gray-200">
                                            {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#161616] border border-gray-100 dark:border-[#222]">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Last Password Change</div>
                                        <div className="text-sm font-medium dark:text-gray-200">
                                            {user.lastPasswordChange ? new Date(user.lastPasswordChange).toLocaleString() : 'Never'}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#161616] border border-gray-100 dark:border-[#222]">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Last Reset</div>
                                        <div className="text-sm font-medium dark:text-gray-200">
                                            {user.lastPasswordReset ? new Date(user.lastPasswordReset).toLocaleString() : 'None'}
                                        </div>
                                    </div>
                                    <div className="col-span-2 md:col-span-3 p-4 rounded-xl bg-gray-50 dark:bg-[#161616] border border-gray-100 dark:border-[#222] flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Last Activity</div>
                                            <div className="text-sm font-medium dark:text-gray-200">
                                                {user.lastActivity ? new Date(user.lastActivity).toLocaleString() : 'Just now'}
                                            </div>
                                        </div>
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                    </div>
                                </div>

                                <section className="space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#222]">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Sessions</h3>
                                        <button
                                            onClick={fetchDevices}
                                            disabled={isLoadingDevices}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                                        >
                                            <i className={`ph-bold ph-arrows-clockwise ${isLoadingDevices ? 'animate-spin' : ''}`}></i> Refresh
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {isLoadingDevices ? (
                                            <div className="py-8 text-center text-gray-500">Loading devices...</div>
                                        ) : devices && devices.length > 0 ? (
                                            devices.map((device) => (
                                                <div key={device._id} className="group p-4 rounded-xl border border-gray-200 dark:border-[#333] hover:border-blue-500/30 dark:hover:border-blue-500/30 bg-white dark:bg-[#111] transition-all flex items-start justify-between">
                                                    <div className="flex gap-4">
                                                        <div className="mt-1 p-2 bg-gray-100 dark:bg-[#222] rounded-lg h-fit text-gray-600 dark:text-gray-300">
                                                            <i className="ph-fill ph-desktop text-xl"></i>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-white text-base">
                                                                {device.deviceInfo || 'Unknown Device'}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                                <i className="ph ph-map-pin"></i>
                                                                <span>{device.location}</span>
                                                                <span className="text-gray-300 dark:text-gray-700">•</span>
                                                                <span>{new Date(device.timestamp).toLocaleString()}</span>
                                                            </div>
                                                            {localStorage.getItem('token') === device.accessToken && (
                                                                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                                    Current Session
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveDevice(device._id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                                        title="Revoke Session"
                                                    >
                                                        <i className="ph-bold ph-sign-out text-xl"></i>
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-[#333] rounded-xl">
                                                No active sessions found.
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="pt-6 border-t border-gray-100 dark:border-[#222] space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Login & Security</h3>

                                    <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#333] overflow-hidden divide-y divide-gray-100 dark:divide-[#222]">
                                        {/* Password Row */}
                                        <div className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-gray-100 dark:bg-[#222] rounded-lg">
                                                        <Lock size={20} className="text-gray-900 dark:text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Password</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">••••••••</p>
                                                    </div>
                                                </div>
                                                {!isEditingPassword && (
                                                    <button
                                                        onClick={() => setIsEditingPassword(true)}
                                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-[#333] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-all"
                                                    >
                                                        Change
                                                    </button>
                                                )}
                                            </div>

                                            {/* Expandable Password Form */}
                                            {isEditingPassword && (
                                                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="max-w-md space-y-4">
                                                        <div className="relative">
                                                            <input
                                                                type={showPassword.current ? "text" : "password"}
                                                                value={passwords.current}
                                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                                className="w-full pl-4 pr-12 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg outline-none focus:border-black dark:focus:border-white transition-all text-sm"
                                                                placeholder="Current Password"
                                                            />
                                                            <button
                                                                onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                            >
                                                                {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="relative">
                                                                <input
                                                                    type={showPassword.new ? "text" : "password"}
                                                                    value={passwords.new}
                                                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                                    className="w-full pl-4 pr-12 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg outline-none focus:border-black dark:focus:border-white transition-all text-sm"
                                                                    placeholder="New Password"
                                                                />
                                                                <button
                                                                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                                >
                                                                    {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                </button>
                                                            </div>
                                                            <div className="relative">
                                                                <input
                                                                    type={showPassword.confirm ? "text" : "password"}
                                                                    value={passwords.confirm}
                                                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                                    className="w-full pl-4 pr-12 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg outline-none focus:border-black dark:focus:border-white transition-all text-sm"
                                                                    placeholder="Confirm Password"
                                                                />
                                                                <button
                                                                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                                >
                                                                    {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={handleUpdatePassword}
                                                            disabled={isUpdatingPassword}
                                                            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
                                                        >
                                                            {isUpdatingPassword ? 'Saving...' : 'Save Password'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setIsEditingPassword(false);
                                                                setPasswords({ current: '', new: '', confirm: '' });
                                                            }}
                                                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#222] rounded-lg text-sm font-medium transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 2FA Row */}
                                        <div className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#161616] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-gray-100 dark:bg-[#222] rounded-lg">
                                                    <Shield size={20} className="text-gray-900 dark:text-white" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                                                        {user.isTwoFactorEnabled ? (
                                                            <span className="px-2 py-0.5 rounded text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold uppercase tracking-wider">On</span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-bold uppercase tracking-wider">Off</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account.</p>
                                                </div>
                                            </div>
                                            {user.isTwoFactorEnabled ? (
                                                <button
                                                    onClick={handleDisable2FA}
                                                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                                                >
                                                    Disable
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleInit2FA}
                                                    className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-all"
                                                >
                                                    Setup
                                                </button>
                                            )}
                                        </div>

                                        {/* Login Notifications Row */}
                                        <div className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#161616] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-gray-100 dark:bg-[#222] rounded-lg">
                                                    <i className="ph-bold ph-bell-ringing text-xl text-gray-900 dark:text-white"></i>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Login Notifications</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Get notified of new sign-ins.</p>
                                                </div>
                                            </div>
                                            <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-green-500 transition-colors duration-200 ease-in-out">
                                                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                <section className="bg-red-50/50 dark:bg-red-950/10 rounded-2xl border border-red-100 dark:border-red-900/30 overflow-hidden">
                                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-1">
                                            <h3 className="text-base font-semibold text-red-900 dark:text-red-400 flex items-center gap-2">
                                                <AlertTriangle size={18} />
                                                Delete Account
                                            </h3>
                                            <p className="text-sm text-red-700 dark:text-red-300 max-w-lg">
                                                Permanently remove your account and all of its contents from the platform. This action is not reversible.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            disabled={isDeleting}
                                            className="px-5 py-2.5 bg-white dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/40 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                                        >
                                            Delete Personal Account
                                        </button>
                                    </div>
                                </section>

                                {showDeleteConfirm && (
                                    <div className="absolute align-middle inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                                        <div className="bg-white mt-80 dark:bg-[#09090b] w-full max-w-md rounded-2xl border border-gray-200 dark:border-[#27272a] shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                                            <div className="flex flex-col items-center text-center space-y-2">
                                                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full mb-2">
                                                    <AlertTriangle size={32} className="text-red-600 dark:text-red-500" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Account?</h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                                </p>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-[#27272a] text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    disabled={isDeleting}
                                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                                >
                                                    {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </>
                        ) : (
                            /* Inline 2FA Setup Flow */
                            <div className="border border-gray-200 dark:border-[#222] rounded-2xl p-8 bg-gray-50/50 dark:bg-[#161616] animate-in slide-in-from-right-4 duration-300">
                                <button
                                    onClick={() => setSecurityView('menu')}
                                    className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
                                >
                                    <ChevronLeft size={16} /> Back to Security
                                </button>

                                <div className="max-w-md mx-auto">
                                    {setupStep === 1 && (
                                        <div className="space-y-8 text-center">
                                            <div className="space-y-2">
                                                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                                                    <Shield size={24} className="text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Setup Authenticator</h3>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc).
                                                </p>
                                            </div>

                                            {qrData && (
                                                <div className="flex justify-center p-4 bg-white rounded-2xl border border-gray-200 shadow-sm mx-auto w-fit">
                                                    <img src={qrData.qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 mix-blend-multiply" />
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification Code</label>
                                                    <input
                                                        type="text"
                                                        maxLength="6"
                                                        value={verifyCode}
                                                        onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
                                                        className="w-full text-center tracking-[0.5em] text-3xl font-mono py-4 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-[#333] rounded-xl outline-none focus:border-black dark:focus:border-white transition-all shadow-sm"
                                                        placeholder="000000"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleVerify2FA}
                                                    disabled={isVerifying2FA || verifyCode.length !== 6}
                                                    className="w-full px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                                                >
                                                    {isVerifying2FA ? 'Verifying...' : 'Verify & Activate'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {setupStep === 3 && (
                                        <div className="space-y-8 text-center animate-in zoom-in-95 duration-300">
                                            <div className="space-y-2">
                                                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                                    <Shield size={24} className="text-green-600 dark:text-green-400" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">2FA Activated!</h3>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    Save these recovery codes securely. You can use them to log in if you lose access to your device.
                                                </p>
                                            </div>

                                            <div className="bg-white dark:bg-[#09090b] p-6 rounded-2xl border border-gray-200 dark:border-[#333] grid grid-cols-2 gap-3 text-center font-mono text-sm shadow-sm">
                                                {recoveryCodes.map((code, i) => (
                                                    <div key={i} className="p-2 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-gray-100 dark:border-[#222] text-gray-600 dark:text-gray-300 select-all hover:bg-gray-100 dark:hover:bg-[#222] transition-colors cursor-text">
                                                        {code}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl text-xs text-amber-800 dark:text-amber-200 border border-amber-100 dark:border-amber-900/30 text-left">
                                                <AlertTriangle size={20} className="shrink-0" />
                                                <span>These codes are only displayed once. Please copy or download them now before continuing.</span>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSecurityView('menu');
                                                    setSetupStep(1);
                                                    setVerifyCode('');
                                                }}
                                                className="w-full px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            >
                                                I have saved these codes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
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
