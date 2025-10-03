import React from 'react';
import { Room } from '../../models';
import { getStatusColor, getStatusIcon } from '../../utils/statusUtils';

interface RoomStatusCardProps {
  room: Room;
}

const RoomStatusCard: React.FC<RoomStatusCardProps> = ({ room }) => {
  const statusColor = getStatusColor(room.status);
  const statusIcon = getStatusIcon(room.status);

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
        <div>
          <div className="font-medium">{room.name}</div>
          <div className="text-sm text-gray-500 capitalize">{room.status}</div>
        </div>
      </div>
      <div className="text-gray-400">{statusIcon}</div>
    </div>
  );
};

export default RoomStatusCard;
