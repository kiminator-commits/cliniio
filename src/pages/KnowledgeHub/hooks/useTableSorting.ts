import { useState } from 'react';
import { mdiSortAscending, mdiSortDescending } from '@mdi/js';

type SortField = 'title' | 'status' | 'dueDate' | 'progress';
type SortDirection = 'asc' | 'desc';

export const useTableSorting = () => {
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? mdiSortAscending : mdiSortDescending;
  };

  return {
    sortField,
    sortDirection,
    handleSort,
    getSortIcon,
  };
};
