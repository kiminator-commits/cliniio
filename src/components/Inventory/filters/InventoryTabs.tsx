import React from 'react';
import { TabType } from '@/pages/Inventory/types';

interface InventoryTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const InventoryTabs: React.FC<InventoryTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs: TabType[] = ['tools', 'supplies', 'equipment', 'officeHardware'];

  return (
    <div className="flex space-x-4 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default InventoryTabs;
