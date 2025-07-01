import { useMemo } from 'react';
import { ContentItem } from '../libraryTypes';

interface LibraryFilters {
  category: string;
  skillLevel: string;
  timeline: string;
  status: string;
  source: string;
  showNewOnly: boolean;
}

interface FilterParams {
  content: ContentItem[];
  searchQuery: string;
  selectedCategory: string;
  selectedLevel: string;
  filters: LibraryFilters;
  favorites: Set<string>;
  aiSuggestionsActive: boolean;
  getAiSuggestions: () => ContentItem[];
  isNewContent: (publishedDate?: string) => boolean;
}

export const useFilteredContent = ({
  content,
  searchQuery,
  selectedCategory,
  selectedLevel,
  filters,
  favorites,
  aiSuggestionsActive,
  getAiSuggestions,
  isNewContent,
}: FilterParams) => {
  return useMemo(() => {
    const baseContent = aiSuggestionsActive ? getAiSuggestions() : content;

    return baseContent.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());

      // Handle favorites filter
      if (selectedCategory === 'Favorites') {
        return matchesSearch && favorites.has(item.id);
      }

      // Handle other category filters
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

      // Handle skill level filter
      const matchesSkillLevel = selectedLevel === 'All' || item.level === selectedLevel;

      // Handle duration filter
      const matchesDuration =
        !filters.timeline ||
        (() => {
          const itemMinutes = parseInt(item.duration.split(' ')[0]);
          switch (filters.timeline) {
            case '<-1-hour':
              return itemMinutes < 60;
            case '1-3-hours':
              return itemMinutes >= 60 && itemMinutes <= 180;
            case '3-5-hours':
              return itemMinutes > 180 && itemMinutes <= 300;
            case '5+-hours':
              return itemMinutes > 300;
            default:
              return true;
          }
        })();

      // Handle new content filter
      const matchesNewFilter = !filters.showNewOnly || isNewContent(item.publishedDate);

      return (
        matchesSearch && matchesCategory && matchesSkillLevel && matchesDuration && matchesNewFilter
      );
    });
  }, [
    content,
    searchQuery,
    selectedCategory,
    selectedLevel,
    filters.timeline,
    filters.showNewOnly,
    favorites,
    aiSuggestionsActive,
    getAiSuggestions,
    isNewContent,
  ]);
};
