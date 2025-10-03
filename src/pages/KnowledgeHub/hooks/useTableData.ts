import { useMemo } from 'react';
import { ContentItem } from '../types';

type SortField = 'title' | 'status' | 'dueDate' | 'progress';

interface UseTableDataProps {
  items: ContentItem[];
  searchQuery: string;
  statusFilter: string;
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  searchError: string | null;
}

export const useTableData = ({
  items,
  searchQuery,
  statusFilter,
  sortField,
  sortDirection,
  searchError,
}: UseTableDataProps) => {
  const filteredAndSortedItems = useMemo(() => {
    // Don't filter if there's a search error
    if (searchError) {
      return items;
    }

    const filtered = items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort items
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [items, searchQuery, statusFilter, sortField, sortDirection, searchError]);

  return {
    filteredAndSortedItems,
  };
};
