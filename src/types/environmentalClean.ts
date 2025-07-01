import { RoomStatusType } from './utils';

export interface Room {
  id: string;
  name: string;
  status: RoomStatusType;
  lastCleaned?: string;
  notes?: string;
}

export interface EnvironmentalCleanContextType {
  rooms: Room[];
  updateRoomStatus: (roomId: string, status: RoomStatusType) => void;
  logRoomCleaned: (roomId: string) => void;
  getRoomStatus: (roomId: string) => RoomStatusType;
  getRoomsByStatus: (status: RoomStatusType) => Room[];
}
