
import React, { useState, useCallback } from 'react';
import { AnalysisResult, DataSource } from './types';
import { fetchBrandAnalysis } from './services/geminiService';
import BrandHeader from './components/BrandHeader';
import BrandInputForm from './components/BrandInputForm';
import LoadingState from './components/LoadingState';
import ErrorDisplay from './components/ErrorDisplay';
import AnalysisDisplay from './components/AnalysisDisplay';
import SourceFilter from './components/SourceFilter';
import { DocumentMagnifyingGlassIcon } from './components/icons/DocumentMagnifyingGlassIcon';

const App: React.FC = () => {
    const [brandName, setBrandName] = useState<string>('Tesla');
    const [selectedSource, setSelectedSource] = useState<DataSource>('all');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = useCallback(async (name: string) => {
        if (!name.trim()) {
            setError('Please enter a brand name.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await fetchBrandAnalysis(name, selectedSource);
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedSource]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-5xl mx-auto">
                <BrandHeader />
                <BrandInputForm
                    brandName={brandName}
                    setBrandName={setBrandName}
                    onAnalyze={handleAnalyze}
                    isLoading={isLoading}
                />
                <SourceFilter 
                    selectedSource={selectedSource}
                    onSelectSource={setSelectedSource}
                    isLoading={isLoading}
                />

                <main className="mt-6">
                    {isLoading && <LoadingState />}
                    {error && <ErrorDisplay message={error} />}
                    {analysisResult && !isLoading && <AnalysisDisplay result={analysisResult} />}
                    {!isLoading && !error && !analysisResult && (
                        <div className="text-center p-8 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
                            <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-500" />
                            <h3 className="mt-2 text-lg font-medium text-white">Ready for Analysis</h3>
                            <p className="mt-1 text-sm text-gray-400">Enter a brand and select your data sources to generate a reputation report.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;
