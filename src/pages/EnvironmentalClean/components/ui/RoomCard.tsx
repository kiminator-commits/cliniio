import React from 'react';
import { RoomStatusType } from './types/RoomStatusTypes';

interface RoomCardProps {
  id: string;
  status: RoomStatusType;
  name: string;
  onUpdateStatus: (roomId: string) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ id, name, onUpdateStatus }) => {
  return (
    <div
      key={id}
      className="flex items-center justify-between p-2 border-b border-gray-100"
    >
      <span>{name}</span>
      <button
        onClick={() => onUpdateStatus(id)}
        className="px-3 py-1 bg-[#4ECDC4] text-white rounded hover:bg-[#3db8b0]"
      >
        Update Status
      </button>
    </div>
  );
};

export default RoomCard;
