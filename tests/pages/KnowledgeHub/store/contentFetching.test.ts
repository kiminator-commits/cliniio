import { act } from '@testing-library/react';
import { ErrorType } from '@/pages/KnowledgeHub/types/errors';
import {
  renderKnowledgeHubStore,
  resetStoreState,
  setupDefaultMocks,
  mockContentItems,
  createNetworkError,
  createValidationError,
  mockKnowledgeHubApiService,
} from '../__mocks__/knowledgeHubMocks';
// import { vi } from 'vitest';

describe('Content Fetching', () => {
  beforeEach(() => {
    resetStoreState();
    setupDefaultMocks();
  });

  it('should fetch content successfully', async () => {
    const { result } = renderKnowledgeHubStore();

    await act(async () => {
      await result.current.initializeContent();
    });

    expect(result.current.content).toEqual(mockContentItems);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.categoryCounts).toEqual({
      Courses: 1,
      Procedures: 1,
      Policies: 1,
      'Learning Pathways': 0,
      Advanced: 0,
    });
  });

  it('should handle API errors during content fetching', async () => {
    const networkError = createNetworkError('Network connection failed');

    // Mock the service to reject with the error
    mockKnowledgeHubApiService.fetchContent.mockRejectedValue(networkError);

    const { result } = renderKnowledgeHubStore();

    await act(async () => {
      await result.current.initializeContent();
    });

    expect(result.current.error?.type).toBe(ErrorType.NETWORK_ERROR);
    expect(result.current.error?.message).toContain(
      'Network connection failed'
    );
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle validation errors from API', async () => {
    const validationError = createValidationError('Invalid content data');

    // Mock the service to reject with the error
    mockKnowledgeHubApiService.fetchContent.mockRejectedValue(validationError);

    const { result } = renderKnowledgeHubStore();

    await act(async () => {
      await result.current.initializeContent();
    });

    expect(result.current.error?.type).toBe(ErrorType.VALIDATION_ERROR);
    expect(result.current.error?.message).toContain('Invalid content data');
  });

  it('should refetch content successfully', async () => {
    const { result } = renderKnowledgeHubStore();

    await act(async () => {
      await result.current.refetchContent();
    });

    expect(result.current.content).toEqual(mockContentItems);
  });
});
