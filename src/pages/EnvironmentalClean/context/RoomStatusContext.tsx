import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { useEnvironmentalCleanDataManager } from '../hooks/useEnvironmentalCleanDataManager';
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
  const { rooms: environmentalCleanRooms } = useEnvironmentalCleanDataManager();

  // Initialize rooms from Environmental Clean data manager
  const [rooms, setRooms] = useState<
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

  // Load rooms from Environmental Clean data manager when component mounts
  useEffect(() => {
    const initialRooms = environmentalCleanRooms.map((room) => ({
      id: room.id,
      status: room.status as RoomStatusType, // Cast to RoomStatusType
      name: room.name,
      metadata: room.metadata,
    }));

    setRooms(initialRooms);
  }, [environmentalCleanRooms]);

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
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === roomId ? { ...room, status: newStatus } : room
        )
      );

      // If room is marked as Clean, add to recently cleaned list
      if (newStatus === 'Clean') {
        // Find the actual room name from Environmental Clean data
        const roomFromData = environmentalCleanRooms.find(
          (room) => room.id === roomId
        );
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
    [environmentalCleanRooms]
  );

  const getCleanRoomsCount = useCallback(() => {
    return rooms.filter((room) => room.status === 'Clean').length;
  }, [rooms]);

  const getDirtyRoomsCount = useCallback(() => {
    return rooms.filter((room) => room.status === 'Dirty').length;
  }, [rooms]);

  const getEfficiency = useCallback(() => {
    const totalRooms = rooms.length;
    const cleanRooms = getCleanRoomsCount();
    return totalRooms > 0 ? Math.round((cleanRooms / totalRooms) * 100) : 0;
  }, [rooms, getCleanRoomsCount]);

  const value: RoomStatusContextType = {
    rooms,
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
