import { useMemo } from 'react';
import { useRoomStore } from '../store/roomStore';
import { RoomStatusType } from '../pages/EnvironmentalClean/models';

/**
 * Bridge hook that provides room data from roomStore to Environmental Clean
 * This allows Environmental Clean to access the rooms created in Settings
 * without requiring any changes to the Environmental Clean UI
 */
export function useEnvironmentalCleanRooms() {
  const { getActiveRooms } = useRoomStore();

  // Convert roomStore rooms to Environmental Clean format
  const environmentalCleanRooms = useMemo(() => {
    const activeRooms = getActiveRooms();

    return activeRooms.map((room) => ({
      id: room.barcode || room.id, // Use barcode as primary identifier for scanning
      status: 'dirty' as RoomStatusType, // Default status when room is scanned
      name: room.name, // Include name for display
      department: room.department, // Include department for context
      floor: room.floor, // Include floor for context
      barcode: room.barcode, // Include barcode for reference
      roomId: room.id, // Keep original room ID for reference
    }));
  }, [getActiveRooms]);

  return {
    environmentalCleans: environmentalCleanRooms,
    isLoading: false,
    error: null,
  };
}
