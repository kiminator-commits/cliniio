import { useCallback } from 'react';
import { ContentItem, ContentStatus } from '../types';
import { KnowledgeHubError } from '../types/errors';

// Import all the slice-based store hooks
import {
  // UI State
  useSelectedCategory,
  useSetSelectedCategory,
  useValidationError,
  useSetValidationError,
  useClearValidationError,

  // Auth State
  useCurrentUser,
  useSetCurrentUser,
  usePermissions,
  useCanDeleteContent,
  useCanUpdateStatus,
  useCanCreateContent,
  useCanViewAllCategories,
  useCanManageUsers,

  // Content State
  useContent,
  useSelectedContent,
  useLoading,
  useError,
  useSetContent,
  useSetLoading,
  useSetError,
  useUpdateSelectedContent,
  useCategoryCount,

  // Performance State
  useRecordPerformanceMetric,
  usePerformanceStats,
  usePerformanceAlerts,

  // Rate Limit State
  useRateLimitStats,
  useIsRateLimited,
  useUpdateRateLimitStats,
  useResetRateLimiter,
  useSetRateLimited,

  // Business Logic Actions
  useUpdateContentStatus as useBusinessUpdateContentStatus,
  useDeleteContent as useBusinessDeleteContent,
  useUpdateContent as useBusinessUpdateContent,
  useInitializeContent as useBusinessInitializeContent,
  useRefetchContent as useBusinessRefetchContent,
} from './knowledgeHubStoreWithSlices';

// Enhanced orchestration hook that coordinates all slices
export const useKnowledgeHubStoresWithSlices = () => {
  // UI State
  const selectedCategory = useSelectedCategory();
  const setSelectedCategory = useSetSelectedCategory();
  const validationError = useValidationError();
  const setValidationError = useSetValidationError();
  const clearValidationError = useClearValidationError();

  // Auth State
  const currentUser = useCurrentUser();
  const setCurrentUser = useSetCurrentUser();
  const permissions = usePermissions();
  const canDeleteContent = useCanDeleteContent();
  const canUpdateStatus = useCanUpdateStatus();
  const canCreateContent = useCanCreateContent();
  const canViewAllCategories = useCanViewAllCategories();
  const canManageUsers = useCanManageUsers();

  // Content State
  const content = useContent();
  const selectedContent = useSelectedContent();
  const isLoading = useLoading();
  const error = useError();
  const setContent = useSetContent();
  const setLoading = useSetLoading();
  const setError = useSetError();
  const updateSelectedContent = useUpdateSelectedContent();

  // Performance State
  const recordPerformanceMetric = useRecordPerformanceMetric();
  const performanceStats = usePerformanceStats();
  const performanceAlerts = usePerformanceAlerts();

  // Rate Limit State
  const rateLimitStats = useRateLimitStats();
  const isRateLimited = useIsRateLimited();
  const updateRateLimitStats = useUpdateRateLimitStats();
  const resetRateLimiter = useResetRateLimiter();
  const setRateLimited = useSetRateLimited();

  // Business Logic Actions
  const businessUpdateContentStatus = useBusinessUpdateContentStatus();
  const businessDeleteContent = useBusinessDeleteContent();
  const businessUpdateContent = useBusinessUpdateContent();
  const businessInitializeContent = useBusinessInitializeContent();
  const businessRefetchContent = useBusinessRefetchContent();

  // Enhanced business logic actions that coordinate between slices
  const updateContentStatus = useCallback(
    async (id: string, status: ContentStatus) => {
      const startTime = performance.now();

      // Permission check
      if (!currentUser) {
        const authError = new Error(
          'Authentication required for this operation'
        );
        setError(authError);
        setValidationError(authError.message);
        return;
      }

      if (!canUpdateStatus) {
        const permissionError = new Error(
          'Insufficient permissions to update content status'
        );
        setError(permissionError);
        setValidationError(permissionError.message);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setValidationError(null);
        setRateLimited(false);

        // Call business logic
        const updatedContentItem = await businessUpdateContentStatus(
          id,
          status
        );

        // Update content slice
        const updatedContent = content.map((item) =>
          item.id === id ? updatedContentItem : item
        );
        setContent(updatedContent);

        // Update selected content if needed
        if (selectedCategory) {
          updateSelectedContent(selectedCategory);
        }

        // Update rate limit stats
        updateRateLimitStats();

        // Record performance metric
        const duration = performance.now() - startTime;
        recordPerformanceMetric({
          operation: 'updateContentStatus',
          duration,
          success: true,
          metadata: {
            contentId: id,
            status,
            contentCount: updatedContent.length,
          },
        });
      } catch (error) {
        const duration = performance.now() - startTime;
        const storeError = error as KnowledgeHubError;

        // Check if it's a rate limiting error
        const isRateLimited = storeError.message
          .toLowerCase()
          .includes('rate limit');
        setError(storeError);
        setValidationError(storeError.message);
        setRateLimited(isRateLimited);

        // Record performance metric for failed operation
        recordPerformanceMetric({
          operation: 'updateContentStatus',
          duration,
          success: false,
          error: storeError.message,
          metadata: { contentId: id, status },
        });
      } finally {
        setLoading(false);
      }
    },
    [
      currentUser,
      canUpdateStatus,
      setLoading,
      setError,
      setValidationError,
      setRateLimited,
      businessUpdateContentStatus,
      content,
      setContent,
      selectedCategory,
      updateSelectedContent,
      updateRateLimitStats,
      recordPerformanceMetric,
    ]
  );

  const deleteContent = useCallback(
    async (id: string) => {
      const startTime = performance.now();

      // Permission check
      if (!currentUser) {
        const authError = new Error(
          'Authentication required for this operation'
        );
        setError(authError);
        setValidationError(authError.message);
        return;
      }

      if (!canDeleteContent) {
        const permissionError = new Error(
          'Insufficient permissions to delete content'
        );
        setError(permissionError);
        setValidationError(permissionError.message);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setValidationError(null);

        // Call business logic
        await businessDeleteContent(id);

        // Update content slice
        const updatedContent = content.filter((item) => item.id !== id);
        setContent(updatedContent);

        // Update selected content if needed
        if (selectedCategory) {
          updateSelectedContent(selectedCategory);
        }

        // Record performance metric
        const duration = performance.now() - startTime;
        recordPerformanceMetric({
          operation: 'deleteContent',
          duration,
          success: true,
          metadata: {
            contentId: id,
            remainingContentCount: updatedContent.length,
          },
        });
      } catch (error) {
        const duration = performance.now() - startTime;
        const storeError = error as KnowledgeHubError;
        setError(storeError);
        setValidationError(storeError.message);

        // Record performance metric for failed operation
        recordPerformanceMetric({
          operation: 'deleteContent',
          duration,
          success: false,
          error: storeError.message,
          metadata: { contentId: id },
        });
      } finally {
        setLoading(false);
      }
    },
    [
      currentUser,
      canDeleteContent,
      setLoading,
      setError,
      setValidationError,
      businessDeleteContent,
      content,
      setContent,
      selectedCategory,
      updateSelectedContent,
      recordPerformanceMetric,
    ]
  );

  const refetchContent = useCallback(async () => {
    const startTime = performance.now();

    try {
      setLoading(true);
      setError(null);

      // Call business logic
      const fetchedContent = await businessRefetchContent();

      // Update content slice
      setContent(fetchedContent);

      // Update selected content if needed
      if (selectedCategory) {
        updateSelectedContent(selectedCategory);
      }

      // Record performance metric
      const duration = performance.now() - startTime;
      recordPerformanceMetric({
        operation: 'refetchContent',
        duration,
        success: true,
        metadata: { contentCount: fetchedContent.length },
      });
    } catch (error) {
      const duration = performance.now() - startTime;
      const storeError = error as KnowledgeHubError;
      setError(storeError);

      // Record performance metric for failed operation
      recordPerformanceMetric({
        operation: 'refetchContent',
        duration,
        success: false,
        error: storeError.message,
      });
    } finally {
      setLoading(false);
    }
  }, [
    setLoading,
    setError,
    businessRefetchContent,
    setContent,
    selectedCategory,
    updateSelectedContent,
    recordPerformanceMetric,
  ]);

  const updateContent = useCallback(
    async (id: string, updates: Partial<ContentItem>) => {
      const startTime = performance.now();

      // Permission check
      if (!currentUser) {
        const authError = new Error(
          'Authentication required for this operation'
        );
        setError(authError);
        setValidationError(authError.message);
        return;
      }

      if (!canUpdateStatus) {
        const permissionError = new Error(
          'Insufficient permissions to update content'
        );
        setError(permissionError);
        setValidationError(permissionError.message);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setValidationError(null);

        // Call business logic
        const updatedContentItem = await businessUpdateContent(id, updates);

        // Update content slice
        const updatedContent = content.map((item) =>
          item.id === id ? updatedContentItem : item
        );
        setContent(updatedContent);

        // Update selected content if needed
        if (selectedCategory) {
          updateSelectedContent(selectedCategory);
        }

        // Record performance metric
        const duration = performance.now() - startTime;
        recordPerformanceMetric({
          operation: 'updateContent',
          duration,
          success: true,
          metadata: { contentId: id, updateFields: Object.keys(updates) },
        });
      } catch (error) {
        const duration = performance.now() - startTime;
        const storeError = error as KnowledgeHubError;
        setError(storeError);
        setValidationError(storeError.message);

        // Record performance metric for failed operation
        recordPerformanceMetric({
          operation: 'updateContent',
          duration,
          success: false,
          error: storeError.message,
          metadata: { contentId: id, updateFields: Object.keys(updates) },
        });
      } finally {
        setLoading(false);
      }
    },
    [
      currentUser,
      canUpdateStatus,
      setLoading,
      setError,
      setValidationError,
      businessUpdateContent,
      content,
      setContent,
      selectedCategory,
      updateSelectedContent,
      recordPerformanceMetric,
    ]
  );

  const initializeContent = useCallback(async () => {
    const startTime = performance.now();

    try {
      setLoading(true);
      setError(null);

      // Call business logic
      const fetchedContent = await businessInitializeContent();

      // Update content slice
      setContent(fetchedContent);

      // Update selected content if needed
      if (selectedCategory) {
        updateSelectedContent(selectedCategory);
      }

      // Record performance metric
      const duration = performance.now() - startTime;
      recordPerformanceMetric({
        operation: 'initializeContent',
        duration,
        success: true,
        metadata: { contentCount: fetchedContent.length },
      });
    } catch (error) {
      const duration = performance.now() - startTime;
      const storeError = error as KnowledgeHubError;
      setError(storeError);

      // Record performance metric for failed operation
      recordPerformanceMetric({
        operation: 'initializeContent',
        duration,
        success: false,
        error: storeError.message,
      });
    } finally {
      setLoading(false);
    }
  }, [
    setLoading,
    setError,
    businessInitializeContent,
    setContent,
    selectedCategory,
    updateSelectedContent,
    recordPerformanceMetric,
  ]);

  // Enhanced setSelectedCategory that updates selected content
  const enhancedSetSelectedCategory = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      updateSelectedContent(category);
    },
    [setSelectedCategory, updateSelectedContent]
  );

  return {
    // UI State
    selectedCategory,
    setSelectedCategory: enhancedSetSelectedCategory,
    validationError,
    setValidationError,
    clearValidationError,

    // Auth State
    currentUser,
    setCurrentUser,
    permissions,
    canDeleteContent,
    canUpdateStatus,
    canCreateContent,
    canViewAllCategories,
    canManageUsers,

    // Content State
    content,
    selectedContent,
    isLoading,
    error,
    categoryCount: useCategoryCount,

    // Performance State
    performanceStats,
    performanceAlerts,

    // Rate Limit State
    rateLimitStats,
    isRateLimited,
    updateRateLimitStats,
    resetRateLimiter,
    setRateLimited,

    // Business Logic Actions
    updateContentStatus,
    deleteContent,
    refetchContent,
    updateContent,
    initializeContent,
  };
};
