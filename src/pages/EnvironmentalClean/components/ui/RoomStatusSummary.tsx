import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiBroom,
  mdiProgressClock,
  mdiCheckCircle,
  mdiPackageVariant,
  mdiShieldAlert,
  mdiWrench,
  mdiOfficeBuilding,
  mdiMapMarker,
  mdiBiohazard,
} from '@mdi/js';
import {
  useEnvironmentalCleanContext,
  RoomStatusType,
} from '../../../../contexts/EnvironmentalCleanContext';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (statuses: RoomStatusType[]) => void;
  currentStatus: RoomStatusType;
}

const StatusModal: React.FC<StatusModalProps> = ({ isOpen, onClose, onUpdate, currentStatus }) => {
  const [selectedStatuses, setSelectedStatuses] = useState<RoomStatusType[]>([]);

  const handleStatusSelect = (status: RoomStatusType) => {
    if (status === 'Available') {
      setSelectedStatuses(['Available']);
    } else {
      setSelectedStatuses(prev => {
        if (prev.includes('Available')) {
          return [status];
        }
        if (prev.includes(status)) {
          return prev.filter(s => s !== status);
        }
        return [...prev, status];
      });
    }
  };

  const handleSubmit = () => {
    onUpdate(selectedStatuses);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-lg font-semibold mb-4">Update Room Status</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            className={`p-3 rounded-lg border ${
              selectedStatuses.includes('Available')
                ? 'bg-green-100 border-green-500'
                : currentStatus === 'Available'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200'
            }`}
            onClick={() => handleStatusSelect('Available')}
          >
            <div className="flex items-center gap-2">
              <Icon path={mdiCheckCircle} size={0.8} color="#16a34a" />
              <span>Available</span>
            </div>
          </button>
          <button
            className={`p-3 rounded-lg border ${
              selectedStatuses.includes('InProgress')
                ? 'bg-yellow-100 border-yellow-500'
                : currentStatus === 'InProgress'
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-200'
            }`}
            onClick={() => handleStatusSelect('InProgress')}
          >
            <div className="flex items-center gap-2">
              <Icon path={mdiProgressClock} size={0.8} color="#ca8a04" />
              <span>In Progress</span>
            </div>
          </button>
          <button
            className={`p-3 rounded-lg border ${
              selectedStatuses.includes('LowInventory')
                ? 'bg-purple-100 border-purple-500'
                : currentStatus === 'LowInventory'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200'
            }`}
            onClick={() => handleStatusSelect('LowInventory')}
          >
            <div className="flex items-center gap-2">
              <Icon path={mdiPackageVariant} size={0.8} color="#9333ea" />
              <span>Low Inventory</span>
            </div>
          </button>
          <button
            className={`p-3 rounded-lg border ${
              selectedStatuses.includes('Theft')
                ? 'bg-gray-100 border-gray-500'
                : currentStatus === 'Theft'
                  ? 'border-gray-500 bg-gray-50'
                  : 'border-gray-200'
            }`}
            onClick={() => handleStatusSelect('Theft')}
          >
            <div className="flex items-center gap-2">
              <Icon path={mdiShieldAlert} size={0.8} color="#4b5563" />
              <span>Theft</span>
            </div>
          </button>
          <button
            className={`p-3 rounded-lg border ${
              selectedStatuses.includes('OutOfService')
                ? 'bg-amber-100 border-amber-500'
                : currentStatus === 'OutOfService'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200'
            }`}
            onClick={() => handleStatusSelect('OutOfService')}
          >
            <div className="flex items-center gap-2">
              <Icon path={mdiWrench} size={0.8} color="#b45309" />
              <span>Out of Service</span>
            </div>
          </button>
          <button
            className={`p-3 rounded-lg border ${
              selectedStatuses.includes('Biohazard')
                ? 'bg-red-100 border-red-500'
                : currentStatus === 'Biohazard'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200'
            }`}
            onClick={() => handleStatusSelect('Biohazard')}
          >
            <div className="flex items-center gap-2">
              <Icon path={mdiBiohazard} size={0.8} color="#dc2626" />
              <span>Biohazard</span>
            </div>
          </button>
          <button
            className={`p-3 rounded-lg border ${
              selectedStatuses.includes('Dirty')
                ? 'bg-red-100 border-red-500'
                : currentStatus === 'Dirty'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200'
            }`}
            onClick={() => handleStatusSelect('Dirty')}
          >
            <div className="flex items-center gap-2">
              <Icon path={mdiBroom} size={0.8} color="#dc2626" />
              <span>Dirty</span>
            </div>
          </button>
          <button
            className={`p-3 rounded-lg border ${
              selectedStatuses.includes('PublicAreas')
                ? 'bg-emerald-100 border-emerald-500'
                : currentStatus === 'PublicAreas'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200'
            }`}
            onClick={() => handleStatusSelect('PublicAreas')}
          >
            <div className="flex items-center gap-2">
              <Icon path={mdiOfficeBuilding} size={0.8} color="#047857" />
              <span>Public Areas</span>
            </div>
          </button>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

const RoomStatusSummary: React.FC = () => {
  const { rooms, updateRoomStatus } = useEnvironmentalCleanContext();
  const [activeDrawer, setActiveDrawer] = useState<RoomStatusType | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const handleStatusUpdate = (roomId: string, statuses: RoomStatusType[]) => {
    if (statuses.includes('Available')) {
      updateRoomStatus(roomId, 'Available');
    } else {
      statuses.forEach(status => {
        updateRoomStatus(roomId, status);
      });
    }
  };

  const toggleDrawer = (status: RoomStatusType) => {
    setActiveDrawer(activeDrawer === status ? null : status);
  };

  const handleCardKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    status: RoomStatusType
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleDrawer(status);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow p-6 mb-6 relative"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
    >
      <h2 className="text-xl font-semibold mb-4 text-[#5b5b5b] flex items-center">
        <Icon path={mdiMapMarker} size={1.1} color="#4ECDC4" className="mr-2" />
        Room Status Summary
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          onClick={() => toggleDrawer('Dirty')}
          role="button"
          tabIndex={0}
          onKeyDown={e => handleCardKeyDown(e, 'Dirty')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-red-100 rounded-full p-1">
              <Icon path={mdiBroom} size={0.8} color="#dc2626" />
            </div>
            <span className="text-sm font-medium text-gray-600">Dirty</span>
          </div>
          <div className="text-2xl font-semibold text-red-600 text-center">
            {rooms.filter(room => room.status === 'Dirty').length}
          </div>
        </div>
        <div
          className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          onClick={() => toggleDrawer('InProgress')}
          role="button"
          tabIndex={0}
          onKeyDown={e => handleCardKeyDown(e, 'InProgress')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-yellow-100 rounded-full p-1">
              <Icon path={mdiProgressClock} size={0.8} color="#ca8a04" />
            </div>
            <span className="text-sm font-medium text-gray-600">In Progress</span>
          </div>
          <div className="text-2xl font-semibold text-yellow-600 text-center">
            {rooms.filter(room => room.status === 'InProgress').length}
          </div>
        </div>
        <div
          className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          onClick={() => toggleDrawer('Available')}
          role="button"
          tabIndex={0}
          onKeyDown={e => handleCardKeyDown(e, 'Available')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 rounded-full p-1">
              <Icon path={mdiCheckCircle} size={0.8} color="#16a34a" />
            </div>
            <span className="text-sm font-medium text-gray-600">Available</span>
          </div>
          <div className="text-2xl font-semibold text-green-600 text-center">
            {rooms.filter(room => room.status === 'Available').length}
          </div>
        </div>
        <div
          className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          onClick={() => toggleDrawer('PublicAreas')}
          role="button"
          tabIndex={0}
          onKeyDown={e => handleCardKeyDown(e, 'PublicAreas')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-emerald-100 rounded-full p-1">
              <Icon path={mdiOfficeBuilding} size={0.8} color="#047857" />
            </div>
            <span className="text-sm font-medium text-gray-600">Public Areas</span>
          </div>
          <div className="text-2xl font-semibold text-emerald-700 text-center">
            {rooms.filter(room => room.status === 'PublicAreas').length}
          </div>
        </div>
        <div
          className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          onClick={() => toggleDrawer('LowInventory')}
          role="button"
          tabIndex={0}
          onKeyDown={e => handleCardKeyDown(e, 'LowInventory')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-purple-100 rounded-full p-1">
              <Icon path={mdiPackageVariant} size={0.8} color="#9333ea" />
            </div>
            <span className="text-sm font-medium text-gray-600">Low Inventory</span>
          </div>
          <div className="text-2xl font-semibold text-purple-600 text-center">
            {rooms.filter(room => room.status === 'LowInventory').length}
          </div>
        </div>
        <div
          className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          onClick={() => toggleDrawer('Theft')}
          role="button"
          tabIndex={0}
          onKeyDown={e => handleCardKeyDown(e, 'Theft')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-gray-100 rounded-full p-1">
              <Icon path={mdiShieldAlert} size={0.8} color="#4b5563" />
            </div>
            <span className="text-sm font-medium text-gray-600">Theft</span>
          </div>
          <div className="text-2xl font-semibold text-gray-600 text-center">
            {rooms.filter(room => room.status === 'Theft').length}
          </div>
        </div>
        <div
          className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          onClick={() => toggleDrawer('OutOfService')}
          role="button"
          tabIndex={0}
          onKeyDown={e => handleCardKeyDown(e, 'OutOfService')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-amber-100 rounded-full p-1">
              <Icon path={mdiWrench} size={0.8} color="#b45309" />
            </div>
            <span className="text-sm font-medium text-gray-600">Out of Service</span>
          </div>
          <div className="text-2xl font-semibold text-amber-700 text-center">
            {rooms.filter(room => room.status === 'OutOfService').length}
          </div>
        </div>
        <div
          className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          onClick={() => toggleDrawer('Biohazard')}
          role="button"
          tabIndex={0}
          onKeyDown={e => handleCardKeyDown(e, 'Biohazard')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-red-100 rounded-full p-1">
              <Icon path={mdiBiohazard} size={0.8} color="#dc2626" />
            </div>
            <span className="text-sm font-medium text-gray-600">Biohazard</span>
          </div>
          <div className="text-2xl font-semibold text-red-600 text-center">
            {rooms.filter(room => room.status === 'Biohazard').length}
          </div>
        </div>
      </div>

      {/* Status Drawer Section */}
      {activeDrawer && (
        <div className="mt-6 bg-white shadow-lg border-t border-gray-200 rounded-b-lg">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#5b5b5b] flex items-center">
                {activeDrawer === 'Dirty' && (
                  <Icon path={mdiBroom} size={1.1} color="#dc2626" className="mr-2" />
                )}
                {activeDrawer === 'InProgress' && (
                  <Icon path={mdiProgressClock} size={1.1} color="#ca8a04" className="mr-2" />
                )}
                {activeDrawer === 'Available' && (
                  <Icon path={mdiCheckCircle} size={1.1} color="#16a34a" className="mr-2" />
                )}
                {activeDrawer === 'PublicAreas' && (
                  <Icon path={mdiOfficeBuilding} size={1.1} color="#047857" className="mr-2" />
                )}
                {activeDrawer === 'LowInventory' && (
                  <Icon path={mdiPackageVariant} size={1.1} color="#9333ea" className="mr-2" />
                )}
                {activeDrawer === 'Theft' && (
                  <Icon path={mdiShieldAlert} size={1.1} color="#4b5563" className="mr-2" />
                )}
                {activeDrawer === 'OutOfService' && (
                  <Icon path={mdiWrench} size={1.1} color="#b45309" className="mr-2" />
                )}
                {activeDrawer === 'Biohazard' && (
                  <Icon path={mdiBiohazard} size={1.1} color="#dc2626" className="mr-2" />
                )}
                {activeDrawer} Rooms
              </h3>
              <button
                onClick={() => setActiveDrawer(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
              {rooms
                .filter(room => room.status === activeDrawer)
                .map(room => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-2 border-b border-gray-100"
                  >
                    <span>{room.name}</span>
                    <button
                      onClick={() => {
                        setSelectedRoom(room.id);
                        setIsStatusModalOpen(true);
                      }}
                      className="px-3 py-1 bg-[#4ECDC4] text-white rounded hover:bg-[#3db8b0]"
                    >
                      Update Status
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedRoom(null);
        }}
        onUpdate={statuses => {
          if (selectedRoom) {
            handleStatusUpdate(selectedRoom, statuses);
          }
        }}
        currentStatus={activeDrawer || 'Available'}
      />
    </div>
  );
};

export default RoomStatusSummary;
