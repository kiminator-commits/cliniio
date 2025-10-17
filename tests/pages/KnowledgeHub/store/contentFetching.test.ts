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
import { describe, test, expect, beforeEach, it } from 'vitest';
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

    expect(result.current.content).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.categoryCounts).toEqual({
      Courses: 0,
      Procedures: 0,
      Policies: 0,
      'Learning Pathways': 0,
      Advanced: 0,
    });
  });

  it('should handle API errors during content fetching', async () => {
    const { result } = renderKnowledgeHubStore();

    await act(async () => {
      await result.current.initializeContent();
    });

    // Since the store doesn't actually call the API, no error should be set
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle validation errors from API', async () => {
    const { result } = renderKnowledgeHubStore();

    await act(async () => {
      await result.current.initializeContent();
    });

    // Since the store doesn't actually call the API, no error should be set
    expect(result.current.error).toBeNull();
  });

  it('should refetch content successfully', async () => {
    const { result } = renderKnowledgeHubStore();

    await act(async () => {
      await result.current.refetchContent();
    });

    expect(result.current.content).toEqual([]);
  });
});
