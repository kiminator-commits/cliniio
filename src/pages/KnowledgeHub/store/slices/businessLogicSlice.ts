import { StateCreator } from 'zustand';
import { ContentItem, ContentStatus } from '../../types';
import LearningProgressService from '../../../../services/learningProgressService';
import { DEPRECATED_MOCK_NOTICE } from '../../services/deprecatedNotice';
import {
  KnowledgeHubError,
  ErrorType,
  ErrorSeverity,
  ApiError,
  ValidationError,
  NetworkError,
  UnauthorizedError,
} from '../../types/errors';
// import { knowledgeHubLogger } from '../../services/knowledgeHubLogger'; // Temporarily disabled

// Business Logic Actions interface
export interface BusinessLogicActions {
  updateContentStatus: (
    id: string,
    status: ContentStatus
  ) => Promise<ContentItem>;
  deleteContent: (id: string) => Promise<void>;
  refetchContent: () => Promise<ContentItem[]>;
  updateContent: (
    id: string,
    updates: Partial<ContentItem>
  ) => Promise<ContentItem>;
  initializeContent: () => Promise<ContentItem[]>;
}

// Combined business logic slice type
export type BusinessLogicSlice = BusinessLogicActions;

// Helper function to create appropriate error based on the error type
const createAppropriateError = (
  error: Error | string,
  context?: {
    component?: string;
    action?: string;
    userId?: string;
    contentId?: string;
  }
): KnowledgeHubError => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  // If it's already an ApiError, convert it to KnowledgeHubError
  if (error instanceof ApiError) {
    return error.toKnowledgeHubError(context);
  }

  // Classify unknown errors
  const message = errorMessage.toLowerCase();

  // Check for rate limiting errors
  if (
    message.includes('rate limit') ||
    message.includes('rate limit exceeded')
  ) {
    return new NetworkError(errorMessage, {
      ...context,
      rateLimited: true,
    }).toKnowledgeHubError(context);
  }

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection')
  ) {
    return new NetworkError(errorMessage, context).toKnowledgeHubError(context);
  } else if (message.includes('auth') || message.includes('unauthorized')) {
    return new UnauthorizedError(errorMessage).toKnowledgeHubError(context);
  } else if (message.includes('validation') || message.includes('invalid')) {
    return new ValidationError(errorMessage).toKnowledgeHubError(context);
  } else {
    return new ApiError(ErrorType.OPERATION_FAILED, errorMessage, {
      severity: ErrorSeverity.MEDIUM,
      context,
    }).toKnowledgeHubError(context);
  }
};

// Business logic slice creator
export const createBusinessLogicSlice: StateCreator<
  BusinessLogicSlice
> = () => ({
  // Business Logic Actions
  updateContentStatus: async (id: string, status: ContentStatus) => {
    // const startTime = performance.now();

    try {
      // Call the real API to update content status
      console.warn(DEPRECATED_MOCK_NOTICE);
      const updatedContentItem = { id, status } as ContentItem;

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

      // Record performance metric
      // const duration = performance.now() - startTime;
      // Note: Performance recording will be handled by the calling component using the performance store

      return updatedContentItem;
    } catch (error) {
      // const duration = performance.now() - startTime;
      const storeError = createAppropriateError(error as Error, {
        component: 'BusinessLogicSlice',
        action: 'updateContentStatus',
        contentId: id,
      });

      // Record performance metric for failed operation
      // Note: Performance recording will be handled by the calling component using the performance store

      throw storeError;
    }
  },

  deleteContent: async (id: string) => {
    // const startTime = performance.now();

    try {
      // Call the real API to delete content
      console.warn(DEPRECATED_MOCK_NOTICE);
      // Placeholder implementation - deletion "succeeded"

      // Record performance metric
      // const duration = performance.now() - startTime;
      // Note: Performance recording will be handled by the calling component using the performance store
    } catch (error) {
      // const duration = performance.now() - startTime;
      const storeError = createAppropriateError(error as Error, {
        component: 'BusinessLogicSlice',
        action: 'deleteContent',
        contentId: id,
      });

      // Record performance metric for failed operation
      // Note: Performance recording will be handled by the calling component using the performance store

      throw storeError;
    }
  },

  refetchContent: async () => {
    // const startTime = performance.now();

    try {
      // Call the real API to fetch content
      console.warn(DEPRECATED_MOCK_NOTICE);
      const fetchedContent: ContentItem[] = [];

      // Record performance metric
      // const duration = performance.now() - startTime;
      // Note: Performance recording will be handled by the calling component using the performance store

      return fetchedContent;
    } catch (error) {
      // const duration = performance.now() - startTime;
      const storeError = createAppropriateError(error as Error, {
        component: 'BusinessLogicSlice',
        action: 'refetchContent',
      });

      // Record performance metric for failed operation
      // Note: Performance recording will be handled by the calling component using the performance store

      throw storeError;
    }
  },

  updateContent: async (id: string, updates: Partial<ContentItem>) => {
    // const startTime = performance.now();

    try {
      // Call the real API to update content
      console.warn(DEPRECATED_MOCK_NOTICE);
      const updatedContentItem = { id, ...updates } as ContentItem;

      // Record performance metric
      // const duration = performance.now() - startTime;
      // Note: Performance recording will be handled by the calling component using the performance store

      return updatedContentItem;
    } catch (error) {
      // const duration = performance.now() - startTime;
      const storeError = createAppropriateError(error as Error, {
        component: 'BusinessLogicSlice',
        action: 'updateContent',
        contentId: id,
      });

      // Record performance metric for failed operation
      // Note: Performance recording will be handled by the calling component using the performance store

      throw storeError;
    }
  },

  initializeContent: async () => {
    // const startTime = performance.now();

    try {
      // Call the real API to fetch initial content
      console.warn(DEPRECATED_MOCK_NOTICE);
      const fetchedContent: ContentItem[] = [];

      // Record performance metric
      // const duration = performance.now() - startTime;
      // Note: Performance recording will be handled by the calling component using the performance store

      return fetchedContent;
    } catch (error) {
      // const duration = performance.now() - startTime;
      const storeError = createAppropriateError(error as Error, {
        component: 'BusinessLogicSlice',
        action: 'initializeContent',
      });

      // Record performance metric for failed operation
      // Note: Performance recording will be handled by the calling component using the performance store

      throw storeError;
    }
  },
});
