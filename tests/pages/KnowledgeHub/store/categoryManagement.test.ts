import { act } from '@testing-library/react';
import {
  renderKnowledgeHubStore,
  resetStoreState,
  setupDefaultMocks,
  setupStoreWithContent,
} from '../__mocks__/knowledgeHubMocks';
import { describe, test, expect, beforeEach, it } from 'vitest';

describe('Category Management', () => {
  beforeEach(() => {
    resetStoreState();
    setupDefaultMocks();
    setupStoreWithContent();
  });

  it('should set selected category and filter content', () => {
    const { result } = renderKnowledgeHubStore();

    act(() => {
      result.current.setSelectedCategory('Courses');
    });

    expect(result.current.selectedCategory).toBe('Courses');
    expect(result.current.selectedContent).toHaveLength(1);
    expect(result.current.selectedContent[0].category).toBe('Courses');
  });

  it('should clear selected content when category is empty', () => {
    const { result } = renderKnowledgeHubStore();

    act(() => {
      result.current.setSelectedCategory('Courses');
    });

    act(() => {
      result.current.setSelectedCategory('');
    });

    expect(result.current.selectedCategory).toBe('');
    expect(result.current.selectedContent).toEqual([]);
  });

  it('should calculate category counts correctly', () => {
    const { result } = renderKnowledgeHubStore();

    expect(result.current.categoryCounts).toEqual({
      Courses: 1,
      Procedures: 1,
      Policies: 1,
      'Learning Pathways': 0,
      Advanced: 0,
    });
  });
});
