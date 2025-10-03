import { act, waitFor } from '@testing-library/react';
import { UserRole } from '@/pages/KnowledgeHub/utils/permissions';
import { ErrorType } from '@/pages/KnowledgeHub/types/errors';
import {
  renderKnowledgeHubStore,
  resetStoreState,
  setupDefaultMocks,
  setupStoreWithContent,
} from '../__mocks__/knowledgeHubMocks';

describe('Content Deletion', () => {
  beforeEach(() => {
    resetStoreState();
    setupDefaultMocks();
    setupStoreWithContent();
  });

  it('should delete content successfully', async () => {
    const { result } = renderKnowledgeHubStore();

    await act(async () => {
      await result.current.deleteContent('1');
    });

    expect(result.current.content).toHaveLength(2);
    expect(
      result.current.content.find((item) => item.id === '1')
    ).toBeUndefined();
  });

  it('should update category counts after deletion', async () => {
    const { result } = renderKnowledgeHubStore();

    // Verify initial counts
    expect(result.current.categoryCounts.Courses).toBe(1);
    expect(result.current.categoryCounts.Procedures).toBe(1);
    expect(result.current.categoryCounts.Policies).toBe(1);

    await act(async () => {
      await result.current.deleteContent('1'); // Delete the Courses item
    });

    // Wait for state to be updated
    await waitFor(() => {
      expect(result.current.content).toHaveLength(2);
    });

    // Check category counts after deletion
    expect(result.current.categoryCounts.Courses).toBe(0);
    expect(result.current.categoryCounts.Procedures).toBe(1);
    expect(result.current.categoryCounts.Policies).toBe(1);
  });

  it('should handle permission errors for content deletion', async () => {
    const { result } = renderKnowledgeHubStore();

    act(() => {
      result.current.setCurrentUser({
        id: 'test-user',
        role: 'Student' as UserRole,
      });
    });

    await act(async () => {
      await result.current.deleteContent('1');
    });

    expect(result.current.error?.type).toBe(ErrorType.VALIDATION_ERROR);
    expect(result.current.error?.message).toContain('Insufficient permissions');
  });

  it('should handle API errors during content deletion', async () => {
    // Import the actual API service and mock it directly
    const { knowledgeHubApiService } = await import(
      '@/pages/KnowledgeHub/services/knowledgeHubApiService'
    );
    vi.spyOn(knowledgeHubApiService, 'deleteContent').mockRejectedValue(
      new Error('Content not found')
    );

    const { result } = renderKnowledgeHubStore();

    await act(async () => {
      await result.current.deleteContent('1');
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.type).toBe(ErrorType.CONTENT_NOT_FOUND);
    expect(result.current.error?.message).toContain('not found');
  });
});
