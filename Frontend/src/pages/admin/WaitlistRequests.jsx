import { Search, Check, RefreshCw, Users, Mail, Calendar, MessageSquare, X } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DetailModal = ({ entry, onClose, onApprove, approving }) => {
    if (!entry) return null;
    const fullName = `${entry.firstName} ${entry.lastName || ''}`.trim();
    const initials = `${entry.firstName?.[0] || ''}${entry.lastName?.[0] || ''}`.toUpperCase();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-[#09090b] rounded-3xl border border-gray-200 dark:border-[#27272a] shadow-2xl w-full max-w-lg p-8 flex flex-col gap-6">
                <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-[#18181b] transition-colors">
                    <X size={18} />
                </button>
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 shrink-0">
                        {entry.avatar
                            ? <img src={entry.avatar} alt={fullName} className="w-full h-full object-cover rounded-2xl" />
                            : initials}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{fullName}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{entry.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-[#18181b] rounded-2xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Auth Provider</p>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">{entry.authProvider || 'local'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#18181b] rounded-2xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Gender</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{entry.gender || '—'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#18181b] rounded-2xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Date of Birth</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {entry.dob ? new Date(entry.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#18181b] rounded-2xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Invite Code</p>
                        <p className="font-semibold text-gray-900 dark:text-white font-mono">{entry.inviteCode || '—'}</p>
                    </div>
                </div>

                {entry.howDidYouFindUs && (
                    <div className="bg-gray-50 dark:bg-[#18181b] rounded-2xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">How they found us</p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{entry.howDidYouFindUs}</p>
                    </div>
                )}
                {entry.whyJoin && (
                    <div className="bg-gray-50 dark:bg-[#18181b] rounded-2xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Why they want to join</p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{entry.whyJoin}</p>
                    </div>
                )}

                <button
                    onClick={() => onApprove(entry._id)}
                    disabled={approving}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                    {approving ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
                    {approving ? 'Approving…' : 'Approve & Move to Users'}
                </button>
            </div>
        </div>
    );
};

const WaitlistRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [approvingId, setApprovingId] = useState(null);
    const [selectedEntry, setSelectedEntry] = useState(null);

    const backendUrl = import.meta.env.VITE_BACKEND_API_URL;
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchWaitlist = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/waitlist`, config);
            setRequests(data.data.list);
        } catch {
            toast.error('Failed to load waitlist');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWaitlist(); }, []);

    const handleApprove = async (id) => {
        try {
            setApprovingId(id);
            await axios.patch(`${backendUrl}/waitlist/${id}/approve`, {}, config);
            toast.success('User approved and notified!');
            setSelectedEntry(null);
            setRequests(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Approval failed');
        } finally {
            setApprovingId(null);
        }
    };

    const filtered = useMemo(() => {
        if (!search.trim()) return requests;
        const q = search.toLowerCase();
        return requests.filter(r =>
            r.email?.toLowerCase().includes(q) ||
            r.firstName?.toLowerCase().includes(q) ||
            r.lastName?.toLowerCase().includes(q)
        );
    }, [requests, search]);

    return (
        <div className="space-y-8 pb-10">
            <DetailModal
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
                onApprove={handleApprove}
                approving={!!approvingId}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Waitlist Requests</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage incoming user access requests and approvals.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors" size={20} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or email…"
                            className="pl-12 pr-5 py-3 rounded-2xl border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#18181b] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none w-full md:w-80 transition-all font-medium"
                        />
                    </div>
                    <button
                        onClick={fetchWaitlist}
                        className="p-3 rounded-2xl border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#18181b] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#202023] transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#09090b] rounded-3xl border border-gray-100 dark:border-[#27272a] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-[#18181b] text-gray-500 dark:text-gray-400 text-sm font-bold border-b border-gray-100 dark:border-[#27272a]">
                                <th className="px-8 py-5">
                                    <div className="flex items-center gap-2"><Users size={14} /> Applicant</div>
                                </th>
                                <th className="px-8 py-5">
                                    <div className="flex items-center gap-2"><Mail size={14} /> Email</div>
                                </th>
                                <th className="px-8 py-5">
                                    <div className="flex items-center gap-2"><MessageSquare size={14} /> Why Join</div>
                                </th>
                                <th className="px-8 py-5">
                                    <div className="flex items-center gap-2"><Calendar size={14} /> Requested</div>
                                </th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#27272a]">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-5"><div className="h-10 bg-gray-100 dark:bg-[#27272a] rounded-xl w-40" /></td>
                                        <td className="px-8 py-5"><div className="h-4 bg-gray-100 dark:bg-[#27272a] rounded-xl w-48" /></td>
                                        <td className="px-8 py-5"><div className="h-4 bg-gray-100 dark:bg-[#27272a] rounded-xl w-56" /></td>
                                        <td className="px-8 py-5"><div className="h-4 bg-gray-100 dark:bg-[#27272a] rounded-xl w-28" /></td>
                                        <td className="px-8 py-5"><div className="h-8 bg-gray-100 dark:bg-[#27272a] rounded-xl w-24 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center text-gray-400 dark:text-gray-600">
                                        <Users size={40} className="mx-auto mb-4 opacity-30" />
                                        <p className="font-semibold">{search ? 'No results match your search.' : 'No waitlist requests yet.'}</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((req) => {
                                    const fullName = `${req.firstName} ${req.lastName || ''}`.trim();
                                    const initials = `${req.firstName?.[0] || ''}${req.lastName?.[0] || ''}`.toUpperCase();
                                    const date = new Date(req.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                                    return (
                                        <tr
                                            key={req._id}
                                            className="hover:bg-gray-50 dark:hover:bg-[#121214] transition-colors group cursor-pointer"
                                            onClick={() => setSelectedEntry(req)}
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20 shrink-0">
                                                        {req.avatar
                                                            ? <img src={req.avatar} alt={fullName} className="w-full h-full object-cover rounded-2xl" />
                                                            : initials}
                                                    </div>
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{fullName}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-gray-600 dark:text-gray-400 text-sm font-medium">{req.email}</td>
                                            <td className="px-8 py-5 text-gray-500 dark:text-gray-400 text-sm max-w-xs">
                                                <span className="line-clamp-1">{req.whyJoin || <span className="italic opacity-50">—</span>}</span>
                                            </td>
                                            <td className="px-8 py-5 text-gray-500 dark:text-gray-400 text-sm font-medium whitespace-nowrap">{date}</td>
                                            <td className="px-8 py-5" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => handleApprove(req._id)}
                                                        disabled={approvingId === req._id}
                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors font-semibold text-sm disabled:opacity-60"
                                                        title="Approve"
                                                    >
                                                        {approvingId === req._id
                                                            ? <RefreshCw size={15} className="animate-spin" />
                                                            : <Check size={15} />}
                                                        Approve
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-[#27272a] bg-gray-50 dark:bg-[#18181b] flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 pl-4">
                        {loading ? 'Loading…' : `${filtered.length} request${filtered.length !== 1 ? 's' : ''}${search ? ' found' : ' pending'}`}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default WaitlistRequests;
