import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { useEnvironmentalCleanStore } from '../store/environmentalCleanStore';
import { EnvironmentalCleanService } from '../services/EnvironmentalCleanService';

export type RoomStatusType =
  | 'Available'
  | 'Dirty'
  | 'LowInventory'
  | 'Biohazard'
  | 'Theft'
  | 'InProgress'
  | 'Supervisor'
  | 'Isolation'
  | 'Quarantine'
  | 'OutOfService'
  | 'Unassigned'
  | 'PublicAreas'
  | 'Clean';

interface RecentlyCleanedRoom {
  room: string;
  cleanedAt: string;
  cleanedBy: string;
}

interface RoomStatusContextType {
  rooms: Array<{
    id: string;
    status: RoomStatusType;
    name?: string;
    metadata?: Record<string, unknown>;
  }>;
  recentlyCleanedRooms: RecentlyCleanedRoom[];
  updateRoomStatus: (roomId: string, newStatus: RoomStatusType) => void;
  getCleanRoomsCount: () => number;
  getDirtyRoomsCount: () => number;
  getEfficiency: () => number;
}

const RoomStatusContext = createContext<RoomStatusContextType | undefined>(
  undefined
);

function useRoomStatus() {
  const context = useContext(RoomStatusContext);
  if (!context) {
    throw new Error('useRoomStatus must be used within a RoomStatusProvider');
  }
  return context;
}

export { useRoomStatus };

interface RoomStatusProviderProps {
  children: ReactNode;
}

export const RoomStatusProvider: React.FC<RoomStatusProviderProps> = ({
  children,
}) => {
  const { rooms } = useEnvironmentalCleanStore();

  // Initialize rooms from Environmental Clean store
  const [contextRooms, setContextRooms] = useState<
    Array<{
      id: string;
      status: RoomStatusType;
      name?: string;
      metadata?: Record<string, unknown>;
    }>
  >([]);
  const [recentlyCleanedRooms, setRecentlyCleanedRooms] = useState<
    RecentlyCleanedRoom[]
  >([]);

  // Update context rooms whenever store rooms change
  useEffect(() => {
    const mappedRooms = rooms.map((room) => ({
      id: room.id,
      status: room.status as RoomStatusType, // Cast to RoomStatusType
      name: room.name,
      metadata: room.metadata,
    }));

    // Use setTimeout to avoid calling setState synchronously in effect
    const timeoutId = setTimeout(() => {
      setContextRooms(mappedRooms);
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [rooms]);

  // Load recently cleaned rooms from service when component mounts
  useEffect(() => {
    const loadRecentlyCleanedRooms = async () => {
      try {
        const recentlyCleaned =
          await EnvironmentalCleanService.fetchRecentlyCleanedRooms(10);
        setRecentlyCleanedRooms(recentlyCleaned);
      } catch (error) {
        console.error('Failed to fetch recently cleaned rooms:', error);
        // Keep empty array on error
      }
    };

    loadRecentlyCleanedRooms();
  }, []);

  const updateRoomStatus = useCallback(
    (roomId: string, newStatus: RoomStatusType) => {
      setContextRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === roomId ? { ...room, status: newStatus } : room
        )
      );

      // If room is marked as Clean, add to recently cleaned list
      if (newStatus === 'Clean') {
        // Find the actual room name from store data
        const roomFromData = rooms.find((room) => room.id === roomId);
        const roomName = roomFromData ? roomFromData.name : `Room ${roomId}`;

        const newCleanedRoom: RecentlyCleanedRoom = {
          room: roomName,
          cleanedAt: new Date().toISOString(),
          cleanedBy: 'Current User', // In a real app, this would be the logged-in user
        };

        setRecentlyCleanedRooms((prev) => [
          newCleanedRoom,
          ...prev.slice(0, 9),
        ]); // Keep only 10 most recent
      }
    },
    [rooms]
  );

  const getCleanRoomsCount = useCallback(() => {
    return contextRooms.filter((room) => room.status === 'Clean').length;
  }, [contextRooms]);

  const getDirtyRoomsCount = useCallback(() => {
    return contextRooms.filter((room) => room.status === 'Dirty').length;
  }, [contextRooms]);

  const getEfficiency = useCallback(() => {
    const totalRooms = contextRooms.length;
    const cleanRooms = getCleanRoomsCount();
    return totalRooms > 0 ? Math.round((cleanRooms / totalRooms) * 100) : 0;
  }, [contextRooms, getCleanRoomsCount]);

  const value: RoomStatusContextType = {
    rooms: contextRooms,
    recentlyCleanedRooms,
    updateRoomStatus,
    getCleanRoomsCount,
    getDirtyRoomsCount,
    getEfficiency,
  };

  return (
    <RoomStatusContext.Provider value={value}>
      {children}
    </RoomStatusContext.Provider>
  );
};
