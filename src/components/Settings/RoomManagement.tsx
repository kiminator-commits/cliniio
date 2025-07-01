import React, { useState } from 'react';
import { useRoomStore, Room } from '../../store/roomStore';
import Icon from '@mdi/react';
import { mdiPlus, mdiPencil, mdiDelete, mdiCheck, mdiClose } from '@mdi/js';

const RoomManagement: React.FC = () => {
  const { rooms, addRoom, updateRoom, deleteRoom } = useRoomStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    floor: '',
  });

  const departments = [
    'Surgery',
    'Intensive Care',
    'Emergency',
    'Logistics',
    'Administration',
    'Laboratory',
  ];

  const handleAddRoom = () => {
    if (formData.name && formData.department && formData.floor) {
      addRoom({
        ...formData,
        isActive: true,
      });
      setFormData({ name: '', department: '', floor: '' });
      setIsAdding(false);
    }
  };

  const handleUpdateRoom = (id: string) => {
    if (formData.name && formData.department && formData.floor) {
      updateRoom(id, formData);
      setFormData({ name: '', department: '', floor: '' });
      setEditingId(null);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingId(room.id);
    setFormData({
      name: room.name,
      department: room.department,
      floor: room.floor,
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', department: '', floor: '' });
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateRoom(id, { isActive: !isActive });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Room Management</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Icon path={mdiPlus} size={1} className="mr-2" />
          Add Room
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-4">{isAdding ? 'Add New Room' : 'Edit Room'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="room-name" className="block text-sm font-medium text-gray-700 mb-1">
                Room Name
              </label>
              <input
                id="room-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Operating Room 1"
              />
            </div>
            <div>
              <label
                htmlFor="room-department"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Department
              </label>
              <select
                id="room-department"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="room-floor" className="block text-sm font-medium text-gray-700 mb-1">
                Floor
              </label>
              <input
                id="room-floor"
                type="text"
                value={formData.floor}
                onChange={e => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2nd Floor"
              />
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={isAdding ? handleAddRoom : () => handleUpdateRoom(editingId!)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Icon path={mdiCheck} size={1} className="mr-2" />
              {isAdding ? 'Add Room' : 'Update Room'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <Icon path={mdiClose} size={1} className="mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rooms List */}
      <div className="space-y-4">
        {rooms.map(room => (
          <div
            key={room.id}
            className={`p-4 border rounded-lg ${
              room.isActive ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3
                    className={`text-lg font-medium ${room.isActive ? 'text-gray-900' : 'text-gray-500'}`}
                  >
                    {room.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      room.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {room.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {room.department} • {room.floor}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Created: {new Date(room.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleActive(room.id, room.isActive)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    room.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {room.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleEdit(room)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Icon path={mdiPencil} size={1} />
                </button>
                <button
                  onClick={() => deleteRoom(room.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Icon path={mdiDelete} size={1} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No rooms have been added yet.</p>
          <p className="text-sm mt-1">Click "Add Room" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
