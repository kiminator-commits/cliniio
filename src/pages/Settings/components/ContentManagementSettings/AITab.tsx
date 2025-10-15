import React from 'react';

export const AITab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          AI Content Suggestions
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Enable AI suggestions</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="enable-ai-suggestions"
                className="sr-only peer"
                defaultChecked
              />
              <div className="w-11 h-6 bg-[#4ECDC4] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:translate-x-full"></div>
              <span className="sr-only">Enable AI suggestions</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Suggest based on content gaps
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="suggest-content-gaps"
                className="sr-only peer"
                defaultChecked
              />
              <div className="w-11 h-6 bg-[#4ECDC4] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:translate-x-full"></div>
              <span className="sr-only">Suggest based on content gaps</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Analyze user search patterns
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="analyze-search-patterns"
                className="sr-only peer"
                defaultChecked
              />
              <div className="w-11 h-6 bg-[#4ECDC4] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:translate-x-full"></div>
              <span className="sr-only">Analyze user search patterns</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-base font-medium text-gray-900 mb-4">
          AI Configuration
        </h4>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="confidence-threshold"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Suggestion Confidence Threshold
            </label>
            <select
              id="confidence-threshold"
              defaultValue="0.8"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="0.7">70% - Balanced</option>
              <option value="0.8">80% - Recommended</option>
              <option value="0.9">90% - High Quality</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
