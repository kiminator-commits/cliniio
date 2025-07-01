import React from 'react';

interface InventoryTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const InventoryTabs: React.FC<InventoryTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex space-x-4 mb-4">
      {['tools', 'supplies', 'equipment', 'officeHardware'].map(tab => (
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
