import React from 'react';
import Icon from '@mdi/react';
import { mdiClipboardList, mdiFileDocument } from '@mdi/js';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex space-x-4">
        <button
          className={`pb-2 px-1 font-medium flex items-center ${
            activeTab === 'checklists'
              ? 'text-[#5b5b5b] border-b-2 border-[#4ECDC4]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => onTabChange('checklists')}
          type="button"
        >
          <Icon
            path={mdiClipboardList}
            size={1.1}
            color="#4ECDC4"
            className="mr-2"
          />
          Cleaning Checklists
        </button>
        <button
          className={`pb-2 px-1 font-medium flex items-center ${
            activeTab === 'sds'
              ? 'text-[#5b5b5b] border-b-2 border-[#4ECDC4]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => onTabChange('sds')}
          type="button"
        >
          <Icon
            path={mdiFileDocument}
            size={1.1}
            color="#4ECDC4"
            className="mr-2"
          />
          SDS Sheets
        </button>
      </div>
    </div>
  );
};
