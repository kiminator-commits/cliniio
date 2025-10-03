import { RoomStatusType, Room } from '../pages/EnvironmentalClean/models';

export interface EnvironmentalCleanContextType {
  rooms: Room[];
  updateRoomStatus: (roomId: string, status: RoomStatusType) => void;
  logRoomCleaned: (roomId: string) => void;
  getRoomStatus: (roomId: string) => RoomStatusType;
  getRoomsByStatus: (status: RoomStatusType) => Room[];
}
