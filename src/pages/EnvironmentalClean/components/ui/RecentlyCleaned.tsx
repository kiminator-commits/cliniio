import React, { useRef } from 'react';
import Icon from '@mdi/react';
import { mdiClockOutline, mdiAccount, mdiCheckCircle, mdiArrowUp } from '@mdi/js';
import { useEnvironmentalCleanContext } from '../../../../contexts/EnvironmentalCleanContext';

const RecentlyCleaned: React.FC = () => {
  const { cleanedRooms, isLoading, error } = useEnvironmentalCleanContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-gray-500 animate-pulse">
        Loading recently cleaned rooms...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
        Failed to load cleaning data. Please try again later.
      </div>
    );
  }

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const sampleData = [
    { room: 'Room 101', cleanedAt: '2025-06-07T10:30:00Z', cleanedBy: 'Alice' },
    { room: 'Room 102', cleanedAt: '2025-06-07T09:45:00Z', cleanedBy: 'Bob' },
    { room: 'Room 103', cleanedAt: '2025-06-07T09:15:00Z', cleanedBy: 'Charlie' },
    { room: 'Room 104', cleanedAt: '2025-06-07T08:30:00Z', cleanedBy: 'David' },
    { room: 'Room 105', cleanedAt: '2025-06-07T08:00:00Z', cleanedBy: 'Eve' },
    { room: 'Room 106', cleanedAt: '2025-06-07T07:45:00Z', cleanedBy: 'Frank' },
    { room: 'Room 107', cleanedAt: '2025-06-07T07:30:00Z', cleanedBy: 'Grace' },
  ];

  const displayData = cleanedRooms.length > 0 ? cleanedRooms : sampleData;

  return (
    <div
      className="bg-white p-3 md:p-4 rounded-xl shadow-lg mb-6 relative"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
    >
      <div className="sticky top-0 bg-white pb-1">
        <h2 className="text-lg font-semibold mb-1 text-[#5b5b5b] flex items-center">
          <Icon path={mdiClockOutline} size={1.1} color="#4ECDC4" className="mr-2" />
          Recently Cleaned Rooms
        </h2>
      </div>
      <div
        className="overflow-y-auto scrollbar-none"
        style={{ maxHeight: '120px' }}
        ref={scrollContainerRef}
      >
        {displayData.length === 0 ? (
          <p className="text-gray-500 text-sm py-1">No rooms cleaned recently</p>
        ) : (
          <div className="space-y-1">
            {displayData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg relative"
              >
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <span className="font-medium text-gray-700 cursor-help hover:text-brand-primary transition-colors group">
                      {item.room}
                      <div className="hidden group-hover:block absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-64 z-50">
                        <div className="flex items-center space-x-2 mb-2">
                          <Icon path={mdiAccount} size={0.8} color="#4ECDC4" />
                          <span className="font-medium text-gray-800">{item.cleanedBy}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Icon path={mdiClockOutline} size={0.8} color="#4ECDC4" />
                          <span className="text-sm text-gray-600">
                            {new Date(item.cleanedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </span>
                  </div>
                  <Icon path={mdiCheckCircle} size={0.8} color="#4ECDC4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={scrollToTop}
        className="absolute bottom-2 right-2 p-1.5 bg-brand-primary text-white rounded-full shadow-md hover:bg-brand-primary transition-colors"
        title="Scroll to most recent"
      >
        <Icon path={mdiArrowUp} size={0.8} className="opacity-70" />
      </button>
    </div>
  );
};

export default RecentlyCleaned;
