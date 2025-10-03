import React from 'react';
import { mdiAutoFix } from '@mdi/js';
import Icon from '@mdi/react';
import { useRecentlyCleanedRooms } from '../../pages/EnvironmentalClean/hooks/useRecentlyCleanedRooms';

const RecentlyCleaned: React.FC = () => {
  const { recentlyCleanedRooms, isLoading, error } = useRecentlyCleanedRooms(3);

  const displayData = recentlyCleanedRooms.slice(0, 2);

  return (
    <div className="p-4 bg-white rounded-lg shadow h-40 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-l-4 border-[#4ECDC4]">
      <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
        <Icon path={mdiAutoFix} size={1} color="#4ECDC4" className="mr-2" />
        Recently Cleaned Rooms
      </h2>
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4ECDC4]"></div>
          <span className="ml-2 text-sm text-gray-500">Loading...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 text-sm py-2">Error loading data</div>
      ) : displayData.length === 0 ? (
        <p className="text-gray-500 text-sm">No rooms cleaned recently</p>
      ) : (
        <ul>
          {displayData.map((item, index) => (
            <li key={index} className="flex justify-between mb-2">
              <span
                className="cursor-pointer"
                title={`Cleaned: ${new Date(item.cleanedAt).toLocaleString()} by ${item.cleanedBy}`}
              >
                {item.room}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentlyCleaned;
