import { useCallback } from 'react';
import { InventoryItem } from '@/types/inventoryTypes';

export interface SearchOptions {
  debounceMs?: number;
  caseSensitive?: boolean;
  searchFields?: string[];
}

export interface InventoryFilters {
  category?: string;
  location?: string;
  status?: string;
  priceRange?: { min: number; max: number };
  quantityRange?: { min: number; max: number };
  dateRange?: { start: Date; end: Date };
}

/**
 * Hook for basic inventory search operations
 * Handles text search, filtering, and basic search functionality
 */
export const useInventorySearch = () => {
  // Helper functions for accessing item properties
  const getItemDate = useCallback((item: InventoryItem): string => {
    return (
      item.last_updated ||
      item.updated_at ||
      (typeof item.data?.createdAt === 'string'
        ? item.data.createdAt
        : new Date().toISOString())
    );
  }, []);

  const getItemQuantity = useCallback((item: InventoryItem): number | null => {
    return item.quantity;
  }, []);

  // Basic search implementation
  const performSearch = useCallback(
    (
      items: InventoryItem[],
      searchTerm: string,
      filters: InventoryFilters = {}
    ): InventoryItem[] => {
      if (!searchTerm.trim() && Object.keys(filters).length === 0) {
        return items;
      }

      let results = items;

      // Text search
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        results = results.filter((item) => {
          const searchableFields = [
            item.name,
            item.category,
            item.location,
            item.data?.description,
            item.data?.barcode,
          ].filter(Boolean);

          return searchableFields.some((field) => {
            if (typeof field !== 'string') return false;
            const fieldLower = field.toLowerCase();
            return fieldLower.includes(searchLower);
          });
        });
      }

      // Apply filters
      if (filters.category) {
        results = results.filter((item) => item.category === filters.category);
      }

      if (filters.location) {
        results = results.filter((item) => item.location === filters.location);
      }

      if (filters.status) {
        results = results.filter((item) => item.status === filters.status);
      }

      if (filters.priceRange) {
        if (filters.priceRange.min !== undefined) {
          results = results.filter((item) => {
            const cost = item.unit_cost || 0;
            return cost >= filters.priceRange!.min!;
          });
        }
        if (filters.priceRange.max !== undefined) {
          results = results.filter((item) => {
            const cost = item.unit_cost || 0;
            return cost <= filters.priceRange!.max!;
          });
        }
      }

      if (filters.quantityRange) {
        if (filters.quantityRange.min !== undefined) {
          results = results.filter((item) => {
            const quantity = getItemQuantity(item);
            return (
              quantity !== null &&
              quantity !== undefined &&
              quantity >= filters.quantityRange!.min!
            );
          });
        }
        if (filters.quantityRange.max !== undefined) {
          results = results.filter((item) => {
            const quantity = getItemQuantity(item);
            return (
              quantity !== null &&
              quantity !== undefined &&
              quantity <= filters.quantityRange!.max!
            );
          });
        }
      }

      // Date range filter
      if (filters.dateRange) {
        results = results.filter((item) => {
          const itemDate = new Date(getItemDate(item));
          return (
            itemDate >= filters.dateRange!.start &&
            itemDate <= filters.dateRange!.end
          );
        });
      }

      return results;
    },
    [getItemDate, getItemQuantity]
  );

  // Fuzzy search implementation
  const performFuzzySearch = useCallback(
    (items: InventoryItem[], searchTerm: string): InventoryItem[] => {
      if (!searchTerm.trim()) return items;

      const searchLower = searchTerm.toLowerCase();

      return items.filter((item) => {
        const searchableFields = [
          item.name,
          item.category,
          item.location,
          item.data?.description,
          item.data?.barcode,
        ].filter(Boolean);

        return searchableFields.some((field) => {
          if (typeof field !== 'string') return false;
          const fieldLower = field.toLowerCase();

          // Exact match
          if (fieldLower.includes(searchLower)) return true;

          // Partial word match
          const searchWords = searchLower.split(' ');
          return searchWords.every(
            (word) =>
              fieldLower.includes(word) ||
              fieldLower
                .split(' ')
                .some(
                  (fieldWord) =>
                    fieldWord.startsWith(word) || fieldWord.endsWith(word)
                )
          );
        });
      });
    },
    []
  );

  // Search with highlighting
  const performSearchWithHighlighting = useCallback(
    (
      items: InventoryItem[],
      searchTerm: string,
      filters: InventoryFilters = {}
    ): Array<{ item: InventoryItem; highlights: string[] }> => {
      const results = performSearch(items, searchTerm, filters);
      const searchLower = searchTerm.toLowerCase();

      return results.map((item) => {
        const highlights: string[] = [];
        const searchableFields = [
          { field: item.name, name: 'name' },
          { field: item.category, name: 'category' },
          { field: item.location, name: 'location' },
          { field: item.data?.description, name: 'description' },
          { field: item.data?.barcode, name: 'barcode' },
        ].filter((f) => f.field);

        searchableFields.forEach(({ field, name }) => {
          if (
            typeof field === 'string' &&
            field.toLowerCase().includes(searchLower)
          ) {
            highlights.push(`${name}: ${field}`);
          }
        });

        return { item, highlights };
      });
    },
    [performSearch]
  );

  return {
    performSearch,
    performFuzzySearch,
    performSearchWithHighlighting,
  };
};
