
import React from 'react';

interface ScoreCardProps {
    score: number;
    rationale: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ score, rationale }) => {
    const getScoreColor = (s: number) => {
        if (s >= 75) return 'text-green-400 border-green-500';
        if (s >= 50) return 'text-yellow-400 border-yellow-500';
        return 'text-red-400 border-red-500';
    };

    const colorClasses = getScoreColor(score);

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg text-center">
            <h3 className="text-lg font-medium text-gray-400 mb-2">Reputation Score</h3>
            <div className={`text-7xl font-bold ${colorClasses.split(' ')[0]}`}>
                {score}
            </div>
            <div className={`w-24 h-1 mx-auto mt-3 mb-4 rounded-full ${colorClasses.split(' ')[1].replace('border-', 'bg-')}`}></div>
            <p className="text-gray-300 italic">"{rationale}"</p>
        </div>
    );
};

export default ScoreCard;
