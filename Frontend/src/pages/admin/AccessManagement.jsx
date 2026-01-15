import { useState } from 'react';
import { Ticket, Copy, RefreshCw, Layers, Sparkles, PenTool } from 'lucide-react';
import toast from 'react-hot-toast';

const AccessManagement = () => {
    const [activeTab, setActiveTab] = useState('invite');
    const [creationMode, setCreationMode] = useState('auto'); // 'auto' or 'manual'
    const [inviteCount, setInviteCount] = useState(10);
    const [creditAmount, setCreditAmount] = useState('500');
    const [generatedCode, setGeneratedCode] = useState('');
    const [manualCodeInput, setManualCodeInput] = useState('');

    const handleCreateInviteCode = () => {
        if (creationMode === 'manual') {
            if (!manualCodeInput.trim()) {
                toast.error('Please enter a code');
                return;
            }
            // Ensure format JP- is present or add it
            let finalCode = manualCodeInput.toUpperCase();
            if (!finalCode.startsWith('JP-')) {
                finalCode = `JP-${finalCode}`;
            }
            setGeneratedCode(finalCode);
            toast.success(`Created Manual Invite Code: ${finalCode}`);
        } else {
            // Format: JP-XXXX-XXXX
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const section1 = Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
            const section2 = Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
            const code = `JP-${section1}-${section2}`;
            setGeneratedCode(code);
            toast.success(`Generated Invite Code for ${inviteCount} users!`);
        }
    };

    const generateCreditCode = () => {
        // Format: JP-XXXXXXXXXXXXXX (14 chars)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const section1 = Array(14).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
        const code = `JP-${section1}`;
        setGeneratedCode(code);
        toast.success(`Generated Credit Code for ${creditAmount} credits!`);
    };

    const copyToClipboard = () => {
        if (!generatedCode) return;
        navigator.clipboard.writeText(generatedCode);
        toast.success('Copied to clipboard!');
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Access & Credits</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Generate access keys and distribute credit bundles.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Generator Card */}
                <div className="bg-white dark:bg-[#09090b] rounded-3xl border border-gray-100 dark:border-[#27272a] p-8 shadow-sm">
                    {/* Tabs */}
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

                    {/* Invite Code Form */}
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
                                {/* Toggle Creation Mode */}
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
                                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {creationMode === 'manual' ? <PenTool size={18} /> : <Sparkles size={18} />}
                                {creationMode === 'manual' ? 'Create Custom Code' : 'Generate Random Code'}
                            </button>
                        </div>
                    )}

                    {/* Credit Code Form */}
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

                {/* Display Area */}
                <div className="flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-[#18181b] to-black dark:from-[#000] dark:to-[#111] rounded-3xl p-10 text-white flex flex-col justify-center h-full relative overflow-hidden shadow-xl border border-gray-800">
                        <div className="relative z-10">
                            <h3 className="text-gray-400 font-medium mb-2 uppercase tracking-widest text-xs">Generated Code</h3>
                            <div className="flex items-center gap-4 mb-8">
                                <span className={`text-3xl lg:text-5xl font-mono font-bold tracking-wider ${generatedCode ? 'text-white' : 'text-gray-700'}`}>
                                    {generatedCode || 'JP-....-....'}
                                </span>
                            </div>
                            
                            {generatedCode && (
                                <div className="flex gap-3">
                                    <button onClick={copyToClipboard} className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
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

                        {/* Decoration */}
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
        </div>
    );
};

export default AccessManagement;
