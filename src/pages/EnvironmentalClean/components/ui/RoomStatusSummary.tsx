import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiMapMarker } from '@mdi/js';
import { UI_CONSTANTS } from '../../constants';
import { useListNavigation } from '../../utils/keyboardNavigation';
import { useRoomStatus } from '../../context/RoomStatusContext';
import { RoomStatusType } from '../../context/RoomStatusContext';
import {
  useStatusCards,
  getRoomCountByStatus,
} from './utils/statusGenerationUtils';
import StatusModal from './components/StatusModal';
import StatusCard from './components/StatusCard';
import RoomDrawer from './components/RoomDrawer';

const RoomStatusSummary: React.FC = () => {
  const { rooms, updateRoomStatus } = useRoomStatus();
  const [activeDrawer, setActiveDrawer] = useState<RoomStatusType | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Get dynamic status cards from store data
  const dynamicStatusCards = useStatusCards();

  const toggleDrawer = (status: RoomStatusType) => {
    setActiveDrawer(activeDrawer === status ? null : status);
  };

  const { selectedIndex, handleKeyDown } = useListNavigation(
    dynamicStatusCards,
    (card) => toggleDrawer(card.status as RoomStatusType),
    0
  );

  const handleStatusUpdate = (roomId: string, statuses: RoomStatusType[]) => {
    if (statuses.length > 0) {
      const newStatus = statuses[0];
      updateRoomStatus(roomId, newStatus);
    }
  };

  const handleUpdateStatus = (roomId: string) => {
    setSelectedRoom(roomId);
    setIsStatusModalOpen(true);
  };

  return (
    <div
      id="room-status-summary"
      className="bg-white rounded-lg shadow p-6 mb-6 relative"
      style={{ borderLeft: `4px solid ${UI_CONSTANTS.borderLeftColor}` }}
      role="region"
      aria-label="Room status summary"
    >
      <h2 className="text-xl font-semibold mb-4 text-[#5b5b5b] flex items-center">
        <Icon
          path={mdiMapMarker}
          size={1.1}
          color={UI_CONSTANTS.primaryIconColor}
          className="mr-2"
        />
        Room Status Summary
      </h2>
      <div
        className="grid grid-cols-4 gap-4"
        role="grid"
        aria-label="Status summary cards"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {dynamicStatusCards.map((card, index) => (
          <StatusCard
            key={card.status}
            status={card.status}
            icon={card.icon}
            color={card.color}
            bgColor={card.bgColor}
            textColor={card.textColor}
            isCore={card.isCore}
            roomCount={getRoomCountByStatus(rooms, card.status)}
            onClick={() => toggleDrawer(card.status as RoomStatusType)}
            isSelected={selectedIndex === index}
            index={index}
          />
        ))}
      </div>

      {/* Drawer for room details */}
      {activeDrawer && (
        <RoomDrawer
          status={activeDrawer}
          rooms={rooms}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onUpdate={(statuses) => {
          if (selectedRoom) {
            handleStatusUpdate(selectedRoom, statuses as RoomStatusType[]);
          }
        }}
        currentStatus={activeDrawer || 'Available'}
      />
    </div>
  );
};

export default RoomStatusSummary;
