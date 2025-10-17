import { act } from '@testing-library/react';
import { UserRole } from '@/pages/KnowledgeHub/utils/permissions';
import { ErrorType } from '@/pages/KnowledgeHub/types/errors';
import {
  renderKnowledgeHubStore,
  resetStoreState,
  setupDefaultMocks,
  setupStoreWithContent,
} from '../__mocks__/knowledgeHubMocks';
import { describe, test, expect, beforeEach, it } from 'vitest';

describe('Content Updates', () => {
  beforeEach(() => {
    resetStoreState();
    setupDefaultMocks();
    setupStoreWithContent();
  });

  it('should update content successfully', async () => {
    const { result } = renderKnowledgeHubStore();

    const updates = {
      title: 'Updated Title',
      description: 'Updated description',
    };

    await act(async () => {
      await result.current.updateContent('1', updates);
    });

    expect(result.current.content[0].title).toBe('Updated Title');
    expect(result.current.content[0].description).toBe('Updated description');
  });

  it('should handle permission errors for content updates', async () => {
    const { result } = renderKnowledgeHubStore();

    act(() => {
      result.current.setCurrentUser({
        id: 'test-user',
        role: 'Student' as UserRole,
      });
    });

    await act(async () => {
      await result.current.updateContent('1', { title: 'New Title' });
    });

    expect(result.current.error?.type).toBe(ErrorType.VALIDATION_ERROR);
    expect(result.current.error?.message).toContain('Insufficient permissions');
  });
});
