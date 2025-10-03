import {
  ContentStatus,
  LearningPathStatus,
} from '../../types/knowledgeHubTypes';
import { KnowledgeHubBulkService } from '../../knowledgeHubBulkService';
import { KnowledgeArticleService } from './KnowledgeArticleService';
import { LearningPathService } from './LearningPathService';

export interface BulkOperation {
  type:
    | 'update_article_status'
    | 'update_pathway_status'
    | 'delete_article'
    | 'delete_pathway';
  ids: string[];
  data?: Record<string, unknown>;
}

export interface BulkOperationResult {
  success: boolean;
  results: Array<{
    type: string;
    success: boolean;
    count: number;
    error?: string;
  }>;
}

export class BulkOperationService {
  private articleService: KnowledgeArticleService;
  private learningPathService: LearningPathService;

  constructor() {
    this.articleService = new KnowledgeArticleService();
    this.learningPathService = new LearningPathService();
  }

  /**
   * Transaction-like bulk operation for mixed content types
   */
  async bulkOperationWithTransaction(
    operations: BulkOperation[]
  ): Promise<BulkOperationResult> {
    try {
      const results: Array<{
        type: string;
        success: boolean;
        count: number;
        error?: string;
      }> = [];

      // Use standardized bulk operation service
      const bulkResult = await KnowledgeHubBulkService.transactionBulkOperation(
        operations,
        async (operation) => {
          let result: {
            success: boolean;
            updatedCount?: number;
            deletedCount?: number;
            error?: string;
          };

          switch (operation.type) {
            case 'update_article_status':
              if (
                operation.data &&
                typeof operation.data === 'object' &&
                'status' in operation.data
              ) {
                result = await this.articleService.bulkUpdateArticlesStatus(
                  operation.ids,
                  operation.data.status as ContentStatus
                );
              } else {
                result = {
                  success: false,
                  error: 'Invalid operation data for status update',
                };
              }
              break;

            case 'update_pathway_status':
              if (
                operation.data &&
                typeof operation.data === 'object' &&
                'isActive' in operation.data
              ) {
                const isActive = operation.data.isActive as boolean;
                const status: LearningPathStatus = isActive
                  ? 'active'
                  : 'inactive';
                result = await this.learningPathService.bulkUpdateLearningPathsStatus(
                  operation.ids,
                  status
                );
              } else {
                result = {
                  success: false,
                  error: 'Invalid operation data for pathway status update',
                };
              }
              break;

            case 'delete_article':
              result = await this.articleService.bulkDeleteArticles(operation.ids);
              break;

            case 'delete_pathway':
              result = await this.learningPathService.bulkDeleteLearningPaths(
                operation.ids
              );
              break;

            default:
              result = {
                success: false,
                error: `Unknown operation type: ${operation.type}`,
              };
          }

          return {
            type: operation.type,
            success: result.success,
            count: result.updatedCount || result.deletedCount || 0,
            error: result.error,
          };
        }
      );

      // Convert bulk result to expected format
      results.push(...bulkResult.results);

      // Add any failed operations to results
      bulkResult.failed.forEach((operation, index) => {
        results.push({
          type: (() => {
            if (
              operation &&
              typeof operation === 'object' &&
              'type' in operation
            ) {
              const typeValue = operation.type;
              if (typeof typeValue === 'string' && typeValue.trim() !== '') {
                return typeValue;
              }
            }
            return 'unknown';
          })(),
          success: false,
          count: 0,
          error: bulkResult.errors[index] || 'Operation failed',
        });
      });

      const overallSuccess = results.every((r) => r.success);

      return {
        success: overallSuccess,
        results,
      };
    } catch (error) {
      console.error(
        'BulkOperationService.bulkOperationWithTransaction error:',
        error
      );
      return {
        success: false,
        results: [
          {
            type: 'transaction',
            success: false,
            count: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        ],
      };
    }
  }
}
