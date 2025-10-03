import React from 'react';

interface TabNavigationProps {
  activeTab: 'export' | 'schedule' | 'templates';
  onTabChange: (tab: 'export' | 'schedule' | 'templates') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => onTabChange('export')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'export'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Export Now
        </button>
        <button
          onClick={() => onTabChange('schedule')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'schedule'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Scheduled Exports
        </button>
        <button
          onClick={() => onTabChange('templates')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'templates'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Export Templates
        </button>
      </nav>
    </div>
  );
};
