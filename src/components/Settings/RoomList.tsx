import React from 'react';
import { Room } from '../../store/roomStore';
import Icon from '@mdi/react';
import { mdiPencil, mdiDelete } from '@mdi/js';

interface RoomListProps {
  rooms: Room[];
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onToggleActive: (roomId: string, isActive: boolean) => void;
}

const RoomList: React.FC<RoomListProps> = ({
  rooms,
  onEditRoom,
  onDeleteRoom,
  onToggleActive,
}) => {
  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">{room.name}</h4>
              <p className="text-sm text-gray-600">
                {room.department} • {room.floor}
              </p>
              {room.barcode && (
                <p className="text-xs text-gray-500">Barcode: {room.barcode}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleActive(room.id, room.isActive)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                room.isActive
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              {room.isActive ? 'Active' : 'Inactive'}
            </button>
            <button
              onClick={() => onEditRoom(room)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Icon path={mdiPencil} size={0.8} />
            </button>
            <button
              onClick={() => onDeleteRoom(room.id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Icon path={mdiDelete} size={0.8} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomList;
