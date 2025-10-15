import React from 'react';

export const WorkflowTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Content Workflow
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Enable draft review workflow
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="enable-draft-review"
                className="sr-only peer"
                defaultChecked
              />
              <div className="w-11 h-6 bg-[#4ECDC4] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:translate-x-full"></div>
              <span className="sr-only">Enable draft review workflow</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Auto-save drafts every 5 minutes
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="auto-save-drafts-5min"
                className="sr-only peer"
                defaultChecked
              />
              <div className="w-11 h-6 bg-[#4ECDC4] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:translate-x-full"></div>
              <span className="sr-only">Auto-save drafts every 5 minutes</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
