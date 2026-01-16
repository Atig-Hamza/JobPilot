import { useState, useEffect } from 'react';
import { Ticket, Copy, RefreshCw, Layers, Sparkles, PenTool, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const AccessManagement = () => {
    const [activeTab, setActiveTab] = useState('invite');
    const [creationMode, setCreationMode] = useState('auto');
    const [inviteCount, setInviteCount] = useState(10);
    const [creditAmount, setCreditAmount] = useState('500');
    const [generatedCode, setGeneratedCode] = useState('');
    const [manualCodeInput, setManualCodeInput] = useState('');
    const [inviteCodes, setInviteCodes] = useState([]);
    const [loading, setLoading] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_API_URL;
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    const fetchInviteCodes = async () => {
        try {
            const response = await axios.get(`${backendUrl}/codes/invite-codes`, config);
            setInviteCodes(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch invite codes');
        }
    };

    useEffect(() => {
        if (activeTab === 'invite') {
            fetchInviteCodes();
        }
    }, [activeTab]);

    const handleCreateInviteCode = async () => {
        let finalCode = '';
        if (creationMode === 'manual') {
            if (!manualCodeInput.trim()) {
                toast.error('Please enter a code');
                return;
            }
            finalCode = manualCodeInput.toUpperCase();
            if (!finalCode.startsWith('JP-')) {
                finalCode = `JP-${finalCode}`;
            }
        } else {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const section1 = Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
            const section2 = Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
            finalCode = `JP-${section1}-${section2}`;
        }

        try {
            setLoading(true);
            // Defaulting expiresAt to 30 days from now
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            await axios.post(`${backendUrl}/codes/create-invite`, {
                code: finalCode,
                availableFor: inviteCount,
                expiresAt: expiresAt
            }, config);

            setGeneratedCode(finalCode);
            toast.success(`Created Invite Code: ${finalCode}`);
            fetchInviteCodes();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create invite code');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteInviteCode = async (id) => {
        try {
            await axios.delete(`${backendUrl}/codes/invite-codes/${id}`, config);
            toast.success('Invite code deleted');
            fetchInviteCodes();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete invite code');
        }
    };

    const generateCreditCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const section1 = Array(14).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
        const code = `JP-${section1}`;
        setGeneratedCode(code);
        toast.success(`Generated Credit Code for ${creditAmount} credits!`);
    };

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Access & Credits</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Generate access keys and distribute credit bundles.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-[#09090b] rounded-3xl border border-gray-100 dark:border-[#27272a] p-8 shadow-sm">
                    <div className="flex p-1.5 bg-gray-50 dark:bg-[#18181b] rounded-2xl mb-8 border border-gray-100 dark:border-[#27272a]">
                        <button
                            onClick={() => { setActiveTab('invite'); setGeneratedCode(''); }}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'invite' ? 'bg-white dark:bg-[#27272a] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                        >
                            Invite Access
                        </button>
                        <button
                            onClick={() => { setActiveTab('credits'); setGeneratedCode(''); }}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'credits' ? 'bg-white dark:bg-[#27272a] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                        >
                            Credit Bundles
                        </button>
                    </div>

                    {activeTab === 'invite' && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                                        <Ticket size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Invite Code</h3>
                                        <p className="text-sm text-gray-500">Create a code for new users.</p>
                                    </div>
                                </div>
                                <div className="flex items-center bg-gray-100 dark:bg-[#18181b] rounded-lg p-1">
                                    <button
                                        onClick={() => setCreationMode('auto')}
                                        className={`p-2 rounded-md transition-all ${creationMode === 'auto' ? 'bg-white dark:bg-[#27272a] shadow-sm text-purple-600' : 'text-gray-400'}`}
                                        title="Auto Generate"
                                    >
                                        <Sparkles size={16} />
                                    </button>
                                    <button
                                        onClick={() => setCreationMode('manual')}
                                        className={`p-2 rounded-md transition-all ${creationMode === 'manual' ? 'bg-white dark:bg-[#27272a] shadow-sm text-purple-600' : 'text-gray-400'}`}
                                        title="Manual Input"
                                    >
                                        <PenTool size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {creationMode === 'manual' ? (
                                    <div className="animate-fadeIn">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                                            Custom Code
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">JP-</span>
                                            <input
                                                type="text"
                                                value={manualCodeInput}
                                                onChange={(e) => setManualCodeInput(e.target.value.toUpperCase().replace('JP-', ''))}
                                                placeholder="VIP-2024"
                                                className="w-full pl-12 pr-5 py-4 rounded-xl border border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#18181b] text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all uppercase tracking-wider"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Prefix 'JP-' will be added automatically.</p>
                                    </div>
                                ) : (
                                    <div className="animate-fadeIn">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                                            Random Pattern
                                        </label>
                                        <div className="w-full px-5 py-4 rounded-xl border border-dashed border-gray-300 dark:border-[#27272a] bg-gray-50/50 dark:bg-[#18181b]/50 text-gray-400 font-mono text-center">
                                            JP-XXXX-XXXX
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                                        Max Users Usage
                                    </label>
                                    <input
                                        type="number"
                                        value={inviteCount}
                                        onChange={(e) => setInviteCount(e.target.value)}
                                        className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#18181b] text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleCreateInviteCode}
                                disabled={loading}
                                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creationMode === 'manual' ? <PenTool size={18} /> : <Sparkles size={18} />}
                                {loading ? 'Creating...' : (creationMode === 'manual' ? 'Create Custom Code' : 'Generate Random Code')}
                            </button>
                        </div>
                    )}

                    {activeTab === 'credits' && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                                    <Layers size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Credit Bundle</h3>
                                    <p className="text-sm text-gray-500">Generate credit keys for user accounts.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                                    Credit Amount
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['500', '1000', '2500', '5000', '7500', 'Custom'].map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => setCreditAmount(amount === 'Custom' ? '' : amount)}
                                            className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all ${creditAmount === amount ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-transparent border-gray-200 dark:border-[#27272a] text-gray-600 dark:text-gray-400 hover:border-emerald-500 dark:hover:border-emerald-500'}`}
                                        >
                                            {amount}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={generateCreditCode}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                            >
                                <Layers size={18} />
                                Generate Credit Key
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-[#18181b] to-black dark:from-[#000] dark:to-[#111] rounded-3xl p-10 text-white flex flex-col justify-center h-full relative overflow-hidden shadow-xl border border-gray-800 relative z-0">
                        <div className="relative z-10">
                            <h3 className="text-gray-400 font-medium mb-2 uppercase tracking-widest text-xs">Generated Code</h3>
                            <div className="flex items-center gap-4 mb-8">
                                <span className={`text-3xl lg:text-5xl font-mono font-bold tracking-wider ${generatedCode ? 'text-white' : 'text-gray-700'}`}>
                                    {generatedCode || 'JP-....-....'}
                                </span>
                            </div>

                            {generatedCode && (
                                <div className="flex gap-3">
                                    <button onClick={() => copyToClipboard(generatedCode)} className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
                                        <Copy size={18} />
                                        Copy Code
                                    </button>
                                    <div className="px-4 py-3 bg-white/10 rounded-xl text-sm font-medium flex items-center gap-2">
                                        <RefreshCw size={16} />
                                        {activeTab === 'invite' ? `${inviteCount} Uses` : `${creditAmount} Credits`}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={`absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-[100px] opacity-20 ${activeTab === 'invite' ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
                        <div className={`absolute -left-20 -top-20 w-80 h-80 rounded-full blur-[100px] opacity-10 ${activeTab === 'invite' ? 'bg-blue-500' : 'bg-teal-500'}`}></div>
                    </div>

                    <div className="bg-white dark:bg-[#09090b] rounded-3xl border border-gray-100 dark:border-[#27272a] p-8 shadow-sm flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                             <button className="p-4 bg-gray-50 dark:bg-[#18181b] rounded-2xl text-left hover:bg-gray-100 dark:hover:bg-[#202023] transition-colors group">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 w-fit mb-3 group-hover:scale-110 transition-transform">
                                    <Sparkles size={20} />
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Grant VIP Access</h4>
                                <p className="text-xs text-gray-500 mt-1">Upgrade user directly</p>
                             </button>
                             <button className="p-4 bg-gray-50 dark:bg-[#18181b] rounded-2xl text-left hover:bg-gray-100 dark:hover:bg-[#202023] transition-colors group">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400 w-fit mb-3 group-hover:scale-110 transition-transform">
                                    <Layers size={20} />
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Bulk Generate</h4>
                                <p className="text-xs text-gray-500 mt-1">CSV Export codes</p>
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            {activeTab === 'invite' && (
                <div className="mt-8 bg-white dark:bg-[#09090b] rounded-3xl border border-gray-100 dark:border-[#27272a] p-8 shadow-sm animate-fadeIn">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Active Invite Codes</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-[#27272a]">
                                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400 text-sm">Code</th>
                                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400 text-sm">Usage</th>
                                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400 text-sm">Expires</th>
                                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400 text-sm">Status</th>
                                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-[#27272a]">
                                {inviteCodes.length > 0 ? (
                                    inviteCodes.map((code) => (
                                        <tr key={code._id} className="group">
                                            <td className="py-4 font-mono font-medium text-gray-900 dark:text-white">
                                                {code.code}
                                            </td>
                                            <td className="py-4 text-gray-600 dark:text-gray-400">
                                                {code.usedby.length} / {code.avaliblefor}
                                            </td>
                                            <td className="py-4 text-gray-600 dark:text-gray-400">
                                                {new Date(code.expiresAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${code.isValid ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                    {code.isValid ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => copyToClipboard(code.code)}
                                                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteInviteCode(code._id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-gray-500">
                                            No invite codes found. Create one above!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessManagement;
