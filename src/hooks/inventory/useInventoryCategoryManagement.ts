import { useCallback, useState } from 'react';
import { useInventoryDataManager } from './useInventoryDataManager';
import { useErrorRecovery } from '../useErrorRecovery';
import { inventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';
import { InventoryItem } from '@/types/inventoryTypes';

interface CategoryManagementState {
  isLoading: boolean;
  error: string | null;
  lastOperation: 'add' | 'delete' | 'update' | null;
  operationTimestamp: Date | null;
}

interface CategoryManagementOperations {
  // Category CRUD operations
  addCategory: (category: string) => Promise<void>;
  deleteCategory: (category: string) => Promise<void>;
  updateCategory: (oldCategory: string, newCategory: string) => Promise<void>;

  // Category queries
  getCategories: () => string[];
  getCategoryStats: (category: string) => {
    itemCount: number;
    totalValue: number;
    averageValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
  getItemsByCategory: (category: string) => InventoryItem[];

  // Category validation
  validateCategoryName: (category: string) => {
    isValid: boolean;
    errors: string[];
  };
  isCategoryInUse: (category: string) => boolean;

  // Utility operations
  resetError: () => void;
  retryLastOperation: () => Promise<void>;
}

export const useInventoryCategoryManagement = (): CategoryManagementState &
  CategoryManagementOperations => {
  const {
    fetchData,
    getCategories: getCategoriesFromManager,
    getItemsByCategory: getItemsByCategoryFromManager,
  } = useInventoryDataManager();
  const { handleError } = useErrorRecovery();

  // State management using useState
  const [state, setState] = useState<CategoryManagementState>({
    isLoading: false,
    error: null,
    lastOperation: null,
    operationTimestamp: null,
  });

  const updateState = useCallback(
    (updates?: Partial<CategoryManagementState>) => {
      if (updates) {
        setState((prevState) => ({ ...prevState, ...updates }));
      }
    },
    []
  );

  // Validate category name
  const validateCategoryName = useCallback(
    (category: string): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (!category || category.trim().length === 0) {
        errors.push('Category name cannot be empty');
      }

      if (category.length > 50) {
        errors.push('Category name cannot exceed 50 characters');
      }

      if (!/^[a-zA-Z0-9\s\-_]+$/.test(category)) {
        errors.push(
          'Category name can only contain letters, numbers, spaces, hyphens, and underscores'
        );
      }

      // Check for reserved names
      const reservedNames = [
        'all',
        'none',
        'uncategorized',
        'deleted',
        'archived',
      ];
      if (reservedNames.includes(category.toLowerCase())) {
        errors.push(`'${category}' is a reserved category name`);
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    []
  );

  // Check if category is in use
  const isCategoryInUse = useCallback(
    (category: string): boolean => {
      const items = getItemsByCategoryFromManager(category);
      return items.length > 0;
    },
    [getItemsByCategoryFromManager]
  );

  // Add category
  const addCategory = useCallback(
    async (category: string) => {
      try {
        updateState({ isLoading: true, error: null, lastOperation: 'add' });

        // Validate category name
        const validation = validateCategoryName(category);
        if (!validation.isValid) {
          throw new Error(
            `Invalid category name: ${validation.errors.join(', ')}`
          );
        }

        // Check if category already exists
        const existingCategories = getCategoriesFromManager();
        if (existingCategories.includes(category)) {
          throw new Error(`Category '${category}' already exists`);
        }

        // Add category via service
        await inventoryServiceFacade.addCategory(category);

        // Refresh data to get updated categories
        await fetchData();

        updateState({
          isLoading: false,
          lastOperation: 'add',
          operationTimestamp: new Date(),
        });

        // Log successful operation
        // auditLogger.log('inventory', 'category_added', { category });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to add category';
        updateState({
          isLoading: false,
          error: errorMessage,
          lastOperation: null,
        });
        handleError(errorMessage);
        throw error;
      }
    },
    [
      fetchData,
      handleError,
      updateState,
      validateCategoryName,
      getCategoriesFromManager,
    ]
  );

  // Delete category
  const deleteCategory = useCallback(
    async (category: string) => {
      try {
        updateState({ isLoading: true, error: null, lastOperation: 'delete' });

        // Check if category exists
        const existingCategories = getCategoriesFromManager();
        if (!existingCategories.includes(category)) {
          throw new Error(`Category '${category}' does not exist`);
        }

        // Check if category is in use
        if (isCategoryInUse(category)) {
          throw new Error(
            `Cannot delete category '${category}' - it contains items`
          );
        }

        // Delete category via service
        await inventoryServiceFacade.deleteCategory(category);

        // Refresh data to get updated categories
        await fetchData();

        updateState({
          isLoading: false,
          lastOperation: 'delete',
          operationTimestamp: new Date(),
        });

        // Log successful operation
        // auditLogger.log('inventory', 'category_deleted', { category });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete category';
        updateState({
          isLoading: false,
          error: errorMessage,
          lastOperation: null,
        });
        handleError(errorMessage);
        throw error;
      }
    },
    [
      fetchData,
      handleError,
      updateState,
      getCategoriesFromManager,
      isCategoryInUse,
    ]
  );

  // Update category (rename)
  const updateCategory = useCallback(
    async (oldCategory: string, newCategory: string) => {
      try {
        updateState({ isLoading: true, error: null, lastOperation: 'update' });

        // Validate new category name
        const validation = validateCategoryName(newCategory);
        if (!validation.isValid) {
          throw new Error(
            `Invalid category name: ${validation.errors.join(', ')}`
          );
        }

        // Check if old category exists
        const existingCategories = getCategoriesFromManager();
        if (!existingCategories.includes(oldCategory)) {
          throw new Error(`Category '${oldCategory}' does not exist`);
        }

        // Check if new category already exists
        if (existingCategories.includes(newCategory)) {
          throw new Error(`Category '${newCategory}' already exists`);
        }

        // Get items in the old category
        const itemsInCategory = getItemsByCategoryFromManager(oldCategory);

        // Update all items in the category to use the new category name
        for (const item of itemsInCategory) {
          await inventoryServiceFacade.updateItem(item.id, {
            category: newCategory,
          });
        }

        // Delete the old category
        await inventoryServiceFacade.deleteCategory(oldCategory);

        // Refresh data to get updated categories
        await fetchData();

        updateState({
          isLoading: false,
          lastOperation: 'update',
          operationTimestamp: new Date(),
        });

        // Log successful operation
        // auditLogger.log('inventory', 'category_updated', {
        //   oldCategory,
        //   newCategory,
        //   itemsUpdated: itemsInCategory.length,
        // });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update category';
        updateState({
          isLoading: false,
          error: errorMessage,
          lastOperation: null,
        });
        handleError(errorMessage);
        throw error;
      }
    },
    [
      fetchData,
      handleError,
      updateState,
      validateCategoryName,
      getCategoriesFromManager,
      getItemsByCategoryFromManager,
    ]
  );

  // Get all categories
  const getCategories = useCallback((): string[] => {
    return getCategoriesFromManager();
  }, [getCategoriesFromManager]);

  // Get category statistics
  const getCategoryStats = useCallback(
    (category: string) => {
      const items = getItemsByCategoryFromManager(category);

      const itemCount = items.length;
      const totalValue = items.reduce((sum, item) => {
        const cost = item.unit_cost || 0;
        const quantity = 'quantity' in item ? (item.quantity ?? 1) : 1;
        return sum + cost * quantity;
      }, 0);
      const averageValue = itemCount > 0 ? totalValue / itemCount : 0;
      const lowStockItems = items.filter(
        (item) =>
          'quantity' in item &&
          (item.quantity ?? 0) <= 10 &&
          (item.quantity ?? 0) > 0
      ).length;
      const outOfStockItems = items.filter(
        (item) => 'quantity' in item && (item.quantity ?? 0) === 0
      ).length;

      return {
        itemCount,
        totalValue,
        averageValue,
        lowStockItems,
        outOfStockItems,
      };
    },
    [getItemsByCategoryFromManager]
  );

  // Get items by category
  const getItemsByCategory = useCallback(
    (category: string) => {
      return getItemsByCategoryFromManager(category);
    },
    [getItemsByCategoryFromManager]
  );

  // Reset error
  const resetError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Retry last operation (simplified implementation)
  const retryLastOperation = useCallback(async () => {
    // In a real implementation, you would store the last operation details
    // and retry them. For now, this is a placeholder.
  }, []);

  return {
    // State
    ...state,

    // Category CRUD operations
    addCategory,
    deleteCategory,
    updateCategory,

    // Category queries
    getCategories,
    getCategoryStats,
    getItemsByCategory,

    // Category validation
    validateCategoryName,
    isCategoryInUse,

    // Utility operations
    resetError,
    retryLastOperation,
  };
};
