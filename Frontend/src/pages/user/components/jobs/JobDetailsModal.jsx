import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, MapPin, DollarSign, Clock, Check, Bot, BrainCircuit, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIInterviewModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-[#1A1A1A] rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl flex flex-col border border-gray-100 dark:border-gray-800"
            >
                <div className="p-6 bg-[#F6F7FB] dark:bg-[#222] border-b border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Interview Process</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Please review the simulation process before applying.
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800" />

                        <div className="relative z-10 flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-black dark:text-black flex items-center justify-center text-sm font-bold shrink-0">1</div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">AI Agent Call</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    You will receive a call from our AI agent for a preliminary simulation interview.
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 flex gap-4 mt-6">
                            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Technical Assessment</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    If successful, you'll proceed to a technical live interview or brain test tailored to your profile.
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 flex gap-4 mt-6">
                            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold shrink-0">3</div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Final Results</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Get immediate feedback and results from your interview simulation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold hover:opacity-90 transition-opacity"
                    >
                        I Understand, Apply
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const JobDetailsModal = ({ isOpen, onClose, job, onApply, userId }) => {
    if (!isOpen || !job) return null;
    const isApplied = job.applicants && job.applicants.includes(userId);
    const [isApplying, setIsApplying] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const navigate = useNavigate();

    const handleApplyClick = () => {
        if (isApplied) return;
        setShowAIModal(true);
    };

    const confirmApply = async () => {
        setShowAIModal(false);
        setIsApplying(true);
        navigate(`/user/meet?jobId=${encodeURIComponent(job._id || job.id)}`);
        setIsApplying(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <AnimatePresence>
                {showAIModal && (
                    <AIInterviewModal
                        isOpen={showAIModal}
                        onClose={() => setShowAIModal(false)}
                        onConfirm={confirmApply}
                    />
                )}
            </AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-[#1A1A1A] rounded-[24px] w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#1A1A1A]">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{job.title}</h2>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1">
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300 mb-8">
                        <div className="flex items-center gap-2 bg-[#F6F7FB] dark:bg-gray-800 px-4 py-2 rounded-full font-medium">
                            <Briefcase size={16} className="text-gray-400" />
                            <span>{job.company}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#F6F7FB] dark:bg-gray-800 px-4 py-2 rounded-full font-medium">
                            <MapPin size={16} className="text-gray-400" />
                            <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#F6F7FB] dark:bg-gray-800 px-4 py-2 rounded-full font-medium">
                            <DollarSign size={16} className="text-gray-400" />
                            <span>{job.salaryRange || 'Competitive'}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#F6F7FB] dark:bg-gray-800 px-4 py-2 rounded-full font-medium">
                            <Clock size={16} className="text-gray-400" />
                            <span>{job.employmentType}</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Description</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-[15px]">
                                {job.description}
                            </p>
                        </div>

                        {job.requirements && job.requirements.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Requirements</h3>
                                <ul className="space-y-2">
                                    {job.requirements.map((req, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300 text-[15px]">
                                            <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-2 shrink-0" />
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {job.responsibilities && job.responsibilities.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Responsibilities</h3>
                                <ul className="space-y-2">
                                    {job.responsibilities.map((res, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300 text-[15px]">
                                            <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-2 shrink-0" />
                                            <span>{res}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1A1A1A]">
                    <button
                        onClick={handleApplyClick}
                        disabled={isApplied || isApplying}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-base font-bold transition-all ${isApplied
                            ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 cursor-default'
                            : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
                            }`}
                    >
                        {isApplying ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : isApplied ? (
                            <>
                                <Check size={18} />
                                <span>Application Sent</span>
                            </>
                        ) : (
                            <span>Apply for Position</span>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default JobDetailsModal;