import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { LocalInventoryItem } from '../../types/inventoryTypes';
import { InventoryFilters } from './useInventoryFilters';

export interface SearchOptions {
  debounceMs?: number;
  caseSensitive?: boolean;
  searchFields?: string[];
}

export interface SearchState {
  searchTerm: string;
  isSearching: boolean;
  searchResults: LocalInventoryItem[];
  totalResults: number;
  searchTimestamp: Date | null;
  searchError: string | null;
}

export interface UseInventorySearchProps {
  data: LocalInventoryItem[];
  filters: InventoryFilters;
  searchOptions?: SearchOptions;
  onSearchComplete?: (results: LocalInventoryItem[]) => void;
}

export const useInventorySearch = ({
  data,
  filters,
  searchOptions = {},
  onSearchComplete,
}: UseInventorySearchProps) => {
  const {
    debounceMs = 300,
    caseSensitive = false,
    searchFields = ['item', 'category', 'location'],
  } = searchOptions;

  const [state, setState] = useState<SearchState>({
    searchTerm: filters.searchQuery || '',
    isSearching: false,
    searchResults: [],
    totalResults: 0,
    searchTimestamp: null,
    searchError: null,
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Core search function
  const performSearch = useCallback(
    (
      items: LocalInventoryItem[],
      searchTerm: string,
      currentFilters: InventoryFilters
    ): LocalInventoryItem[] => {
      let results = [...items];

      // Apply text search
      if (searchTerm.trim()) {
        const searchLower = caseSensitive ? searchTerm : searchTerm.toLowerCase();

        results = results.filter(item => {
          return searchFields.some(field => {
            const value = item[field as keyof LocalInventoryItem];
            if (typeof value === 'string') {
              const itemValue = caseSensitive ? value : value.toLowerCase();
              return itemValue.includes(searchLower);
            }
            return false;
          });
        });
      }

      // Apply category filter
      if (currentFilters.category) {
        results = results.filter(item => item.category === currentFilters.category);
      }

      // Apply location filter
      if (currentFilters.location) {
        results = results.filter(item => item.location === currentFilters.location);
      }

      // Apply status filter
      if (currentFilters.status) {
        results = results.filter(item => {
          const status =
            (item as Record<string, unknown>).status || (item as Record<string, unknown>).p2Status;
          return status === currentFilters.status;
        });
      }

      // Apply price range filter
      if (currentFilters.minPrice !== undefined) {
        results = results.filter(item => (item.cost || 0) >= currentFilters.minPrice!);
      }
      if (currentFilters.maxPrice !== undefined) {
        results = results.filter(item => (item.cost || 0) <= currentFilters.maxPrice!);
      }

      // Apply quantity range filter (for supplies)
      if (currentFilters.minQuantity !== undefined) {
        results = results.filter(item => {
          const quantity = (item as Record<string, unknown>).quantity;
          return quantity !== undefined && quantity >= currentFilters.minQuantity!;
        });
      }
      if (currentFilters.maxQuantity !== undefined) {
        results = results.filter(item => {
          const quantity = (item as Record<string, unknown>).quantity;
          return quantity !== undefined && quantity <= currentFilters.maxQuantity!;
        });
      }

      // Apply date range filter
      if (currentFilters.dateCreated) {
        results = results.filter(item => {
          const itemDate = new Date(
            (item as Record<string, unknown>).purchaseDate ||
              (item as Record<string, unknown>).dateCreated
          );
          return (
            itemDate >= currentFilters.dateCreated!.start &&
            itemDate <= currentFilters.dateCreated!.end
          );
        });
      }

      return results;
    },
    [caseSensitive, searchFields]
  );

  // Debounced search function
  const search = useCallback(
    (searchTerm: string, options: { debounceMs?: number } = {}) => {
      const { debounceMs: customDebounce = debounceMs } = options;

      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Abort previous search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setState(prev => ({ ...prev, isSearching: true, searchError: null }));

      searchTimeoutRef.current = setTimeout(() => {
        try {
          const results = performSearch(data, searchTerm, filters);

          setState(prev => ({
            ...prev,
            searchTerm,
            searchResults: results,
            totalResults: results.length,
            isSearching: false,
            searchTimestamp: new Date(),
          }));

          if (onSearchComplete) {
            onSearchComplete(results);
          }
        } catch (error) {
          setState(prev => ({
            ...prev,
            isSearching: false,
            searchError: error instanceof Error ? error.message : 'Search failed',
          }));
        }
      }, customDebounce);
    },
    [data, filters, performSearch, debounceMs, onSearchComplete]
  );

  // Update search when filters change
  useEffect(() => {
    search(filters.searchQuery || '');
  }, [filters, search]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Memoized search results
  const searchResults = useMemo(() => state.searchResults, [state.searchResults]);

  return {
    search,
    searchResults,
    isSearching: state.isSearching,
    totalResults: state.totalResults,
    searchTimestamp: state.searchTimestamp,
    searchError: state.searchError,
    searchTerm: state.searchTerm,
  };
};
