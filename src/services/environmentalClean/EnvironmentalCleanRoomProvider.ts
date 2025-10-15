import { supabase } from '@/lib/supabase';
import { Room, RoomStatusType } from '../../pages/EnvironmentalClean/models';
import { auditLogger } from '@/utils/auditLogger';
import { createUserFriendlyError } from '../../pages/EnvironmentalClean/services/errors/EnvironmentalCleanServiceError';

/**
 * Provider for environmental cleaning room operations
 */
export class EnvironmentalCleanRoomProvider {
  /**
   * Fetch recently cleaned rooms from the environmental_cleans_enhanced table
   */
  static async fetchRecentlyCleanedRooms(limit: number = 10): Promise<
    Array<{
      room: string;
      cleanedAt: string;
      cleanedBy: string;
    }>
  > {
    try {
      const { data, error } = await supabase
        .from('environmental_cleans_enhanced')
        .select(
          `
          room_name,
          completed_time,
          cleaner_id
        `
        )
        .eq('status', 'clean')
        .not('completed_time', 'is', null)
        .order('completed_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      // Transform Supabase data to the expected format
      const recentlyCleanedRooms = (
        (data as {
          room_name: string;
          completed_time: string;
          cleaner_id?: string;
        }[]) || []
      ).map(
        (item: {
          room_name: string;
          completed_time: string;
          cleaner_id?: string;
        }) => ({
          room: (item.room_name as string) || 'Unknown Room',
          cleanedAt: item.completed_time as string,
          cleanedBy: item.cleaner_id ? `Cleaner ${item.cleaner_id}` : 'System',
        })
      );

      return recentlyCleanedRooms;
    } catch (error) {
      console.error('❌ Raw error in fetchRecentlyCleanedRooms:', error);
      const friendlyError = createUserFriendlyError(
        error,
        'fetchRecentlyCleanedRooms'
      );
      console.error(
        '❌ Failed to fetch recently cleaned rooms:',
        friendlyError
      );
      throw friendlyError;
    }
  }

  /**
   * Scan a room barcode and return room information
   * This connects the room store with the Environmental Clean workflow
   */
  static async scanRoomBarcode(
    barcode: string
  ): Promise<{ success: boolean; room?: Room; message: string }> {
    try {
      if (!barcode || barcode.trim() === '') {
        return {
          success: false,
          message: 'Please enter a valid barcode',
        };
      }

      // Import roomStore dynamically to avoid circular dependencies
      const { useRoomStore } = await import('../../store/roomStore');
      const roomStore = useRoomStore.getState();
      const room = roomStore.getRoomByBarcode(barcode.trim());

      if (!room) {
        return {
          success: false,
          message: `Room with barcode "${barcode}" not found. Please check the barcode or add the room in Settings.`,
        };
      }

      // Log the scan for audit purposes
      auditLogger.log('environmental_clean', 'room_scan', {
        barcode,
        roomId: room.id,
        roomName: room.name,
      });

      return {
        success: true,
        room: {
          id: room.barcode || room.id,
          name: room.name,
          status: 'dirty' as RoomStatusType, // Default to dirty when scanned
        },
        message: `Successfully scanned room: ${room.name}`,
      };
    } catch (error) {
      console.error('❌ Error scanning room barcode:', error);
      return {
        success: false,
        message:
          'An error occurred while scanning the barcode. Please try again.',
      };
    }
  }
}
