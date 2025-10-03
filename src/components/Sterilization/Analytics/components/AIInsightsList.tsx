import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import {
  mdiBrain,
  mdiChartLine,
  mdiShield,
  mdiCog,
  mdiAlertCircle,
  mdiTrendingUp,
  mdiEye,
  mdiEyeOff,
  mdiLightbulb,
  mdiClock,
} from '@mdi/js';
import { SterilizationAIInsight } from '@/types/sterilizationAITypes';

interface AIInsightsListProps {
  insights: SterilizationAIInsight[];
  filteredInsights: SterilizationAIInsight[];
  isLoading: boolean;
  expandedInsights: Set<string>;
  onToggleInsightExpansion: (insightId: string) => void;
}

const AIInsightsList: React.FC<AIInsightsListProps> = ({
  filteredInsights,
  isLoading,
  expandedInsights,
  onToggleInsightExpansion,
}) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'cycle_optimization':
        return mdiChartLine;
      case 'quality_assurance':
        return mdiShield;
      case 'maintenance_prediction':
        return mdiCog;
      case 'compliance_alert':
        return mdiAlertCircle;
      case 'efficiency_improvement':
        return mdiTrendingUp;
      default:
        return mdiBrain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'cycle_optimization':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'quality_assurance':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'maintenance_prediction':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'compliance_alert':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'efficiency_improvement':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading AI insights...</span>
      </div>
    );
  }

  if (filteredInsights.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Icon path={mdiBrain} size={3} className="mx-auto mb-3 text-gray-300" />
        <p>No insights available for the selected filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Icon path={mdiBrain} size={1.2} className="text-purple-600" />
        AI-Generated Insights ({filteredInsights.length})
      </h3>

      <div className="space-y-4">
        {filteredInsights.map((insight) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-lg overflow-hidden ${getInsightColor(insight.type)}`}
          >
            {/* Insight Header */}
            <div
              className="p-4 cursor-pointer hover:bg-opacity-75 transition-colors"
              onClick={() => onToggleInsightExpansion(insight.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleInsightExpansion(insight.id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-expanded={expandedInsights.has(insight.id)}
              aria-label={`Toggle ${insight.title} details`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Icon
                    path={getInsightIcon(insight.type)}
                    size={1.5}
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-800">
                        {insight.title}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(insight.priority || 'medium')}`}
                      >
                        {(insight.priority || 'medium').toUpperCase()}
                      </span>
                      {insight.actionable === true && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">
                          Actionable
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">
                      {insight.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Icon path={mdiBrain} size={0.8} />
                        {Math.round((insight.confidence || 0) * 100)}%
                        confidence
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon path={mdiClock} size={0.8} />
                        {new Date(
                          insight.created_at || insight.timestamp
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Icon
                  path={expandedInsights.has(insight.id) ? mdiEyeOff : mdiEye}
                  size={1.2}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                />
              </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {expandedInsights.has(insight.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t bg-white bg-opacity-50"
                >
                  <div className="p-4 space-y-4">
                    {/* Recommendations */}
                    {insight.recommendations.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Icon
                            path={mdiLightbulb}
                            size={1}
                            className="text-yellow-500"
                          />
                          Recommendations
                        </h5>
                        <ul className="space-y-2">
                          {insight.recommendations.map(
                            (rec: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm text-gray-600"
                              >
                                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                                {rec}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Data Details */}
                    {insight.data && Object.keys(insight.data).length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">
                          Data Details
                        </h5>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <pre className="text-xs text-gray-600 overflow-x-auto">
                            {JSON.stringify(insight.data || {}, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Take Action
                      </button>
                      <button className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors">
                        Dismiss
                      </button>
                      <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                        Schedule Follow-up
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AIInsightsList;
