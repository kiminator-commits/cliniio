// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { create } from 'zustand';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { subscribeWithSelector } from 'zustand/middleware';
import { ContentItem, ContentStatus } from '../types';
import { knowledgeHubApiService } from '../services/knowledgeHubApiService';
import {
  ApiError,
  UnauthorizedError,
  ValidationError,
  ErrorType,
  ErrorSeverity,
} from '../types/errors';
import { KnowledgeHubStore, ALL_CATEGORIES } from './knowledgeHubTypes';
import LearningProgressService from '../../../services/learningProgressService';
// import { KnowledgeHubError } from '../types/errors';

// Helper function to create appropriate error based on the error type
const createAppropriateError = (
  error: Error,
  context: Record<string, unknown>
): ApiError => {
  const errorMessage = error.message || 'An unexpected error occurred';

  // If it's already an ApiError, check if it needs conversion based on message
  if (error instanceof ApiError) {
    // Check if it's a rate limit error that needs conversion
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return new ApiError(ErrorType.RATE_LIMIT_EXCEEDED, errorMessage, {
        ...context,
      });
    }
    // Return other ApiErrors as-is
    return error;
  }

  // Handle rate limiting
  if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
    return new ApiError(ErrorType.RATE_LIMIT_EXCEEDED, errorMessage, {
      ...context,
    });
  }

  // Handle network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('timeout')
  ) {
    return new ApiError(ErrorType.NETWORK_ERROR, errorMessage, context);
  }

  // Handle validation errors
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('permission')
  ) {
    return new ApiError(ErrorType.VALIDATION_ERROR, errorMessage, context);
  }

  // Handle content not found
  if (errorMessage.includes('not found') || errorMessage.includes('404')) {
    return new ApiError(ErrorType.CONTENT_NOT_FOUND, errorMessage, context);
  }

  // Default to operation failed
  return new ApiError(ErrorType.OPERATION_FAILED, errorMessage, {
    severity: ErrorSeverity.MEDIUM,
    ...context,
  });
};

// Business logic action creators
export const createBusinessActions = (
  get: () => KnowledgeHubStore,
  set: (partial: Partial<KnowledgeHubStore>) => void
) => ({
  updateContentStatus: async (id: string, status: ContentStatus) => {
    const startTime = performance.now();
    set({ isLoading: true, error: null, validationError: null });

    try {
      const { content, canUpdateStatus, currentUser } = get();

      // Clear rate limited state on successful operation
      set({ isRateLimited: false });

      // Permission check
      if (!currentUser) {
        const authError = new UnauthorizedError(
          'Authentication required for this operation'
        ).toKnowledgeHubError({
          component: 'KnowledgeHubStore',
          action: 'updateContentStatus',
          contentId: id,
        });
        set({ error: authError, validationError: authError.message });
        return;
      }

      if (!canUpdateStatus()) {
        const permissionError = new ValidationError(
          'Insufficient permissions to update content status'
        ).toKnowledgeHubError({
          component: 'KnowledgeHubStore',
          action: 'updateContentStatus',
          contentId: id,
          requiredPermission: 'canUpdateStatus',
        });
        set({
          error: permissionError,
          validationError: permissionError.message,
        });
        return;
      }

      // Call the real API to update content status
      const updatedContentItem =
        await knowledgeHubApiService.updateContentStatus(id, status);

      // Update local state with the response from API
      const updatedContent = content.map((item: ContentItem) =>
        item.id === id ? updatedContentItem : item
      );

      set({ content: updatedContent });

      // Update selected content if needed
      const { selectedCategory } = get();
      if (selectedCategory) {
        const selectedContent = updatedContent.filter(
          (item: ContentItem) => item.category === selectedCategory
        );
        set({ selectedContent });
      }

      // Update category counts
      const categoryCounts = updatedContent.reduce(
        (acc: Record<string, number>, item: ContentItem) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      // Update content counts for all categories
      ['Courses', 'Procedures', 'Policies', 'Learning Pathways'].forEach(
        (cat) => {
          if (!(cat in categoryCounts)) categoryCounts[cat] = 0;
        }
      );
      set({ categoryCounts });

      // Learning progress update
      if (status === 'published') {
        try {
          const progressService = LearningProgressService.getInstance();
          if (progressService) {
            progressService.updateItemStatus(id, 'Completed');
          }
        } catch (progressError) {
          console.warn('Failed to update learning progress:', progressError);
          // Don't fail the main operation if progress tracking fails
        }
      }

      // Update rate limit stats
      get().updateRateLimitStats();

      // Record performance metric
      const duration = performance.now() - startTime;
      get().recordPerformanceMetric({
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
      const apiError = createAppropriateError(error as Error, {
        action: 'updateContentStatus',
        contentId: id,
        status,
      });
      set({ error: apiError, validationError: apiError.message });

      // Record performance metric for failed operation
      get().recordPerformanceMetric({
        operation: 'updateContentStatus',
        duration,
        success: false,
        error: apiError.message,
        metadata: { contentId: id, status },
      });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteContent: async (id: string) => {
    const { content, canDeleteContent, currentUser } = get();

    // Permission check
    if (!currentUser) {
      const authError = new UnauthorizedError(
        'Authentication required for this operation'
      ).toKnowledgeHubError({
        component: 'KnowledgeHubStore',
        action: 'deleteContent',
        contentId: id,
      });
      set({ error: authError, validationError: authError.message });
      return;
    }

    if (!canDeleteContent()) {
      const permissionError = new ValidationError(
        'Insufficient permissions to delete content'
      ).toKnowledgeHubError({
        component: 'KnowledgeHubStore',
        action: 'deleteContent',
        contentId: id,
        requiredPermission: 'canDeleteContent',
      });
      set({ error: permissionError, validationError: permissionError.message });
      return;
    }

    const startTime = performance.now();

    try {
      set({
        isLoading: true,
        error: null,
        validationError: null,
        isRateLimited: false,
      });

      // Call the real API to delete content
      await knowledgeHubApiService.deleteContent(id);

      // Update local state by removing the deleted content
      const updatedContent = content.filter(
        (item: ContentItem) => item.id !== id
      );

      set({ content: updatedContent });

      // Update selected content if needed
      const { selectedCategory } = get();
      if (selectedCategory) {
        const selectedContent = updatedContent.filter(
          (item: ContentItem) => item.category === selectedCategory
        );
        set({ selectedContent });
      }

      // Update category counts
      const categoryCounts = updatedContent.reduce(
        (acc: Record<string, number>, item: ContentItem) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      // Update content counts for all categories
      ['Courses', 'Procedures', 'Policies', 'Learning Pathways'].forEach(
        (cat) => {
          if (!(cat in categoryCounts)) categoryCounts[cat] = 0;
        }
      );
      set({ categoryCounts });

      // Record performance metric
      const duration = performance.now() - startTime;
      get().recordPerformanceMetric({
        operation: 'deleteContent',
        duration,
        success: true,
        metadata: { contentId: id, contentCount: updatedContent.length },
      });
    } catch (error) {
      const duration = performance.now() - startTime;
      const storeError = createAppropriateError(error as Error, {
        component: 'KnowledgeHubStore',
        action: 'deleteContent',
        contentId: id,
      });

      // Check if it's a rate limiting error
      const isRateLimited = storeError.message
        .toLowerCase()
        .includes('rate limit');
      set({
        error: storeError.toKnowledgeHubError({
          component: 'KnowledgeHubStore',
          action: 'deleteContent',
          contentId: id,
        }),
        validationError: storeError.message,
        isRateLimited,
      });

      // Record performance metric for failed operation
      get().recordPerformanceMetric({
        operation: 'deleteContent',
        duration,
        success: false,
        error: storeError.message,
        metadata: { contentId: id },
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchContent: async () => {
    const startTime = performance.now();

    try {
      set({
        isLoading: true,
        error: null,
        validationError: null,
        isRateLimited: false,
      });

      // Call the real API to fetch content
      const fetchedContent = await knowledgeHubApiService.fetchContent();

      set({ content: fetchedContent });

      // Record performance metric
      const duration = performance.now() - startTime;
      get().recordPerformanceMetric({
        operation: 'fetchContent',
        duration,
        success: true,
        metadata: { contentCount: fetchedContent.length },
      });
    } catch (error) {
      const duration = performance.now() - startTime;
      const storeError = createAppropriateError(error as Error, {
        component: 'KnowledgeHubStore',
        action: 'fetchContent',
      });

      set({
        error: storeError.toKnowledgeHubError(),
        validationError: storeError.message,
      });

      // Record performance metric for failed operation
      get().recordPerformanceMetric({
        operation: 'fetchContent',
        duration,
        success: false,
        error: storeError.message,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateContent: async (id: string, updates: Partial<ContentItem>) => {
    const startTime = performance.now();
    set({ isLoading: true, error: null, validationError: null });

    try {
      const { content, canUpdateStatus, currentUser } = get();

      // Clear rate limited state on successful operation
      set({ isRateLimited: false });

      // Permission check
      if (!currentUser) {
        const authError = new UnauthorizedError(
          'Authentication required for this operation'
        ).toKnowledgeHubError({
          component: 'KnowledgeHubStore',
          action: 'updateContent',
          contentId: id,
        });
        set({ error: authError, validationError: authError.message });
        return;
      }

      if (!canUpdateStatus()) {
        const permissionError = new ValidationError(
          'Insufficient permissions to update content'
        ).toKnowledgeHubError({
          component: 'KnowledgeHubStore',
          action: 'updateContent',
          contentId: id,
          requiredPermission: 'canUpdateStatus',
        });
        set({
          error: permissionError,
          validationError: permissionError.message,
        });
        return;
      }

      // Call the real API to update content
      const updatedContentItem = await knowledgeHubApiService.updateContent(
        id,
        updates
      );

      // Update local state with the response from API
      const updatedContent = content.map((item: ContentItem) =>
        item.id === id ? updatedContentItem : item
      );

      set({ content: updatedContent });

      // Update selected content if needed
      const { selectedCategory } = get();
      if (selectedCategory) {
        const selectedContent = updatedContent.filter(
          (item: ContentItem) => item.category === selectedCategory
        );
        set({ selectedContent });
      }

      // Update category counts
      const categoryCounts = updatedContent.reduce(
        (acc: Record<string, number>, item: ContentItem) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      ALL_CATEGORIES.forEach((cat) => {
        if (!(cat in categoryCounts)) categoryCounts[cat] = 0;
      });
      set({ categoryCounts });

      // Record performance metric
      const duration = performance.now() - startTime;
      get().recordPerformanceMetric({
        operation: 'updateContent',
        duration,
        success: true,
        metadata: { contentId: id, contentCount: updatedContent.length },
      });
    } catch (error) {
      const duration = performance.now() - startTime;
      const storeError = createAppropriateError(error as Error, {
        component: 'KnowledgeHubStore',
        action: 'updateContent',
        contentId: id,
      });

      // Check if it's a rate limiting error
      const isRateLimited = storeError.message
        .toLowerCase()
        .includes('rate limit');
      set({
        error: storeError.toKnowledgeHubError(),
        validationError: storeError.message,
        isRateLimited,
      });

      // Record performance metric for failed operation
      get().recordPerformanceMetric({
        operation: 'updateContent',
        duration,
        success: false,
        error: storeError.message,
        metadata: { contentId: id },
      });
    } finally {
      set({ isLoading: false });
    }
  },

  initializeContent: async () => {
    const { setLoading, setError, setContent } = get();
    const startTime = performance.now();

    try {
      setLoading(true);
      setError(null);

      // Call the real API to fetch initial content
      const fetchedContent = await knowledgeHubApiService.fetchContent();

      setContent(fetchedContent);

      // Record performance metric
      const duration = performance.now() - startTime;
      get().recordPerformanceMetric({
        operation: 'initializeContent',
        duration,
        success: true,
        metadata: { contentCount: fetchedContent.length },
      });
    } catch (error) {
      const duration = performance.now() - startTime;
      const storeError = createAppropriateError(error as Error, {
        component: 'KnowledgeHubStore',
        action: 'initializeContent',
      });
      setError(
        storeError.toKnowledgeHubError({
          component: 'KnowledgeHubStore',
          action: 'initializeContent',
        })
      );

      // Record performance metric for failed operation
      get().recordPerformanceMetric({
        operation: 'initializeContent',
        duration,
        success: false,
        error: storeError.message,
      });
    } finally {
      setLoading(false);
    }
  },
});
