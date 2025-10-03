// ============================================================================
// KNOWLEDGE HUB CATEGORY PROVIDER - Category Operations
// ============================================================================

import { UnifiedDatabaseAdapter } from '../../pages/KnowledgeHub/services/adapters/unifiedDatabaseAdapter';

export class KnowledgeHubCategoryProvider {
  /**
   * Get knowledge categories
   */
  static async getKnowledgeCategories(): Promise<string[]> {
    try {
      const adapter = new UnifiedDatabaseAdapter();
      const categories = await adapter.getKnowledgeCategories();
      return categories.map((cat) => cat.name);
    } catch (error) {
      console.error('Failed to get knowledge categories:', error);
      throw error;
    }
  }

  /**
   * Add category
   */
  static async addCategory(category: string): Promise<string> {
    try {
      const adapter = new UnifiedDatabaseAdapter();
      const result = await adapter.addCategory(category);

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.category) {
        throw new Error('No category returned from creation');
      }

      return result.category.name;
    } catch (error) {
      console.error('Failed to add category:', error);
      throw error;
    }
  }

  /**
   * Delete category
   */
  static async deleteCategory(category: string): Promise<void> {
    try {
      const adapter = new UnifiedDatabaseAdapter();
      const result = await adapter.deleteCategory(category);

      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  }
}
