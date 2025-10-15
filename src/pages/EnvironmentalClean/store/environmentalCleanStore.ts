import { create } from 'zustand';
import {
  Room,
  RoomStatusType,
  CleaningAnalytics,
  CleaningChecklist,
  isRoom,
  isRoomStatusType,
} from '../models';
import { EnvironmentalCleanService } from '../services/EnvironmentalCleanService';
import { createUserFriendlyError } from '../services/errors/EnvironmentalCleanServiceError';

// Define proper error types for the store
export type EnvironmentalCleanError =
  | ReturnType<typeof createUserFriendlyError>
  | Error
  | string
  | null;

// Define audit metadata types
export interface AuditMetadata {
  roomId?: string;
  status?: RoomStatusType;
  barcode?: string;
  operator?: string;
  timestamp?: string;
  [key: string]: string | number | boolean | undefined;
}

// ============================================================================
// DATA SLICE - Room data, checklists, analytics
// ============================================================================
interface DataSlice {
  // Data state
  rooms: Room[];
  checklists: CleaningChecklist[];
  analytics: CleaningAnalytics;
  isLoading: boolean;
  error: EnvironmentalCleanError;

  // Data actions
  setRooms: (rooms: Room[]) => void;
  setChecklists: (checklists: CleaningChecklist[]) => void;
  setAnalytics: (analytics: CleaningAnalytics) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: EnvironmentalCleanError) => void;

  // Data operations
  fetchRooms: () => Promise<void>;
  fetchChecklists: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  updateRoomStatus: (roomId: string, status: RoomStatusType) => Promise<void>;
  completeRoomCleaning: (roomId: string) => Promise<void>;
  scanRoomBarcode: (
    barcode: string
  ) => Promise<{ success: boolean; room?: Room; message: string }>;
}

// ============================================================================
// UI SLICE - Modal states, selections, filters
// ============================================================================
interface UISlice {
  // Modal states
  showStatusModal: boolean;
  isScanModalOpen: boolean;

  // Selection states
  selectedIds: string[];
  selectedRoom: Room | null;
  selectedStatus: 'all' | RoomStatusType | null;

  // Filter states
  searchTerm: string;
  filterStatus: string;

  // UI actions
  setShowStatusModal: (show: boolean) => void;
  setSelectedRoom: (room: Room | null) => void;
  setSelectedStatus: (status: 'all' | RoomStatusType | null) => void;
  toggleSelectedId: (id: string) => void;
  clearSelectedIds: () => void;
  setSearchTerm: (term: string) => void;
  setFilterStatus: (status: string) => void;
  openScanModal: () => void;
  closeScanModal: () => void;
}

// ============================================================================
// AUDIT SLICE - Audit logging
// ============================================================================
interface AuditSlice {
  lastAuditTimestamp: string | null;
  setLastAudit: (timestamp: string) => void;
  addAuditLog: (action: string, metadata: AuditMetadata) => void;
}

// ============================================================================
// COMBINED STORE
// ============================================================================
export const useEnvironmentalCleanStore = create<
  DataSlice & UISlice & AuditSlice
>((set, get) => ({
  // ============================================================================
  // DATA SLICE IMPLEMENTATION
  // ============================================================================
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

  setRooms: (rooms: Room[]) => {
    // Validate rooms before setting
    const validRooms = rooms.filter((room) => isRoom(room));
    if (validRooms.length !== rooms.length) {
      console.warn('Some rooms were filtered out due to invalid data');
    }
    set({ rooms: validRooms });
  },

  setChecklists: (checklists: CleaningChecklist[]) => {
    set({ checklists });
  },

  setAnalytics: (analytics: CleaningAnalytics) => {
    set({ analytics });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: EnvironmentalCleanError) => {
    set({ error });
  },

  fetchRooms: async () => {
    const { setLoading, setError, setRooms } = get();

    try {
      setLoading(true);
      setError(null);

      const rooms = await EnvironmentalCleanService.fetchRooms();
      setRooms(rooms);

      console.log('✅ Fetched rooms from service:', rooms.length);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch rooms';
      setError(errorMessage);
      console.error('❌ Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  },

  fetchChecklists: async () => {
    const { setLoading, setError, setChecklists } = get();

    try {
      setLoading(true);
      setError(null);

      const checklists = await EnvironmentalCleanService.fetchChecklists();
      setChecklists(checklists);

      console.log('✅ Fetched checklists from service:', checklists.length);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch checklists';
      setError(errorMessage);
      console.error('❌ Failed to fetch checklists:', error);
    } finally {
      setLoading(false);
    }
  },

  fetchAnalytics: async () => {
    const { setLoading, setError, setAnalytics } = get();

    try {
      setLoading(true);
      setError(null);

      const analytics = await EnvironmentalCleanService.fetchAnalytics();
      setAnalytics(analytics);

      console.log('✅ Fetched analytics from service');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch analytics';
      setError(errorMessage);
      console.error('❌ Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  },

  updateRoomStatus: async (roomId: string, status: RoomStatusType) => {
    const { setError, rooms, setRooms } = get();

    try {
      // Validate input
      if (!roomId) {
        throw new Error('Room ID is required');
      }
      if (!isRoomStatusType(status)) {
        throw new Error('Invalid status type');
      }

      // Update in Supabase
      await EnvironmentalCleanService.updateRoomStatus(roomId, status);

      // Update local state
      const updatedRooms = rooms.map((room) =>
        room.id === roomId ? { ...room, status } : room
      );
      setRooms(updatedRooms);

      // Add audit log
      await EnvironmentalCleanService.addAuditLog(
        'status_update',
        roomId,
        'system'
      );

      console.log('✅ Updated room status:', roomId, status);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update room status';
      setError(errorMessage);
      console.error('❌ Failed to update room status:', error);
      throw error;
    }
  },

  completeRoomCleaning: async (roomId: string) => {
    const { setError, rooms, setRooms } = get();

    try {
      // Validate input
      if (!roomId) {
        throw new Error('Room ID is required');
      }

      // Complete cleaning in Supabase
      await EnvironmentalCleanService.completeRoomCleaning(roomId);

      // Update local state
      const updatedRooms = rooms.map((room) =>
        room.id === roomId
          ? { ...room, status: 'clean' as RoomStatusType }
          : room
      );
      setRooms(updatedRooms);

      // Add audit log
      await EnvironmentalCleanService.addAuditLog(
        'complete_cleaning',
        roomId,
        'system'
      );

      console.log('✅ Completed room cleaning:', roomId);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to complete room cleaning';
      setError(errorMessage);
      console.error('❌ Failed to complete room cleaning:', error);
      throw error;
    }
  },

  scanRoomBarcode: async (barcode: string) => {
    try {
      // Validate input
      if (!barcode || barcode.trim() === '') {
        return {
          success: false,
          message: 'Please enter a valid barcode',
        };
      }

      // Scan barcode using service (now properly awaited)
      const result = await EnvironmentalCleanService.scanRoomBarcode(barcode);

      if (result.success && result.room) {
        // Add room to local state if not already present
        const { rooms, setRooms } = get();
        const existingRoom = rooms.find((room) => room.id === result.room!.id);

        if (!existingRoom) {
          setRooms([...rooms, result.room!]);
        }

        // Add audit log
        await EnvironmentalCleanService.addAuditLog(
          'room_scan',
          result.room.id,
          'system'
        );
      }

      return result;
    } catch (error) {
      console.error('❌ Error scanning barcode:', error);
      return {
        success: false,
        message:
          'An error occurred while scanning the barcode. Please try again.',
      };
    }
  },

  // ============================================================================
  // UI SLICE IMPLEMENTATION
  // ============================================================================
  showStatusModal: false,
  isScanModalOpen: false,
  selectedIds: [],
  selectedRoom: null,
  selectedStatus: null,
  searchTerm: '',
  filterStatus: '',

  setShowStatusModal: (show: boolean) => set({ showStatusModal: show }),
  setSelectedRoom: (room: Room | null) => set({ selectedRoom: room }),
  setSelectedStatus: (status: 'all' | RoomStatusType | null) =>
    set({ selectedStatus: status }),
  toggleSelectedId: (id: string) => {
    const { selectedIds } = get();
    const newSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];
    set({ selectedIds: newSelectedIds });
  },
  clearSelectedIds: () => set({ selectedIds: [] }),
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setFilterStatus: (status: string) => set({ filterStatus: status }),
  openScanModal: () => set({ isScanModalOpen: true }),
  closeScanModal: () => set({ isScanModalOpen: false }),

  // ============================================================================
  // AUDIT SLICE IMPLEMENTATION
  // ============================================================================
  lastAuditTimestamp: null,

  setLastAudit: (timestamp: string) => set({ lastAuditTimestamp: timestamp }),

  addAuditLog: async (action: string, metadata: AuditMetadata) => {
    const timestamp = new Date().toISOString();
    const { setLastAudit } = get();

    // Update last audit timestamp
    setLastAudit(timestamp);

    // Log to console for debugging
    console.log('🔍 [ENVIRONMENTAL CLEAN AUDIT]', {
      action,
      metadata,
      timestamp,
    });

    // Note: Audit logging is now handled by the useEnvironmentalCleanAudit hook
    // to prevent duplicate entries. This method is kept for backward compatibility
    // but no longer performs database operations.
  },
}));

export type EnvironmentalCleanStore = DataSlice & UISlice & AuditSlice;
