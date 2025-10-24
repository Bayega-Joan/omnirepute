
import React from 'react';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface ErrorDisplayProps {
    message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
    return (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
            <div className="flex items-center">
                <ExclamationTriangleIcon className="w-6 h-6 mr-3 text-red-400" />
                <div>
                    <strong className="font-bold">An error occurred</strong>
                    <span className="block sm:inline ml-2">{message}</span>
                </div>
            </div>
        </div>
    );
};

export default ErrorDisplay;
