import React, { useState, useEffect } from 'react';
import UserLayout from './components/UserLayout';

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    return isMobile;
};

const AutoPilotAgent = () => {
    const isMobile = useIsMobile();
    return (
        <UserLayout activeMode="autopilot" isMobile={isMobile}>
            <div className="flex-1 overflow-y-auto w-full flex items-center justify-center h-full">
                 <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Hello from Auto Agent</h1>
            </div>
        </UserLayout>
    );
};

export default AutoPilotAgent;
