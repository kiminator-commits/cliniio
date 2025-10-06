import { InventoryDataAdapter } from '../../adapters/InventoryDataAdapter';
import { InventoryErrorHandler } from '../../InventoryErrorHandler';
import { cacheInvalidationService } from '../../../cache/cacheInvalidationCompatibility';
import { logEvent, trackUserAction } from '../../../../utils/monitoring';
import { trackEvent as trackAnalyticsEvent } from '../../../analytics';

export interface CategorizedItems {
  tools: Record<string, unknown>[];
  supplies: Record<string, unknown>[];
  equipment: Record<string, unknown>[];
  officeHardware: Record<string, unknown>[];
}

// Export utility functions for backward compatibility
export function normalizeCategory(category: string): string {
  return InventoryCategoryProvider.normalizeCategory(category);
}

export function categorizeItems(
  normalized: Record<string, unknown>[]
): CategorizedItems {
  return InventoryCategoryProvider.categorizeItems(normalized);
}

export function withNormalizedCategory<T extends { category?: string | null }>(
  items: T[]
): T[] {
  return InventoryCategoryProvider.withNormalizedCategory(items);
}

export class InventoryCategoryProvider {
  private adapter: InventoryDataAdapter;
  private adapterType: string;

  constructor(adapter: InventoryDataAdapter, adapterType: string) {
    this.adapter = adapter;
    this.adapterType = adapterType;
  }

  /**
   * Normalize categories to one of the four main buckets
   */
  static normalizeCategory(category: string): string {
    const normalized = category.toLowerCase().trim();

    if (
      normalized.includes('mask') ||
      normalized.includes('glove') ||
      normalized.includes('gown') ||
      normalized.includes('supply')
    ) {
      return 'Supplies';
    }

    if (
      normalized.includes('scalpel') ||
      normalized.includes('forceps') ||
      normalized.includes('tool') ||
      normalized.includes('instrument')
    ) {
      return 'Tools';
    }

    if (
      normalized.includes('chair') ||
      normalized.includes('autoclave') ||
      normalized.includes('machine') ||
      normalized.includes('equipment')
    ) {
      return 'Equipment';
    }

    if (
      normalized.includes('computer') ||
      normalized.includes('printer') ||
      normalized.includes('office') ||
      normalized.includes('hardware')
    ) {
      return 'Office Hardware';
    }

    // Fallback
    return 'Tools';
  }

  /**
   * Categorize items into normalized buckets
   */
  static categorizeItems(
    normalized: Record<string, unknown>[]
  ): CategorizedItems {
    const tools: Record<string, unknown>[] = [];
    const supplies: Record<string, unknown>[] = [];
    const equipment: Record<string, unknown>[] = [];
    const officeHardware: Record<string, unknown>[] = [];

    normalized.forEach((item) => {
      const normalizedCategory = this.normalizeCategory(
        String(item.category || '')
      );

      switch (normalizedCategory) {
        case 'Tools':
          tools.push(item);
          break;
        case 'Supplies':
          supplies.push(item);
          break;
        case 'Equipment':
          equipment.push(item);
          break;
        case 'Office Hardware':
          officeHardware.push(item);
          break;
        default:
          tools.push(item);
          break;
      }
    });

    return { tools, supplies, equipment, officeHardware };
  }

  /**
   * Apply normalized category to items
   */
  static withNormalizedCategory<T extends { category?: string | null }>(
    items: T[]
  ): T[] {
    return items.map((it) => ({
      ...it,
      category: this.normalizeCategory(it.category),
    }));
  }

  /**
   * Add category
   */
  async addCategory(
    category: string
  ): Promise<{ success: boolean; error: string | null }> {
    const result = await InventoryErrorHandler.handleOperation(
      'addCategory',
      async () => {
        await this.adapter.addCategory(category);
        cacheInvalidationService.invalidateRelated(
          'inventory:categories',
          category
        );

        // Track category creation
        logEvent(
          'inventory',
          'category_created',
          `Category created: ${category}`,
          'info',
          {
            category,
            adapterType: this.adapterType,
          }
        );

        trackUserAction('create_category', 'inventory', { category });

        trackAnalyticsEvent('inventory_category_created', {
          category,
          adapterType: this.adapterType,
        });

        return true;
      }
    );

    return { success: result, error: null };
  }

  /**
   * Delete category
   */
  async deleteCategory(
    category: string
  ): Promise<{ success: boolean; error: string | null }> {
    const result = await InventoryErrorHandler.handleOperation(
      'deleteCategory',
      async () => {
        await this.adapter.deleteCategory(category);
        cacheInvalidationService.invalidateRelated(
          'inventory:categories',
          category
        );

        // Track category deletion
        logEvent(
          'inventory',
          'category_deleted',
          `Category deleted: ${category}`,
          'info',
          {
            category,
            adapterType: this.adapterType,
          }
        );

        trackUserAction('delete_category', 'inventory', { category });

        trackAnalyticsEvent('inventory_category_deleted', {
          category,
          adapterType: this.adapterType,
        });

        return true;
      }
    );

    return { success: result, error: null };
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<{ data: string[]; error: string | null }> {
    const result = await InventoryErrorHandler.handleOperation(
      'getCategories',
      async () => {
        return await this.adapter.fetchCategories();
      }
    );

    return { data: result, error: null };
  }

  /**
   * Get normalized categories
   */
  async getNormalizedCategories(): Promise<{
    data: string[];
    error: string | null;
  }> {
    const result = await InventoryErrorHandler.handleOperation(
      'getNormalizedCategories',
      async () => {
        const categories = await this.adapter.fetchCategories();
        const normalizedCategories = categories.map((category) =>
          InventoryCategoryProvider.normalizeCategory(category)
        );
        return Array.from(new Set(normalizedCategories));
      }
    );

    return { data: result, error: null };
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(): Promise<{
    data: Record<string, number> | null;
    error: string | null;
  }> {
    const result = await InventoryErrorHandler.handleOperation(
      'getCategoryStats',
      async () => {
        const allItems = await this.adapter.fetchInventoryItems();
        const stats: Record<string, number> = {};

        allItems.forEach((item) => {
          const normalizedCategory =
            InventoryCategoryProvider.normalizeCategory(item.category || '');
          stats[normalizedCategory] = (stats[normalizedCategory] || 0) + 1;
        });

        return stats;
      }
    );

    return { data: result, error: null };
  }

  /**
   * Validate category name
   */
  static validateCategoryName(category: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!category || category.trim() === '') {
      errors.push('Category name is required');
    }

    if (category.length > 100) {
      errors.push('Category name must be less than 100 characters');
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(category)) {
      errors.push('Category name contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get category suggestions based on item name
   */
  static getCategorySuggestions(itemName: string): string[] {
    const name = itemName.toLowerCase();
    const suggestions: string[] = [];

    if (
      name.includes('mask') ||
      name.includes('glove') ||
      name.includes('gown')
    ) {
      suggestions.push('Supplies');
    }

    if (
      name.includes('scalpel') ||
      name.includes('forceps') ||
      name.includes('tool')
    ) {
      suggestions.push('Tools');
    }

    if (
      name.includes('chair') ||
      name.includes('autoclave') ||
      name.includes('machine')
    ) {
      suggestions.push('Equipment');
    }

    if (
      name.includes('computer') ||
      name.includes('printer') ||
      name.includes('office')
    ) {
      suggestions.push('Office Hardware');
    }

    // If no specific suggestions, return all categories
    if (suggestions.length === 0) {
      suggestions.push('Tools', 'Supplies', 'Equipment', 'Office Hardware');
    }

    return suggestions;
  }

  /**
   * Merge duplicate categories
   */
  async mergeCategories(
    sourceCategory: string,
    targetCategory: string
  ): Promise<{ success: boolean; error: string | null }> {
    const result = await InventoryErrorHandler.handleOperation(
      'mergeCategories',
      async () => {
        const allItems = await this.adapter.fetchInventoryItems();
        const itemsToUpdate = allItems.filter(
          (item) => item.category === sourceCategory
        );

        // Update items to use target category
        for (const item of itemsToUpdate) {
          await this.adapter.updateInventoryItem(item.id, {
            category: targetCategory,
          });
        }

        // Delete source category if it's empty
        const remainingItems = await this.adapter.fetchInventoryItems();
        const hasRemainingItems = remainingItems.some(
          (item) => item.category === sourceCategory
        );

        if (!hasRemainingItems) {
          await this.adapter.deleteCategory(sourceCategory);
        }

        // Track category merge
        logEvent(
          'inventory',
          'category_merged',
          `Category merged: ${sourceCategory} -> ${targetCategory}`,
          'info',
          {
            sourceCategory,
            targetCategory,
            itemsUpdated: itemsToUpdate.length,
            adapterType: this.adapterType,
          }
        );

        trackUserAction('merge_category', 'inventory', {
          sourceCategory,
          targetCategory,
          itemsUpdated: itemsToUpdate.length,
        });

        trackAnalyticsEvent('inventory_category_merged', {
          sourceCategory,
          targetCategory,
          itemsUpdated: itemsToUpdate.length,
          adapterType: this.adapterType,
        });

        return true;
      }
    );

    return { success: result, error: null };
  }
}
