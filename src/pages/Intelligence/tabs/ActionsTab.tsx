import React from 'react';
import Icon from '@mdi/react';
import {
  mdiExclamation,
  mdiBookOpen,
  mdiRocket,
  mdiArrowRight,
  mdiInformation,
} from '@mdi/js';
import { IntelligenceSummary } from '../utils/intelligenceTypes';
import {
  IntelligenceRecommendation,
  OptimizationTip,
} from '../../../services/analytics';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  estimatedTime: string;
  priority: number;
}

interface ExtendedIntelligenceSummary extends IntelligenceSummary {
  actions?: ActionItem[];
}

interface ActionsTabProps {
  summary?: ExtendedIntelligenceSummary | null;
  recommendations?: IntelligenceRecommendation[];
  optimizationTips?: OptimizationTip[];
}

export default function ActionsTab({
  summary,
  optimizationTips = [],
}: ActionsTabProps) {
  // Helper function to get urgent actions
  const getUrgentActions = () => {
    if (!summary?.actions) return [];
    return summary.actions.filter(
      (action: ActionItem) => action.urgency === 'high'
    );
  };

  // Use optimization tips from props or fallback to empty array
  const tips = optimizationTips || [];

  if (!summary) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <Icon
            path={mdiInformation}
            size={2}
            className="text-gray-400 mx-auto mb-2"
          />
          <p className="text-gray-600">No action items data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Urgent Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Icon
            path={mdiExclamation}
            size={1.5}
            className="text-red-600 mr-2"
          />
          Urgent Actions Required
        </h3>
        <div className="space-y-4">
          {getUrgentActions().map((action, index) => (
            <div
              key={index}
              className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-900">{action.title}</h4>
                  <p className="text-sm text-red-700 mt-1">
                    {action.description}
                  </p>
                </div>
                <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700">
                  Take Action
                </button>
              </div>
            </div>
          ))}
          {getUrgentActions().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No urgent actions required at this time
            </div>
          )}
        </div>
      </div>

      {/* Training Recommendations */}
      {summary.trainingGaps ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Icon
                path={mdiBookOpen}
                size={1.5}
                className="text-blue-600 mr-2"
              />
              Training & Knowledge Gaps
            </h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {summary.trainingGaps?.usersWithGaps?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Total Gaps</div>
            </div>
          </div>

          {summary.trainingGaps?.usersWithGaps &&
          summary.trainingGaps.usersWithGaps.length > 0 ? (
            <div className="space-y-4">
              {summary.trainingGaps.usersWithGaps.map((user, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      {user.userName || 'Unknown User'}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-500">ID: {user.userId}</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Training Required
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-700">
                      Knowledge Gaps:
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {user.recommendedTraining &&
                      user.recommendedTraining.length > 0 ? (
                        user.recommendedTraining.map(
                          (gap: string, gapIndex: number) => (
                            <li key={gapIndex} className="flex items-center">
                              <Icon
                                path={mdiArrowRight}
                                size={0.8}
                                className="mr-2"
                              />
                              {gap}
                            </li>
                          )
                        )
                      ) : (
                        <li className="text-gray-500">
                          No specific gaps identified
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No training gaps identified
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <Icon
              path={mdiInformation}
              size={2}
              className="text-gray-400 mx-auto mb-2"
            />
            <p className="text-gray-600">No training data available</p>
            <p className="text-sm text-gray-500">
              Data will appear here once staff assessments are completed
            </p>
          </div>
        </div>
      )}

      {/* Optimization Tips */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Icon path={mdiRocket} size={1.5} className="text-purple-600 mr-2" />
          Optimization Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900">{tip.title}</h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tip.difficulty === 'easy'
                      ? 'bg-green-100 text-green-800'
                      : tip.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {tip.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{tip.description}</p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Current:</span>
                  <span className="text-gray-600 ml-2">{tip.currentState}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Action:</span>
                  <span className="text-gray-600 ml-2">
                    {tip.recommendedAction}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Expected:</span>
                  <span className="text-gray-600 ml-2">
                    {tip.expectedOutcome}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Effort:</span>
                  <span className="text-gray-600 ml-2">
                    {tip.estimatedEffort}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
