import React from 'react';
import { useRoomStore } from '@/store/roomStore';
import { handleEnterKey } from '../../../utils/keyboardNavigation';
import { RoomDrawerProps } from '../types/RoomStatusTypes';
import { getRoomDetails } from '../utils/statusGenerationUtils';

const RoomDrawer: React.FC<RoomDrawerProps> = ({
  status,
  rooms,
  onUpdateStatus,
}) => {
  const { getActiveRooms } = useRoomStore();
  const activeRooms = getActiveRooms();

  const roomsWithStatus = rooms.filter((room) => room.status === status);

  return (
    <div
      className="mt-4 p-4 bg-gray-50 rounded-lg"
      role="region"
      aria-label={`${status} rooms details`}
    >
      <h3 className="text-lg font-medium mb-3">{status} Rooms</h3>
      <div className="space-y-2">
        {roomsWithStatus.map((room) => {
          const { name, department, floor } = getRoomDetails(room, activeRooms);

          return (
            <div
              key={room.id}
              className="flex items-center justify-between p-2 bg-white rounded border"
            >
              <div className="flex-1">
                <span className="text-sm font-medium">{name}</span>
                {(department || floor) && (
                  <div className="text-xs text-gray-500 mt-1">
                    {department && <span>{department}</span>}
                    {department && floor && <span> • </span>}
                    {floor && <span>{floor}</span>}
                  </div>
                )}
              </div>
              <button
                onClick={() => onUpdateStatus(room.id)}
                onKeyDown={handleEnterKey(() => onUpdateStatus(room.id))}
                className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ml-2"
                aria-label={`Update status for ${name}`}
              >
                Update Status
              </button>
            </div>
          );
        })}
        {roomsWithStatus.length === 0 && (
          <p className="text-sm text-gray-500">No rooms with this status</p>
        )}
      </div>
    </div>
  );
};

export default RoomDrawer;
