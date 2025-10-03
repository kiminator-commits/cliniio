import React from 'react';

interface AIFeaturesContentProps {
  onBack: () => void;
}

export const AIFeaturesContent: React.FC<AIFeaturesContentProps> = ({
  onBack,
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
            <h3 className="font-medium text-gray-900">AI Features</h3>
            <p className="text-xs text-gray-500">
              How AI improves your workflow
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 text-lg">
            AI-Powered Assistance
          </h4>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h5 className="font-medium text-blue-800 mb-2">
              Smart Task Generation
            </h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• AI creates relevant daily tasks</li>
              <li>• Adapts to your facility's needs</li>
              <li>• Suggests optimal task sequences</li>
              <li>• Learns from your preferences</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="font-medium text-green-800 mb-2">
              Performance Optimization
            </h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Real-time efficiency monitoring</li>
              <li>• Predictive maintenance alerts</li>
              <li>• Resource optimization suggestions</li>
              <li>• Compliance risk mitigation</li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h5 className="font-medium text-purple-800 mb-2">
              Intelligent Insights
            </h5>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Data-driven recommendations</li>
              <li>• Trend analysis and forecasting</li>
              <li>• Best practice suggestions</li>
              <li>• Continuous improvement tips</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
