import { supabase } from '@/lib/supabase';
import { ContentItem } from '../libraryTypes';
import { ContentStatus as _ContentStatus } from '@/pages/KnowledgeHub/types';
import { categoryOrganizationService as _categoryOrganizationService } from './categoryOrganizationService';

export interface KnowledgeHubIntegrationError extends Error {
  code: string;
  details?: unknown;
}

export class KnowledgeHubIntegrationService {
  private tableName = 'knowledge_hub_content';

  /**
   * Add content from library to user's Knowledge Hub
   */
  async addToKnowledgeHub(
    libraryItem: ContentItem,
    userId?: string
  ): Promise<{ success: boolean; message: string; contentId?: string }> {
    try {
      // Get current user if not provided
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        userId = user.id;
      }

      // Check if content already exists in user's Knowledge Hub
      const existingContent = await this.checkExistingContent(
        libraryItem.id,
        userId
      );
      if (existingContent) {
        return {
          success: false,
          message: 'This content is already in your Knowledge Hub',
          contentId: existingContent.id,
        };
      }

      // Transform library item to Knowledge Hub format
      const knowledgeHubItem = await this.transformLibraryToKnowledgeHub(
        libraryItem,
        userId
      );

      // Insert into Knowledge Hub
      const { data, error } = await supabase
        .from('knowledge_hub_content')
        .insert([knowledgeHubItem])
        .select()
        .single();

      if (error) {
        console.error('Error adding to Knowledge Hub:', error);
        throw new Error(`Failed to add content: ${error.message}`);
      }

      return {
        success: true,
        message: `"${libraryItem.title}" added to your Knowledge Hub`,
        contentId: data.id ? String(data.id) : undefined,
      };
    } catch (error) {
      console.error('Knowledge Hub integration error:', error);
      const integrationError = new Error(
        error instanceof Error
          ? error.message
          : 'Failed to add content to Knowledge Hub'
      ) as KnowledgeHubIntegrationError;
      integrationError.code = 'INTEGRATION_ERROR';
      integrationError.details = error;
      throw integrationError;
    }
  }

  /**
   * Check if content already exists in user's Knowledge Hub
   */
  private async checkExistingContent(
    libraryItemId: string,
    userId: string
  ): Promise<{ id: string } | null> {
    try {
      const { data, error } = await supabase
        .from('knowledge_hub_content')
        .select('id')
        .eq('author_id', userId)
        .eq('title', libraryItemId) // Using title as a unique identifier for now
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error
        throw error;
      }

      return data ? (data as { id: string }) : null;
    } catch (error) {
      console.error('Error checking existing content:', error);
      return null;
    }
  }

  /**
   * Transform library content item to Knowledge Hub format
   */
  private async transformLibraryToKnowledgeHub(
    libraryItem: ContentItem,
    userId: string
  ): Promise<Record<string, unknown>> {
    const contentPayload = {
      description: libraryItem.data?.description || null,
      media: libraryItem.data?.media || null,
      requirements: libraryItem.data?.requirements || [],
      steps: libraryItem.data?.steps || [],
    };

    return {
      id: libraryItem.id || crypto.randomUUID(),
      title: libraryItem.title,
      content_type: libraryItem.category || 'generic',
      content: contentPayload, // required JSON column
      domain: null, // Domain not available in ContentItem
      tags: [libraryItem.category, libraryItem.level].filter(Boolean),
      status: 'not_started',
      author_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    };
  }

  /**
   * Map library content type to Knowledge Hub content type
   */
  private mapContentType(category: string): string {
    const typeMapping: Record<string, string> = {
      Courses: 'course',
      'Learning Pathways': 'learning_pathway',
      Procedures: 'procedure',
      Policies: 'policy',
      'SDS Sheets': 'procedure',
    };

    return typeMapping[category] || 'course';
  }

  /**
   * Get user's Knowledge Hub content count
   */
  async getUserContentCount(userId?: string): Promise<number> {
    try {
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return 0;
        userId = user.id;
      }

      const { count, error } = await supabase
        .from('knowledge_hub_content')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId);

      if (error) throw error;
      return (count as number) || 0;
    } catch (error) {
      console.error('Error getting user content count:', error);
      return 0;
    }
  }

  /**
   * Remove content from Knowledge Hub
   */
  async removeFromKnowledgeHub(
    contentId: string,
    userId?: string
  ): Promise<boolean> {
    try {
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        userId = user.id;
      }

      const { error } = await supabase
        .from('knowledge_hub_content')
        .delete()
        .eq('id', contentId)
        .eq('author_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from Knowledge Hub:', error);
      return false;
    }
  }
}

// Export singleton instance
export const knowledgeHubIntegrationService =
  new KnowledgeHubIntegrationService();
