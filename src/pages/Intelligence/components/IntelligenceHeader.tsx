import React from 'react';
import Icon from '@mdi/react';
import { mdiRefresh } from '@mdi/js';

interface IntelligenceHeaderProps {
  loading: boolean;
  lastUpdated: string | null;
  onRefresh: () => void;
}
export const IntelligenceHeader: React.FC<IntelligenceHeaderProps> = ({
  loading,
  lastUpdated,
  onRefresh,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-600">
            Cliniio Intelligence
          </h1>
          <p className="mt-2 text-gray-500">
            Predictive analytics and strategic insights for clinical operations
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#4ECDC4] hover:bg-[#3DB8B0] text-white'
            }`}
          >
            <Icon
              path={mdiRefresh}
              size={1.2}
              className={`mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="text-sm text-gray-500">
            Last updated:{' '}
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}
          </div>
        </div>
      </div>
    </div>
  );
};
