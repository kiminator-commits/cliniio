import React from 'react';
import Icon from '@mdi/react';
import { mdiAccount, mdiCog, mdiAccountCog, mdiCellphone } from '@mdi/js';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'basic-info', label: 'Basic Information', icon: mdiAccount },
    { id: 'preferences', label: 'Preferences', icon: mdiCog },
    { id: 'mobile', label: 'Mobile Scanner Shortcuts', icon: mdiCellphone },
    { id: 'account', label: 'Account Management', icon: mdiAccountCog },
  ];

  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-[#4ECDC4] text-[#4ECDC4]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon path={tab.icon} size={1} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
