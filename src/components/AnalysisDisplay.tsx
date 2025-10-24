
import React from 'react';
import { AnalysisResult } from '../types';
import ScoreCard from './ScoreCard';
import SectionCard from './SectionCard';
import { SparklesIcon } from './icons/SparklesIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { HeartIcon } from './icons/HeartIcon';
import { NoSymbolIcon } from './icons/NoSymbolIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';

interface AnalysisDisplayProps {
    result: AnalysisResult;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <ScoreCard score={result.reputationScore} rationale={result.scoreRationale} />
                <SectionCard title="Key Insights" icon={<SparklesIcon />}>
                    <ul className="space-y-3">
                        {result.keyInsights.map((insight, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-cyan-400 mr-3 mt-1">&#10148;</span>
                                <span>{insight}</span>
                            </li>
                        ))}
                    </ul>
                </SectionCard>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <SectionCard title="Sentiment Summary" icon={<HeartIcon />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-lg text-green-400 flex items-center mb-2">
                                <HeartIcon className="w-5 h-5 mr-2" /> What's Loved
                            </h4>
                            <ul className="space-y-2">
                                {result.whatUsersLove.map((item, index) => (
                                    <li key={index} className="flex items-start text-gray-300">
                                        <span className="text-green-400 mr-2 mt-1">&#43;</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg text-red-400 flex items-center mb-2">
                                <NoSymbolIcon className="w-5 h-5 mr-2" /> What's Not
                            </h4>
                            <ul className="space-y-2">
                                {result.whatUsersHate.map((item, index) => (
                                    <li key={index} className="flex items-start text-gray-300">
                                        <span className="text-red-400 mr-2 mt-1">&#8722;</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Improvement Strategies" icon={<LightBulbIcon />}>
                    <div className="space-y-4">
                        {result.improvementStrategies.map((strategy, index) => (
                            <div key={index} className="p-3 bg-gray-900 rounded-md">
                                <h4 className="font-semibold text-cyan-300">{strategy.title}</h4>
                                <p className="text-gray-400 text-sm mt-1">{strategy.description}</p>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                <SectionCard title="Complaint Response Suggestions" icon={<ChatBubbleLeftRightIcon />}>
                    <div className="space-y-4">
                        {result.complaintResponses.map((response, index) => (
                            <div key={index} className="p-3 bg-gray-900 rounded-md border-l-2 border-cyan-500">
                                <p className="font-semibold text-gray-300 italic">" {response.complaint} "</p>
                                <p className="text-cyan-300 mt-2"><strong className="text-gray-400 font-medium">Suggested Response:</strong> {response.suggestedResponse}</p>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>
        </div>
    );
};

export default AnalysisDisplay;
