import React from 'react';
import Icon from '@mdi/react';
import { mdiBrain, mdiRefresh } from '@mdi/js';

interface DashboardHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isLoading,
  onRefresh,
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon path={mdiBrain} size={2} />
          <div>
            <h2 className="text-2xl font-bold">Sterilization AI Insights</h2>
            <p className="text-purple-100">
              Real-time intelligence for optimal sterilization operations
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Icon
            path={mdiRefresh}
            size={1}
            className={isLoading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
