import { useMemo } from 'react';
import { ContentItem } from '../types';
import {
  ContentFilterService,
  FilterOptions,
} from '../services/contentFilterService';

interface UseContentFilteringProps {
  content: ContentItem[] | null;
  selectedCategory: string | null;
  filterOptions: FilterOptions;
}

export const useContentFiltering = ({
  content,
  selectedCategory,
  filterOptions,
}: UseContentFilteringProps) => {
  const categoryItems = useMemo(() => {
    if (!content || !Array.isArray(content)) {
      return [];
    }
    const filtered = ContentFilterService.filterByCategory(
      content,
      selectedCategory || ''
    );
    return filtered;
  }, [content, selectedCategory]);

  const filteredItems = useMemo(() => {
    return ContentFilterService.filterContent(categoryItems, filterOptions);
  }, [categoryItems, filterOptions]);

  const uniqueDomains = useMemo(() => {
    if (!content) return [];
    return ContentFilterService.getUniqueDomains(content);
  }, [content]);

  const uniqueContentTypes = useMemo(() => {
    if (!content) return [];
    return ContentFilterService.getUniqueContentTypes(content);
  }, [content]);

  const getCategoryCount = (category: string): number => {
    if (!content) return 0;
    return ContentFilterService.getCategoryCount(content, category);
  };

  return {
    categoryItems,
    filteredItems,
    uniqueDomains,
    uniqueContentTypes,
    getCategoryCount,
  };
};
