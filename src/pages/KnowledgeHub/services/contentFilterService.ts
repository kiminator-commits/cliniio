import { ContentItem } from '../types';

export interface FilterOptions {
  searchQuery: string;
  selectedDomain: string;
  selectedContentType: string;
  activeTab: string;
}

export class ContentFilterService {
  static filterByCategory(
    content: ContentItem[] | null,
    category: string
  ): ContentItem[] {
    if (!content || !Array.isArray(content)) {
      return [];
    }
    return content.filter((item) => item.category === category);
  }

  static filterContent(
    items: ContentItem[],
    options: FilterOptions
  ): ContentItem[] {
    let filtered = [...items];

    // Filter by search query
    if (options.searchQuery.trim()) {
      const query = options.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.data?.description?.toLowerCase().includes(query) ||
          item.data?.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by domain
    if (options.selectedDomain && options.selectedDomain !== 'All') {
      filtered = filtered.filter(
        (item) => item.domain === options.selectedDomain
      );
    }

    // Filter by content type
    if (options.selectedContentType && options.selectedContentType !== 'All') {
      filtered = filtered.filter(
        (item) => item.contentType === options.selectedContentType
      );
    }

    return filtered;
  }

  static getCategoryCount(content: ContentItem[], category: string): number {
    if (!content || !Array.isArray(content)) {
      return 0;
    }
    return content.filter((item) => item.category === category).length;
  }

  static getUniqueDomains(content: ContentItem[]): string[] {
    if (!content || !Array.isArray(content)) {
      return [];
    }
    const domains = new Set(
      content
        .map((item) => item.domain)
        .filter((domain): domain is string => Boolean(domain))
    );
    return Array.from(domains).sort();
  }

  static getUniqueContentTypes(content: ContentItem[]): string[] {
    if (!content || !Array.isArray(content)) {
      return [];
    }
    const types = new Set(
      content
        .map((item) => item.contentType)
        .filter((type): type is string => Boolean(type))
    );
    return Array.from(types).sort();
  }
}
