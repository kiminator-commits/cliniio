import { act } from '@testing-library/react';
import { ErrorType } from '@/pages/KnowledgeHub/types/errors';
import {
  renderKnowledgeHubStore,
  resetStoreState,
  setupDefaultMocks,
  createNetworkError,
  createValidationError,
} from '../__mocks__/knowledgeHubMocks';
import { vi } from 'vitest';

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
    const networkError = createNetworkError('Connection timeout');
    const { knowledgeHubApiService } = await import(
      '@/pages/KnowledgeHub/services/knowledgeHubApiService'
    );

    // Mock the service to reject with the error
    vi.spyOn(knowledgeHubApiService, 'fetchContent').mockRejectedValue(
      networkError
    );

    const { result } = renderKnowledgeHubStore();

    await act(async () => {
      await result.current.initializeContent();
    });

    expect(result.current.error?.type).toBe(ErrorType.NETWORK_ERROR);
    expect(result.current.error?.severity).toBe('HIGH');
  });

  it('should handle validation errors appropriately', async () => {
    const validationError = createValidationError('Invalid data format');
    const { knowledgeHubApiService } = await import(
      '@/pages/KnowledgeHub/services/knowledgeHubApiService'
    );

    // Mock the service to reject with the error
    vi.spyOn(knowledgeHubApiService, 'fetchContent').mockRejectedValue(
      validationError
    );

    const { result } = renderKnowledgeHubStore();

    await act(async () => {
      await result.current.initializeContent();
    });

    expect(result.current.error?.type).toBe(ErrorType.VALIDATION_ERROR);
    expect(result.current.error?.severity).toBe('MEDIUM');
  });
});
