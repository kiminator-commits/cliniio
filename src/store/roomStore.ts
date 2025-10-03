import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Room {
  id: string;
  name: string;
  department: string;
  floor: string;
  barcode?: string; // Add barcode field for scanning
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RoomStore {
  rooms: Room[];
  addRoom: (room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  getActiveRooms: () => Room[];
  getRoomsByDepartment: (department: string) => Room[];
  getRoomByBarcode: (barcode: string) => Room | undefined; // Add method to find room by barcode
}

export const useRoomStore = create<RoomStore>()(
  persist(
    (set, get) => ({
      rooms: [],
      addRoom: (roomData) => {
        const newRoom: Room = {
          ...roomData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          rooms: [...state.rooms, newRoom],
        }));
      },
      updateRoom: (id, updates) => {
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === id
              ? { ...room, ...updates, updatedAt: new Date().toISOString() }
              : room
          ),
        }));
      },
      deleteRoom: (id) => {
        set((state) => ({
          rooms: state.rooms.filter((room) => room.id !== id),
        }));
      },
      getActiveRooms: () => {
        return get().rooms.filter((room) => room.isActive);
      },
      getRoomsByDepartment: (department) => {
        return get().rooms.filter(
          (room) => room.department === department && room.isActive
        );
      },
      getRoomByBarcode: (barcode: string) => {
        return get().rooms.find(
          (room) => room.barcode === barcode && room.isActive
        );
      },
    }),
    {
      name: 'room-storage',
    }
  )
);
