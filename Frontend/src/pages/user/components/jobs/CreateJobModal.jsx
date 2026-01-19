import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const CreateJobModal = ({ isOpen, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        salaryRange: '',
        description: '',
        employmentType: 'Full-time'
    });

    const headerColor = 'bg-[#E2DBFA]';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-[#111111] rounded-[30px] w-full max-w-[600px] overflow-hidden shadow-2xl border border-gray-100 dark:border-[#222]"
            >
                <div className={`${headerColor} p-8 flex justify-between items-start`}>
                    <div>
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-bold text-gray-700 w-fit mb-4">
                            NEW POSTING
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">Create Opportunity</h2>
                        <p className="text-gray-700 font-medium mt-1 opacity-80">Share a new role with the community</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-gray-700 transition-all shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-gray-900 dark:text-white uppercase tracking-wide ml-1">Position Details</label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Job Title (e.g. Senior Product Designer)"
                                className="w-full h-[56px] px-6 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] border-none text-gray-900 dark:text-white font-bold placeholder-gray-400 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <input
                                    required
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder="Company Name"
                                    className="w-full h-[56px] px-6 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] border-none text-gray-900 dark:text-white font-medium placeholder-gray-400 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <input
                                    required
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Location (e.g. Remote)"
                                    className="w-full h-[56px] px-6 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] border-none text-gray-900 dark:text-white font-medium placeholder-gray-400 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <input
                                    name="salaryRange"
                                    value={formData.salaryRange}
                                    onChange={handleChange}
                                    placeholder="Salary (e.g. $120k/yr)"
                                    className="w-full h-[56px] px-6 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] border-none text-gray-900 dark:text-white font-medium placeholder-gray-400 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2 h-[56px]">
                                <div className="relative h-full">
                                    <select
                                        name="employmentType"
                                        value={formData.employmentType}
                                        onChange={handleChange}
                                        className="w-full h-full px-6 pr-10 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] border-none text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                        <option>Freelance</option>
                                        <option>Internship</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <textarea
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Job Description & Requirements..."
                                className="w-full p-6 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] border-none text-gray-900 dark:text-white font-medium placeholder-gray-400 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all outline-none resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full h-[60px] rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                        >
                            Publish Opportunity
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CreateJobModal;