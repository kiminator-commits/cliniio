import { supabase } from '../../../../lib/supabase';
import {
  ContentItem as KnowledgeHubContentItem,
  ContentCategory,
  ContentStatus,
} from '../../../../pages/KnowledgeHub/types';
import { CategoryStatistics } from '../types/categoryTypes';

// Define interface for database item
interface DatabaseContentItem {
  id: string;
  title: string;
  category: string;
  status: string;
  due_date?: string;
  progress?: number;
  department?: string;
  updated_at?: string;
  description?: string;
  tags?: string[];
  domain?: string;
  content_type?: string;
  created_by: string;
  created_at: string;
}

export class CategoryDatabaseService {
  private tableName = 'knowledge_hub_content';

  /**
   * Get category statistics for Knowledge Hub
   */
  async getCategoryStatistics(userId?: string): Promise<CategoryStatistics> {
    try {
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return this.getEmptyCategoryStats();
        userId = user.id;
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .select('category')
        .eq('created_by', userId);

      if (error) throw error;

      const stats = this.getEmptyCategoryStats();
      data?.forEach((item: { category: string }) => {
        const category = item.category as ContentCategory;
        if (category && Object.prototype.hasOwnProperty.call(stats, category)) {
          stats[category]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting category statistics:', error);
      return this.getEmptyCategoryStats();
    }
  }

  /**
   * Update content category in Knowledge Hub
   */
  async updateContentCategory(
    contentId: string,
    newCategory: ContentCategory,
    userId?: string
  ): Promise<boolean> {
    try {
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;
        userId = user.id;
      }

      const { error } = await supabase
        .from(this.tableName)
        .update({
          category: newCategory,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contentId)
        .eq('created_by', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating content category:', error);
      return false;
    }
  }

  /**
   * Get content by category
   */
  async getContentByCategory(
    category: ContentCategory,
    userId?: string
  ): Promise<KnowledgeHubContentItem[]> {
    try {
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return [];
        userId = user.id;
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('created_by', userId)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (
        data?.map(
          (item: {
            id: string;
            title: string;
            category: string;
            status: string;
            due_date?: string;
            progress?: number;
            department: string;
          }) => ({
            id: item.id as string,
            title: item.title as string,
            category: item.category as ContentCategory,
            status: item.status as ContentStatus,
            dueDate: (item.due_date as string) || '',
            progress: (item.progress as number) || 0,
            department: item.department as string,
            lastUpdated:
              (item as DatabaseContentItem).updated_at ||
              new Date().toISOString(),
            description: (item as DatabaseContentItem).description || '',
            tags: (item as DatabaseContentItem).tags || [],
            domain: (item as DatabaseContentItem).domain || '',
            contentType: (item as DatabaseContentItem).content_type || '',
          })
        ) || []
      );
    } catch (error) {
      console.error('Error getting content by category:', error);
      return [];
    }
  }

  /**
   * Get empty category statistics
   */
  private getEmptyCategoryStats(): CategoryStatistics {
    return {
      Courses: 0,
      Procedures: 0,
      Policies: 0,
      'Learning Pathways': 0,
      Advanced: 0,
    };
  }
}
