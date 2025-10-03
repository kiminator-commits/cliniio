import React from 'react';
import { RoomStatusType } from '../../pages/EnvironmentalClean/types';

interface UpdateRoomStatusModalProps {
  roomName: string;
  roomId: string;
  onClose: () => void;
  onUpdate: (roomId: string, newStatus: RoomStatusType) => void;
}

const UpdateRoomStatusModal: React.FC<UpdateRoomStatusModalProps> = ({
  roomName,
  roomId,
  onClose,
  onUpdate,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-80">
        <h3 className="text-lg font-semibold mb-4">
          Update Status: {roomName}
        </h3>
        <div className="flex flex-col gap-2">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={() => {
              onUpdate(roomId, 'clean');
              onClose();
            }}
          >
            Available
          </button>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded"
            onClick={() => {
              onUpdate(roomId, 'dirty');
              onClose();
            }}
          >
            Dirty
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={() => {
              onUpdate(roomId, 'in_progress');
              onClose();
            }}
          >
            Biohazard
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => {
              onUpdate(roomId, 'clean');
              onClose();
            }}
          >
            Low Inventory
          </button>
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateRoomStatusModal;
