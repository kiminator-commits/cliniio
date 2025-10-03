import React from 'react';
import { Icon } from '@mdi/react';
import { mdiLightningBolt, mdiTarget, mdiRocket, mdiArrowRight } from '@mdi/js';
import {
  IntelligenceRecommendation,
  OptimizationTip,
} from './utils/intelligenceTypes';

interface IntelligenceInsightsTabProps {
  insightsSummary: Record<string, unknown>;
  recommendations: IntelligenceRecommendation[];
  optimizationTips: OptimizationTip[];
  getPriorityColor: (priority: string) => string;
}

export const IntelligenceInsightsTab: React.FC<
  IntelligenceInsightsTabProps
> = ({
  insightsSummary,
  recommendations,
  optimizationTips,
  getPriorityColor,
}) => {
  return (
    <div className="space-y-6">
      {/* Actionable Insights Summary */}
      {insightsSummary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Icon
              path={mdiLightningBolt}
              size={2}
              className="text-blue-600 mr-3"
            />
            <h3 className="text-xl font-bold text-blue-900">
              Actionable Insights Summary
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {String(insightsSummary?.totalRecommendations || 0)}
              </div>
              <div className="text-sm text-blue-700">Total Recommendations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {String(insightsSummary?.criticalItems || 0)}
              </div>
              <div className="text-sm text-red-700">Critical Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${(insightsSummary?.estimatedSavings || 0).toLocaleString()}
              </div>
              <div className="text-sm text-green-700">Estimated Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {String(insightsSummary?.estimatedTimeSavings || 0)}h
              </div>
              <div className="text-sm text-purple-700">Time Savings</div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Icon path={mdiTarget} size={1.5} className="text-green-600 mr-2" />
          Smart Recommendations
        </h3>
        <div className="space-y-4">
          {recommendations
            .slice(0, 5)
            .map((rec: IntelligenceRecommendation, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {rec.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {rec.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-500">
                        Timeline: {rec.timeline}
                      </span>
                      <span className="text-gray-500">
                        Confidence: {Math.round(rec.confidence * 100)}%
                      </span>
                      <span className="text-gray-500">
                        Category: {rec.category}
                      </span>
                    </div>
                    {rec.impact.costSavings && (
                      <div className="mt-2 text-sm">
                        <span className="text-green-600 font-medium">
                          💰 Potential savings: $
                          {(rec.impact.costSavings || 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(rec.priority)}`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Action Items:
                  </h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {rec.actionItems
                      .slice(0, 3)
                      .map((action: string, idx: number) => (
                        <li key={idx} className="flex items-center">
                          <Icon
                            path={mdiArrowRight}
                            size={0.8}
                            className="text-blue-500 mr-2"
                          />
                          {action}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Optimization Tips */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Icon path={mdiRocket} size={1.5} className="text-purple-600 mr-2" />
          Optimization Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {optimizationTips.map((tip: OptimizationTip, index: number) => (
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
};
