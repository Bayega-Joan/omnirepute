export type DataSource = 'all' | 'reddit' | 'gdelt' | 'twitter' | 'youtube';

export interface AnalysisResult {
  reputationScore: number;
  scoreRationale: string;
  keyInsights: string[];
  improvementStrategies: {
    title: string;
    description: string;
  }[];
  whatUsersLove: string[];
  whatUsersHate: string[];
  complaintResponses: {
    complaint: string;
    suggestedResponse: string;
  }[];
}
