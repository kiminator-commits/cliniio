// ============================================================================
// KNOWLEDGE HUB ACTIVITY PROVIDER - User Activity and Content Aggregation
// ============================================================================

import { ContentItem } from '../../pages/KnowledgeHub/types';
import { UnifiedDatabaseAdapter } from '../../pages/KnowledgeHub/services/adapters/unifiedDatabaseAdapter';
import { KnowledgeHubContentProvider } from './KnowledgeHubContentProvider';
import { KnowledgeHubPathwayProvider } from './KnowledgeHubPathwayProvider';

export class KnowledgeHubActivityProvider {
  /**
   * Get recent user activity
   */
  static async getRecentUserActivity(userId?: string, limit?: number): Promise<Record<string, unknown>[]> {
    try {
      const adapter = new UnifiedDatabaseAdapter();
      return await adapter.getRecentUserActivity(userId, limit);
    } catch (error) {
      console.error('Failed to get recent user activity:', error);
      throw error;
    }
  }

  /**
   * Get all content (articles and learning pathways)
   */
  static async getAllContent(): Promise<ContentItem[]> {
    try {
      const [articles, pathways] = await Promise.all([
        KnowledgeHubContentProvider.getKnowledgeArticles(),
        KnowledgeHubPathwayProvider.getLearningPathways(),
      ]);

      return [...articles, ...pathways];
    } catch (error) {
      console.error('Failed to get all content:', error);
      throw error;
    }
  }
}
