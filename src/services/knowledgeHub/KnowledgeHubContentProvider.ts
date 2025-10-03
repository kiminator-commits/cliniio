// ============================================================================
// KNOWLEDGE HUB CONTENT PROVIDER - Content CRUD Operations
// ============================================================================

import { ContentItem, ContentStatus } from '../../pages/KnowledgeHub/types';
import { UnifiedDatabaseAdapter } from '../../pages/KnowledgeHub/services/adapters/unifiedDatabaseAdapter';
import { convertStringToContentCategory } from './KnowledgeHubUtils';

export class KnowledgeHubContentProvider {
  /**
   * Get all knowledge articles
   */
  static async getKnowledgeArticles(): Promise<ContentItem[]> {
    try {
      const adapter = new UnifiedDatabaseAdapter();
      const articles = await adapter.getKnowledgeArticles();
      return articles.map((article) => ({
        id: article.id,
        title: article.title,
        category: convertStringToContentCategory(article.category || 'Courses'),
        status: 'draft' as ContentStatus,
        dueDate: article.published_at || new Date().toISOString(),
        progress: 0,
        lastUpdated: article.updated_at,
        description: article.summary,
        tags: article.tags,
        createdAt: article.created_at,
      }));
    } catch (error) {
      console.error('Failed to get knowledge articles:', error);
      throw error;
    }
  }

  /**
   * Get knowledge article by ID
   */
  static async getKnowledgeArticleById(
    id: string
  ): Promise<ContentItem | null> {
    try {
      const adapter = new UnifiedDatabaseAdapter();
      const result = await adapter.getArticleById(id);

      if (result.error || !result.data) {
        return null;
      }

      const article = result.data as {
        id: string;
        title: string;
        content: string;
        category?: string;
        status?: string;
      };
      return {
        id: article.id,
        title: article.title,
        category: convertStringToContentCategory(article.category || 'Courses'),
        status: 'draft' as ContentStatus,
        dueDate: article.published_at || new Date().toISOString(),
        progress: 0,
        lastUpdated: article.updated_at,
        description: article.summary,
        tags: article.tags,
        createdAt: article.created_at,
      };
    } catch (error) {
      console.error('Failed to get knowledge article by ID:', error);
      throw error;
    }
  }

  /**
   * Create knowledge article
   */
  static async createKnowledgeArticle(
    article: Omit<ContentItem, 'id' | 'createdAt'>
  ): Promise<ContentItem> {
    try {
      const adapter = new UnifiedDatabaseAdapter();
      const result = await adapter.createArticle({
        title: article.title,
        content: article.description || '', // Use description as content
        summary: article.description || '',
        category: article.category,
        tags: article.tags || [],
        status: 'draft' as ContentStatus,
      });

      if (result.error) {
        throw new Error(result.error as string);
      }

      if (!result.article) {
        throw new Error('Failed to create article');
      }

      return {
        id: result.article.id,
        title: result.article.title,
        category: convertStringToContentCategory(
          result.article.category || 'Courses'
        ),
        status: result.article.status,
        dueDate: result.article.published_at || new Date().toISOString(),
        progress: 0,
        lastUpdated: result.article.updated_at,
        description: result.article.summary,
        tags: result.article.tags,
        createdAt: result.article.created_at,
      };
    } catch (error) {
      console.error('Failed to create knowledge article:', error);
      throw error;
    }
  }

  /**
   * Update knowledge article
   */
  static async updateKnowledgeArticle(
    id: string,
    updates: Partial<ContentItem>
  ): Promise<ContentItem> {
    try {
      const adapter = new UnifiedDatabaseAdapter();

      // Convert ContentItem updates to KnowledgeArticle format
      const articleUpdates: Record<string, unknown> = {};
      if (updates.title) articleUpdates.title = updates.title;
      if (updates.description) articleUpdates.summary = updates.description;
      if (updates.category) articleUpdates.category_id = updates.category;
      if (updates.tags) articleUpdates.tags = updates.tags;
      if (updates.status) {
        articleUpdates.status =
          updates.status === 'review' ? 'published' : 'draft';
      }

      const result = await adapter.updateArticle(id, articleUpdates);

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.article) {
        throw new Error('No article returned from update');
      }

      // Transform the database article back to ContentItem format
      return {
        id: result.article.id,
        title: result.article.title,
        category: convertStringToContentCategory(result.article.category),
        status: result.article.status,
        dueDate: result.article.published_at || new Date().toISOString(),
        progress: 0, // Default progress
        description: result.article.summary,
        tags: result.article.tags,
        createdAt: result.article.created_at,
        lastUpdated: result.article.updated_at,
      };
    } catch (error) {
      console.error('Failed to update knowledge article:', error);
      throw error;
    }
  }

  /**
   * Delete knowledge article
   */
  static async deleteKnowledgeArticle(id: string): Promise<void> {
    try {
      const adapter = new UnifiedDatabaseAdapter();
      const result = await adapter.deleteArticle(id);

      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to delete knowledge article:', error);
      throw error;
    }
  }

  /**
   * Update content status
   */
  static async updateContentStatus(
    id: string,
    status: ContentStatus
  ): Promise<void> {
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
      const result = await adapter.updateArticleStatus(id, databaseStatus);

      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to update content status:', error);
      throw error;
    }
  }
}
