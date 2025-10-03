import React from 'react';
import { useEnvironmentalCleanData } from '../hooks/useEnvironmentalCleanData';
import RoomStatusCard from './ui/RoomStatusCard';

const EnvironmentalCleanRoomStatus: React.FC = () => {
  const { rooms } = useEnvironmentalCleanData();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Room Status</h2>
      <div className="space-y-3">
        {rooms.map((room) => (
          <RoomStatusCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
};

export default EnvironmentalCleanRoomStatus;
