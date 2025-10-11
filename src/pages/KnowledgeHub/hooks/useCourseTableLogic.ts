import { useEffect, useMemo } from 'react';
import { ContentItem } from '../types';
import {
  CourseTableService,
  TableDataOptions,
} from '../services/courseTableService';

interface UseCourseTableLogicProps {
  items: ContentItem[];
  searchQuery: string;
  statusFilter: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  searchError: string | null;
  validationError: string | null;
  clearValidationError: () => void;
  updateContentStatus: (id: string, status: string) => Promise<boolean>;
  deleteContent: (id: string) => Promise<boolean>;
  canUpdateStatus: boolean;
  canDeleteContent: boolean;
}

export const useCourseTableLogic = ({
  items,
  searchQuery,
  statusFilter,
  sortField,
  sortDirection,
  searchError,
  validationError,
  clearValidationError,
  updateContentStatus,
  deleteContent,
  canUpdateStatus,
  canDeleteContent,
}: UseCourseTableLogicProps) => {
  // Business logic for filtering and sorting
  const filteredAndSortedItems = useMemo(() => {
    const options: TableDataOptions = {
      items,
      searchQuery,
      statusFilter,
      sortField,
      sortDirection,
      searchError,
    };
    return CourseTableService.getFilteredAndSortedItems(options);
  }, [items, searchQuery, statusFilter, sortField, sortDirection, searchError]);

  // Validation error handling
  useEffect(() => {
    if (CourseTableService.shouldClearValidationError(validationError)) {
      const timer = setTimeout(() => {
        clearValidationError();
      }, CourseTableService.getValidationErrorTimeout());
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [validationError, clearValidationError]);

  // Virtualized list data
  const listData = useMemo(
    () =>
      CourseTableService.getListData(
        filteredAndSortedItems,
        updateContentStatus,
        deleteContent,
        canUpdateStatus,
        canDeleteContent
      ),
    [
      filteredAndSortedItems,
      updateContentStatus,
      deleteContent,
      canUpdateStatus,
      canDeleteContent,
    ]
  );

  return {
    filteredAndSortedItems,
    listData,
  };
};
