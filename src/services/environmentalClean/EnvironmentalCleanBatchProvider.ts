import { supabase } from '@/lib/supabase';
import { auditLogger } from '@/utils/auditLogger';
import { createUserFriendlyError } from '../../pages/EnvironmentalClean/services/errors/EnvironmentalCleanServiceError';

/**
 * Provider for environmental cleaning batch operations
 */
export class EnvironmentalCleanBatchProvider {
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
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      // Map action to database fields
      switch (action) {
        case 'mark_completed':
          updateData.status = 'completed';
          updateData.completed_time = new Date().toISOString();
          break;
        case 'mark_in_progress':
          updateData.status = 'in_progress';
          updateData.started_time = new Date().toISOString();
          break;
        case 'mark_verified':
          updateData.status = 'verified';
          updateData.verified_time = new Date().toISOString();
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      const { error } = await supabase
        .from('environmental_cleans_enhanced')
        .update(updateData)
        .in('room_id', ids);

      if (error) {
        throw error;
      }

      // Log batch action
      auditLogger.log('environmental_clean', 'batch_action', {
        action,
        roomIds: ids,
        count: ids.length,
      });

      return { success: true };
    } catch (error) {
      const friendlyError = createUserFriendlyError(
        error,
        'batchEnvironmentalCleanAction'
      );
      console.error('❌ Failed to perform batch action:', friendlyError);
      throw friendlyError;
    }
  }
}
