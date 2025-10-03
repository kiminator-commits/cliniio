import React, { useState, useEffect } from 'react';
import { Room } from '../../store/roomStore';
import Icon from '@mdi/react';
import { mdiPlus, mdiCheck, mdiClose, mdiBarcode } from '@mdi/js';
import { getRandomRoomBarcode } from '../../utils/getRandomBarcode';

interface RoomFormProps {
  isOpen: boolean;
  onClose: () => void;
  room?: Room | null;
  mode: 'add' | 'edit';
  onSave: (roomData: Partial<Room>) => void;
}

const RoomForm: React.FC<RoomFormProps> = ({
  isOpen,
  onClose,
  room,
  mode,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    floor: '',
    barcode: '',
  });

  const departments = [
    'Surgery',
    'Intensive Care',
    'Emergency',
    'Logistics',
    'Administration',
    'Laboratory',
  ];

  useEffect(() => {
    if (room && mode === 'edit') {
      setFormData({
        name: room.name || '',
        department: room.department || '',
        floor: room.floor || '',
        barcode: room.barcode || '',
      });
    } else {
      setFormData({
        name: '',
        department: '',
        floor: '',
        barcode: '',
      });
    }
  }, [room, mode, isOpen]);

  const handleSubmit = () => {
    if (formData.name && formData.department && formData.floor) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-md font-medium mb-3">
        {mode === 'add' ? 'Add New Room' : 'Edit Room'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label
            htmlFor="room-name"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Room Name
          </label>
          <input
            id="room-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Operating Room 1"
          />
        </div>
        <div>
          <label
            htmlFor="room-barcode"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Barcode
          </label>
          <div className="flex gap-1">
            <input
              id="room-barcode"
              type="text"
              value={formData.barcode}
              onChange={(e) =>
                setFormData({ ...formData, barcode: e.target.value })
              }
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., OR001"
            />
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, barcode: getRandomRoomBarcode() })
              }
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1 text-xs"
              title="Generate random barcode"
            >
              <Icon path={mdiBarcode} size={0.6} />
              <span>Gen</span>
            </button>
          </div>
        </div>
        <div>
          <label
            htmlFor="room-department"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Department
          </label>
          <select
            id="room-department"
            value={formData.department}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="room-floor"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Floor
          </label>
          <input
            id="room-floor"
            type="text"
            value={formData.floor}
            onChange={(e) =>
              setFormData({ ...formData, floor: e.target.value })
            }
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 2nd Floor"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleSubmit}
          className="flex items-center px-3 py-1 bg-[#4ECDC4] text-white text-sm rounded-md hover:bg-[#38b2ac] transition-colors"
        >
          <Icon
            path={mode === 'add' ? mdiPlus : mdiCheck}
            size={0.8}
            className="mr-1"
          />
          {mode === 'add' ? 'Add Room' : 'Update Room'}
        </button>
        <button
          onClick={onClose}
          className="flex items-center px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
        >
          <Icon path={mdiClose} size={0.8} className="mr-1" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RoomForm;
