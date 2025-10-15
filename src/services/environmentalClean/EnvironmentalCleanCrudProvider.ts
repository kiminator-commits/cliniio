import { Room } from '../../pages/EnvironmentalClean/models';
import { auditLogger } from '@/utils/auditLogger';
import { insertSterilizationLog } from '@/services/auditLogService';
import { usageTrackingService } from '@/services/usageTrackingService';
import { createUserFriendlyError } from '../../pages/EnvironmentalClean/services/errors/EnvironmentalCleanServiceError';
import { EnvironmentalCleanBatchProvider } from './EnvironmentalCleanBatchProvider';
import { supabase } from '@/lib/supabaseClient';

/**
 * Provider for environmental cleaning CRUD operations with audit logging
 */
export class EnvironmentalCleanCrudProvider {
  /**
   * Fetch environmental cleans with audit logging
   */
  static async fetchEnvironmentalCleans(): Promise<Room[]> {
    try {
      // Direct database call instead of going through EnvironmentalCleanService
      const { data: rooms, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name');

      if (error) {
        throw createUserFriendlyError('Failed to fetch rooms', error);
      }

      // Log audit and tracking
      auditLogger.log('environmentalClean', 'fetch', { rooms });
      insertSterilizationLog({
        event: 'environmentalClean_fetch',
        data: { rooms },
        timestamp: new Date().toISOString(),
        userId: 'system',
      });
      usageTrackingService.trackItemView('environmentalClean_fetch');

      return rooms;
    } catch (error) {
      usageTrackingService.trackItemView('environmentalClean_fetch_error');
      const friendlyError = createUserFriendlyError(
        error,
        'fetchEnvironmentalCleans'
      );
      console.error('❌ Failed to fetch environmental cleans:', friendlyError);
      throw friendlyError;
    }
  }

  /**
   * Create environmental clean with audit logging
   */
  static async createEnvironmentalClean(data: Partial<Room>): Promise<Room> {
    try {
      const room =
        await EnvironmentalCleanService.createEnvironmentalClean(data);

      // Log audit and tracking
      auditLogger.log('environmentalClean', 'create', { room });
      insertSterilizationLog({
        event: 'environmentalClean_create',
        data: { room },
        timestamp: new Date().toISOString(),
        userId: 'system',
      });
      usageTrackingService.trackItemView('environmentalClean_create');

      return room;
    } catch (error) {
      usageTrackingService.trackItemView('environmentalClean_create_error');
      const friendlyError = createUserFriendlyError(
        error,
        'createEnvironmentalClean'
      );
      console.error('❌ Failed to create environmental clean:', friendlyError);
      throw friendlyError;
    }
  }

  /**
   * Update environmental clean with audit logging
   */
  static async updateEnvironmentalClean(
    id: string,
    data: Partial<Room>
  ): Promise<Room> {
    try {
      const room = await EnvironmentalCleanService.updateEnvironmentalClean(
        id,
        data
      );

      // Log audit and tracking
      auditLogger.log('environmentalClean', 'update', { room });
      insertSterilizationLog({
        event: 'environmentalClean_update',
        data: { room },
        timestamp: new Date().toISOString(),
        userId: 'system',
      });
      usageTrackingService.trackItemView('environmentalClean_update');

      return room;
    } catch (error) {
      usageTrackingService.trackItemView('environmentalClean_update_error');
      const friendlyError = createUserFriendlyError(
        error,
        'updateEnvironmentalClean'
      );
      console.error('❌ Failed to update environmental clean:', friendlyError);
      throw friendlyError;
    }
  }

  /**
   * Delete environmental clean with audit logging
   */
  static async deleteEnvironmentalClean(id: string): Promise<void> {
    try {
      await EnvironmentalCleanService.deleteEnvironmentalClean(id);

      // Log audit and tracking
      auditLogger.log('environmentalClean', 'delete', { roomId: id });
      insertSterilizationLog({
        event: 'environmentalClean_delete',
        data: { roomId: id },
        timestamp: new Date().toISOString(),
        userId: 'system',
      });
      usageTrackingService.trackItemView('environmentalClean_delete');
    } catch (error) {
      usageTrackingService.trackItemView('environmentalClean_delete_error');
      const friendlyError = createUserFriendlyError(
        error,
        'deleteEnvironmentalClean'
      );
      console.error('❌ Failed to delete environmental clean:', friendlyError);
      throw friendlyError;
    }
  }

  /**
   * Perform batch environmental clean action with audit logging
   */
  static async batchEnvironmentalCleanAction({
    ids,
    action,
  }: {
    ids: string[];
    action: string;
  }): Promise<{ success: boolean }> {
    try {
      const result =
        await EnvironmentalCleanBatchProvider.batchEnvironmentalCleanAction({
          ids,
          action,
        });

      // Log audit and tracking
      auditLogger.log('environmentalClean', 'batch_action', { ids, action });
      insertSterilizationLog({
        event: 'environmentalClean_batch_action',
        data: { ids, action },
        timestamp: new Date().toISOString(),
        userId: 'system',
      });
      usageTrackingService.trackItemView('environmentalClean_batch_action');

      return result;
    } catch (error) {
      usageTrackingService.trackItemView(
        'environmentalClean_batch_action_error'
      );
      const friendlyError = createUserFriendlyError(
        error,
        'batchEnvironmentalCleanAction'
      );
      console.error('❌ Failed to perform batch action:', friendlyError);
      throw friendlyError;
    }
  }
}
