import React from 'react';
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';

interface ContentBuilderTabProps {
  onLaunchBuilder: () => void;
}

export const ContentBuilderTab: React.FC<ContentBuilderTabProps> = ({
  onLaunchBuilder,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Content Builder
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Launch Content Builder
            </span>
            <button
              onClick={onLaunchBuilder}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4ECDC4] hover:bg-[#3db8b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4] transition-colors"
            >
              <Icon path={mdiPlus} size={1} className="mr-2" />
              Launch Builder
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Enable content creation
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="enable-content-creation"
                className="sr-only peer"
                defaultChecked
              />
              <div className="w-11 h-6 bg-[#4ECDC4] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:translate-x-full"></div>
              <span className="sr-only">Enable content creation</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Auto-save drafts</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="auto-save-drafts"
                className="sr-only peer"
                defaultChecked
              />
              <div className="w-11 h-6 bg-[#4ECDC4] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:translate-x-full"></div>
              <span className="sr-only">Auto-save drafts</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-base font-medium text-gray-900 mb-4">
          Recent Activity
        </h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Course published
              </p>
              <p className="text-xs text-gray-600">
                Sterilization Safety Protocols
              </p>
            </div>
            <span className="text-xs text-gray-500">2h ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Draft saved</p>
              <p className="text-xs text-gray-600">
                Inventory Management Guide
              </p>
            </div>
            <span className="text-xs text-gray-500">1d ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};
