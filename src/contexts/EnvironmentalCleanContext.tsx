import React, { createContext, useContext, useState } from 'react';

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
  | 'Unassigned';

export interface Room {
  id: string;
  name: string;
  status: RoomStatusType;
}

interface CleanedRoomEntry {
  room: string;
  cleanedAt: string;
  cleanedBy: string;
}

interface RoomTransition {
  roomId: string;
  fromStatus: RoomStatusType;
  toStatus: RoomStatusType;
  timestamp: Date;
  staffId?: string;
  duration?: number;
  notes?: string;
}

interface EfficiencyMetrics {
  averageCleaningTime: number;
  staffEfficiency: {
    [staffId: string]: {
      roomsCleaned: number;
      averageTime: number;
    };
  };
  roomUtilization: {
    [roomId: string]: {
      availableTime: number;
      cleaningTime: number;
      downTime: number;
    };
  };
  qualityScore: number;
}

interface AnalyticsData {
  cleanRooms: number;
  dirtyRooms: number;
  efficiency: number;
}

export interface EnvironmentalCleanContextType {
  cleanedRooms: Room[];
  analytics: AnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
}

const EnvironmentalCleanContext = createContext<EnvironmentalCleanContextType | undefined>(
  undefined
);

export const EnvironmentalCleanProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cleanedRooms, setCleanedRooms] = useState<CleanedRoomEntry[]>([]);
  const [roomTransitions, setRoomTransitions] = useState<RoomTransition[]>([]);
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', name: 'Room 101', status: 'Available' },
    { id: '2', name: 'Room 102', status: 'Dirty' },
    { id: '3', name: 'Room 103', status: 'Supervisor' },
    { id: '4', name: 'Room 104', status: 'Biohazard' },
  ]);

  const getDailyCleanedRoomsCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return cleanedRooms.filter(entry => {
      const cleanedDate = new Date(entry.cleanedAt);
      cleanedDate.setHours(0, 0, 0, 0);
      return cleanedDate.getTime() === today.getTime();
    }).length;
  };

  const getDailyDirtyRoomsCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return roomTransitions.filter(transition => {
      const transitionDate = new Date(transition.timestamp);
      transitionDate.setHours(0, 0, 0, 0);
      return (
        transitionDate.getTime() === today.getTime() &&
        transition.fromStatus === 'Available' &&
        ['Dirty', 'Low Inventory', 'Theft', 'Biohazard', 'Out of Service'].includes(
          transition.toStatus
        )
      );
    }).length;
  };

  const getEfficiencyMetrics = (): EfficiencyMetrics => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate average cleaning time
    const cleaningTransitions = roomTransitions.filter(
      t => t.fromStatus === 'In Progress' && t.toStatus === 'Available'
    );
    const totalCleaningTime = cleaningTransitions.reduce((sum, t) => sum + (t.duration || 0), 0);
    const averageCleaningTime =
      cleaningTransitions.length > 0 ? totalCleaningTime / cleaningTransitions.length : 0;

    // Calculate staff efficiency
    const staffEfficiency: { [key: string]: { roomsCleaned: number; averageTime: number } } = {};
    cleaningTransitions.forEach(transition => {
      if (transition.staffId) {
        if (!staffEfficiency[transition.staffId]) {
          staffEfficiency[transition.staffId] = { roomsCleaned: 0, averageTime: 0 };
        }
        staffEfficiency[transition.staffId].roomsCleaned++;
        staffEfficiency[transition.staffId].averageTime += transition.duration || 0;
      }
    });

    // Calculate room utilization
    const roomUtilization: {
      [key: string]: { availableTime: number; cleaningTime: number; downTime: number };
    } = {};
    rooms.forEach(room => {
      const roomTransitionsForRoom = roomTransitions.filter(t => t.roomId === room.id);
      roomUtilization[room.id] = {
        availableTime: 0,
        cleaningTime: 0,
        downTime: 0,
      };
      // Basic calculation - can be enhanced with more sophisticated logic
      roomTransitionsForRoom.forEach(t => {
        if (t.duration) {
          if (t.toStatus === 'Available') roomUtilization[room.id].availableTime += t.duration;
          else if (t.toStatus === 'In Progress')
            roomUtilization[room.id].cleaningTime += t.duration;
          else roomUtilization[room.id].downTime += t.duration;
        }
      });
    });

    // Calculate quality score (0-100)
    const qualityScore = calculateQualityScore(roomTransitions);

    return {
      averageCleaningTime,
      staffEfficiency,
      roomUtilization,
      qualityScore,
    };
  };

  const calculateQualityScore = (transitions: RoomTransition[]): number => {
    // Basic quality score calculation - can be enhanced
    const recentTransitions = transitions.filter(t => {
      const transitionDate = new Date(t.timestamp);
      return transitionDate > new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    });

    const issues = recentTransitions.filter(
      t =>
        t.fromStatus === 'Available' &&
        ['Dirty', 'Low Inventory', 'Theft', 'Biohazard', 'Out of Service'].includes(t.toStatus)
    ).length;

    const totalTransitions = recentTransitions.length;
    if (totalTransitions === 0) return 100;

    return Math.max(0, Math.min(100, 100 - (issues / totalTransitions) * 100));
  };

  const logRoomCleaned = (room: string, cleanedBy: string) => {
    const newEntry: CleanedRoomEntry = {
      room,
      cleanedAt: new Date().toISOString(),
      cleanedBy,
    };
    setCleanedRooms(prev => [newEntry, ...prev]);
  };

  const updateRoomStatus = (roomId: string, newStatus: RoomStatusType) => {
    setRooms(prevRooms => {
      const room = prevRooms.find(r => r.id === roomId);
      if (room) {
        const transition: RoomTransition = {
          roomId,
          fromStatus: room.status,
          toStatus: newStatus,
          timestamp: new Date(),
          duration: 0, // Will be calculated when status changes again
        };
        setRoomTransitions(prev => [...prev, transition]);
        return prevRooms.map(r => (r.id === roomId ? { ...r, status: newStatus } : r));
      }
      return prevRooms;
    });

    if (newStatus === 'Available') {
      const cleanedRoom = rooms.find(room => room.id === roomId);
      if (cleanedRoom) {
        logRoomCleaned(cleanedRoom.name, 'System'); // Replace 'System' with actual user later
      }
    }
  };

  return (
    <EnvironmentalCleanContext.Provider
      value={{
        cleanedRooms,
        logRoomCleaned,
        rooms,
        updateRoomStatus,
        getDailyCleanedRoomsCount,
        getDailyDirtyRoomsCount,
        getEfficiencyMetrics,
        isLoading: false,
        error: null,
        analytics: {
          cleanRooms: 0,
          dirtyRooms: 0,
          efficiency: 0,
        },
      }}
    >
      {children}
    </EnvironmentalCleanContext.Provider>
  );
};

export const useEnvironmentalCleanContext = (): EnvironmentalCleanContextType => {
  const context = useContext(EnvironmentalCleanContext);
  if (!context) {
    throw new Error(
      'useEnvironmentalCleanContext must be used within an EnvironmentalCleanProvider'
    );
  }
  return context;
};
