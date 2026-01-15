import { Search, Filter, Check, X, MoreHorizontal, Mail, MapPin, Briefcase } from 'lucide-react';
import React, { useState } from 'react';

const WaitlistRequests = () => {
    const [requests, setRequests] = useState([
        { id: 1, email: "alex.doe@example.com", date: "2024-03-10", status: "Pending", country: "USA", role: "Software Engineer" },
        { id: 2, email: "sarah.smith@design.co", date: "2024-03-09", status: "Approved", country: "UK", role: "Product Designer" },
        { id: 3, email: "mike.brown@tech.io", date: "2024-03-08", status: "Rejected", country: "Canada", role: "Product Manager" },
        { id: 4, email: "emily.white@web.net", date: "2024-03-08", status: "Pending", country: "USA", role: "Frontend Developer" },
        { id: 5, email: "chris.green@app.com", date: "2024-03-07", status: "Pending", country: "Germany", role: "Backend Developer" },
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50';
            case 'Rejected': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/50';
            default: return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50';
        }
    };

    return (
        <div className="space-y-8 pb-10">
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
                            placeholder="Search requests..."
                            className="pl-12 pr-5 py-3 rounded-2xl border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#18181b] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none w-full md:w-80 transition-all font-medium"
                        />
                    </div>
                    <button className="p-3 rounded-2xl border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#18181b] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#202023] transition-colors">
                        <Filter size={20} />
                    </button>
                    <button className="px-5 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-2xl hover:shadow-lg transition-all">
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#09090b] rounded-3xl border border-gray-100 dark:border-[#27272a] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-[#18181b] text-gray-500 dark:text-gray-400 text-sm font-bold border-b border-gray-100 dark:border-[#27272a]">
                                <th className="px-8 py-5">User Email</th>
                                <th className="px-8 py-5">Role & Location</th>
                                <th className="px-8 py-5">Date Requested</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#27272a]">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-[#121214] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
                                                {req.email[0].toUpperCase()}
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white text-base">{req.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-medium">
                                                <Briefcase size={14} className="text-gray-400" />
                                                <span>{req.role}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <MapPin size={12} />
                                                <span>{req.country}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-gray-500 dark:text-gray-400 font-medium">{req.date}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide outline outline-1 outline-offset-1 ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <button
                                                className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors"
                                                title="Approve"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                                                title="Reject"
                                            >
                                                <X size={18} />
                                            </button>
                                            <button className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-[#202023] transition-colors">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination (Mock) */}
                <div className="p-4 border-t border-gray-100 dark:border-[#27272a] bg-gray-50 dark:bg-[#18181b] flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 pl-4">Showing 1-5 of 124 requests</span>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#27272a] rounded-xl transition-colors disabled:opacity-50">Previous</button>
                        <button className="px-4 py-2 text-sm font-bold text-gray-900 dark:text-white bg-white dark:bg-[#09090b] border border-gray-200 dark:border-[#27272a] rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-[#202023] transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaitlistRequests;
