import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = ({ onComplete }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 2000;
        const start = Date.now();

        const timer = setInterval(() => {
            const timePassed = Date.now() - start;
            if (timePassed >= duration) {
                clearInterval(timer);
                setCount(100);
                setIsLoading(false);
                setTimeout(() => onComplete && onComplete(), 800);
            } else {
                setCount(Math.floor((timePassed / duration) * 100));
            }
        }, 20);
        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <AnimatePresence mode="wait">
            {isLoading && (
                <motion.div
                    className="fixed inset-0 z-[9999] bg-[#0a0a0a] dark:bg-white text-white dark:text-black flex flex-col justify-end items-end p-10 md:p-20"
                    exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
                >
                    <div className="overflow-hidden">
                        <motion.h1 
                            className="text-[12rem] leading-none font-thin tracking-tighter"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            {count}%
                        </motion.h1>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
export default Preloader;