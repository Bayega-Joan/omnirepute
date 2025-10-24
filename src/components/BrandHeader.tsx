
import React from 'react';
import { ChartBarIcon } from './icons/ChartBarIcon';

const BrandHeader: React.FC = () => {
    return (
        <header className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-3 mb-2">
                <ChartBarIcon className="w-8 h-8 text-cyan-400" />
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                    OmniRepute
                </h1>
            </div>
            <p className="text-lg text-gray-400">
                Leverage AI to gain deep insights about your brand's performance.
            </p>
        </header>
    );
};

export default BrandHeader;
