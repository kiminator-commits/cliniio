import { renderHook } from '@testing-library/react';
import { useFilteredContent } from '@/features/library/hooks/useFilteredContent';
import { ContentItem } from '@/features/library/libraryTypes';

const mockItems: ContentItem[] = [
  {
    id: '1',
    title: 'Test One',
    category: 'Courses',
    level: 'Beginner',
    duration: '30 min',
    points: 10,
    description: 'Desc',
  },
  {
    id: '2',
    title: 'Test Two',
    category: 'Procedures',
    level: 'Advanced',
    duration: '90 min',
    points: 20,
    description: 'Desc',
  },
];

describe('useFilteredContent', () => {
  it('filters by search query', () => {
    const { result } = renderHook(() =>
      useFilteredContent({
        content: mockItems,
        searchQuery: 'One',
        selectedCategory: 'All',
        selectedLevel: 'All',
        filters: {
          category: '',
          skillLevel: '',
          timeline: '',
          status: '',
          source: '',
          showNewOnly: false,
        },
        favorites: new Set(),
        aiSuggestionsActive: false,
        getAiSuggestions: () => mockItems,
        isNewContent: () => false,
      })
    );
    expect(result.current).toHaveLength(1);
  });
});
