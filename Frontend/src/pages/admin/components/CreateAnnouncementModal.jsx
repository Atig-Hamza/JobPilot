import React, { useState } from 'react';
import { X, Upload, Loader2, CheckCircle } from 'lucide-react';

const CreateAnnouncementModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        buttonText: '',
        buttonLink: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('token');

            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('buttonText', formData.buttonText);
            data.append('buttonLink', formData.buttonLink);
            if (imageFile) {
                data.append('image', imageFile);
            }

            const response = await fetch(`${API_URL}/announcements`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            const resData = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setFormData({ title: '', description: '', buttonText: '', buttonLink: '' });
                    setImageFile(null);
                }, 2000);
            } else {
                setError(resData.message || 'Failed to create announcement');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#09090b] rounded-3xl w-full max-w-lg border border-gray-100 dark:border-[#27272a] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 dark:border-[#27272a] flex justify-between items-center bg-gray-50/50 dark:bg-[#18181b]/50">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Announcement</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-[#27272a] rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in slide-in-from-bottom-5">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Published!</h4>
                            <p className="text-gray-500 dark:text-gray-400">Your announcement is now live for all users.</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                    placeholder="e.g., New Feature Alert!"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                                    placeholder="Briefly describe the announcement..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Announcement Image</label>
                                <div className="border border-dashed border-gray-300 dark:border-[#27272a] rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#18181b] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {imageFile ? (
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                            <CheckCircle size={20} />
                                            <span className="text-sm font-medium truncate max-w-[200px]">{imageFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <Upload size={24} />
                                            <span className="text-sm">Click to upload image</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Button Text</label>
                                    <input
                                        type="text"
                                        name="buttonText"
                                        value={formData.buttonText}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                        placeholder="e.g., Learn More"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Button Link</label>
                                    <input
                                        type="text"
                                        name="buttonLink"
                                        value={formData.buttonLink}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                        placeholder="/path or https://"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 bg-white dark:bg-[#18181b] text-gray-700 dark:text-gray-300 font-bold rounded-xl border border-gray-200 dark:border-[#27272a] hover:bg-gray-50 dark:hover:bg-[#27272a] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                    <span>Publish</span>
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CreateAnnouncementModal;
