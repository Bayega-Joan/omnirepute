
import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Connecting to data streams...",
    "Analyzing social media sentiment...",
    "Scanning news articles and blogs...",
    "Compiling key insights...",
    "Formulating strategic recommendations...",
    "Almost there..."
];

const LoadingState: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-center p-8 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex justify-center items-center mb-4">
                <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Generating Report</h2>
            <p className="text-gray-400 mt-2 transition-opacity duration-500">{loadingMessages[messageIndex]}</p>
        </div>
    );
};

export default LoadingState;
