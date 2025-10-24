import React from 'react';
import { DataSource } from '../types';

const sources: { id: DataSource; name: string }[] = [
    { id: 'all', name: 'All Sources' },
    { id: 'reddit', name: 'Reddit' },
    { id: 'gdelt', name: 'GDELT' },
    { id: 'twitter', name: 'Twitter' },
    { id: 'youtube', name: 'YouTube' },
];

interface SourceFilterProps {
    selectedSource: DataSource;
    onSelectSource: (source: DataSource) => void;
    isLoading: boolean;
}

const SourceFilter: React.FC<SourceFilterProps> = ({ selectedSource, onSelectSource, isLoading }) => {
    return (
        <div className="flex justify-center flex-wrap gap-2 my-6">
            {sources.map((source) => (
                <button
                    key={source.id}
                    onClick={() => onSelectSource(source.id)}
                    disabled={isLoading}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500
                        ${
                            selectedSource === source.id
                                ? 'bg-cyan-600 text-white shadow-md'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }
                        ${isLoading ? 'cursor-not-allowed opacity-50' : ''}
                    `}
                    aria-pressed={selectedSource === source.id}
                >
                    {source.name}
                </button>
            ))}
        </div>
    );
};

export default SourceFilter;
