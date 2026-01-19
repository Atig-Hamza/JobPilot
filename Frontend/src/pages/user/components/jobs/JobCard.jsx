import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const JobCard = ({ job, onApply, onDetails, userId, color }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-white dark:bg-[#111] border border-gray-100 dark:border-[#222] rounded-[24px] shadow-sm transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden p-1.5"
        >
            <div className={`rounded-[20px] p-5 h-[200px] flex flex-col justify-between ${color || 'bg-[#FFE4D3]'}`}>
                <div className="flex justify-between items-start">
                    <div className="bg-white/90 dark:bg-black/80 px-3 py-1.5 rounded-full text-[11px] font-bold text-gray-700 dark:text-gray-300 backdrop-blur-sm">
                        {new Date(job.createdAt || Date.now()).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="w-8 h-8 bg-white/90 dark:bg-black/80 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 transition-transform text-gray-700 dark:text-gray-300">
                        {job.applicants && job.applicants.includes(userId) ? (
                            <Check size={14} className="text-green-600 dark:text-green-400" strokeWidth={3} />
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                        )}
                    </div>
                </div>

                <div>
                    <div className="text-[13px] font-bold text-gray-800 dark:text-gray-900 mb-1 opacity-80">{job.company}</div>
                    <div className="flex justify-between items-end gap-2">
                        <div className="text-[20px] font-extrabold leading-tight text-gray-900 dark:text-black line-clamp-2 w-[80%]">
                            {job.title}
                        </div>
                        <div className="w-10 h-10 bg-white/90 dark:bg-black/80 rounded-full flex items-center justify-center font-bold text-lg shadow-sm text-gray-900 dark:text-white shrink-0">
                            {job.company.charAt(0)}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                    <div className="px-2.5 py-1 border border-gray-900/10 dark:border-black/10 rounded-full text-[10px] font-bold text-gray-800 dark:text-gray-900/80 uppercase tracking-wide">
                        {job.employmentType}
                    </div>
                    {job.location.toLowerCase().includes('remote') && (
                        <div className="px-2.5 py-1 border border-gray-900/10 dark:border-black/10 rounded-full text-[10px] font-bold text-gray-800 dark:text-gray-900/80 uppercase tracking-wide">
                            Remote
                        </div>
                    )}
                </div>
            </div>

            <div className="px-5 py-4 flex justify-between items-center bg-white dark:bg-[#111]">
                <div className="flex flex-col">
                    <div className="text-[17px] font-bold text-gray-900 dark:text-white">
                        {job.salaryRange ? (
                            job.salaryRange.includes('$') || job.salaryRange.includes('k') ? job.salaryRange : '$' + job.salaryRange
                        ) : 'Competitive'}
                    </div>
                    <div className="text-[12px] text-gray-400 dark:text-gray-500 font-medium truncate max-w-[120px]">
                        {job.location}
                    </div>
                </div>

                <button
                    onClick={() => onDetails(job)}
                    className="bg-[#1A1A1A] dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors shadow-lg shadow-gray-200/50 dark:shadow-none"
                >
                    Details
                </button>
            </div>
        </motion.div>
    );
};

export default JobCard;