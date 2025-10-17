import React, { useState } from 'react';
import { useRoomStore, Room } from '../../store/roomStore';
import { useStatusTypesStore, StatusType } from '../../store/statusTypesStore';
import * as StatusBundles from '../../config/statusBundles';
import Icon from '@mdi/react';
import { mdiPlus, mdiChevronDown, mdiChevronRight, mdiCog } from '@mdi/js';
import RoomList from './RoomList';
import RoomForm from './RoomForm';
import StatusTypeManagement from './StatusTypeManagement';
import StatusBundleManager from './StatusBundleManager';
import StatusCreationForm from './StatusCreationForm';

const RoomManagement: React.FC = () => {
  const { rooms, addRoom, updateRoom, deleteRoom } = useRoomStore();
  const {
    getCoreStatusTypes,
    getCustomStatusTypes,
    addStatusType,
    deleteStatusType,
    publishStatusType,
    unpublishStatusType,
    getStatusCountInfo,
    canAddCustomStatus,
  } = useStatusTypesStore();

  // Get statuses from the store
  const coreStatuses = getCoreStatusTypes();
  const customStatuses = getCustomStatusTypes();
  const [isAdding, setIsAdding] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStatusManagement, setShowStatusManagement] = useState(false);
  const [isAddingStatus, setIsAddingStatus] = useState(false);

  // Handler functions for the refactored components
  const handleAddRoom = (roomData: Partial<Room>) => {
    addRoom({
      name: roomData.name || '',
      department: roomData.department || '',
      floor: roomData.floor || '',
      barcode: roomData.barcode || '',
      isActive: true,
    } as Omit<Room, 'id' | 'createdAt' | 'updatedAt'>);
    setIsAdding(false);
  };

  const handleUpdateRoom = (roomData: Partial<Room>) => {
    if (editingRoom) {
      updateRoom(editingRoom.id, roomData);
      setEditingRoom(null);
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
  };

  const handleCancelRoom = () => {
    setIsAdding(false);
    setEditingRoom(null);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateRoom(id, { isActive: !isActive });
  };

  const handleDeleteRoom = (roomId: string) => {
    deleteRoom(roomId);
  };

  // Status management functions
  const handleEditStatus = () => {
    // This will be handled by a separate StatusTypeForm component
  };

  const handleDeleteStatus = (id: string) => {
    deleteStatusType(id);
  };

  const handleTogglePublishStatus = (id: string, isPublished: boolean) => {
    if (isPublished) {
      publishStatusType(id);
    } else {
      unpublishStatusType(id);
    }
  };

  const handleCreateStatus = async (statusData: Omit<StatusType, 'id'>) => {
    try {
      await addStatusType(statusData);
      setIsAddingStatus(false);
    } catch (error) {
      console.error('Error creating status:', error);
      // Error handling is done in the form component
      throw error;
    }
  };

  const handleLoadBundle = (bundleId: string) => {
    const bundle = StatusBundles.getBundleById(bundleId);
    if (!bundle) return;

    // Convert bundle to status types
    const bundleStatuses = StatusBundles.convertBundleToStatusTypes(bundle);

    // Filter out exact duplicates (keep existing ones)
    const existingNames = customStatuses.map((s) => s.name.toLowerCase());
    const newStatuses = bundleStatuses.filter(
      (status) => !existingNames.includes(status.name.toLowerCase())
    );

    // Add new statuses
    newStatuses.forEach((status: StatusType) => {
      addStatusType(status);
    });
  };

  const handleReplaceWithBundle = (bundleId: string) => {
    const bundle = StatusBundles.getBundleById(bundleId);
    if (!bundle) return;

    // Remove all existing custom statuses
    customStatuses.forEach((status: StatusType) => {
      deleteStatusType(status.id);
    });

    // Add all bundle statuses
    const bundleStatuses = StatusBundles.convertBundleToStatusTypes(bundle);
    bundleStatuses.forEach((status: StatusType) => {
      addStatusType(status);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-xl font-semibold text-gray-800 hover:text-gray-600 transition-colors"
        >
          <Icon
            path={isExpanded ? mdiChevronDown : mdiChevronRight}
            size={1.2}
            className="mr-2"
          />
          Room Management
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({rooms.filter((room) => room.isActive).length} active)
          </span>
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowStatusManagement(!showStatusManagement)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <Icon path={mdiCog} size={1} className="mr-2" />
            Status Types
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center px-4 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors"
          >
            <Icon path={mdiPlus} size={1} className="mr-2" />
            Add Room
          </button>
        </div>
      </div>

      {/* Status Types Management */}
      {showStatusManagement && (
        <div className="mb-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-purple-800">
                Custom Status Types
              </h3>
              <div className="text-sm text-purple-600 mt-1">
                {(() => {
                  const countInfo = getStatusCountInfo();
                  return `${countInfo.custom}/${countInfo.maxCustom} custom statuses used (${countInfo.total}/8 total)`;
                })()}
              </div>
            </div>
            <button
              onClick={() => setIsAddingStatus(true)}
              disabled={!canAddCustomStatus()}
              className={`flex items-center px-3 py-1 rounded-md transition-colors text-sm ${
                canAddCustomStatus()
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={
                canAddCustomStatus()
                  ? 'Add a new custom status'
                  : 'Maximum of 4 custom statuses reached'
              }
            >
              <Icon path={mdiPlus} size={0.8} className="mr-1" />
              Add Custom Status
            </button>
          </div>

          {/* Status Bundle Manager */}
          <StatusBundleManager
            customStatuses={customStatuses}
            onLoadBundle={handleLoadBundle}
            onReplaceWithBundle={handleReplaceWithBundle}
          />

          {/* Status Type Management */}
          <StatusTypeManagement
            coreStatuses={coreStatuses}
            customStatuses={customStatuses}
            onEditStatus={handleEditStatus}
            onDeleteStatus={handleDeleteStatus}
            onTogglePublishStatus={handleTogglePublishStatus}
            statusCountInfo={getStatusCountInfo()}
          />
        </div>
      )}

      {/* Room Form */}
      <RoomForm
        isOpen={isAdding || !!editingRoom}
        onClose={handleCancelRoom}
        room={editingRoom}
        mode={isAdding ? 'add' : 'edit'}
        onSave={isAdding ? handleAddRoom : handleUpdateRoom}
      />

      {/* Rooms List */}
      {isExpanded && (
        <RoomList
          rooms={rooms}
          onEditRoom={handleEditRoom}
          onDeleteRoom={handleDeleteRoom}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* Status Creation Form */}
      <StatusCreationForm
        isOpen={isAddingStatus}
        onClose={() => setIsAddingStatus(false)}
        onSave={handleCreateStatus}
        existingStatuses={[...coreStatuses, ...customStatuses]}
      />
    </div>
  );
};

export default RoomManagement;
