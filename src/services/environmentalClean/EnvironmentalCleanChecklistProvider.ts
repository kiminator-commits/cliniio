import { supabase } from '@/lib/supabase';
import { Checklist } from '../../pages/EnvironmentalClean/types';
import { createUserFriendlyError } from '../../pages/EnvironmentalClean/services/errors/EnvironmentalCleanServiceError';

/**
 * Provider for environmental cleaning checklist operations
 */
export class EnvironmentalCleanChecklistProvider {
  /**
   * Fetch checklists from the environmental_cleaning_checklists table
   */
  static async fetchChecklists(): Promise<Checklist[]> {
    try {
      console.log('🔍 Fetching environmental cleaning checklists...');
      const { data, error } = await supabase
        .from('environmental_cleaning_task_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log(
        '✅ Checklists fetched successfully:',
        data?.length || 0,
        'records'
      );

      // Transform Supabase data to Checklist format
      return (data || []).map(
        (item: {
          id: string;
          name: string;
          data: { description?: string };
        }) => ({
          id: item.id as string,
          name: item.name as string,
          description: (item.data as { description?: string })
            ?.description as string,
          items: [], // Task items will be fetched separately if needed
          isActive: item.is_active as boolean,
          createdAt: item.created_at as string,
          updatedAt: item.updated_at as string,
        })
      );
    } catch (error) {
      console.error('❌ Error fetching checklists:', error);
      throw createUserFriendlyError(error as Error, 'fetchChecklists');
    }
  }
}
