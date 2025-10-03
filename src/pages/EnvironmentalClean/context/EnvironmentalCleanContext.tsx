import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RoomStatusOption, Notification } from '../types';
import { useStatusTypes } from '@/store/statusTypesStore';

interface EnvironmentalCleanContextType {
  roomStatuses: Record<string, string[]>;
  statusOptions: RoomStatusOption[];
  handleUpdateRoomStatus: (roomId: string, status: string) => void;
  handleStartWorkflow: () => void;
  notification: Notification;
  closeNotification: () => void;
  showNotification: (message: string, type: string) => void;
  setScannedRoom: (room: string) => void;
  setShowStatusModal: (show: boolean) => void;
}

const EnvironmentalCleanContext = createContext<
  EnvironmentalCleanContextType | undefined
>(undefined);

export const EnvironmentalCleanProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { getCoreStatusTypes, getPublishedStatusTypes } = useStatusTypes();
  const [roomStatuses, setRoomStatuses] = useState<Record<string, string[]>>(
    {}
  );

  // Get dynamic status options from the database
  const statusOptions: RoomStatusOption[] = [
    ...getCoreStatusTypes().map((status) => ({
      key: status.name,
      label: status.name,
      icon: status.icon,
      color: status.color,
    })),
    ...getPublishedStatusTypes().map((status) => ({
      key: status.name,
      label: status.name,
      icon: status.icon,
      color: status.color,
    })),
  ];
  const [notification, setNotification] = useState<Notification>({
    id: '',
    message: '',
    type: 'info',
    timestamp: new Date().toISOString(),
  });

  const handleUpdateRoomStatus = (roomId: string, status: string) => {
    setRoomStatuses((prev: Record<string, string[]>) => ({
      ...prev,
      [roomId]: [status],
    }));
  };

  const handleStartWorkflow = () => {};

  const closeNotification = () => {
    setNotification({ ...notification, id: '', message: '' });
  };

  const showNotification = (message: string, type: string) => {
    setNotification({
      id: Date.now().toString(),
      message,
      type: type as 'success' | 'error' | 'warning' | 'info',
      timestamp: new Date().toISOString(),
    });
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
    throw new Error(
      'useEnvironmentalClean must be used within an EnvironmentalCleanProvider'
    );
  }
  return context;
};
