import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RoomStatuses, RoomStatusOption, Notification } from '../models';
import {
  mdiCheckCircle,
  mdiAccountGroup,
  mdiBroom,
  mdiBiohazard,
  mdiPackageVariant,
  mdiShieldAlert,
  mdiWrench,
  mdiOfficeBuilding,
} from '@mdi/js';

interface EnvironmentalCleanContextType {
  roomStatuses: RoomStatuses;
  statusOptions: RoomStatusOption[];
  handleUpdateRoomStatus: (roomId: string, status: string) => void;
  handleStartWorkflow: () => void;
  notification: Notification;
  closeNotification: () => void;
  showNotification: (message: string, type: string) => void;
  setScannedRoom: (room: string) => void;
  setShowStatusModal: (show: boolean) => void;
}

const defaultRoomStatuses: RoomStatuses = {
  available: ['101', '102', '103'],
  occupied: ['201', '202'],
  dirty: ['301', '302', '303'],
  biohazard: ['401'],
  lowInventory: ['501', '502'],
  theft: ['601'],
  outOfOrder: ['701', '702'],
  publicAreas: ['Lobby', 'Cafeteria', 'Waiting Room'],
};

const defaultStatusOptions = [
  {
    id: 'available' as RoomStatusType,
    label: 'Available',
    color: '#4ECDC4',
    icon: mdiCheckCircle,
  },
  {
    id: 'occupied' as RoomStatusType,
    label: 'Occupied',
    color: '#FF6B6B',
    icon: mdiAccountGroup,
  },
  {
    id: 'dirty' as RoomStatusType,
    label: 'Dirty',
    color: '#FFD93D',
    icon: mdiBroom,
  },
  {
    id: 'biohazard' as RoomStatusType,
    label: 'Biohazard',
    color: '#FF0000',
    icon: mdiBiohazard,
  },
  {
    id: 'lowInventory' as RoomStatusType,
    label: 'Low Inventory',
    color: '#FFA500',
    icon: mdiPackageVariant,
  },
  {
    id: 'theft' as RoomStatusType,
    label: 'Theft',
    color: '#800000',
    icon: mdiShieldAlert,
  },
  {
    id: 'outOfOrder' as RoomStatusType,
    label: 'Out of Order',
    color: '#808080',
    icon: mdiWrench,
  },
  {
    id: 'publicAreas' as RoomStatusType,
    label: 'Public Areas',
    color: '#4169E1',
    icon: mdiOfficeBuilding,
  },
];

const EnvironmentalCleanContext = createContext<EnvironmentalCleanContextType | undefined>(
  undefined
);

export const EnvironmentalCleanProvider = ({ children }: { children: ReactNode }) => {
  const [roomStatuses, setRoomStatuses] = useState<RoomStatuses>(defaultRoomStatuses);
  const [statusOptions] = useState<RoomStatusOption[]>(defaultStatusOptions);
  const [notification, setNotification] = useState<Notification>({
    show: false,
    message: '',
    type: 'info',
  });

  const handleUpdateRoomStatus = (roomId: string, status: string) => {
    setRoomStatuses(prev => ({ ...prev, [roomId]: status }));
  };

  const handleStartWorkflow = () => {};

  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ show: true, message, type });
  };

  return (
    <EnvironmentalCleanContext.Provider
      value={{
        roomStatuses,
        statusOptions,
        handleUpdateRoomStatus,
        handleStartWorkflow,
        notification,
        closeNotification,
        showNotification,
        setScannedRoom: () => {},
        setShowStatusModal: () => {},
      }}
    >
      {children}
    </EnvironmentalCleanContext.Provider>
  );
};

export const useEnvironmentalClean = () => {
  const context = useContext(EnvironmentalCleanContext);
  if (context === undefined) {
    throw new Error('useEnvironmentalClean must be used within an EnvironmentalCleanProvider');
  }
  return context;
};
