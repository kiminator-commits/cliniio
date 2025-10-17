import { ContentItem } from '../types';
import { KnowledgeHubSupabaseService } from './knowledgeHubSupabaseService';

/**
 * Knowledge Hub API Service
 * 
 * This service provides a simplified API interface for Knowledge Hub operations.
 * It wraps the existing knowledgeHubSupabaseService to provide a consistent API.
 */
export const knowledgeHubApiService = {
  /**
   * Fetch all content items
   */
  async fetchContent(): Promise<ContentItem[]> {
    try {
        const service = new KnowledgeHubSupabaseService();
        const result = await service.fetchContent();
      return result || [];
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  },

  /**
   * Create new content item
   */
  async createContent(contentData: Partial<ContentItem>): Promise<ContentItem> {
    try {
      const service = new KnowledgeHubSupabaseService();
      return await service.createContent(contentData);
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  },

  /**
   * Update existing content item
   */
  async updateContent(id: string, updates: Partial<ContentItem>): Promise<ContentItem> {
    try {
      const service = new KnowledgeHubSupabaseService();
      return await service.updateContent(id, updates);
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  },

  /**
   * Delete content item
   */
  async deleteContent(id: string): Promise<void> {
    try {
      const service = new KnowledgeHubSupabaseService();
      await service.deleteContent(id);
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  },

  /**
   * Update content status
   */
  async updateContentStatus(id: string, status: string): Promise<ContentItem> {
    try {
      const service = new KnowledgeHubSupabaseService();
      return await service.updateContent(id, { status });
    } catch (error) {
      console.error('Error updating content status:', error);
      throw error;
    }
  },

  /**
   * Search content
   */
  async searchContent(query: string): Promise<ContentItem[]> {
    try {
      const service = new KnowledgeHubSupabaseService();
      const result = await service.searchContent(query);
      return result || [];
    } catch (error) {
      console.error('Error searching content:', error);
      throw error;
    }
  }
};
