import React from 'react';
import Icon from '@mdi/react';
import { mdiChartBar } from '@mdi/js';
import { useEnvironmentalCleanContext } from '../../../../contexts/EnvironmentalCleanContext';

export const CleaningAnalytics: React.FC = () => {
  const { analytics, isLoading, error } = useEnvironmentalCleanContext();

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500 animate-pulse">Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
        Failed to load analytics. Please try again later.
      </div>
    );
  }

  // Default values if analytics is undefined
  const cleanRooms = analytics?.cleanRooms ?? 0;
  const dirtyRooms = analytics?.dirtyRooms ?? 0;
  const efficiency = analytics?.efficiency ?? 0;

  return (
    <div
      className="bg-white p-3 md:p-4 rounded-xl shadow-lg mb-6"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
    >
      <h2 className="text-lg font-semibold mb-2 text-[#5b5b5b] flex items-center">
        <Icon path={mdiChartBar} size={1.1} color="#4ECDC4" className="mr-2" />
        Cleaning Analytics
      </h2>
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 bg-green-100 rounded-lg text-center">
          <h3 className="text-sm text-green-700 font-medium mb-1">Clean Rooms</h3>
          <p className="text-xl font-bold text-green-700">{cleanRooms}</p>
        </div>
        <div className="p-2 bg-orange-100 rounded-lg text-center">
          <h3 className="text-sm text-orange-700 font-medium mb-1">Dirty Rooms</h3>
          <p className="text-xl font-bold text-orange-700">{dirtyRooms}</p>
        </div>
        <div className="p-2 bg-purple-100 rounded-lg text-center">
          <h3 className="text-sm text-purple-700 font-medium mb-1">Efficiency</h3>
          <p className="text-xl font-bold text-purple-700">{efficiency}%</p>
        </div>
      </div>
    </div>
  );
};

export default CleaningAnalytics;
