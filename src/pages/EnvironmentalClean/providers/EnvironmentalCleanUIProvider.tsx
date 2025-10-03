import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useEnvironmentalCleanStore } from '../store/environmentalCleanStore';
import { Room, RoomStatusType } from '../models';

type EnvironmentalCleanUIContextType = {
  isScanModalOpen: boolean;
  selectedRoom: Room | null;
  selectedStatus: 'all' | RoomStatusType | null;
  openScanModal: () => void;
  closeScanModal: () => void;
  setSelectedRoom: (room: Room | null) => void;
  setSelectedStatus: (status: 'all' | RoomStatusType | null) => void;
};

const EnvironmentalCleanUIContext = createContext<
  EnvironmentalCleanUIContextType | undefined
>(undefined);

interface EnvironmentalCleanUIProviderProps {
  children: ReactNode;
}

const EnvironmentalCleanUIProvider: React.FC<
  EnvironmentalCleanUIProviderProps
> = ({ children }) => {
  // Get UI state from store directly
  const isScanModalOpen = useEnvironmentalCleanStore(
    (state) => state.isScanModalOpen
  );
  const selectedRoom = useEnvironmentalCleanStore(
    (state) => state.selectedRoom
  );
  const selectedStatus = useEnvironmentalCleanStore(
    (state) => state.selectedStatus
  );
  const openScanModal = useEnvironmentalCleanStore(
    (state) => state.openScanModal
  );
  const closeScanModal = useEnvironmentalCleanStore(
    (state) => state.closeScanModal
  );
  const setSelectedRoom = useEnvironmentalCleanStore(
    (state) => state.setSelectedRoom
  );
  const setSelectedStatus = useEnvironmentalCleanStore(
    (state) => state.setSelectedStatus
  );

  const contextValue = useMemo(
    () => ({
      isScanModalOpen,
      selectedRoom,
      selectedStatus,
      openScanModal,
      closeScanModal,
      setSelectedRoom,
      setSelectedStatus,
    }),
    [
      isScanModalOpen,
      selectedRoom,
      selectedStatus,
      openScanModal,
      closeScanModal,
      setSelectedRoom,
      setSelectedStatus,
    ]
  );

  return (
    <EnvironmentalCleanUIContext.Provider value={contextValue}>
      {children}
    </EnvironmentalCleanUIContext.Provider>
  );
};

const useEnvironmentalCleanUI = () => {
  const context = useContext(EnvironmentalCleanUIContext);
  if (context === undefined) {
    throw new Error(
      'useEnvironmentalCleanUI must be used within EnvironmentalCleanUIProvider'
    );
  }
  return context;
};

export { EnvironmentalCleanUIProvider, useEnvironmentalCleanUI };
