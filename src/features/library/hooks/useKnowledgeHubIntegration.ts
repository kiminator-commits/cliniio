import { useState, useCallback } from 'react';
import { ContentItem } from '../libraryTypes';
import { knowledgeHubIntegrationService } from '../services/knowledgeHubIntegrationService';

export interface IntegrationState {
  isAdding: boolean;
  addedItems: Set<string>;
  error: string | null;
  successMessage: string | null;
}

export interface UseKnowledgeHubIntegrationReturn {
  state: IntegrationState;
  addToKnowledgeHub: (item: ContentItem) => Promise<void>;
  removeFromKnowledgeHub: (contentId: string) => Promise<void>;
  clearMessages: () => void;
  isInKnowledgeHub: (itemId: string) => boolean;
}

export const useKnowledgeHubIntegration =
  (): UseKnowledgeHubIntegrationReturn => {
    const [state, setState] = useState<IntegrationState>({
      isAdding: false,
      addedItems: new Set(),
      error: null,
      successMessage: null,
    });

    const addToKnowledgeHub = useCallback(async (item: ContentItem) => {
      setState((prev) => ({
        ...prev,
        isAdding: true,
        error: null,
        successMessage: null,
      }));

      try {
        const result =
          await knowledgeHubIntegrationService.addToKnowledgeHub(item);

        if (result.success) {
          setState((prev) => ({
            ...prev,
            isAdding: false,
            addedItems: new Set([...prev.addedItems, item.id]),
            successMessage: result.message,
          }));

          // Clear success message after 3 seconds
          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              successMessage: null,
            }));
          }, 3000);
        } else {
          setState((prev) => ({
            ...prev,
            isAdding: false,
            error: result.message,
          }));

          // Clear error message after 5 seconds
          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              error: null,
            }));
          }, 5000);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to add content to Knowledge Hub';

        setState((prev) => ({
          ...prev,
          isAdding: false,
          error: errorMessage,
        }));

        // Clear error message after 5 seconds
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            error: null,
          }));
        }, 5000);
      }
    }, []);

    const removeFromKnowledgeHub = useCallback(async (contentId: string) => {
      try {
        const success =
          await knowledgeHubIntegrationService.removeFromKnowledgeHub(
            contentId
          );

        if (success) {
          setState((prev) => ({
            ...prev,
            addedItems: new Set(
              [...prev.addedItems].filter((id) => id !== contentId)
            ),
            successMessage: 'Content removed from Knowledge Hub',
          }));

          // Clear success message after 3 seconds
          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              successMessage: null,
            }));
          }, 3000);
        } else {
          setState((prev) => ({
            ...prev,
            error: 'Failed to remove content from Knowledge Hub',
          }));

          // Clear error message after 5 seconds
          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              error: null,
            }));
          }, 5000);
        }
      } catch (err) {
        console.error(err);
        setState((prev) => ({
          ...prev,
          error: 'Failed to remove content from Knowledge Hub',
        }));

        // Clear error message after 5 seconds
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            error: null,
          }));
        }, 5000);
      }
    }, []);

    const clearMessages = useCallback(() => {
      setState((prev) => ({
        ...prev,
        error: null,
        successMessage: null,
      }));
    }, []);

    const isInKnowledgeHub = useCallback(
      (itemId: string) => {
        return state.addedItems.has(itemId);
      },
      [state.addedItems]
    );

    return {
      state,
      addToKnowledgeHub,
      removeFromKnowledgeHub,
      clearMessages,
      isInKnowledgeHub,
    };
  };
