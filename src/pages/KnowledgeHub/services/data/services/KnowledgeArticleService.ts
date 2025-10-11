import { supabase } from '@/lib/supabaseClient';
import {
  KnowledgeArticle,
  BulkUpdateResult,
  BulkDeleteResult,
  ContentStatus,
} from '../../types/knowledgeHubTypes';

export class KnowledgeArticleService {
  private tableName = 'knowledge_articles';

  /**
   * Fetch all knowledge articles from Supabase
   * @deprecated Use KnowledgeHubService.getKnowledgeArticles() instead
   */
  async getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    console.warn(
      'KnowledgeArticleService.getKnowledgeArticles() is deprecated. Use KnowledgeHubService.getKnowledgeArticles() instead.'
    );
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching knowledge articles:', error);
        throw new Error(`Failed to fetch knowledge articles: ${error.message}`);
      }

      return (data as unknown as KnowledgeArticle[]) || [];
    } catch (error) {
      console.error(
        'KnowledgeArticleService.getKnowledgeArticles error:',
        error
      );
      throw error;
    }
  }

  /**
   * Bulk update knowledge articles status using .in() operator
   */
  async bulkUpdateArticlesStatus(
    articleIds: string[],
    status: ContentStatus
  ): Promise<BulkUpdateResult> {
    try {
      if (!articleIds || articleIds.length === 0) {
        return {
          success: false,
          updatedCount: 0,
          processedCount: 0,
          errors: ['No article IDs provided'],
        };
      }

      const { error, count } = await supabase
        .from(this.tableName)
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .in('id', articleIds)
        .select('id');

      if (error) {
        console.error('Error bulk updating articles status:', error);
        return {
          success: false,
          updatedCount: 0,
          processedCount: articleIds.length,
          errors: [error.message],
        };
      }

      return {
        success: true,
        updatedCount: count || 0,
        processedCount: articleIds.length,
        errors: [],
      };
    } catch (error) {
      console.error(
        'KnowledgeArticleService.bulkUpdateArticlesStatus error:',
        error
      );
      return {
        success: false,
        updatedCount: 0,
        processedCount: articleIds.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Bulk delete knowledge articles (soft delete) using .in() operator
   */
  async bulkDeleteArticles(articleIds: string[]): Promise<BulkDeleteResult> {
    try {
      if (!articleIds || articleIds.length === 0) {
        return {
          success: false,
          deletedCount: 0,
          processedCount: 0,
          errors: ['No article IDs provided'],
        };
      }

      const { error, count } = await supabase
        .from(this.tableName)
        .update({
          status: 'archived',
          updated_at: new Date().toISOString(),
        })
        .in('id', articleIds)
        .select('id');

      if (error) {
        console.error('Error bulk deleting articles:', error);
        return {
          success: false,
          deletedCount: 0,
          processedCount: articleIds.length,
          errors: [error.message],
        };
      }

      return {
        success: true,
        deletedCount: count || 0,
        processedCount: articleIds.length,
        errors: [],
      };
    } catch (error) {
      console.error('KnowledgeArticleService.bulkDeleteArticles error:', error);
      return {
        success: false,
        deletedCount: 0,
        processedCount: articleIds.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}
