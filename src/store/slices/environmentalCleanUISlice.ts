import { StateCreator } from 'zustand';
import { RoomStatusType } from '../../pages/EnvironmentalClean/models';

export interface EnvironmentalCleanUIState {
  isScanModalOpen: boolean;
  selectedRoom: string | null;
  selectedStatus: 'all' | RoomStatusType | null;
  openScanModal: () => void;
  closeScanModal: () => void;
  setSelectedRoom: (roomId: string | null) => void;
  setSelectedStatus: (status: 'all' | RoomStatusType | null) => void;
}

export const createEnvironmentalCleanUISlice: StateCreator<
  EnvironmentalCleanUIState
> = (set) => ({
  isScanModalOpen: false,
  selectedRoom: null,
  selectedStatus: null,

  openScanModal: () => {
    // Debug logging removed for production
    set({ isScanModalOpen: true });
  },
  closeScanModal: () => {
    // Debug logging removed for production
    set({ isScanModalOpen: false });
  },
  setSelectedRoom: (roomId: string | null) => set({ selectedRoom: roomId }),
  setSelectedStatus: (status: 'all' | RoomStatusType | null) =>
    set({ selectedStatus: status }),
});
