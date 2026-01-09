import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const CompanyRow = ({ name, logo, email, source, status }) => (
    <div className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-[#18181b] rounded-2xl transition-colors cursor-pointer group">
        <div className="col-span-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 p-1 flex items-center justify-center shrink-0 shadow-sm">
                <img src={logo} alt={name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('bg-gray-100'); }} />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-200">{name}</span>
        </div>
        <div className="col-span-4">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded border border-gray-100 dark:border-gray-700">{email}</span>
        </div>
        <div className="col-span-2">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{source}</span>
        </div>
        <div className="col-span-2 text-right">
            {status === 'sent' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
                    <CheckCircle2 size={12} /> SENT
                </span>
            ) : (
                <button className="opacity-0 group-hover:opacity-100 transition-all bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-3 py-1.5 rounded-lg hover:scale-105 active:scale-95 shadow-lg shadow-gray-200 dark:shadow-black">
                    Include
                </button>
            )}
        </div>
    </div>
);

export default CompanyRow;
