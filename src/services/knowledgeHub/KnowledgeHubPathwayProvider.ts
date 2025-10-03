// ============================================================================
// KNOWLEDGE HUB PATHWAY PROVIDER - Learning Pathway Operations
// ============================================================================

import { ContentItem, ContentCategory, ContentStatus } from '../../pages/KnowledgeHub/types';
import { UnifiedDatabaseAdapter } from '../../pages/KnowledgeHub/services/adapters/unifiedDatabaseAdapter';

export class KnowledgeHubPathwayProvider {
  /**
   * Get all learning pathways
   */
  static async getLearningPathways(): Promise<ContentItem[]> {
    try {
      const adapter = new UnifiedDatabaseAdapter();
      const pathways = await adapter.getLearningPathways();
      return pathways.map((pathway) => ({
        id: pathway.id,
        title: pathway.title,
        category: 'Learning Pathways' as ContentCategory,
        status: 'draft' as ContentStatus,
        dueDate: pathway.created_at || new Date().toISOString(),
        progress: 0,
        lastUpdated: pathway.updated_at,
        description: pathway.description,
        createdAt: pathway.created_at,
      }));
    } catch (error) {
      console.error('Failed to get learning pathways:', error);
      throw error;
    }
  }

  /**
   * Get learning pathway by ID
   */
  static async getLearningPathwayById(id: string): Promise<ContentItem | null> {
    try {
      const adapter = new UnifiedDatabaseAdapter();
      const result = await adapter.getLearningPathById(id);

      if (result.error || !result.data) {
        return null;
      }

      const pathway = result.data as {
        id: string;
        title: string;
        description?: string;
        created_at?: string;
        updated_at?: string;
      };
      return {
        id: pathway.id,
        title: pathway.title,
        category: 'Learning Pathways' as ContentCategory,
        status: 'draft' as ContentStatus,
        dueDate: pathway.created_at || new Date().toISOString(),
        progress: 0,
        lastUpdated: pathway.updated_at,
        description: pathway.description,
        createdAt: pathway.created_at,
      };
    } catch (error) {
      console.error('Failed to get learning pathway by ID:', error);
      throw error;
    }
  }

  /**
   * Create learning pathway
   */
  static async createLearningPathway(
    pathway: Omit<ContentItem, 'id' | 'createdAt'>
  ): Promise<ContentItem> {
    try {
      const adapter = new UnifiedDatabaseAdapter();

      const pathwayData = {
        title: pathway.title,
        description: pathway.description || '',
        category: pathway.category,
        difficulty: 'beginner', // Default difficulty
        estimated_time: '30 minutes', // Default time
        is_active: true,
      };

      const result = await adapter.createLearningPath(pathwayData);

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.pathway) {
        throw new Error('No pathway returned from creation');
      }

      // Transform the database pathway back to ContentItem format
      return {
        id: result.pathway.id,
        title: result.pathway.title,
        category: result.pathway.category as ContentItem['category'],
        status: 'draft',
        dueDate: new Date().toISOString(),
        progress: 0,
        description: result.pathway.description,
        createdAt: result.pathway.created_at,
        lastUpdated: result.pathway.updated_at,
      };
    } catch (error) {
      console.error('Failed to create learning pathway:', error);
      throw error;
    }
  }

  /**
   * Update learning pathway
   */
  static async updateLearningPathway(
    id: string,
    updates: Partial<ContentItem>
  ): Promise<ContentItem> {
    try {
      const adapter = new UnifiedDatabaseAdapter();

      // Convert ContentItem updates to KnowledgeLearningPath format
      const pathwayUpdates: Record<string, unknown> = {};
      if (updates.title) pathwayUpdates.title = updates.title;
      if (updates.description) pathwayUpdates.description = updates.description;
      if (updates.category) pathwayUpdates.category = updates.category;

      const result = await adapter.updateLearningPath(id, pathwayUpdates);

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.pathway) {
        throw new Error('No pathway returned from update');
      }

      // Transform the database pathway back to ContentItem format
      return {
        id: result.pathway.id,
        title: result.pathway.title,
        category: result.pathway.category as ContentItem['category'],
        status: 'draft',
        dueDate: new Date().toISOString(),
        progress: 0,
        description: result.pathway.description,
        createdAt: result.pathway.created_at,
        lastUpdated: result.pathway.updated_at,
      };
    } catch (error) {
      console.error('Failed to update learning pathway:', error);
      throw error;
    }
  }

  /**
   * Delete learning pathway
   */
  static async deleteLearningPathway(id: string): Promise<void> {
    try {
      const adapter = new UnifiedDatabaseAdapter();
      const result = await adapter.deleteLearningPath(id);

      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to delete learning pathway:', error);
      throw error;
    }
  }

  /**
   * Update learning path status
   */
  static async updateLearningPathStatus(
    id: string,
    isActive: boolean
  ): Promise<void> {
    try {
      const adapter = new UnifiedDatabaseAdapter();
      const result = await adapter.updateLearningPathStatus(id, isActive);

      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to update learning path status:', error);
      throw error;
    }
  }
}
