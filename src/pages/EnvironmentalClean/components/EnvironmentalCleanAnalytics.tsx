import React from 'react';
import { useEnvironmentalCleanData } from '../hooks/useEnvironmentalCleanData';

const EnvironmentalCleanAnalytics: React.FC = () => {
  const { analytics } = useEnvironmentalCleanData();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Cleaning Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {analytics.cleanRooms}
          </div>
          <div className="text-sm text-gray-600">Clean Rooms</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {analytics.dirtyRooms}
          </div>
          <div className="text-sm text-gray-600">Dirty Rooms</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {analytics.totalRooms}
          </div>
          <div className="text-sm text-gray-600">Total Rooms</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {analytics.cleaningEfficiency}%
          </div>
          <div className="text-sm text-gray-600">Efficiency</div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalCleanAnalytics;
