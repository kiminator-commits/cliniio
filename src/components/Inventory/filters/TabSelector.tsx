import React from 'react';
import { TabType } from '@/types/inventory';
import Icon from '@mdi/react';
import {
  mdiTools,
  mdiPackageVariant,
  mdiMedicalBag,
  mdiDesktopTower,
} from '@mdi/js';

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: { id: TabType; icon: string; label: string }[] = [
    { id: 'tools', icon: mdiTools, label: 'Tools' },
    { id: 'supplies', icon: mdiPackageVariant, label: 'Supplies' },
    { id: 'equipment', icon: mdiMedicalBag, label: 'Equipment' },
    { id: 'officeHardware', icon: mdiDesktopTower, label: 'Office Hardware' },
  ];

  return (
    <div className="flex space-x-4 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
            activeTab === tab.id
              ? 'bg-[#4ECDC4] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Icon path={tab.icon} size={1.2} className="mr-2" />
          <span className="font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabSelector;
