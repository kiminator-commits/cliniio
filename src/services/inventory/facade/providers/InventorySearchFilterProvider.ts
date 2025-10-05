import { LocalInventoryItem } from '../types';
import { InventoryDataAdapter } from '../../adapters/InventoryDataAdapter';
import { InventoryErrorHandler } from '../../InventoryErrorHandler';
import { InventoryCategoryProvider } from './InventoryCategoryProvider';

export interface SearchFilters {
  category?: string;
  status?: string;
  location?: string;
  searchQuery?: string;
  minQuantity?: number;
  maxQuantity?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'category' | 'location' | 'quantity' | 'lastUpdated';
  sortOrder?: 'asc' | 'desc';
  includeArchived?: boolean;
}

export interface SearchResult {
  data: LocalInventoryItem[];
  total: number;
  filters: SearchFilters;
  options: SearchOptions;
  error: string | null;
}

export class InventorySearchFilterProvider {
  private adapter: InventoryDataAdapter;

  constructor(adapter: InventoryDataAdapter) {
    this.adapter = adapter;
  }

  /**
   * Search items
   */
  async searchItems(
    query: string
  ): Promise<{ data: LocalInventoryItem[]; error: string | null }> {
    const result = await InventoryErrorHandler.handleOperation(
      'searchItems',
      async () => {
        const allItems = await this.adapter.fetchInventoryItems();

        const searchResults = allItems.filter(
          (item) =>
            item.name?.toLowerCase().includes(query.toLowerCase()) ||
            (item.data as Record<string, unknown>)?.description
              ?.toString()
              .toLowerCase()
              .includes(query.toLowerCase()) ||
            item.category?.toLowerCase().includes(query.toLowerCase())
        );

        return { data: searchResults, error: null };
      }
    );

    return result;
  }

  /**
   * Get filtered items
   */
  async getFilteredItems(
    filters: SearchFilters
  ): Promise<{ data: LocalInventoryItem[]; error: string | null }> {
    const result = await InventoryErrorHandler.handleOperation(
      'getFilteredItems',
      async () => {
        const allItems = await this.adapter.fetchInventoryItems();

        let filteredItems = allItems;

        if (filters.category) {
          filteredItems = filteredItems.filter(
            (item) => item.category === filters.category
          );
        }

        if (filters.status) {
          filteredItems = filteredItems.filter(
            (item) => item.status === filters.status
          );
        }

        if (filters.location) {
          filteredItems = filteredItems.filter(
            (item) => item.location === filters.location
          );
        }

        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredItems = filteredItems.filter(
            (item) =>
              item.name?.toLowerCase().includes(query) ||
              (item.data as Record<string, unknown>)?.description
                ?.toString()
                .toLowerCase()
                .includes(query)
          );
        }

        if (filters.minQuantity !== undefined) {
          filteredItems = filteredItems.filter(
            (item) => (item.quantity || 0) >= filters.minQuantity!
          );
        }

        if (filters.maxQuantity !== undefined) {
          filteredItems = filteredItems.filter(
            (item) => (item.quantity || 0) <= filters.maxQuantity!
          );
        }

        if (filters.dateRange) {
          filteredItems = filteredItems.filter((item) => {
            const itemDate = new Date(item.lastUpdated || item.createdAt);
            return (
              itemDate >= filters.dateRange!.start &&
              itemDate <= filters.dateRange!.end
            );
          });
        }

        if (filters.tags && filters.tags.length > 0) {
          filteredItems = filteredItems.filter((item) => {
            const itemTags =
              ((item.data as Record<string, unknown>)?.tags as string[]) || [];
            return filters.tags!.some((tag) => itemTags.includes(tag));
          });
        }

        return { data: filteredItems, error: null };
      }
    );

    return result;
  }

  /**
   * Advanced search with filters and options
   */
  async advancedSearch(
    filters: SearchFilters,
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    const result = await InventoryErrorHandler.handleOperation(
      'advancedSearch',
      async () => {
        const allItems = await this.adapter.fetchInventoryItems();

        let filteredItems = allItems;

        // Apply filters
        if (filters.category) {
          filteredItems = filteredItems.filter(
            (item) => item.category === filters.category
          );
        }

        if (filters.status) {
          filteredItems = filteredItems.filter(
            (item) => item.status === filters.status
          );
        }

        if (filters.location) {
          filteredItems = filteredItems.filter(
            (item) => item.location === filters.location
          );
        }

        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredItems = filteredItems.filter(
            (item) =>
              item.name?.toLowerCase().includes(query) ||
              (item.data as Record<string, unknown>)?.description
                ?.toString()
                .toLowerCase()
                .includes(query) ||
              item.category?.toLowerCase().includes(query)
          );
        }

        if (filters.minQuantity !== undefined) {
          filteredItems = filteredItems.filter(
            (item) => (item.quantity || 0) >= filters.minQuantity!
          );
        }

        if (filters.maxQuantity !== undefined) {
          filteredItems = filteredItems.filter(
            (item) => (item.quantity || 0) <= filters.maxQuantity!
          );
        }

        if (filters.dateRange) {
          filteredItems = filteredItems.filter((item) => {
            const itemDate = new Date(item.lastUpdated || item.createdAt);
            return (
              itemDate >= filters.dateRange!.start &&
              itemDate <= filters.dateRange!.end
            );
          });
        }

        if (filters.tags && filters.tags.length > 0) {
          filteredItems = filteredItems.filter((item) => {
            const itemTags =
              ((item.data as Record<string, unknown>)?.tags as string[]) || [];
            return filters.tags!.some((tag) => itemTags.includes(tag));
          });
        }

        // Filter out archived items unless explicitly requested
        if (!options.includeArchived) {
          filteredItems = filteredItems.filter(
            (item) => item.status !== 'archived'
          );
        }

        // Apply sorting
        if (options.sortBy) {
          filteredItems = this.sortItems(
            filteredItems,
            options.sortBy,
            options.sortOrder || 'asc'
          );
        }

        // Apply pagination
        const total = filteredItems.length;
        if (options.limit || options.offset) {
          const start = options.offset || 0;
          const end = options.limit
            ? start + options.limit
            : filteredItems.length;
          filteredItems = filteredItems.slice(start, end);
        }

        return {
          data: filteredItems,
          total,
          filters,
          options,
          error: null,
        };
      }
    );

    return result;
  }

  /**
   * Search by normalized category
   */
  async searchByNormalizedCategory(
    normalizedCategory: string,
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    const result = await InventoryErrorHandler.handleOperation(
      'searchByNormalizedCategory',
      async () => {
        const allItems = await this.adapter.fetchInventoryItems();

        // Apply normalized category filtering
        const filteredItems = allItems.filter((item) => {
          const itemNormalizedCategory =
            InventoryCategoryProvider.normalizeCategory(item.category || '');
          return itemNormalizedCategory === normalizedCategory;
        });

        // Apply additional options
        let resultItems = filteredItems;

        if (!options.includeArchived) {
          resultItems = resultItems.filter(
            (item) => item.status !== 'archived'
          );
        }

        if (options.sortBy) {
          resultItems = this.sortItems(
            resultItems,
            options.sortBy,
            options.sortOrder || 'asc'
          );
        }

        const total = resultItems.length;
        if (options.limit || options.offset) {
          const start = options.offset || 0;
          const end = options.limit
            ? start + options.limit
            : resultItems.length;
          resultItems = resultItems.slice(start, end);
        }

        return {
          data: resultItems,
          total,
          filters: { category: normalizedCategory },
          options,
          error: null,
        };
      }
    );

    return result;
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(
    query: string,
    limit: number = 10
  ): Promise<string[]> {
    const result = await InventoryErrorHandler.handleOperation(
      'getSearchSuggestions',
      async () => {
        const allItems = await this.adapter.fetchInventoryItems();
        const suggestions = new Set<string>();

        if (!query || query.trim() === '') {
          return [];
        }

        const searchTerm = query.toLowerCase();

        allItems.forEach((item) => {
          // Add name suggestions
          if (item.name && item.name.toLowerCase().includes(searchTerm)) {
            suggestions.add(item.name);
          }

          // Add category suggestions
          if (
            item.category &&
            item.category.toLowerCase().includes(searchTerm)
          ) {
            suggestions.add(item.category);
          }

          // Add location suggestions
          if (
            item.location &&
            item.location.toLowerCase().includes(searchTerm)
          ) {
            suggestions.add(item.location);
          }

          // Add description suggestions
          const description = (item.data as Record<string, unknown>)
            ?.description as string;
          if (description && description.toLowerCase().includes(searchTerm)) {
            // Extract relevant words from description
            const words = description
              .split(/\s+/)
              .filter(
                (word) =>
                  word.toLowerCase().includes(searchTerm) && word.length > 2
              );
            words.forEach((word) => suggestions.add(word));
          }
        });

        return Array.from(suggestions).slice(0, limit);
      }
    );

    return result || [];
  }

  /**
   * Get locations
   */
  async getLocations(): Promise<{ data: string[]; error: string | null }> {
    const result = await InventoryErrorHandler.handleOperation(
      'getLocations',
      async () => {
        const allItems = await this.adapter.fetchInventoryItems();
        const locations = Array.from(
          new Set(allItems.map((item) => item.location).filter(Boolean))
        ) as string[];
        return locations;
      }
    );

    return { data: result, error: null };
  }

  /**
   * Sort items by specified field
   */
  private sortItems(
    items: LocalInventoryItem[],
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): LocalInventoryItem[] {
    return items.sort((a, b) => {
      let aValue: unknown;
      let bValue: unknown;

      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        case 'location':
          aValue = a.location || '';
          bValue = b.location || '';
          break;
        case 'quantity':
          aValue = a.quantity || 0;
          bValue = b.quantity || 0;
          break;
        case 'lastUpdated':
          aValue = new Date(a.lastUpdated || a.createdAt);
          bValue = new Date(b.lastUpdated || b.createdAt);
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Validate search filters
   */
  static validateSearchFilters(filters: SearchFilters): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (
      filters.minQuantity !== undefined &&
      filters.maxQuantity !== undefined
    ) {
      if (filters.minQuantity > filters.maxQuantity) {
        errors.push('Minimum quantity cannot be greater than maximum quantity');
      }
    }

    if (filters.dateRange) {
      if (filters.dateRange.start > filters.dateRange.end) {
        errors.push('Start date cannot be after end date');
      }
    }

    if (filters.searchQuery && filters.searchQuery.length > 100) {
      errors.push('Search query must be less than 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate search options
   */
  static validateSearchOptions(options: SearchOptions): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (options.limit !== undefined && options.limit < 1) {
      errors.push('Limit must be greater than 0');
    }

    if (options.limit !== undefined && options.limit > 1000) {
      errors.push('Limit cannot exceed 1000');
    }

    if (options.offset !== undefined && options.offset < 0) {
      errors.push('Offset must be non-negative');
    }

    const validSortFields = [
      'name',
      'category',
      'location',
      'quantity',
      'lastUpdated',
    ];
    if (options.sortBy && !validSortFields.includes(options.sortBy)) {
      errors.push(
        `Invalid sort field. Must be one of: ${validSortFields.join(', ')}`
      );
    }

    const validSortOrders = ['asc', 'desc'];
    if (options.sortOrder && !validSortOrders.includes(options.sortOrder)) {
      errors.push(
        `Invalid sort order. Must be one of: ${validSortOrders.join(', ')}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
