import React from 'react';

export const PublishingTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Publishing Workflow
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Require approval before publishing
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="require-approval"
                className="sr-only peer"
                defaultChecked
              />
              <div className="w-11 h-6 bg-[#4ECDC4] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:translate-x-full"></div>
              <span className="sr-only">
                Require approval before publishing
              </span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Auto-publish to Library
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="auto-publish-library"
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              <span className="sr-only">Auto-publish to Library</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Notify reviewers on submission
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="notify-reviewers"
                className="sr-only peer"
                defaultChecked
              />
              <div className="w-11 h-6 bg-[#4ECDC4] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:translate-x-full"></div>
              <span className="sr-only">Notify reviewers on submission</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-base font-medium text-gray-900 mb-4">
          Approval Roles
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">
              Content Manager
            </span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Primary
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">
              Department Head
            </span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Secondary
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
