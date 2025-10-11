import { ContentItem } from '../../types';
import { ContentStatus as UIContentStatus } from '../../types';
import {
  convertToCSV,
  convertToJSON,
  convertToPDF,
  createDownloadUrl,
  generateFilename,
} from '../../../../utils/exportUtils';
import {
  BulkUpdateResult,
  BulkDeleteResult,
  BulkExportResult,
  LearningPathStatus,
  ContentStatus as DatabaseContentStatus,
} from '../types/knowledgeHubTypes';
import { UnifiedDatabaseAdapter } from '../adapters/unifiedDatabaseAdapter';
import { UnifiedDataTransformer } from '../transformers/unifiedDataTransformer';
import { KnowledgeHubBulkService } from '../knowledgeHubBulkService';

export class ContentActions {
  /**
   * Fetch all content from Supabase and convert to ContentItem format
   */
  static async getAllContentItems(
    database: UnifiedDatabaseAdapter
  ): Promise<ContentItem[]> {
    try {
      const [articles, pathways] = await Promise.all([
        database.getKnowledgeArticles(),
        database.getLearningPathways(),
      ]);

      const articleContentItems =
        UnifiedDataTransformer.convertArticlesToContentItems(articles);
      const pathwayContentItems =
        UnifiedDataTransformer.convertLearningPathwaysToContentItems(pathways);

      return [...articleContentItems, ...pathwayContentItems];
    } catch (error) {
      console.error('ContentActions.getAllContentItems error:', error);
      throw error;
    }
  }

  /**
   * Update content status
   */
  static async updateContentStatus(
    contentId: string,
    status: UIContentStatus,
    database: UnifiedDatabaseAdapter
  ): Promise<boolean> {
    try {
      // Validate status
      const validStatuses: UIContentStatus[] = ['draft', 'review', 'published'];
      if (!validStatuses.includes(status)) {
        throw new Error(
          `Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`
        );
      }

      // Map UI ContentStatus to database ContentStatus
      const mapStatusToDatabase = (
        status: UIContentStatus
      ): DatabaseContentStatus => {
        switch (status) {
          case 'draft':
            return 'draft';
          case 'review':
            return 'review';
          case 'published':
            return 'published';
          default:
            return 'draft';
        }
      };

      const databaseStatus = mapStatusToDatabase(status);

      // Try to update article status
      const { error: articleError } = await database.updateArticleStatus(
        contentId,
        databaseStatus
      );

      // Try to update learning path status (using is_active for learning paths)
      const { error: pathwayError } = await database.updateLearningPathStatus(
        contentId,
        status === 'published'
      );

      // If both operations failed, throw an error
      if (articleError && pathwayError) {
        throw new Error(
          `Failed to update content status: ${articleError || pathwayError}`
        );
      }

      return true;
    } catch (error) {
      console.error('ContentActions.updateContentStatus error:', error);
      return false;
    }
  }

  /**
   * Bulk update content status for multiple items
   */
  static async bulkUpdateContentStatus(
    itemIds: string[],
    status: UIContentStatus,
    database: UnifiedDatabaseAdapter
  ): Promise<BulkUpdateResult> {
    try {
      if (!itemIds || itemIds.length === 0) {
        return {
          success: false,
          updatedCount: 0,
          processedCount: 0,
          errors: ['No items provided for status update'],
        };
      }

      // Validate status
      const validStatuses: UIContentStatus[] = ['draft', 'review', 'published'];
      if (!validStatuses.includes(status)) {
        return {
          success: false,
          updatedCount: 0,
          processedCount: 0,
          errors: [
            `Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`,
          ],
        };
      }

      // For now, we'll use the individual approach since we need to determine content type
      // In the future, we could optimize this by separating articles and pathways first
      const errors: string[] = [];
      let updatedCount = 0;

      // Use standardized bulk operation service with retry support
      const bulkResult = await KnowledgeHubBulkService.simpleBulkOperation(
        itemIds,
        async (contentId) =>
          await this.updateContentStatus(contentId, status, database),
        {
          retryConfig: {
            maxRetries: 3,
            delay: 1000,
            enableRetry: true,
          },
        }
      );

      updatedCount = bulkResult.successCount;
      errors.push(...bulkResult.errors);

      const success = updatedCount === itemIds.length;

      return {
        success,
        updatedCount,
        processedCount: itemIds.length,
        errors,
      };
    } catch (error) {
      console.error('ContentActions.bulkUpdateContentStatus error:', error);
      return {
        success: false,
        updatedCount: 0,
        processedCount: itemIds.length,
        errors: [
          `Bulk status update operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  /**
   * Optimized bulk update content status using database .in() operator
   */
  static async bulkUpdateContentStatusOptimized(
    articleIds: string[],
    pathwayIds: string[],
    status: UIContentStatus,
    bulkUpdateArticlesFn: (
      ids: string[],
      status: UIContentStatus
    ) => Promise<BulkUpdateResult>,
    bulkUpdatePathwaysFn: (
      ids: string[],
      status: LearningPathStatus
    ) => Promise<BulkUpdateResult>
  ): Promise<BulkUpdateResult> {
    try {
      if (
        (!articleIds || articleIds.length === 0) &&
        (!pathwayIds || pathwayIds.length === 0)
      ) {
        return {
          success: false,
          updatedCount: 0,
          processedCount: 0,
          errors: ['No items provided for status update'],
        };
      }

      // Validate status
      const validStatuses: UIContentStatus[] = ['draft', 'review', 'published'];
      if (!validStatuses.includes(status)) {
        return {
          success: false,
          updatedCount: 0,
          processedCount: 0,
          errors: [
            `Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`,
          ],
        };
      }

      const errors: string[] = [];
      let totalUpdatedCount = 0;

      // Update articles using optimized bulk operation
      if (articleIds && articleIds.length > 0) {
        const articleResult = await bulkUpdateArticlesFn(articleIds, status);
        if (articleResult.success) {
          totalUpdatedCount += articleResult.updatedCount;
        } else {
          errors.push(...articleResult.errors);
        }
      }

      // Update learning paths using optimized bulk operation
      if (pathwayIds && pathwayIds.length > 0) {
        const pathwayStatus: LearningPathStatus =
          status === 'published' ? 'active' : 'inactive';
        const pathwayResult = await bulkUpdatePathwaysFn(
          pathwayIds,
          pathwayStatus
        );
        if (pathwayResult.success) {
          totalUpdatedCount += pathwayResult.updatedCount;
        } else {
          errors.push(...pathwayResult.errors);
        }
      }

      const totalProcessedCount =
        (articleIds?.length || 0) + (pathwayIds?.length || 0);
      const success = errors.length === 0;

      return {
        success,
        updatedCount: totalUpdatedCount,
        processedCount: totalProcessedCount,
        errors,
      };
    } catch (error) {
      console.error(
        'ContentActions.bulkUpdateContentStatusOptimized error:',
        error
      );
      const totalProcessedCount =
        (articleIds?.length || 0) + (pathwayIds?.length || 0);
      return {
        success: false,
        updatedCount: 0,
        processedCount: totalProcessedCount,
        errors: [
          `Bulk status update operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  /**
   * Delete content (soft delete by updating status)
   */
  static async deleteContent(
    contentId: string,
    database: UnifiedDatabaseAdapter
  ): Promise<boolean> {
    try {
      // Determine if it's an article or learning path based on the ID format or content type
      // For now, we'll try to update both tables

      // Try to update article status to 'archived'
      const { error: articleError } = await database.updateArticleStatus(
        contentId,
        'archived'
      );

      // Try to update learning path status to 'archived'
      const { error: pathwayError } = await database.updateLearningPathStatus(
        contentId,
        false
      );

      // If both operations failed, throw an error
      if (articleError && pathwayError) {
        throw new Error(
          `Failed to delete content: ${articleError || pathwayError}`
        );
      }

      return true;
    } catch (error) {
      console.error('ContentActions.deleteContent error:', error);
      return false;
    }
  }

  /**
   * Bulk delete multiple content items
   */
  static async bulkDeleteContent(
    itemIds: string[],
    database: UnifiedDatabaseAdapter
  ): Promise<BulkDeleteResult> {
    try {
      if (!itemIds || itemIds.length === 0) {
        return {
          success: false,
          deletedCount: 0,
          processedCount: 0,
          errors: ['No items provided for deletion'],
        };
      }

      const errors: string[] = [];
      let deletedCount = 0;

      // Use standardized bulk operation service with retry support
      const bulkResult = await KnowledgeHubBulkService.simpleBulkOperation(
        itemIds,
        async (contentId) => await this.deleteContent(contentId, database),
        {
          retryConfig: {
            maxRetries: 3,
            delay: 1000,
            enableRetry: true,
          },
        }
      );

      deletedCount = bulkResult.successCount;
      errors.push(...bulkResult.errors);

      const success = deletedCount === itemIds.length;

      return {
        success,
        deletedCount,
        processedCount: itemIds.length,
        errors,
      };
    } catch (error) {
      console.error('ContentActions.bulkDeleteContent error:', error);
      return {
        success: false,
        deletedCount: 0,
        processedCount: itemIds.length,
        errors: [
          `Bulk delete operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  /**
   * Optimized bulk delete using database .in() operator
   */
  static async bulkDeleteContentOptimized(
    articleIds: string[],
    pathwayIds: string[],
    bulkDeleteArticlesFn: (ids: string[]) => Promise<BulkDeleteResult>,
    bulkDeletePathwaysFn: (ids: string[]) => Promise<BulkDeleteResult>
  ): Promise<BulkDeleteResult> {
    try {
      if (
        (!articleIds || articleIds.length === 0) &&
        (!pathwayIds || pathwayIds.length === 0)
      ) {
        return {
          success: false,
          deletedCount: 0,
          processedCount: 0,
          errors: ['No items provided for deletion'],
        };
      }

      const errors: string[] = [];
      let totalDeletedCount = 0;

      // Delete articles using optimized bulk operation
      if (articleIds && articleIds.length > 0) {
        const articleResult = await bulkDeleteArticlesFn(articleIds);
        if (articleResult.success) {
          totalDeletedCount += articleResult.deletedCount;
        } else {
          errors.push(...articleResult.errors);
        }
      }

      // Delete learning paths using optimized bulk operation
      if (pathwayIds && pathwayIds.length > 0) {
        const pathwayResult = await bulkDeletePathwaysFn(pathwayIds);
        if (pathwayResult.success) {
          totalDeletedCount += pathwayResult.deletedCount;
        } else {
          errors.push(...pathwayResult.errors);
        }
      }

      const totalProcessedCount =
        (articleIds?.length || 0) + (pathwayIds?.length || 0);
      const success = errors.length === 0;

      return {
        success,
        deletedCount: totalDeletedCount,
        processedCount: totalProcessedCount,
        errors,
      };
    } catch (error) {
      console.error('ContentActions.bulkDeleteContentOptimized error:', error);
      const totalProcessedCount =
        (articleIds?.length || 0) + (pathwayIds?.length || 0);
      return {
        success: false,
        deletedCount: 0,
        processedCount: totalProcessedCount,
        errors: [
          `Bulk delete operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  /**
   * Bulk export content items in various formats
   */
  static async bulkExportContent(
    itemIds: string[],
    format: 'json' | 'csv' | 'pdf' = 'json',
    onProgress?: (progress: number) => void,
    database?: UnifiedDatabaseAdapter
  ): Promise<BulkExportResult> {
    try {
      if (!itemIds || itemIds.length === 0) {
        return {
          success: false,
          exportedCount: 0,
          errors: ['No items provided for export'],
        };
      }

      // Validate format
      const validFormats = ['json', 'csv', 'pdf'];
      if (!validFormats.includes(format)) {
        return {
          success: false,
          exportedCount: 0,
          errors: [
            `Invalid format: ${format}. Valid formats are: ${validFormats.join(', ')}`,
          ],
        };
      }

      const errors: string[] = [];
      const contentItems: ContentItem[] = [];

      // Fetch content items using standardized bulk operation with retry support
      onProgress?.(10);
      const bulkResult = await KnowledgeHubBulkService.simpleBulkOperation(
        itemIds,
        async (itemId) => {
          const contentItem = database
            ? await this.getContentItemById(itemId, database)
            : null;
          if (!contentItem) {
            throw new Error(`Content item ${itemId} not found`);
          }
          return contentItem;
        },
        {
          onProgress: (completed, total) => {
            const progress = 10 + Math.floor((completed / total) * 40);
            onProgress?.(progress);
          },
          retryConfig: {
            maxRetries: 3,
            delay: 1000,
            enableRetry: true,
          },
        }
      );

      contentItems.push(...bulkResult.results);
      errors.push(...bulkResult.errors);

      if (contentItems.length === 0) {
        return {
          success: false,
          exportedCount: 0,
          errors: ['No valid content items found for export'],
        };
      }

      // Generate export data based on format
      onProgress?.(50);
      let exportData: string | Blob;
      let filename: string;

      switch (format) {
        case 'json':
          exportData = convertToJSON(
            contentItems.map((item) => ({
              id: item.id,
              title: item.title,
              category: item.category,
              status: item.status,
              dueDate: item.dueDate,
              progress: item.progress,
              description: item.data?.description,
              tags: item.data?.tags,
              domain: item.domain,
              contentType: item.contentType,
              type: item.type,
              createdAt: item.data?.createdAt,
              lastUpdated: item.lastUpdated,
              isActive: item.data?.isActive,
              estimatedDuration: item.estimatedDuration,
              difficultyLevel: item.difficultyLevel,
              repeatSettings: item.repeatSettings,
              mandatoryRepeat: item.mandatoryRepeat,
              passingScore: item.passingScore,
            }))
          );
          filename = generateFilename('knowledge_hub_export', 'json');
          break;

        case 'csv':
          exportData = convertToCSV(
            contentItems.map((item) => ({
              id: item.id,
              title: item.title,
              category: item.category,
              type: item.type,
              status: item.status,
              description: item.data?.description,
              createdAt: item.data?.createdAt,
              updatedAt: item.lastUpdated,
              tags: item.data?.tags,
              estimatedDuration: item.estimatedDuration,
              difficulty: item.difficultyLevel,
              prerequisites: [],
            })),
            [
              'id',
              'title',
              'category',
              'type',
              'status',
              'description',
              'createdAt',
              'updatedAt',
              'tags',
              'estimatedDuration',
              'difficulty',
              'prerequisites',
            ]
          );
          filename = generateFilename('knowledge_hub_export', 'csv');
          break;

        case 'pdf':
          exportData = await convertToPDF(
            contentItems.map((item) => ({
              id: item.id,
              title: item.title,
              category: item.category,
              type: item.type,
              status: item.status,
              description: item.data?.description,
              createdAt: item.data?.createdAt,
              updatedAt: item.lastUpdated,
              tags: item.data?.tags,
              estimatedDuration: item.estimatedDuration,
              difficulty: item.difficultyLevel,
              prerequisites: [],
            })),
            'Knowledge Hub Content Export',
            [
              'id',
              'title',
              'category',
              'type',
              'status',
              'description',
              'createdAt',
              'updatedAt',
              'tags',
              'estimatedDuration',
              'difficulty',
              'prerequisites',
            ]
          );
          filename = generateFilename('knowledge_hub_export', 'pdf');
          break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      onProgress?.(90);

      // Create download URL and trigger download
      const downloadUrl = createDownloadUrl(exportData, filename);

      onProgress?.(100);

      return {
        success: true,
        exportedCount: contentItems.length,
        downloadUrl,
        errors,
      };
    } catch (error) {
      console.error('ContentActions.bulkExportContent error:', error);
      return {
        success: false,
        exportedCount: 0,
        errors: [
          `Bulk export operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  /**
   * Get a single content item by ID
   */
  private static async getContentItemById(
    contentId: string,
    database: UnifiedDatabaseAdapter
  ): Promise<ContentItem | null> {
    try {
      // Try to get article
      const { data: articleData, error: articleError } =
        await database.getArticleById(contentId);

      if (articleData && !articleError) {
        return UnifiedDataTransformer.convertArticlesToContentItems([
          articleData,
        ])[0];
      }

      // Try to get learning path
      const { data: pathwayData, error: pathwayError } =
        await database.getLearningPathById(contentId);

      if (pathwayData && !pathwayError) {
        return UnifiedDataTransformer.convertLearningPathwaysToContentItems([
          pathwayData,
        ])[0];
      }

      return null;
    } catch (error) {
      console.error('ContentActions.getContentItemById error:', error);
      return null;
    }
  }
}
