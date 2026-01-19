import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import UserLayout from './components/UserLayout';

const Onboarding = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [step, setStep] = useState('upload');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        bio: '',
        contactEmail: '',
        phoneNumber: '',
        skills: '',
        languages: [],
        certificates: [],
        experience: [],
        education: [],
        socialLinks: []
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
                const { bio, contactEmail, phoneNumber, skills, languages, certificates, experience, education, cv, socialLinks } = data.data;
                setFormData({
                    bio: bio || '',
                    contactEmail: contactEmail || '',
                    phoneNumber: phoneNumber || '',
                    skills: Array.isArray(skills) ? skills.join(', ') : skills || '',
                    languages: languages || [],
                    certificates: certificates || [],
                    experience: experience || [],
                    education: education || [],
                    socialLinks: socialLinks || [],
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
            setIsSaving(true);
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
        } finally {
            setIsSaving(false);
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

    const addSocialLink = () => {
        setFormData(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, { platform: '', url: '' }]
        }));
    };

    const updateSocialLink = (index, field, value) => {
        const newLinks = [...formData.socialLinks];
        newLinks[index][field] = value;
        setFormData(prev => ({ ...prev, socialLinks: newLinks }));
    };

    const removeSocialLink = (index) => {
        setFormData(prev => ({ ...prev, socialLinks: prev.socialLinks.filter((_, i) => i !== index) }));
    };

    const addLanguage = () => {
        setFormData(prev => ({
            ...prev,
            languages: [...prev.languages, { language: '', proficiency: 'Intermediate' }]
        }));
    };

    const updateLanguage = (index, field, value) => {
        const newLangs = [...formData.languages];
        newLangs[index][field] = value;
        setFormData(prev => ({ ...prev, languages: newLangs }));
    };

    const removeLanguage = (index) => {
        setFormData(prev => ({ ...prev, languages: prev.languages.filter((_, i) => i !== index) }));
    };

    const addCertificate = () => {
        setFormData(prev => ({
            ...prev,
            certificates: [...prev.certificates, { name: '', issuer: '', date: '' }]
        }));
    };

    const updateCertificate = (index, field, value) => {
        const newCerts = [...formData.certificates];
        newCerts[index][field] = value;
        setFormData(prev => ({ ...prev, certificates: newCerts }));
    };

    const removeCertificate = (index) => {
        setFormData(prev => ({ ...prev, certificates: prev.certificates.filter((_, i) => i !== index) }));
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.contactEmail}
                                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                            className="w-full p-3 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-zinc-800 focus:border-black dark:focus:border-zinc-600 outline-none"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="w-full p-3 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-zinc-800 focus:border-black dark:focus:border-zinc-600 outline-none"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium">Social Links</label>
                                        <button onClick={addSocialLink} className="text-xs flex items-center gap-1 hover:underline">
                                            <i className="ph ph-plus"></i> Add Link
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.socialLinks.map((link, idx) => (
                                            <div key={idx} className="flex gap-2 items-center group">
                                                <input
                                                    placeholder="Platform (e.g. LinkedIn)"
                                                    value={link.platform}
                                                    onChange={(e) => updateSocialLink(idx, 'platform', e.target.value)}
                                                    className="w-1/3 p-3 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-zinc-800 focus:border-black dark:focus:border-zinc-600 outline-none"
                                                />
                                                <input
                                                    placeholder="URL"
                                                    value={link.url}
                                                    onChange={(e) => updateSocialLink(idx, 'url', e.target.value)}
                                                    className="flex-1 p-3 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-zinc-800 focus:border-black dark:focus:border-zinc-600 outline-none"
                                                />
                                                <button
                                                    onClick={() => removeSocialLink(idx)}
                                                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <i className="ph ph-trash"></i>
                                                </button>
                                            </div>
                                        ))}
                                        {formData.socialLinks.length === 0 && (
                                            <p className="text-xs text-gray-500 italic">No social links added.</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Professional Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-zinc-800 focus:border-black dark:focus:border-zinc-600 outline-none min-h-[120px]"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Skills (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.skills}
                                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-zinc-800 focus:border-black dark:focus:border-zinc-600 outline-none"
                                        placeholder="React, Node.js, Design..."
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium">Languages</label>
                                        <button onClick={addLanguage} className="text-xs flex items-center gap-1 hover:underline">
                                            <i className="ph ph-plus"></i> Add Language
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.languages.map((lang, idx) => (
                                            <div key={idx} className="flex gap-2 items-center group">
                                                <input
                                                    placeholder="Language (e.g. English)"
                                                    value={lang.language}
                                                    onChange={(e) => updateLanguage(idx, 'language', e.target.value)}
                                                    className="flex-1 p-3 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-zinc-800 focus:border-black dark:focus:border-zinc-600 outline-none"
                                                />
                                                <select
                                                    value={lang.proficiency}
                                                    onChange={(e) => updateLanguage(idx, 'proficiency', e.target.value)}
                                                    className="w-1/3 p-3 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-zinc-800 focus:border-black dark:focus:border-zinc-600 outline-none"
                                                >
                                                    <option value="Basic">Basic</option>
                                                    <option value="Intermediate">Intermediate</option>
                                                    <option value="Advanced">Advanced</option>
                                                    <option value="Fluent">Fluent</option>
                                                    <option value="Native">Native</option>
                                                </select>
                                                <button
                                                    onClick={() => removeLanguage(idx)}
                                                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <i className="ph ph-trash"></i>
                                                </button>
                                            </div>
                                        ))}
                                        {formData.languages.length === 0 && (
                                            <p className="text-xs text-gray-500 italic">No languages added.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-medium">Certificates</label>
                                    <button onClick={addCertificate} className="text-xs flex items-center gap-1 hover:underline">
                                        <i className="ph ph-plus"></i> Add
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {formData.certificates.map((cert, idx) => (
                                        <div key={idx} className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 relative group">
                                            <button
                                                onClick={() => removeCertificate(idx)}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <i className="ph ph-trash"></i>
                                            </button>
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <input
                                                    placeholder="Certificate Name"
                                                    value={cert.name}
                                                    onChange={(e) => updateCertificate(idx, 'name', e.target.value)}
                                                    className="p-2 bg-transparent border-b border-gray-200 dark:border-zinc-800 outline-none focus:border-black dark:focus:border-zinc-600"
                                                />
                                                <input
                                                    placeholder="Issuer"
                                                    value={cert.issuer}
                                                    onChange={(e) => updateCertificate(idx, 'issuer', e.target.value)}
                                                    className="p-2 bg-transparent border-b border-gray-200 dark:border-zinc-800 outline-none focus:border-black dark:focus:border-zinc-600"
                                                />
                                            </div>
                                            <input
                                                placeholder="Date (e.g. 2023)"
                                                value={cert.date}
                                                onChange={(e) => updateCertificate(idx, 'date', e.target.value)}
                                                className="w-full p-2 bg-transparent border-b border-gray-200 dark:border-zinc-800 outline-none focus:border-black dark:focus:border-zinc-600"
                                            />
                                        </div>
                                    ))}
                                    {formData.certificates.length === 0 && (
                                        <p className="text-sm text-gray-400 italic text-center py-4 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
                                            No certificates added yet.
                                        </p>
                                    )}
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
                                    disabled={isSaving}
                                    className={`px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSaving && <i className="ph ph-spinner animate-spin"></i>}
                                    {isSaving ? 'Saving...' : 'Save Profile'}
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
