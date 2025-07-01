import { useState, useCallback, useMemo } from 'react';
import { LocalInventoryItem } from '../../types/inventoryTypes';

export type SortDirection = 'asc' | 'desc';
export type SortableField = keyof LocalInventoryItem | 'cost' | 'quantity' | 'status';

export interface SortConfig {
  field: SortableField;
  direction: SortDirection;
}

export interface SortOptions {
  multiSort?: boolean;
  caseSensitive?: boolean;
  nullsFirst?: boolean;
}

export interface UseInventorySortingProps {
  data: LocalInventoryItem[];
  initialSort?: SortConfig;
  sortOptions?: SortOptions;
  onSortChange?: (sortedData: LocalInventoryItem[]) => void;
}

export const useInventorySorting = ({
  data,
  initialSort = { field: 'item', direction: 'asc' },
  sortOptions = {},
  onSortChange,
}: UseInventorySortingProps) => {
  const { multiSort = false, caseSensitive = false, nullsFirst = false } = sortOptions;

  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort);
  const [multiSortConfigs, setMultiSortConfigs] = useState<SortConfig[]>([]);

  // Get sortable value from item
  const getSortValue = useCallback(
    (item: LocalInventoryItem, field: SortableField): unknown => {
      switch (field) {
        case 'cost':
          return item.cost || 0;
        case 'quantity':
          return (item as Record<string, unknown>).quantity || 0;
        case 'status':
          return (
            (item as Record<string, unknown>).status ||
            (item as Record<string, unknown>).p2Status ||
            ''
          );
        default: {
          const value = item[field as keyof LocalInventoryItem];
          return typeof value === 'string' && !caseSensitive ? value.toLowerCase() : value;
        }
      }
    },
    [caseSensitive]
  );

  // Compare function for sorting
  const compareValues = useCallback(
    (a: unknown, b: unknown, direction: SortDirection): number => {
      // Handle null/undefined values
      const aIsNull = a === null || a === undefined;
      const bIsNull = b === null || b === undefined;

      if (aIsNull && bIsNull) return 0;
      if (aIsNull) return nullsFirst ? -1 : 1;
      if (bIsNull) return nullsFirst ? 1 : -1;

      // Handle different types
      if (typeof a === 'string' && typeof b === 'string') {
        const comparison = a.localeCompare(b);
        return direction === 'asc' ? comparison : -comparison;
      }

      if (typeof a === 'number' && typeof b === 'number') {
        const comparison = a - b;
        return direction === 'asc' ? comparison : -comparison;
      }

      if (a instanceof Date && b instanceof Date) {
        const comparison = a.getTime() - b.getTime();
        return direction === 'asc' ? comparison : -comparison;
      }

      // Fallback to string comparison
      const aStr = String(a);
      const bStr = String(b);
      const comparison = aStr.localeCompare(bStr);
      return direction === 'asc' ? comparison : -comparison;
    },
    [nullsFirst]
  );

  // Sort data based on current configuration
  const sortedData = useMemo(() => {
    if (!data.length) return data;

    const dataCopy = [...data];

    if (multiSort && multiSortConfigs.length > 0) {
      // Multi-sort: apply multiple sort criteria in order
      dataCopy.sort((a, b) => {
        for (const config of multiSortConfigs) {
          const aValue = getSortValue(a, config.field);
          const bValue = getSortValue(b, config.field);
          const comparison = compareValues(aValue, bValue, config.direction);

          if (comparison !== 0) {
            return comparison;
          }
        }
        return 0;
      });
    } else {
      // Single sort
      dataCopy.sort((a, b) => {
        const aValue = getSortValue(a, sortConfig.field);
        const bValue = getSortValue(b, sortConfig.field);
        return compareValues(aValue, bValue, sortConfig.direction);
      });
    }

    return dataCopy;
  }, [data, sortConfig, multiSortConfigs, multiSort, getSortValue, compareValues]);

  // Sort by single field
  const sortBy = useCallback(
    (field: SortableField, direction?: SortDirection) => {
      const newDirection =
        direction ||
        (sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc');

      const newSortConfig = { field, direction: newDirection };
      setSortConfig(newSortConfig);

      if (onSortChange) {
        const sorted = [...data].sort((a, b) => {
          const aValue = getSortValue(a, field);
          const bValue = getSortValue(b, field);
          return compareValues(aValue, bValue, newDirection);
        });
        onSortChange(sorted);
      }
    },
    [sortConfig, data, getSortValue, compareValues, onSortChange]
  );

  // Add sort criteria for multi-sort
  const addSortCriteria = useCallback(
    (field: SortableField, direction: SortDirection = 'asc') => {
      if (!multiSort) return;

      setMultiSortConfigs(prev => {
        // Remove existing sort for this field
        const filtered = prev.filter(config => config.field !== field);
        // Add new sort criteria
        return [...filtered, { field, direction }];
      });
    },
    [multiSort]
  );

  // Remove sort criteria from multi-sort
  const removeSortCriteria = useCallback(
    (field: SortableField) => {
      if (!multiSort) return;

      setMultiSortConfigs(prev => prev.filter(config => config.field !== field));
    },
    [multiSort]
  );

  // Clear all sort criteria
  const clearSort = useCallback(() => {
    setSortConfig(initialSort);
    setMultiSortConfigs([]);
  }, [initialSort]);

  // Get current sort configuration
  const getCurrentSort = useCallback(() => {
    if (multiSort && multiSortConfigs.length > 0) {
      return multiSortConfigs;
    }
    return [sortConfig];
  }, [multiSort, multiSortConfigs, sortConfig]);

  // Check if a field is currently sorted
  const isFieldSorted = useCallback(
    (field: SortableField): SortDirection | null => {
      if (multiSort) {
        const config = multiSortConfigs.find(c => c.field === field);
        return config ? config.direction : null;
      }
      return sortConfig.field === field ? sortConfig.direction : null;
    },
    [multiSort, multiSortConfigs, sortConfig]
  );

  // Get next sort direction for a field
  const getNextSortDirection = useCallback(
    (field: SortableField): SortDirection => {
      const currentDirection = isFieldSorted(field);
      if (!currentDirection) return 'asc';
      return currentDirection === 'asc' ? 'desc' : 'asc';
    },
    [isFieldSorted]
  );

  return {
    sortedData,
    sortBy,
    addSortCriteria,
    removeSortCriteria,
    clearSort,
    getCurrentSort,
    isFieldSorted,
    getNextSortDirection,
    sortConfig,
    multiSortConfigs,
  };
};
