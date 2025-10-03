import React from 'react';

interface PerformanceMetricsContentProps {
  onBack: () => void;
  expandedMetrics: Set<string>;
  onToggleMetricSection: (sectionName: string) => void;
}

export const PerformanceMetricsContent: React.FC<PerformanceMetricsContentProps> = ({
  onBack,
  expandedMetrics,
  onToggleMetricSection,
}) => {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
          >
            ← Back
          </button>
          <div>
            <h3 className="font-medium text-gray-900">Performance Metrics</h3>
            <p className="text-xs text-gray-500">
              Understanding your dashboard metrics
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 text-lg">
            Dashboard Metrics Explained
          </h4>

          <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleMetricSection('time-savings')}
              className="w-full p-3 text-left flex items-center justify-between hover:bg-blue-100 transition-colors"
            >
              <h5 className="font-medium text-blue-800">Time Savings</h5>
              <span className="text-blue-600 text-lg transition-transform duration-200">
                {expandedMetrics.has('time-savings') ? '−' : '+'}
              </span>
            </button>
            {expandedMetrics.has('time-savings') && (
              <div className="px-3 pb-3">
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Shows hours saved through AI assistance</li>
                  <li>• Daily and monthly tracking</li>
                  <li>• Compares AI vs. manual task completion</li>
                  <li>• Real-time updates as tasks complete</li>
                </ul>
              </div>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleMetricSection('cost-savings')}
              className="w-full p-3 text-left flex items-center justify-between hover:bg-green-100 transition-colors"
            >
              <h5 className="font-medium text-green-800">Cost Savings</h5>
              <span className="text-green-600 text-lg transition-transform duration-200">
                {expandedMetrics.has('cost-savings') ? '−' : '+'}
              </span>
            </button>
            {expandedMetrics.has('cost-savings') && (
              <div className="px-3 pb-3">
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Calculates dollar impact of AI efficiency</li>
                  <li>• Includes error prevention and compliance savings</li>
                  <li>• Uses facility-specific hourly rates</li>
                  <li>• Projects annual savings with growth factors</li>
                </ul>
              </div>
            )}
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleMetricSection('team-performance')}
              className="w-full p-3 text-left flex items-center justify-between hover:bg-purple-100 transition-colors"
            >
              <h5 className="font-medium text-purple-800">Team Performance</h5>
              <span className="text-purple-600 text-lg transition-transform duration-200">
                {expandedMetrics.has('team-performance') ? '−' : '+'}
              </span>
            </button>
            {expandedMetrics.has('team-performance') && (
              <div className="px-3 pb-3">
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Skills: Based on AI task completion rates</li>
                  <li>• Inventory: Real-time accuracy from actual data</li>
                  <li>• Sterilization: Performance from cycle data</li>
                  <li>• Helps identify training needs</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
