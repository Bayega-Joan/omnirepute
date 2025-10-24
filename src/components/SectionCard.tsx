
import React from 'react';

interface SectionCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg h-full">
            <div className="flex items-center mb-4">
                <span className="text-cyan-400 mr-3">{React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}</span>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
            </div>
            <div className="text-gray-300">
                {children}
            </div>
        </div>
    );
};

export default SectionCard;
