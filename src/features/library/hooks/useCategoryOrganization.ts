import { useState, useCallback, useEffect } from 'react';
import { ContentItem } from '../libraryTypes';
import { ContentCategory } from '../../../pages/KnowledgeHub/types';
import {
  categoryOrganizationService,
  CategorySyncResult,
} from '../services/categoryOrganizationService';

export interface CategoryOrganizationState {
  categorySync: CategorySyncResult | null;
  isLoading: boolean;
  error: string | null;
  selectedCategory: ContentCategory | null;
  showReviewMode: boolean;
  categoryStatistics: Record<ContentCategory, number>;
}

export interface UseCategoryOrganizationReturn {
  state: CategoryOrganizationState;
  analyzeCategory: (item: ContentItem) => Promise<void>;
  updateCategory: (newCategory: ContentCategory) => Promise<void>;
  toggleReviewMode: () => void;
  refreshStatistics: () => Promise<void>;
  getCategoryMetadata: (category: ContentCategory) => Record<string, unknown>;
  getValidCategories: () => ContentCategory[];
}

export const useCategoryOrganization = (
  initialItem?: ContentItem
): UseCategoryOrganizationReturn => {
  const [state, setState] = useState<CategoryOrganizationState>({
    categorySync: null,
    isLoading: false,
    error: null,
    selectedCategory: null,
    showReviewMode: false,
    categoryStatistics: {
      Courses: 0,
      Procedures: 0,
      Policies: 0,
      'Learning Pathways': 0,
      Advanced: 0,
    },
  });

  const analyzeCategory = useCallback(async (item: ContentItem) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const syncResult =
        await categoryOrganizationService.syncCategoryToKnowledgeHub(item);

      setState((prev) => ({
        ...prev,
        categorySync: syncResult,
        selectedCategory: syncResult.mappedCategory,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error analyzing category:', error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Failed to analyze category',
        isLoading: false,
      }));
    }
  }, []);

  const updateCategory = useCallback(
    async (newCategory: ContentCategory) => {
      setState((prev) => ({ ...prev, selectedCategory: newCategory }));

      // If we have a content ID, update it in the database
      if (state.categorySync?.success) {
        try {
          // This would be called when updating existing content
          // For new content, the category will be set when adding to Knowledge Hub
          console.log('Category updated to:', newCategory);
        } catch (error) {
          console.error('Error updating category:', error);
          setState((prev) => ({
            ...prev,
            error: 'Failed to update category',
          }));
        }
      }
    },
    [state.categorySync]
  );

  const toggleReviewMode = useCallback(() => {
    setState((prev) => ({ ...prev, showReviewMode: !prev.showReviewMode }));
  }, []);

  const refreshStatistics = useCallback(async () => {
    try {
      const stats = await categoryOrganizationService.getCategoryStatistics();
      setState((prev) => ({ ...prev, categoryStatistics: stats }));
    } catch (error) {
      console.error('Error refreshing statistics:', error);
    }
  }, []);

  const getCategoryMetadata = useCallback((category: ContentCategory) => {
    return categoryOrganizationService.getCategoryMetadata(category);
  }, []);

  const getValidCategories = useCallback(() => {
    return categoryOrganizationService.getValidCategories();
  }, []);

  // Load initial item if provided
  useEffect(() => {
    if (initialItem) {
      analyzeCategory(initialItem);
    }
  }, [initialItem, analyzeCategory]);

  // Load initial statistics
  useEffect(() => {
    refreshStatistics();
  }, [refreshStatistics]);

  return {
    state,
    analyzeCategory,
    updateCategory,
    toggleReviewMode,
    refreshStatistics,
    getCategoryMetadata,
    getValidCategories,
  };
};
