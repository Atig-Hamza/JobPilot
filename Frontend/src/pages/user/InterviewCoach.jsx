import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Check, Briefcase } from 'lucide-react';
import axios from 'axios';
import UserLayout from './components/UserLayout';
import { useTheme } from '../../context/ThemeContext';
import Mainlogo from '../../assets/Main/logo-without-bg.png';
import MainlogoWhite from '../../assets/Main/logo-white-without-bg.png';

import JobCard from './components/jobs/JobCard';
import JobDetailsModal from './components/jobs/JobDetailsModal';
import CreateJobModal from './components/jobs/CreateJobModal';

const InterviewCoach = () => {
    const { theme } = useTheme();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [jobSource, setJobSource] = useState('all');

    const [filters, setFilters] = useState({
        employmentTypes: [],
        specializations: []
    });
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 6;

    const cardColors = [
        'bg-[#FFE4D3]',
        'bg-[#D1F2E8]',
        'bg-[#E2DBFA]',
        'bg-[#D9EFFF]',
        'bg-[#FCE0EF]',
        'bg-[#EEF1F5]',
    ];

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserId(user.id || user._id);
        setUserProfile(user);
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/jobs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'success') {
                setJobs(response.data.data.jobs);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJob = async (jobData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/jobs`, jobData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'success') {
                setJobs([...jobs, response.data.data.job]);
                setIsModalOpen(false);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to create job');
        }
    };

    const handleApply = async (jobId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/jobs/${jobId}/apply`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchJobs();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleFilter = (category, value) => {
        setFilters(prev => {
            const current = prev[category];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [category]: updated };
        });
        setCurrentPage(1);
    };

    const filteredJobs = jobs.filter(job => {
        if (jobSource === 'recommended') {
             // Filter by jobs created by the user or strictly destined for the user (AI generated)
            const isCreatedByUser = job.createdBy === userId;
            const isDestinedForUser = job.jobDestinedTo === userId;

            if (isCreatedByUser || isDestinedForUser) return true;
            return false;
        }

        if (filters.employmentTypes.length > 0 && !filters.employmentTypes.includes(job.employmentType)) {
            return false;
        }

        if (filters.specializations.length > 0) {
            const titleLower = job.title.toLowerCase();
            const matchesSpec = filters.specializations.some(spec => {
                if (spec === 'UI/UX Designer') return titleLower.includes('designer') || titleLower.includes('ux');
                if (spec === 'Frontend Developer') return titleLower.includes('frontend') || titleLower.includes('react') || titleLower.includes('web');
                if (spec === 'Backend Engineer') return titleLower.includes('backend') || titleLower.includes('node') || titleLower.includes('api');
                if (spec === 'Project Manager') return titleLower.includes('manager') || titleLower.includes('product');
                return false;
            });
            if (!matchesSpec) return false;
        }

        return true;
    });

    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <UserLayout activeMode="interview-coach">
            <div className="h-full bg-[#f8f9fc] dark:bg-black w-full overflow-y-auto relative">
                <header className="absolute top-0 left-0 p-6 z-10 w-full pointer-events-none">
                    <div className="flex items-center gap-3 select-none pointer-events-auto">
                        <img
                            src={theme === 'dark' ? MainlogoWhite : Mainlogo}
                            alt="JobPilot"
                            className="h-6 w-auto"
                        />
                        <span className="font-semibold text-gray-900 dark:text-white text-lg tracking-tight">JobPilot</span>
                    </div>
                </header>
                <div className="max-w-[1400px] mx-auto p-4 mt-[80px] md:p-8 pt-24 flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <h1 className="text-[28px] font-bold text-gray-900 dark:text-white tracking-tight">Recommended jobs</h1>
                                <div className="px-3 py-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-full text-sm font-semibold text-gray-600 dark:text-gray-400 shadow-sm">
                                    {filteredJobs.length}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
                                >
                                    <Plus size={16} />
                                    <span>Post Job</span>
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                                    {currentJobs.map((job, index) => (
                                        <JobCard
                                            key={job._id}
                                            job={job}
                                            userId={userId}
                                            color={cardColors[index % cardColors.length]}
                                            onApply={handleApply}
                                            onDetails={(j) => setSelectedJob(j)}
                                        />
                                    ))}

                                    {currentJobs.length === 0 && (
                                        <div className="col-span-full py-20 text-center bg-white dark:bg-[#111] rounded-[24px] border border-gray-100 dark:border-[#222]">
                                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Briefcase className="text-gray-400" size={24} />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No jobs found</h3>
                                            <p className="text-gray-500 text-sm">Try adjusting your filters or check back later</p>
                                        </div>
                                    )}
                                </div>
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                            <button
                                                key={number}
                                                onClick={() => paginate(number)}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentPage === number
                                                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-110'
                                                    : 'bg-white text-gray-600 dark:bg-[#111] dark:text-gray-400 border border-gray-200 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#222]'
                                                    }`}
                                            >
                                                {number}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-6">
                        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2E2E3A] rounded-[24px] p-6 text-center text-white relative overflow-hidden h-[240px] flex flex-col justify-center border border-gray-800 shadow-xl">
                            <div className="absolute inset-0 bg-blue-500/20 blur-2xl -top-10 -right-10 h-32 w-32"></div>
                            <div className="absolute inset-0 bg-purple-500/20 blur-2xl -bottom-10 -left-10 h-32 w-32"></div>
                            <div className="text-2xl font-bold leading-tight mb-6 relative z-10 font-serif">Get Your best profession with JobPilot</div>
                            <button className="bg-[#89CFF0] text-black px-6 py-3 rounded-full font-bold text-sm cursor-pointer hover:bg-[#6CB4D8] transition-colors relative z-10 mx-auto hover:scale-105 active:scale-95 transform duration-200">
                                Learn more
                            </button>
                        </div>
                        <div className="bg-white dark:bg-[#111] p-6 rounded-[24px] border border-gray-100 dark:border-[#222] shadow-sm sticky top-6">
                            
                            <div className="mb-8">
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Job View</div>
                                <div className="bg-[#F6F7FB] dark:bg-[#1A1A1A] p-1 rounded-xl flex">
                                    <button
                                        onClick={() => { setJobSource('all'); setCurrentPage(1); }}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                            jobSource === 'all' 
                                            ? 'bg-white dark:bg-[#333] text-black dark:text-white shadow-sm' 
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                    >
                                        All Jobs
                                    </button>
                                    <button
                                        onClick={() => { setJobSource('recommended'); setCurrentPage(1); }}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                            jobSource === 'recommended' 
                                            ? 'bg-white dark:bg-[#333] text-black dark:text-white shadow-sm' 
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                    >
                                        For You
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">Filters</div>
                                <div
                                    onClick={() => {
                                        setFilters({ employmentTypes: [], specializations: [] });
                                        setCurrentPage(1);
                                    }}
                                    className="text-xs text-blue-500 font-bold cursor-pointer hover:underline"
                                >
                                    Clear
                                </div>
                            </div>
                            <div className="mb-6">
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Job Specialization</div>
                                <div className="flex flex-col gap-3">
                                    {['UI/UX Designer', 'Frontend Developer', 'Backend Engineer', 'Project Manager'].map(spec => {
                                        const isSelected = filters.specializations.includes(spec);
                                        return (
                                            <div
                                                key={spec}
                                                onClick={() => toggleFilter('specializations', spec)}
                                                className="flex items-center gap-3 cursor-pointer group"
                                            >
                                                <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${isSelected
                                                    ? 'bg-[#1A1A1A] dark:bg-white border border-[#1A1A1A] dark:border-white'
                                                    : 'border-2 border-gray-200 dark:border-[#333] group-hover:border-gray-400'
                                                    }`}>
                                                    {isSelected && <Check size={12} className="text-white dark:text-black" strokeWidth={4} />}
                                                </div>
                                                <div className={`text-sm font-medium transition-colors ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                                                    }`}>
                                                    {spec}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Working schedule</div>
                                <div className="flex flex-col gap-3">
                                    {['Full-time', 'Part-time', 'Contract', 'Freelance'].map(type => {
                                        const isSelected = filters.employmentTypes.includes(type);
                                        return (
                                            <div
                                                key={type}
                                                onClick={() => toggleFilter('employmentTypes', type)}
                                                className="flex items-center gap-3 cursor-pointer group"
                                            >
                                                <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${isSelected
                                                    ? 'bg-[#1A1A1A] dark:bg-white border border-[#1A1A1A] dark:border-white'
                                                    : 'border-2 border-gray-200 dark:border-[#333] group-hover:border-gray-400'
                                                    }`}>
                                                    {isSelected && <Check size={12} className="text-white dark:text-black" strokeWidth={4} />}
                                                </div>
                                                <div className={`text-sm font-medium transition-colors ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                                                    }`}>
                                                    {type}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                <AnimatePresence>
                    {isModalOpen && (
                        <CreateJobModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onCreate={handleCreateJob}
                        />
                    )}
                    {selectedJob && (
                        <JobDetailsModal
                            isOpen={!!selectedJob}
                            onClose={() => setSelectedJob(null)}
                            job={selectedJob}
                        />
                    )}
                </AnimatePresence>
            </div>
        </UserLayout>
    );
};

export default InterviewCoach;