import React, { useRef } from 'react';
import Icon from '@mdi/react';
import {
  mdiClockOutline,
  mdiAccount,
  mdiCheckCircle,
  mdiArrowUp,
  mdiRefresh,
} from '@mdi/js';
import { useRoomStatus } from '../../context/RoomStatusContext';

const RecentlyCleaned: React.FC = () => {
  const { recentlyCleanedRooms } = useRoomStatus();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoading = false;
  const error = null;

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleRefresh = () => {
    // Refresh functionality would be implemented here
    console.log('Refreshing recently cleaned rooms...');
  };

  return (
    <div
      className="bg-white p-3 md:p-4 rounded-xl shadow-lg mb-6 relative"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
    >
      <div className="sticky top-0 bg-white pb-1 flex justify-between items-center">
        <h2 className="text-lg font-semibold mb-1 text-[#5b5b5b] flex items-center">
          <Icon
            path={mdiClockOutline}
            size={1.1}
            color="#4ECDC4"
            className="mr-2"
          />
          Recently Cleaned Rooms
        </h2>
        <button
          onClick={handleRefresh}
          className="p-1 text-gray-500 hover:text-[#4ECDC4] transition-colors"
          title="Refresh data"
          disabled={isLoading}
        >
          <Icon
            path={mdiRefresh}
            size={0.8}
            className={isLoading ? 'animate-spin' : ''}
          />
        </button>
      </div>
      <div
        className="overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ maxHeight: '120px' }}
        ref={scrollContainerRef}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4ECDC4]"></div>
            <span className="ml-2 text-sm text-gray-500">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm py-2 px-2 bg-red-50 rounded">
            Error loading data. Please try refreshing.
          </div>
        ) : recentlyCleanedRooms.length === 0 ? (
          <p className="text-gray-500 text-sm py-1">
            No rooms cleaned recently
          </p>
        ) : (
          <div className="space-y-1">
            {recentlyCleanedRooms.map((item, index) => (
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
                          <span className="font-medium text-gray-800">
                            {item.cleanedBy}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Icon
                            path={mdiClockOutline}
                            size={0.8}
                            color="#4ECDC4"
                          />
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
