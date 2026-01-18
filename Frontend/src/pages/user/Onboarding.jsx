import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import UserLayout from './components/UserLayout';

const Onboarding = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [step, setStep] = useState('upload');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [formData, setFormData] = useState({
        bio: '',
        skills: '',
        experience: [],
        education: []
    });

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsAnalyzing(true);
        const formDataUpload = new FormData();
        formDataUpload.append('cv', file);

        try {
            const API_URL = import.meta.env.VITE_BACKEND_API_URL;
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/profile/analyze-cv`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataUpload
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                const { bio, skills, experience, education, cv } = data.data;
                setFormData({
                    bio: bio || '',
                    skills: Array.isArray(skills) ? skills.join(', ') : skills || '',
                    experience: experience || [],
                    education: education || [],
                    cv: cv
                });
                setStep('manual');
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            setStep('manual');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const API_URL = import.meta.env.VITE_BACKEND_API_URL;
            const token = localStorage.getItem('token');
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);

            await fetch(`${API_URL}/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    skills: skillsArray
                })
            });
            toast.success('Profile saved successfully!');
            navigate('/user/dashboard');
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save profile.');
        }
    };

    const handleSkip = () => {
        sessionStorage.setItem('skipOnboarding', 'true');
        navigate('/user/dashboard');
    };

    const addExperience = () => {
        setFormData(prev => ({
            ...prev,
            experience: [...prev.experience, { role: '', company: '', startDate: '', endDate: '', description: '' }]
        }));
    };

    const updateExperience = (index, field, value) => {
        const newExp = [...formData.experience];
        newExp[index][field] = value;
        setFormData(prev => ({ ...prev, experience: newExp }));
    };

    const removeExperience = (index) => {
        setFormData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
    };

    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [...prev.education, { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' }]
        }));
    };

    const updateEducation = (index, field, value) => {
        const newEdu = [...formData.education];
        newEdu[index][field] = value;
        setFormData(prev => ({ ...prev, education: newEdu }));
    };

    const removeEducation = (index) => {
        setFormData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
    };
    
    return (
        <UserLayout activeMode="onboarding">
            <div className="flex flex-col h-full bg-white dark:bg-[#09090b] text-gray-900 dark:text-gray-100 overflow-y-auto">
                <div className="max-w-3xl mx-auto w-full px-6 py-12">
                    
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-bold tracking-tight mb-3">Welcome to JobPilot</h1>
                        <p className="text-gray-500 dark:text-zinc-400">Let's set up your profile to personalize your experience.</p>
                    </div>

                    {step === 'upload' && (
                        <div className="space-y-6">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl p-12 text-center cursor-pointer hover:border-black dark:hover:border-zinc-600 transition-colors group ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange} 
                                />
                                <div className="w-16 h-16 bg-gray-100 dark:bg-[#111] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <i className="ph ph-upload-simple text-2xl text-gray-500 dark:text-zinc-400"></i>
                                </div>
                                <h3 className="text-lg font-medium mb-1">Upload your CV</h3>
                                <p className="text-sm text-gray-500 dark:text-zinc-500">PDF or Word documents (Max 5MB)</p>
                                {isAnalyzing && <p className="mt-4 text-blue-600 dark:text-blue-400 animate-pulse">Analyzing document...</p>}
                            </div>

                            <div className="flex items-center gap-4 my-8">
                                <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1"></div>
                                <span className="text-xs text-gray-400 font-medium uppercase">Or</span>
                                <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1"></div>
                            </div>

                            <button 
                                onClick={() => setStep('manual')}
                                className="w-full py-3 rounded-lg border border-gray-200 dark:border-zinc-800 font-medium hover:bg-gray-50 dark:hover:bg-[#111] transition-colors"
                            >
                                Fill Manually
                            </button>

                            <div className="text-center mt-6">
                                <button 
                                    onClick={handleSkip}
                                    className="text-sm text-gray-400 hover:text-gray-600 dark:text-zinc-600 dark:hover:text-zinc-400"
                                >
                                    Skip for now
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'manual' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Professional Bio</label>
                                    <textarea 
                                        value={formData.bio}
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-zinc-800 focus:border-black dark:focus:border-zinc-600 outline-none min-h-[120px]"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Skills (comma separated)</label>
                                    <input 
                                        type="text"
                                        value={formData.skills}
                                        onChange={(e) => setFormData({...formData, skills: e.target.value})}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-zinc-800 focus:border-black dark:focus:border-zinc-600 outline-none"
                                        placeholder="React, Node.js, Design..."
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-medium">Work Experience</label>
                                    <button onClick={addExperience} className="text-xs flex items-center gap-1 hover:underline">
                                        <i className="ph ph-plus"></i> Add
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {formData.experience.map((exp, idx) => (
                                        <div key={idx} className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 relative group">
                                            <button 
                                                onClick={() => removeExperience(idx)}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <i className="ph ph-trash"></i>
                                            </button>
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <input 
                                                    placeholder="Role"
                                                    value={exp.role}
                                                    onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                                                    className="p-2 bg-transparent border-b border-gray-200 dark:border-zinc-800 outline-none focus:border-black dark:focus:border-zinc-600"
                                                />
                                                <input 
                                                    placeholder="Company" 
                                                    value={exp.company}
                                                    onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                                                    className="p-2 bg-transparent border-b border-gray-200 dark:border-zinc-800 outline-none focus:border-black dark:focus:border-zinc-600"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <input 
                                                    placeholder="Start Date"
                                                    value={exp.startDate}
                                                    onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
                                                    className="p-2 bg-transparent border-b border-gray-200 dark:border-zinc-800 outline-none focus:border-black dark:focus:border-zinc-600"
                                                />
                                                <input 
                                                    placeholder="End Date" 
                                                    value={exp.endDate}
                                                    onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
                                                    className="p-2 bg-transparent border-b border-gray-200 dark:border-zinc-800 outline-none focus:border-black dark:focus:border-zinc-600"
                                                />
                                            </div>
                                            <textarea 
                                                placeholder="Description"
                                                value={exp.description}
                                                onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                                                className="w-full p-2 bg-transparent text-sm text-gray-600 dark:text-zinc-400 outline-none resize-none"
                                                rows={2}
                                            />
                                        </div>
                                    ))}
                                    {formData.experience.length === 0 && (
                                        <div className="text-center py-8 text-sm text-gray-400 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
                                            No experience added
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-medium">Education</label>
                                    <button onClick={addEducation} className="text-xs flex items-center gap-1 hover:underline">
                                        <i className="ph ph-plus"></i> Add
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {formData.education.map((edu, idx) => (
                                        <div key={idx} className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 relative group">
                                            <button 
                                                onClick={() => removeEducation(idx)}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <i className="ph ph-trash"></i>
                                            </button>
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <input 
                                                    placeholder="School / University"
                                                    value={edu.institution}
                                                    onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                                                    className="p-2 bg-transparent border-b border-gray-200 dark:border-zinc-800 outline-none focus:border-black dark:focus:border-zinc-600"
                                                />
                                                <input 
                                                    placeholder="Degree" 
                                                    value={edu.degree}
                                                    onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                                                    className="p-2 bg-transparent border-b border-gray-200 dark:border-zinc-800 outline-none focus:border-black dark:focus:border-zinc-600"
                                                />
                                            </div>
                                            <input 
                                                placeholder="Field of Study"
                                                value={edu.fieldOfStudy}
                                                onChange={(e) => updateEducation(idx, 'fieldOfStudy', e.target.value)}
                                                className="w-full p-2 mb-3 bg-transparent border-b border-gray-200 dark:border-zinc-800 outline-none focus:border-black dark:focus:border-zinc-600"
                                            />
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <input 
                                                    placeholder="Start Date"
                                                    value={edu.startDate}
                                                    onChange={(e) => updateEducation(idx, 'startDate', e.target.value)}
                                                    className="p-2 bg-transparent border-b border-gray-200 dark:border-zinc-800 outline-none focus:border-black dark:focus:border-zinc-600"
                                                />
                                                <input 
                                                    placeholder="End Date" 
                                                    value={edu.endDate}
                                                    onChange={(e) => updateEducation(idx, 'endDate', e.target.value)}
                                                    className="p-2 bg-transparent border-b border-gray-200 dark:border-zinc-800 outline-none focus:border-black dark:focus:border-zinc-600"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {formData.education.length === 0 && (
                                        <div className="text-center py-8 text-sm text-gray-400 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
                                            No education added
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 flex items-center justify-end gap-3">
                                <button 
                                    onClick={handleSkip}
                                    className="px-6 py-2 text-sm font-medium text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                                >
                                    Skip
                                </button>
                                <button 
                                    onClick={handleSubmit}
                                    className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                    Save Profile
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </UserLayout>
    );
};

export default Onboarding;
