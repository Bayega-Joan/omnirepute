
import React from 'react';

interface BrandInputFormProps {
    brandName: string;
    setBrandName: (name: string) => void;
    onAnalyze: (name: string) => void;
    isLoading: boolean;
}

const BrandInputForm: React.FC<BrandInputFormProps> = ({ brandName, setBrandName, onAnalyze, isLoading }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAnalyze(brandName);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2 items-center bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-2 shadow-lg">
                <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Enter a brand name (e.g., Tesla, Apple)"
                    className="w-full flex-grow bg-transparent text-lg text-white placeholder-gray-500 focus:outline-none px-4 py-2"
                    aria-label="Brand Name"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                        </>
                    ) : (
                        'Analyze Brand'
                    )}
                </button>
            </div>
        </form>
    );
};

export default BrandInputForm;
