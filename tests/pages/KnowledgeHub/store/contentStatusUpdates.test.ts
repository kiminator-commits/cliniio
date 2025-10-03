import { act } from '@testing-library/react';
import { UserRole } from '@/pages/KnowledgeHub/utils/permissions';
import { ErrorType } from '@/pages/KnowledgeHub/types/errors';
import {
  renderKnowledgeHubStore,
  resetStoreState,
  setupDefaultMocks,
  setupStoreWithContent,
  // mockUser,
  createApiError,
} from '../__mocks__/knowledgeHubMocks';

describe('Content Status Updates', () => {
  beforeEach(() => {
    resetStoreState();
    setupDefaultMocks();
    setupStoreWithContent();
  });

  it('should update content status successfully', async () => {
    const { result } = renderKnowledgeHubStore();

    await act(async () => {
      await result.current.updateContentStatus('1', 'Completed');
    });

    expect(result.current.content[0].status).toBe('Completed');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle permission errors for status updates', async () => {
    const { result } = renderKnowledgeHubStore();

    // Set user without update permissions
    act(() => {
      result.current.setCurrentUser({
        id: 'test-user',
        role: 'Student' as UserRole,
      });
    });

    await act(async () => {
      await result.current.updateContentStatus('1', 'Completed');
    });

    expect(result.current.error?.type).toBe(ErrorType.VALIDATION_ERROR);
    expect(result.current.error?.message).toContain('Insufficient permissions');
    expect(result.current.validationError).toContain(
      'Insufficient permissions'
    );
  });

  it('should handle authentication errors for status updates', async () => {
    const { result } = renderKnowledgeHubStore();

    // Clear user
    act(() => {
      result.current.setCurrentUser(null);
    });

    await act(async () => {
      await result.current.updateContentStatus('1', 'Completed');
    });

    expect(result.current.error?.type).toBe(ErrorType.UNAUTHORIZED);
    expect(result.current.error?.message).toContain('Authentication required');
  });

  it('should handle API errors during status updates', async () => {
    const apiError = createApiError(
      ErrorType.OPERATION_FAILED,
      'Invalid status update'
    );

    // Import the actual API service and mock it directly
    const { knowledgeHubApiService } = await import(
      '@/pages/KnowledgeHub/services/knowledgeHubApiService'
    );
    vi.spyOn(knowledgeHubApiService, 'updateContentStatus').mockRejectedValue(
      apiError
    );

    const { result } = renderKnowledgeHubStore();

    await act(async () => {
      await result.current.updateContentStatus('1', 'Completed');
    });

    expect(result.current.error?.type).toBe(ErrorType.OPERATION_FAILED);
    expect(result.current.error?.message).toContain('Invalid status update');
  });

  it('should update selected content when category is selected', async () => {
    const { result } = renderKnowledgeHubStore();

    // Set selected category
    act(() => {
      result.current.setSelectedCategory('Courses');
    });

    await act(async () => {
      await result.current.updateContentStatus('1', 'Completed');
    });

    expect(result.current.selectedContent).toHaveLength(1);
    expect(result.current.selectedContent[0].status).toBe('Completed');
  });
});
