import { RoomService } from './services/RoomService';
import { EnvironmentalCleanAnalyticsService } from './EnvironmentalCleanAnalyticsService';
import { Room, RoomStatusType } from '../models';
import { CleaningAnalytics } from '../models';
import { Checklist } from '../types';
import { EnvironmentalCleanChecklistProvider } from '../../../services/environmentalClean/EnvironmentalCleanChecklistProvider';
import { EnvironmentalCleanRoomProvider } from '../../../services/environmentalClean/EnvironmentalCleanRoomProvider';
import { EnvironmentalCleanBatchProvider } from '../../../services/environmentalClean/EnvironmentalCleanBatchProvider';
import { EnvironmentalCleanCrudProvider } from '../../../services/environmentalClean/EnvironmentalCleanCrudProvider';
import { supabase } from '@/lib/supabaseClient';
// import { createUserFriendlyError } from './errors/EnvironmentalCleanServiceError';

export class EnvironmentalCleanService {
  static supabase = supabase;

  /**
   * Add audit log entry to Supabase
   */
  static async addAuditLog(action: string, roomId: string, userId: string) {
    try {
      await supabase.from('environmental_clean_audit').insert({
        action,
        room_id: roomId,
        user_id: userId,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Audit log failed:', err);
    }
  }

  /**
   * Fetch rooms from the environmental_cleans_enhanced table
   */
  static async fetchRooms(): Promise<Room[]> {
    return RoomService.fetchRooms();
  }

  /**
   * Fetch checklists from the environmental_cleaning_checklists table
   */
  static async fetchChecklists(): Promise<Checklist[]> {
    return EnvironmentalCleanChecklistProvider.fetchChecklists();
  }

  /**
   * Update room status in the environmental_cleans_enhanced table
   */
  static async updateRoomStatus(
    roomId: string,
    status: RoomStatusType
  ): Promise<void> {
    return RoomService.updateRoomStatus(roomId, status);
  }

  /**
   * Complete room cleaning
   */
  static async completeRoomCleaning(roomId: string): Promise<void> {
    return RoomService.completeRoomCleaning(roomId);
  }

  /**
   * Fetch analytics from Supabase environmental_cleans_enhanced table
   */
  static async fetchAnalytics(): Promise<CleaningAnalytics> {
    return EnvironmentalCleanAnalyticsService.fetchAnalytics();
  }

  /**
   * Get room counts by status for detailed analytics
   */
  static async getRoomCountsByStatus() {
    return EnvironmentalCleanAnalyticsService.getRoomCountsByStatus();
  }

  /**
   * Get recently completed cleanings
   */
  static async getRecentlyCompletedCleanings(limit: number = 10) {
    return EnvironmentalCleanAnalyticsService.getRecentlyCompletedCleanings(
      limit
    );
  }

  /**
   * Get cleaning efficiency trends
   */
  static async getCleaningEfficiencyTrends(days: number = 7) {
    return EnvironmentalCleanAnalyticsService.getCleaningEfficiencyTrends(days);
  }

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
    return EnvironmentalCleanRoomProvider.fetchRecentlyCleanedRooms(limit);
  }

  /**
   * Scan a room barcode and return room information
   * This connects the room store with the Environmental Clean workflow
   */
  static async scanRoomBarcode(
    barcode: string
  ): Promise<{ success: boolean; room?: Room; message: string }> {
    return EnvironmentalCleanRoomProvider.scanRoomBarcode(barcode);
  }

  /**
   * Create a new environmental cleaning record
   */
  static async createEnvironmentalClean(
    roomData: Partial<Room>
  ): Promise<Room> {
    return RoomService.createEnvironmentalClean(roomData);
  }

  /**
   * Update an existing environmental cleaning record
   */
  static async updateEnvironmentalClean(
    id: string,
    roomData: Partial<Room>
  ): Promise<Room> {
    return RoomService.updateEnvironmentalClean(id, roomData);
  }

  /**
   * Delete an environmental cleaning record
   */
  static async deleteEnvironmentalClean(id: string): Promise<void> {
    return RoomService.deleteEnvironmentalClean(id);
  }

  /**
   * Perform batch operations on environmental cleaning records
   */
  static async batchEnvironmentalCleanAction({
    ids,
    action,
  }: {
    ids: string[];
    action: string;
  }): Promise<{ success: boolean }> {
    return EnvironmentalCleanBatchProvider.batchEnvironmentalCleanAction({
      ids,
      action,
    });
  }
}

// CRUD handler functions following Inventory pattern
export async function fetchEnvironmentalCleans(): Promise<Room[]> {
  return EnvironmentalCleanCrudProvider.fetchEnvironmentalCleans();
}

export async function createEnvironmentalClean(
  data: Partial<Room>
): Promise<Room> {
  return EnvironmentalCleanCrudProvider.createEnvironmentalClean(data);
}

export async function updateEnvironmentalClean(
  id: string,
  data: Partial<Room>
): Promise<Room> {
  return EnvironmentalCleanCrudProvider.updateEnvironmentalClean(id, data);
}

export async function deleteEnvironmentalClean(id: string): Promise<void> {
  return EnvironmentalCleanCrudProvider.deleteEnvironmentalClean(id);
}

export async function batchEnvironmentalCleanAction({
  ids,
  action,
}: {
  ids: string[];
  action: string;
}): Promise<{ success: boolean }> {
  return EnvironmentalCleanCrudProvider.batchEnvironmentalCleanAction({
    ids,
    action,
  });
}

// Export the error class for use in other modules
export { createUserFriendlyError as EnvironmentalCleanServiceError } from './errors/EnvironmentalCleanServiceError';
