import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ContentItem, ContentStatus } from '../types';
import LearningProgressService from '../../../services/learningProgressService';
import { knowledgeHubApiService } from '../services/knowledgeHubApiService';
import {
  KnowledgeHubError,
  ErrorType,
  ErrorSeverity,
  ApiError,
  ValidationError,
  NetworkError,
  UnauthorizedError,
} from '../types/errors';
// import { knowledgeHubLogger } from '../services/knowledgeHubLogger'; // Temporarily disabled

// Business Logic Actions interface
interface BusinessLogicActions {
  updateContentStatus: (id: string, status: ContentStatus) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  refetchContent: () => Promise<void>;
  updateContent: (id: string, updates: Partial<ContentItem>) => Promise<void>;
  initializeContent: () => Promise<void>;
}

// Combined business logic store type
type BusinessLogicStore = BusinessLogicActions;

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

// Create the business logic store
export const useBusinessLogicStore = create<BusinessLogicStore>()(
  devtools(() => ({
    // Business Logic Actions
    updateContentStatus: async (id: string, status: ContentStatus) => {
      // const startTime = performance.now();

      try {
        // Call the real API to update content status
        const updatedContentItem =
          await knowledgeHubApiService.updateContentStatus(id, status);

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
          component: 'BusinessLogicStore',
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
        await knowledgeHubApiService.deleteContent(id);

        // Record performance metric
        // const duration = performance.now() - startTime;
        // Note: Performance recording will be handled by the calling component using the performance store
      } catch (error) {
        // const duration = performance.now() - startTime;
        const storeError = createAppropriateError(error as Error, {
          component: 'BusinessLogicStore',
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
        const fetchedContent = await knowledgeHubApiService.fetchContent();

        // Record performance metric
        // const duration = performance.now() - startTime;
        // Note: Performance recording will be handled by the calling component using the performance store

        return fetchedContent;
      } catch (error) {
        // const duration = performance.now() - startTime;
        const storeError = createAppropriateError(error as Error, {
          component: 'BusinessLogicStore',
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
        const updatedContentItem = await knowledgeHubApiService.updateContent(
          id,
          updates
        );

        // Record performance metric
        // const duration = performance.now() - startTime;
        // Note: Performance recording will be handled by the calling component using the performance store

        return updatedContentItem;
      } catch (error) {
        // const duration = performance.now() - startTime;
        const storeError = createAppropriateError(error as Error, {
          component: 'BusinessLogicStore',
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
        const fetchedContent = await knowledgeHubApiService.fetchContent();

        // Record performance metric
        // const duration = performance.now() - startTime;
        // Note: Performance recording will be handled by the calling component using the performance store

        return fetchedContent;
      } catch (error) {
        // const duration = performance.now() - startTime;
        const storeError = createAppropriateError(error as Error, {
          component: 'BusinessLogicStore',
          action: 'initializeContent',
        });

        // Record performance metric for failed operation
        // Note: Performance recording will be handled by the calling component using the performance store

        throw storeError;
      }
    },
  }))
);

// Action hooks for business logic
export const useUpdateContentStatus = () =>
  useBusinessLogicStore((state) => state.updateContentStatus);
export const useDeleteContent = () =>
  useBusinessLogicStore((state) => state.deleteContent);
export const useUpdateContent = () =>
  useBusinessLogicStore((state) => state.updateContent);
export const useInitializeContent = () =>
  useBusinessLogicStore((state) => state.initializeContent);
export const useRefetchContent = () =>
  useBusinessLogicStore((state) => state.refetchContent);
