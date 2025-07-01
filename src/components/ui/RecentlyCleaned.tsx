import React from 'react';
import { useEnvironmentalCleanContext } from '../../../../contexts/EnvironmentalCleanContext';
import { mdiAutoFix } from '@mdi/js';
import Icon from '@mdi/react';

const RecentlyCleaned: React.FC = () => {
  const { cleanedRooms } = useEnvironmentalCleanContext();

  const sampleData = [
    { room: 'Room 101', cleanedAt: '2025-06-07T10:30:00Z', cleanedBy: 'Alice' },
    { room: 'Room 102', cleanedAt: '2025-06-07T09:45:00Z', cleanedBy: 'Bob' },
    { room: 'Room 103', cleanedAt: '2025-06-07T09:15:00Z', cleanedBy: 'Charlie' },
  ];

  const displayData = cleanedRooms.length > 0 ? cleanedRooms.slice(0, 2) : sampleData.slice(0, 2);

  return (
    <div className="p-4 bg-white rounded-lg shadow h-40 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-l-4 border-[#4ECDC4]">
      <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
        <Icon path={mdiAutoFix} size={1} color="#4ECDC4" className="mr-2" />
        Recently Cleaned Rooms
      </h2>
      <ul>
        {displayData.map((item, index) => {
          console.log('Item data:', item);
          return (
            <li key={index} className="flex justify-between mb-2">
              <span
                className="cursor-pointer"
                title={`Cleaned: ${new Date(item.cleanedAt).toLocaleString()} by ${item.cleanedBy}`}
              >
                {item.room}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentlyCleaned;
