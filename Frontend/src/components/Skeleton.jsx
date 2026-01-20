import React from 'react';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse bg-gray-200 rounded ${className}`}
            {...props}
        />
    );
};

export const PageSkeleton = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
            <div className="fixed top-0 left-0 right-0 z-[60] bg-pink-100/50 h-10 border-b border-pink-200/50 animate-pulse"></div>
            <nav className="fixed top-14 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                <div className="bg-white/80 backdrop-blur-xl h-14 w-full max-w-5xl rounded-full shadow-sm animate-pulse border border-gray-100 dark:border-gray-800 flex items-center justify-between px-5">
                    <div className="w-24 h-6 bg-gray-200 rounded"></div>
                    <div className="hidden md:flex gap-4">
                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="hidden md:flex gap-4">
                        <div className="w-16 h-8 bg-gray-200 rounded-full"></div>
                        <div className="w-24 h-8 bg-pink-200/50 rounded-full"></div>
                    </div>
                </div>
            </nav>
            <div className="pt-48 pb-20 px-6 flex flex-col items-center text-center max-w-5xl mx-auto z-10 relative">
                <div className="h-32 w-11/12 md:w-3/4 bg-gray-100 rounded-3xl mb-8 animate-pulse"></div>

                <div className="h-16 w-1/2 bg-gray-100 rounded-full mb-12 animate-pulse transform -rotate-2"></div>

                <div className="h-4 w-2/3 bg-gray-50 rounded-lg mb-3 animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-50 rounded-lg mb-12 animate-pulse"></div>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20 w-full">
                    <div className="h-14 w-40 bg-gray-100 rounded-full animate-pulse"></div>
                    <div className="h-14 w-40 bg-gray-800 rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col items-center gap-6 w-full">
                    <div className="h-3 w-32 bg-gray-100 rounded animate-pulse"></div>
                    <div className="flex flex-wrap justify-center gap-8 w-full px-10">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-8 w-24 bg-gray-50 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Skeleton;
