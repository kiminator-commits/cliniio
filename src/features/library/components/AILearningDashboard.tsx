import React from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiBrain, mdiTrendingUp, mdiTarget, mdiClock } from '@mdi/js';

interface LearningInsights {
  learning_efficiency_score: number;
  next_learning_milestone: string;
  optimal_study_duration: number;
  ai_confidence_score: number;
  skill_gaps?: string[];
}

interface ContentRecommendation {
  id: string;
  recommendation_score: number;
  confidence_level: number;
  recommendation_reason: string;
}

interface AILearningDashboardProps {
  learningInsights: LearningInsights;
  contentRecommendations: ContentRecommendation[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const AILearningDashboard: React.FC<AILearningDashboardProps> = ({
  learningInsights,
  contentRecommendations,
  isLoading,
  onRefresh,
}) => {
  if (!learningInsights) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-[#4ECDC4]/10 to-[#3db8b0]/10 rounded-2xl p-6 mb-8 border border-[#4ECDC4]/20"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4ECDC4] rounded-full flex items-center justify-center">
            <Icon path={mdiBrain} size={1.2} color="white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              AI Learning Insights
            </h3>
            <p className="text-gray-600">
              Personalized learning analytics and recommendations
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3db8b0] transition disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Learning Efficiency */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <Icon path={mdiTrendingUp} size={1} className="text-[#4ECDC4]" />
            <h4 className="font-semibold text-gray-900">Efficiency Score</h4>
          </div>
          <div className="text-2xl font-bold text-[#4ECDC4]">
            {learningInsights.learning_efficiency_score}%
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {learningInsights.learning_efficiency_score >= 80
              ? 'Excellent progress!'
              : learningInsights.learning_efficiency_score >= 60
                ? 'Good progress'
                : learningInsights.learning_efficiency_score >= 40
                  ? 'Keep going!'
                  : 'Getting started'}
          </div>
        </div>

        {/* Optimal Study Time */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <Icon path={mdiClock} size={1} className="text-[#4ECDC4]" />
            <h4 className="font-semibold text-gray-900">Optimal Study Time</h4>
          </div>
          <div className="text-2xl font-bold text-[#4ECDC4]">
            {learningInsights.optimal_study_duration} min
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Recommended session duration
          </div>
        </div>

        {/* Next Milestone */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <Icon path={mdiTarget} size={1} className="text-[#4ECDC4]" />
            <h4 className="font-semibold text-gray-900">Next Milestone</h4>
          </div>
          <div className="text-sm text-gray-900 font-medium leading-tight">
            {learningInsights.next_learning_milestone}
          </div>
        </div>

        {/* AI Confidence */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <Icon path={mdiBrain} size={1} className="text-[#4ECDC4]" />
            <h4 className="font-semibold text-gray-900">AI Confidence</h4>
          </div>
          <div className="text-2xl font-bold text-[#4ECDC4]">
            {Math.round(learningInsights.ai_confidence_score * 100)}%
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Model confidence level
          </div>
        </div>
      </div>

      {/* Skill Gaps */}
      {learningInsights.skill_gaps &&
        learningInsights.skill_gaps.length > 0 && (
          <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border">
            <h4 className="font-semibold text-gray-900 mb-3">
              Identified Skill Gaps
            </h4>
            <div className="flex flex-wrap gap-2">
              {learningInsights.skill_gaps.map((gap: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                >
                  {gap}
                </span>
              ))}
            </div>
          </div>
        )}

      {/* Content Recommendations */}
      {contentRecommendations.length > 0 && (
        <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border">
          <h4 className="font-semibold text-gray-900 mb-3">
            AI Content Recommendations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentRecommendations
              .slice(0, 4)
              .map((rec: ContentRecommendation) => (
                <div key={rec.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      Score: {rec.recommendation_score}%
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(rec.confidence_level * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {rec.recommendation_reason}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
