import React from 'react';
import Sidebar from '../../components/Sidebar';

const AutoPilotAgent = () => {
    return (
        <div className="flex h-screen w-screen bg-[#FAFAFA] font-sans text-gray-900 overflow-hidden selection:bg-pink-200 selection:text-pink-900 dark:bg-[#090909] dark:text-gray-100 dark:selection:bg-pink-900 dark:selection:text-pink-100 transition-colors duration-300">
            <Sidebar activePage="autopilot" />
            <main className="flex-1 flex flex-col relative h-full">
                <div className="flex-1 overflow-y-auto w-full flex items-center justify-center">
                    <h1 className="text-2xl font-bold text-gray-800">hello from auto agent</h1>
                </div>
            </main>
        </div>
    );
};

export default AutoPilotAgent;
