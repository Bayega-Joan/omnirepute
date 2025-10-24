
import React from 'react';
import { ChartBarIcon } from './icons/ChartBarIcon';

const BrandHeader: React.FC = () => {
    return (
        <header className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-3 mb-2">
                <ChartBarIcon className="w-8 h-8 text-cyan-400 hover-lift" />
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight gradient-text">
                    OmniRepute
                </h1>
            </div>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Leverage AI to gain deep insights about your brand's performance across multiple data sources.
            </p>
        </header>
    );
};

export default BrandHeader;
