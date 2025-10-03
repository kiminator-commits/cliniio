import React from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import {
  mdiLightbulb,
  mdiRefresh,
  mdiClock,
  mdiAccount,
  mdiSchool,
} from '@mdi/js';
import { ContentItem } from '../libraryTypes';

interface AISuggestionScore {
  content: ContentItem;
  score: number;
  priority: 'low' | 'medium' | 'high';
  reasoning: string[];
  category: string;
  skillLevel: string;
  timeline: string;
  status: string;
  source: string;
  showNewOnly: boolean;
  contentId: string;
  reasons: string[];
}

interface AISuggestionInsightsProps {
  suggestions: ContentItem[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
}

const AISuggestionInsights: React.FC<AISuggestionInsightsProps> = ({
  suggestions,
  isLoading,
  error,
  onRefresh,
}) => {
  const [insights, setInsights] = React.useState<AISuggestionScore[]>([]);
  const [loadingInsights, setLoadingInsights] = React.useState(false);

  const loadInsights = React.useCallback(async () => {
    if (suggestions.length === 0) return;

    setLoadingInsights(true);
    try {
      // Mock data for now - these methods don't exist yet

      const scoredSuggestions = suggestions.map((content) => {
        // Mock score calculation for now
        const score: AISuggestionScore = {
          content,
          score: Math.random() * 100,
          priority:
            Math.random() > 0.7
              ? 'high'
              : Math.random() > 0.4
                ? 'medium'
                : 'low',
          reasoning: [
            'Based on user profile analysis',
            'Matches current learning needs',
          ],
          category: content.category || 'general',
          skillLevel: 'intermediate',
          timeline: 'this_week',
          status: 'active',
          source: 'ai_recommendation',
          showNewOnly: false,
          contentId: content.id,
          reasons: ['Relevant to current role', 'Addresses skill gaps'],
        };
        return score;
      });

      setInsights(scoredSuggestions);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  }, [suggestions]);

  React.useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-red-800">
          <Icon path={mdiLightbulb} size={1} />
          <span className="font-medium">AI Suggestions Error</span>
        </div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading || loadingInsights) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-blue-800">
          <Icon path={mdiLightbulb} size={1} />
          <span className="font-medium">Analyzing Your Profile...</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-blue-600 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Generating personalized recommendations</span>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon path={mdiLightbulb} size={1.2} className="text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50"
        >
          <Icon path={mdiRefresh} size={0.8} />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const suggestion = suggestions.find(
            (s) => s.id === insight.contentId
          );
          if (!suggestion) return null;

          return (
            <motion.div
              key={insight.contentId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-4 border border-purple-100 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {suggestion.title}
                </h4>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(insight.priority)}`}
                >
                  {insight.priority} priority
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Icon path={mdiSchool} size={0.7} />
                  <span>{suggestion.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon path={mdiClock} size={0.7} />
                  <span>{suggestion.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon path={mdiAccount} size={0.7} />
                  <span>{suggestion.level}</span>
                </div>
              </div>

              {insight.reasons.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">
                    Why this was recommended:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {insight.reasons.slice(0, 3).map((reason, reasonIndex) => (
                      <li key={reasonIndex} className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Relevance Score: {insight.score}/100</span>
                  <span>+{suggestion.points} points</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
        <p className="text-sm text-purple-700">
          <strong>How it works:</strong> Our AI analyzes your role, department,
          learning history, and performance to suggest the most relevant content
          for your professional development.
        </p>
      </div>
    </motion.div>
  );
};

export default AISuggestionInsights;
