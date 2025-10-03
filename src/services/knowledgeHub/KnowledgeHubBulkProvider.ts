// ============================================================================
// KNOWLEDGE HUB BULK PROVIDER - Bulk Operations
// ============================================================================

import { ContentStatus } from '../../pages/KnowledgeHub/types';
import { BulkResponse } from '../../pages/KnowledgeHub/services/types/knowledgeHubTypes';
import { UnifiedDatabaseAdapter } from '../../pages/KnowledgeHub/services/adapters/unifiedDatabaseAdapter';

export class KnowledgeHubBulkProvider {
  /**
   * Bulk update content status
   */
  static async bulkUpdateContentStatus(
    ids: string[],
    status: ContentStatus
  ): Promise<BulkResponse> {
    try {
      const adapter = new UnifiedDatabaseAdapter();
      // Map UI ContentStatus to database ContentStatus
      let databaseStatus: ContentStatus;
      switch (status) {
        case 'review':
          databaseStatus = 'review';
          break;
        case 'published':
          databaseStatus = 'published';
          break;
        default:
          databaseStatus = 'draft';
      }
      const result = await adapter.bulkUpdateArticlesStatus(
        ids,
        databaseStatus
      );

      return {
        success: result.success,
        processedCount: result.processedCount,
        successCount: result.updatedCount || 0,
        errorCount: result.errors?.length || 0,
        errors: result.errors || [],
      };
    } catch (error) {
      console.error('Failed to bulk update content status:', error);
      throw error;
    }
  }

  /**
   * Bulk delete content
   */
  static async bulkDeleteContent(ids: string[]): Promise<BulkResponse> {
    try {
      const adapter = new UnifiedDatabaseAdapter();
      const result = await adapter.deleteArticles(ids);

      return {
        success: result.success,
        processedCount: result.processedCount,
        successCount: result.deletedCount || 0,
        errorCount: result.errors?.length || 0,
        errors: result.errors || [],
      };
    } catch (error) {
      console.error('Failed to bulk delete content:', error);
      throw error;
    }
  }

  /**
   * Bulk update learning path status
   */
  static async bulkUpdateLearningPathStatus(
    ids: string[],
    isActive: boolean
  ): Promise<BulkResponse> {
    try {
      const adapter = new UnifiedDatabaseAdapter();
      const result = await adapter.bulkUpdateLearningPathsStatus(ids, isActive);

      return {
        success: result.success,
        processedCount: result.processedCount,
        successCount: result.updatedCount || 0,
        errorCount: result.errors?.length || 0,
        errors: result.errors || [],
      };
    } catch (error) {
      console.error('Failed to bulk update learning path status:', error);
      throw error;
    }
  }

  /**
   * Bulk delete learning pathways
   */
  static async bulkDeleteLearningPathways(
    ids: string[]
  ): Promise<BulkResponse> {
    try {
      const adapter = new UnifiedDatabaseAdapter();
      const result = await adapter.deleteLearningPaths(ids);

      return {
        success: result.success,
        processedCount: result.processedCount,
        successCount: result.deletedCount || 0,
        errorCount: result.errors?.length || 0,
        errors: result.errors || [],
      };
    } catch (error) {
      console.error('Failed to bulk delete learning pathways:', error);
      throw error;
    }
  }
}
