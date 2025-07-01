import React, { useState } from 'react';
import {
  useEnvironmentalCleanContext,
  RoomStatusType,
  Room,
} from '../../contexts/EnvironmentalCleanContext';
import UpdateRoomStatusModal from './UpdateRoomStatusModal';

const RoomStatusSummary: React.FC = () => {
  const { rooms, updateRoomStatus } = useEnvironmentalCleanContext();
  const [activeStatus, setActiveStatus] = useState<RoomStatusType | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const statusCounts: Record<RoomStatusType, number> = {
    Available: 0,
    Dirty: 0,
    LowInventory: 0,
    Biohazard: 0,
    Theft: 0,
    InProgress: 0,
    Supervisor: 0,
    Isolation: 0,
    Quarantine: 0,
    OutOfService: 0,
    Unassigned: 0,
  };

  rooms.forEach(room => {
    statusCounts[room.status]++;
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveStatus(event.currentTarget.textContent as RoomStatusType);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className="p-4 bg-white rounded-lg shadow cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => setActiveStatus(status as RoomStatusType)}
            onKeyDown={handleKeyDown}
          >
            <div className="text-lg font-semibold">{status}</div>
            <div className="text-2xl">{count}</div>
          </div>
        ))}
      </div>

      {activeStatus && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-inner">
          <h3 className="text-md font-semibold mb-2">{activeStatus} Rooms</h3>
          <ul>
            {rooms
              .filter(room => room.status === activeStatus)
              .map(room => (
                <li key={room.id} className="flex justify-between mb-2">
                  <span>{room.name}</span>
                  <button
                    className="px-2 py-1 bg-teal-500 text-white rounded"
                    onClick={() => setSelectedRoom(room)}
                  >
                    Update
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}

      {selectedRoom && (
        <UpdateRoomStatusModal
          roomId={selectedRoom.id}
          roomName={selectedRoom.name}
          onClose={() => setSelectedRoom(null)}
          onUpdate={updateRoomStatus}
        />
      )}
    </div>
  );
};

export default RoomStatusSummary;
