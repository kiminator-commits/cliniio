import {
  KnowledgeArticle,
  KnowledgeCategory,
  KnowledgeLearningPath,
  RecentUpdate,
  BulkUpdateResult,
  BulkDeleteResult,
  ContentStatus,
  LearningPathStatus,
} from '../types/knowledgeHubTypes';
import { KnowledgeArticleService } from './services/KnowledgeArticleService';
import { KnowledgeCategoryService } from './services/KnowledgeCategoryService';
import { LearningPathService } from './services/LearningPathService';
import {
  BulkOperationService,
  BulkOperation,
} from './services/BulkOperationService';
import { UserActivityService } from './services/UserActivityService';

/**
 * @deprecated Use KnowledgeHubService from '@/pages/KnowledgeHub/services/knowledgeHubService' instead
 * This service is deprecated in favor of the consolidated KnowledgeHubService
 */
export class KnowledgeDataService {
  private articleService: KnowledgeArticleService;
  private categoryService: KnowledgeCategoryService;
  private learningPathService: LearningPathService;
  private bulkOperationService: BulkOperationService;
  private userActivityService: UserActivityService;

  constructor() {
    this.articleService = new KnowledgeArticleService();
    this.categoryService = new KnowledgeCategoryService();
    this.learningPathService = new LearningPathService();
    this.bulkOperationService = new BulkOperationService();
    this.userActivityService = new UserActivityService();
  }

  /**
   * Fetch all knowledge articles from Supabase
   * @deprecated Use KnowledgeHubService.getKnowledgeArticles() instead
   */
  static async getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    console.warn(
      'KnowledgeDataService.getKnowledgeArticles() is deprecated. Use KnowledgeHubService.getKnowledgeArticles() instead.'
    );
    const service = new KnowledgeDataService();
    return service.articleService.getKnowledgeArticles();
  }

  /**
   * Fetch all knowledge categories from Supabase
   */
  static async getKnowledgeCategories(): Promise<KnowledgeCategory[]> {
    const service = new KnowledgeDataService();
    return service.categoryService.getKnowledgeCategories();
  }

  /**
   * Fetch all learning paths from Supabase
   */
  static async getLearningPathways(): Promise<KnowledgeLearningPath[]> {
    const service = new KnowledgeDataService();
    return service.learningPathService.getLearningPathways();
  }

  /**
   * Bulk update knowledge articles status using .in() operator
   */
  static async bulkUpdateArticlesStatus(
    articleIds: string[],
    status: ContentStatus
  ): Promise<BulkUpdateResult> {
    const service = new KnowledgeDataService();
    return service.articleService.bulkUpdateArticlesStatus(articleIds, status);
  }

  /**
   * Bulk update learning paths status using .in() operator
   */
  static async bulkUpdateLearningPathsStatus(
    pathwayIds: string[],
    status: LearningPathStatus
  ): Promise<BulkUpdateResult> {
    const service = new KnowledgeDataService();
    return service.learningPathService.bulkUpdateLearningPathsStatus(
      pathwayIds,
      status
    );
  }

  /**
   * Bulk delete knowledge articles (soft delete) using .in() operator
   */
  static async bulkDeleteArticles(
    articleIds: string[]
  ): Promise<BulkDeleteResult> {
    const service = new KnowledgeDataService();
    return service.articleService.bulkDeleteArticles(articleIds);
  }

  /**
   * Bulk delete learning paths (soft delete) using .in() operator
   */
  static async bulkDeleteLearningPaths(
    pathwayIds: string[]
  ): Promise<BulkDeleteResult> {
    const service = new KnowledgeDataService();
    return service.learningPathService.bulkDeleteLearningPaths(pathwayIds);
  }

  /**
   * Transaction-like bulk operation for mixed content types
   */
  static async bulkOperationWithTransaction(
    operations: BulkOperation[]
  ): Promise<{
    success: boolean;
    results: Array<{
      type: string;
      success: boolean;
      count: number;
      error?: string;
    }>;
  }> {
    const service = new KnowledgeDataService();
    return service.bulkOperationService.bulkOperationWithTransaction(
      operations
    );
  }

  /**
   * Fetch recent user activity for the recent updates panel
   * @deprecated Use KnowledgeHubService.getRecentUserActivity() instead
   */
  static async getRecentUserActivity(
    userId: string,
    limit: number = 10
  ): Promise<RecentUpdate[]> {
    console.warn(
      'KnowledgeDataService.getRecentUserActivity() is deprecated. Use KnowledgeHubService.getRecentUserActivity() instead.'
    );
    const service = new KnowledgeDataService();
    return service.userActivityService.getRecentUserActivity(userId, limit);
  }
}
