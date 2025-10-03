import { StateCreator } from 'zustand';
import {
  Room,
  CleaningChecklist,
  CleaningAnalytics,
} from '../../pages/EnvironmentalClean/models';
import { EnvironmentalCleanService } from '../../pages/EnvironmentalClean/services/EnvironmentalCleanService';

export interface EnvironmentalCleanDataState {
  rooms: Room[];
  checklists: CleaningChecklist[];
  analytics: CleaningAnalytics;
  isLoading: boolean;
  error: string | null;
  fetchRooms: () => Promise<void>;
  updateRoomStatus: (roomId: string, status: string) => Promise<void>;
  fetchChecklists: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  addAuditLog: (action: string, metadata: Record<string, unknown>) => void;
}

export const createEnvironmentalCleanDataSlice: StateCreator<
  EnvironmentalCleanDataState
> = (set, get) => ({
  rooms: [],
  checklists: [],
  analytics: {
    totalRooms: 0,
    cleanRooms: 0,
    dirtyRooms: 0,
    inProgressRooms: 0,
    cleaningEfficiency: 0,
    averageCleaningTime: 0,
    lastUpdated: new Date().toISOString(),
  },
  isLoading: false,
  error: null,

  fetchRooms: async () => {
    set({ isLoading: true, error: null });
    try {
      const rooms = await EnvironmentalCleanService.fetchRooms();
      set({ rooms, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ error: 'Failed to fetch rooms', isLoading: false });
    }
  },

  updateRoomStatus: async (roomId: string, status: string) => {
    try {
      await EnvironmentalCleanService.updateRoomStatus(
        roomId,
        status as Room['status']
      );
      // Optionally refresh rooms after status update:
      const rooms = await EnvironmentalCleanService.fetchRooms();
      set({ rooms });
      // ADD AUDIT LOG HERE:
      get().addAuditLog('updateRoomStatus', { roomId, status });
    } catch (err) {
      console.error(err);
      set({ error: 'Failed to update room status' });
    }
  },

  fetchChecklists: async () => {
    set({ isLoading: true, error: null });
    try {
      const checklists = await EnvironmentalCleanService.fetchChecklists();
      set({ checklists, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch checklists:', error);
      set({ error: 'Failed to fetch checklists', isLoading: false });
    }
  },

  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const analytics = await EnvironmentalCleanService.fetchAnalytics();
      set({ analytics, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ error: 'Failed to fetch analytics', isLoading: false });
    }
  },

  addAuditLog: () => {
    // Implementation for audit logging
    // Debug logging removed for production
  },
});
