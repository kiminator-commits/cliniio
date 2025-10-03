import { supabase } from '@/lib/supabase';
import {
  KnowledgeLearningPath,
  BulkUpdateResult,
  BulkDeleteResult,
  LearningPathStatus,
} from '../../types/knowledgeHubTypes';

export class LearningPathService {
  private tableName = 'knowledge_learning_paths';

  /**
   * Fetch all learning paths from Supabase
   */
  async getLearningPathways(): Promise<KnowledgeLearningPath[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching learning pathways:', error);
        throw new Error(`Failed to fetch learning pathways: ${error.message}`);
      }

      return (data as unknown as KnowledgeLearningPath[]) || [];
    } catch (error) {
      console.error('LearningPathService.getLearningPathways error:', error);
      throw error;
    }
  }

  /**
   * Bulk update learning paths status using .in() operator
   */
  async bulkUpdateLearningPathsStatus(
    pathwayIds: string[],
    status: LearningPathStatus
  ): Promise<BulkUpdateResult> {
    try {
      if (!pathwayIds || pathwayIds.length === 0) {
        return {
          success: false,
          updatedCount: 0,
          processedCount: 0,
          errors: ['No pathway IDs provided'],
        };
      }

      const isActive = status === 'active';
      const { error, count } = await supabase
        .from(this.tableName)
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .in('id', pathwayIds)
        .select('id');

      if (error) {
        console.error('Error bulk updating learning paths status:', error);
        return {
          success: false,
          updatedCount: 0,
          processedCount: pathwayIds.length,
          errors: [error.message],
        };
      }

      return {
        success: true,
        updatedCount: count || 0,
        processedCount: pathwayIds.length,
        errors: [],
      };
    } catch (error) {
      console.error(
        'LearningPathService.bulkUpdateLearningPathsStatus error:',
        error
      );
      return {
        success: false,
        updatedCount: 0,
        processedCount: pathwayIds.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Bulk delete learning paths (soft delete) using .in() operator
   */
  async bulkDeleteLearningPaths(
    pathwayIds: string[]
  ): Promise<BulkDeleteResult> {
    try {
      if (!pathwayIds || pathwayIds.length === 0) {
        return {
          success: false,
          deletedCount: 0,
          processedCount: 0,
          errors: ['No pathway IDs provided'],
        };
      }

      const { error, count } = await supabase
        .from(this.tableName)
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .in('id', pathwayIds)
        .select('id');

      if (error) {
        console.error('Error bulk deleting learning paths:', error);
        return {
          success: false,
          deletedCount: 0,
          processedCount: pathwayIds.length,
          errors: [error.message],
        };
      }

      return {
        success: true,
        deletedCount: count || 0,
        processedCount: pathwayIds.length,
        errors: [],
      };
    } catch (error) {
      console.error(
        'LearningPathService.bulkDeleteLearningPaths error:',
        error
      );
      return {
        success: false,
        deletedCount: 0,
        processedCount: pathwayIds.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}
