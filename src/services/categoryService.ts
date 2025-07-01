import { supabase } from '../lib/supabaseClient';
import { useInventoryStore } from '../store/useInventoryStore';

export const categoryService = {
  async fetchCategories(): Promise<string[]> {
    const setCategoriesLoading = useInventoryStore.getState().setCategoriesLoading;
    setCategoriesLoading(true);

    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
      return data.map((row: { name: string }) => row.name);
    } finally {
      setCategoriesLoading(false);
    }
  },

  async addCategory(category: string): Promise<string> {
    const { error } = await supabase.from('categories').insert([{ name: category }]);
    if (error) {
      console.error('Error adding category:', error);
      throw error;
    }
    return category;
  },

  async deleteCategory(category: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('name', category);
    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },
};
