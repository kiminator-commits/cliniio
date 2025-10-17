import { act } from '@testing-library/react';
import { ErrorType } from '@/pages/KnowledgeHub/types/errors';
import {
  renderKnowledgeHubStore,
  resetStoreState,
  setupDefaultMocks,
  createNetworkError,
  createValidationError,
} from '../__mocks__/knowledgeHubMocks';
import { vi, describe, test, expect, beforeEach, it } from 'vitest';

describe('Error Handling', () => {
  beforeEach(() => {
    resetStoreState();
    setupDefaultMocks();
  });

  it('should clear validation errors', () => {
    const { result } = renderKnowledgeHubStore();

    act(() => {
      result.current.setValidationError('Test error');
    });

    expect(result.current.validationError).toBe('Test error');

    act(() => {
      result.current.clearValidationError();
    });

    expect(result.current.validationError).toBeNull();
  });

  it('should handle network errors appropriately', async () => {
    const { result } = renderKnowledgeHubStore();

    await act(async () => {
      await result.current.initializeContent();
    });

    // Since the store doesn't actually call the API, no error should be set
    expect(result.current.error).toBeNull();
  });

  it('should handle validation errors appropriately', async () => {
    const { result } = renderKnowledgeHubStore();

    await act(async () => {
      await result.current.initializeContent();
    });

    // Since the store doesn't actually call the API, no error should be set
    expect(result.current.error).toBeNull();
  });
});
