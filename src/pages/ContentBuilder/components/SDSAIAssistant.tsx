import React from 'react';
import Icon from '@mdi/react';
import {
  mdiRobot,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiClock,
  mdiRefresh,
} from '@mdi/js';
import { useSDSAnalysis } from '../hooks/useSDSAnalysis';

const SDSAIAssistant: React.FC = () => {
  const { analysis, loading, error, analyzeCoverage } = useSDSAnalysis();

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-700">Analyzing your SDS sheet coverage...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Icon path={mdiAlertCircle} size={1.2} className="text-red-600" />
          <h3 className="text-sm font-medium text-red-900">Analysis Error</h3>
        </div>
        <p className="text-sm text-red-700 mb-4">{error}</p>
        <button
          onClick={analyzeCoverage}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <Icon path={mdiRefresh} size={1} className="mr-2" />
          Retry Analysis
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No analysis data available</p>
      </div>
    );
  }

  const {
    totalChemicals,
    existingSDSSheets: existingSDSSheets,
    missingSDSSheets: missingSDSSheets,

    coveragePercentage,
    missingChemicals,
    priorityRecommendations,
  } = analysis;

  const highPriorityMissing = missingChemicals.filter(
    (c) => c.priority === 'high'
  ).length;
  const mediumPriorityMissing = missingChemicals.filter(
    (c) => c.priority === 'medium'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Icon path={mdiRobot} size={1.2} className="text-blue-600" />
          <h3 className="text-sm font-medium text-blue-900">
            Safety Data Sheet (SDS) Compliance Assistant
          </h3>
        </div>
        <p className="text-sm text-blue-700">
          AI-powered analysis of your chemical inventory vs. SDS sheet coverage
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Chemicals
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalChemicals}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Icon
                path={mdiAlertCircle}
                size={1.5}
                className="text-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Coverage</p>
              <p className="text-2xl font-bold text-gray-900">
                {coveragePercentage}%
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <Icon
                path={mdiCheckCircle}
                size={1.5}
                className="text-green-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Coverage Breakdown
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Existing SDS Sheets</span>
            <span className="text-sm font-medium text-green-600">
              {existingSDSSheets}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Missing SDS Sheets</span>
            <span className="text-sm font-medium text-red-600">
              {missingSDSSheets}
            </span>
          </div>
          <div className="border-t pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                High Priority Missing
              </span>
              <span className="text-sm font-bold text-red-600">
                {highPriorityMissing}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                Medium Priority Missing
              </span>
              <span className="text-sm font-bold text-orange-600">
                {mediumPriorityMissing}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Recommendations */}
      {priorityRecommendations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Priority Recommendations
          </h4>
          <div className="space-y-3">
            {priorityRecommendations.slice(0, 5).map((rec, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {rec.chemicalName}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      rec.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : rec.priority === 'medium'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {rec.priority} priority
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{rec.reason}</p>
                <div className="flex items-center space-x-2">
                  <Icon path={mdiClock} size={0.8} className="text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Est. {rec.estimatedTimeToCreate} min to create
                  </span>
                </div>
              </div>
            ))}
          </div>
          {priorityRecommendations.length > 5 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              +{priorityRecommendations.length - 5} more recommendations
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={analyzeCoverage}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Icon path={mdiRefresh} size={1} className="mr-2" />
          Refresh Analysis
        </button>
        <button className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Icon path={mdiRobot} size={1} className="mr-2" />
          Get AI Suggestions
        </button>
      </div>
    </div>
  );
};

export default SDSAIAssistant;
