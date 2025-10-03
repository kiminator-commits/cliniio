import { ContentItem as LibraryContentItem } from '../libraryTypes';
import {
  ContentItem as KnowledgeHubContentItem,
  ContentCategory,
} from '../../../pages/KnowledgeHub/types';
import {
  AutoCategorizationResult,
  CategorySyncResult,
  CategoryStatistics,
  CategoryMetadata,
} from './types/categoryTypes';
import { CategoryMappingService } from './mapping/CategoryMappingService';
import { CategoryAnalyzer } from './analysis/CategoryAnalyzer';
import { CategoryMetadataService } from './metadata/CategoryMetadataService';
import { CategoryDatabaseService } from './database/CategoryDatabaseService';

export class CategoryOrganizationService {
  private mappingService: CategoryMappingService;
  private analyzer: CategoryAnalyzer;
  private metadataService: CategoryMetadataService;
  private databaseService: CategoryDatabaseService;

  constructor() {
    this.mappingService = new CategoryMappingService();
    this.analyzer = new CategoryAnalyzer(this.mappingService);
    this.metadataService = new CategoryMetadataService();
    this.databaseService = new CategoryDatabaseService();
  }

  /**
   * Automatically categorize content based on title, description, and category
   */
  async autoCategorizeContent(
    content: LibraryContentItem | KnowledgeHubContentItem
  ): Promise<AutoCategorizationResult> {
    return this.analyzer.autoCategorizeContent(content);
  }

  /**
   * Sync library category to Knowledge Hub category
   */
  async syncCategoryToKnowledgeHub(
    libraryItem: LibraryContentItem
  ): Promise<CategorySyncResult> {
    try {
      // Get auto-categorization result
      const categorization = await this.autoCategorizeContent(libraryItem);

      // Determine if review is needed
      const needsReview = categorization.confidence < 0.7;

      return {
        success: true,
        mappedCategory: categorization.category,
        originalCategory: libraryItem.category,
        confidence: categorization.confidence,
        reasoning: categorization.reasoning,
        needsReview,
      };
    } catch (error) {
      console.error('Error syncing category:', error);
      return {
        success: false,
        mappedCategory: 'Courses',
        originalCategory: libraryItem.category,
        confidence: 0,
        reasoning: ['Error occurred during categorization'],
        needsReview: true,
      };
    }
  }

  /**
   * Get category statistics for Knowledge Hub
   */
  async getCategoryStatistics(userId?: string): Promise<CategoryStatistics> {
    return this.databaseService.getCategoryStatistics(userId);
  }

  /**
   * Validate and normalize category names
   */
  validateCategory(category: string): ContentCategory {
    return this.mappingService.validateCategory(category);
  }

  /**
   * Get all valid Knowledge Hub categories
   */
  getValidCategories(): ContentCategory[] {
    return this.mappingService.getValidCategories();
  }

  /**
   * Get category description and metadata
   */
  getCategoryMetadata(category: ContentCategory): CategoryMetadata {
    return this.metadataService.getCategoryMetadata(category);
  }


  /**
   * Update content category in Knowledge Hub
   */
  async updateContentCategory(
    contentId: string,
    newCategory: ContentCategory,
    userId?: string
  ): Promise<boolean> {
    return this.databaseService.updateContentCategory(contentId, newCategory, userId);
  }

  /**
   * Get content by category
   */
  async getContentByCategory(
    category: ContentCategory,
    userId?: string
  ): Promise<KnowledgeHubContentItem[]> {
    return this.databaseService.getContentByCategory(category, userId);
  }
}

// Export singleton instance
export const categoryOrganizationService = new CategoryOrganizationService();
