import { ContentItem } from '../types';

export interface TableDataOptions {
  items: ContentItem[];
  searchQuery: string;
  statusFilter: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  searchError: string | null;
}

export interface ValidationErrorOptions {
  validationError: string | null;
  clearValidationError: () => void;
}

export class CourseTableService {
  static getFilteredAndSortedItems(options: TableDataOptions): ContentItem[] {
    const {
      items,
      searchQuery,
      statusFilter,
      sortField,
      sortDirection,
      searchError,
    } = options;

    if (searchError) {
      return [];
    }

    let filtered = [...items];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.data?.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'All') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField as keyof ContentItem];
        const bValue = b[sortField as keyof ContentItem];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
        if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }

  static shouldClearValidationError(validationError: string | null): boolean {
    return !!validationError;
  }

  static getValidationErrorTimeout(): number {
    return 5000; // 5 seconds
  }

  static getListData(
    filteredAndSortedItems: ContentItem[],
    updateContentStatus: (id: string, status: string) => Promise<boolean>,
    deleteContent: (id: string) => Promise<boolean>,
    canUpdateStatus: boolean,
    canDeleteContent: boolean
  ) {
    return {
      items: filteredAndSortedItems,
      handleStatusUpdate: updateContentStatus,
      handleDeleteContent: deleteContent,
      canUpdateStatus,
      canDeleteContent,
    };
  }
}
