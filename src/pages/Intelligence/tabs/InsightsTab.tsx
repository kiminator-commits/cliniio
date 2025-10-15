import React from 'react';
import Icon from '@mdi/react';
import {
  mdiLightningBolt,
  mdiTarget,
  mdiRocket,
  mdiArrowRight,
  mdiInformation,
} from '@mdi/js';
import { IntelligenceSummary } from '../utils/intelligenceTypes';
import {
  IntelligenceRecommendation,
  OptimizationTip,
} from '../../../services/analyticsService';

interface InsightsTabProps {
  summary?: IntelligenceSummary | null;
  recommendations?: IntelligenceRecommendation[];
  optimizationTips?: OptimizationTip[];
  insightsSummary?: Record<string, unknown> | null;
}

export default function InsightsTab({
  summary,
  recommendations = [],
  optimizationTips = [],
  insightsSummary,
}: InsightsTabProps) {
  // Helper function for priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  // Use data from props or fallback to empty arrays
  const summaryData = (insightsSummary as Record<string, unknown>) || {
    totalRecommendations: 0,
    criticalItems: 0,
    estimatedSavings: 0,
    estimatedTimeSavings: 0,
  };

  const recs = recommendations || [];

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
          <p className="text-gray-600">No insights data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actionable Insights Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
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
              {summaryData.totalRecommendations}
            </div>
            <div className="text-sm text-blue-700">Total Recommendations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {summaryData.criticalItems}
            </div>
            <div className="text-sm text-red-700">Critical Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${summaryData.estimatedSavings.toLocaleString()}
            </div>
            <div className="text-sm text-green-700">Estimated Savings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {summaryData.estimatedTimeSavings}h
            </div>
            <div className="text-sm text-purple-700">Time Savings</div>
          </div>
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Icon path={mdiTarget} size={1.5} className="text-green-600 mr-2" />
          Smart Recommendations
        </h3>
        <div className="space-y-4">
          {recs.slice(0, 5).map((rec, index) => (
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
                        {rec.impact.costSavings.toLocaleString()}
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
                  {rec.actionItems.slice(0, 3).map((action, idx) => (
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
