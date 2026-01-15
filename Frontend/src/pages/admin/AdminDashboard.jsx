import React from 'react';
import { Search, Plus, MoreHorizontal, Calendar, Sliders, ArrowUpRight, Users, Activity, DollarSign, ShieldCheck, Mail } from 'lucide-react';

const StatCard = ({ icon, label, value, trend, trendUp }) => (
    <div className="bg-white dark:bg-[#09090b] p-6 rounded-3xl border border-gray-100 dark:border-[#27272a] shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl ${icon.bg} ${icon.text} group-hover:scale-110 transition-transform`}>
                {icon.component}
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${trendUp ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {trendUp ? <ArrowUpRight size={14} /> : <ArrowUpRight size={14} className="rotate-90" />}
                    {trend}
                </div>
            )}
        </div>
        <div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        </div>
    </div>
);

const AdminDashboard = () => {
    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Admin Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Monitor system performance and user growth.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        <Activity size={18} />
                        <span>System Health</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={{ component: <Users size={24} />, bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' }}
                    label="Total Users"
                    value="12,345"
                    trend="+12% vs last month"
                    trendUp={true}
                />
                <StatCard 
                    icon={{ component: <Mail size={24} />, bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' }}
                    label="Waitlist Requests"
                    value="2,543"
                    trend="+45 this week"
                    trendUp={true}
                />
                <StatCard 
                    icon={{ component: <ShieldCheck size={24} />, bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400' }}
                    label="Access Codes"
                    value="843"
                    trend="+18% usage"
                    trendUp={true}
                />
                 <StatCard 
                    icon={{ component: <DollarSign size={24} />, bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' }}
                    label="Revenue (ARR)"
                    value="$1.2M"
                    trend="+32% YoY"
                    trendUp={true}
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Tasks */}
                <div className="lg:col-span-2 bg-white dark:bg-[#09090b] rounded-3xl border border-gray-100 dark:border-[#27272a] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-2.5 rounded-xl text-purple-600 dark:text-purple-400">
                                <Activity size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activities</h2>
                        </div>
                        <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 hover:bg-gray-100 dark:hover:bg-[#18181b] rounded-xl">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {[
                            { user: "Sarah Miller", action: "requested access", time: "2 mins ago", type: "waitlist" },
                            { user: "Alex Johnson", action: "generated 5 codes", time: "15 mins ago", type: "admin" },
                            { user: "System", action: "Daily backup completed", time: "1 hour ago", type: "system" },
                            { user: "Mike Chen", action: "updated profile", time: "2 hours ago", type: "user" }
                        ].map((item, i) => (
                            <div key={i} className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-[#18181b] border border-transparent hover:border-gray-200 dark:hover:border-[#27272a] rounded-2xl transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                                        {item.user.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-base">
                                            {item.user} <span className="font-medium text-gray-500 dark:text-gray-400">{item.action}</span>
                                        </h4>
                                        <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">{item.type} • {item.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="px-4 py-2 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#27272a] transition-colors shadow-sm">
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white dark:bg-[#09090b] rounded-3xl border border-gray-100 dark:border-[#27272a] p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">System Status</h2>
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-gray-500 dark:text-gray-400">API Latency</span>
                                <span className="text-emerald-500">24ms</span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 dark:bg-[#18181b] rounded-full overflow-hidden">
                                <div className="h-full w-[30%] bg-emerald-500 rounded-full" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-gray-500 dark:text-gray-400">Database Load</span>
                                <span className="text-blue-500">42%</span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 dark:bg-[#18181b] rounded-full overflow-hidden">
                                <div className="h-full w-[42%] bg-blue-500 rounded-full" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-gray-500 dark:text-gray-400">AI Worker Nodes</span>
                                <span className="text-purple-500">12/12 Active</span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 dark:bg-[#18181b] rounded-full overflow-hidden">
                                <div className="h-full w-full bg-purple-500 rounded-full" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-100 dark:border-[#27272a]">
                        <button className="w-full py-3.5 bg-gray-50 dark:bg-[#18181b] rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#27272a] transition-colors border border-dashed border-gray-300 dark:border-[#3f3f46]">
                             Download System Logs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
