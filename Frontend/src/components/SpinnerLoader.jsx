import React from 'react';

const SpinnerLoader = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-950 z-[9999]">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800 opacity-25"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 border-r-pink-500 animate-spin"></div>
            </div>
        </div>
    );
};

export default SpinnerLoader;
