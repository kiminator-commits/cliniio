import { supabase } from '@/lib/supabaseClient';
import { KnowledgeCategory } from '../../types/knowledgeHubTypes';

export class KnowledgeCategoryService {
  private tableName = 'knowledge_categories';

  /**
   * Fetch all knowledge categories from Supabase
   */
  async getKnowledgeCategories(): Promise<KnowledgeCategory[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching knowledge categories:', error);
        throw new Error(
          `Failed to fetch knowledge categories: ${error.message}`
        );
      }

      return (data as unknown as KnowledgeCategory[]) || [];
    } catch (error) {
      console.error(
        'KnowledgeCategoryService.getKnowledgeCategories error:',
        error
      );
      throw error;
    }
  }
}
