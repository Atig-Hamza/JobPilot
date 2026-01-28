import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AnnouncementPopup = ({ isOpen, onClose, announcement }) => {
    if (!announcement) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-[#18181b] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative border border-white/20 dark:border-gray-800"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-gray-800 dark:text-white rounded-full transition-all backdrop-blur-md"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-200 dark:bg-gray-800">
                            {announcement.image ? (
                                <img
                                    src={announcement.image}
                                    alt={announcement.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span>No Image</span>
                                </div>
                            )}
                        </div>

                        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                                {announcement.title}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                                {announcement.description}
                            </p>

                            {announcement.buttonText && (
                                <a
                                    href={announcement.buttonLink || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black text-lg font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all group w-fit"
                                    onClick={(e) => {
                                        if (!announcement.buttonLink) {
                                            e.preventDefault();
                                        }
                                        onClose();
                                    }}
                                >
                                    {announcement.buttonText}
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                                </a>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AnnouncementPopup;
