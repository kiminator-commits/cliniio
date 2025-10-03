import React from 'react';
import { TabType } from '@/pages/Inventory/types';

export interface InventoryTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tabs?: TabType[];
}

export const InventoryTabs: React.FC<InventoryTabsProps> = ({
  activeTab,
  onTabChange,
  tabs = ['tools', 'supplies', 'equipment'],
}) => {
  return (
    <div className="mb-4">
      <div className="flex space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            aria-label={`Switch to ${tab} tab`}
            aria-pressed={activeTab === tab}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};
