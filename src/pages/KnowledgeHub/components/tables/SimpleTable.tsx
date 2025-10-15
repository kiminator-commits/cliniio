import React, { useState, useMemo } from 'react';
import { ContentItem, ContentStatus } from '../../types';
import { useSimplifiedKnowledgeHub } from '../../providers/SimplifiedKnowledgeHubProvider';

import { TablePagination } from './TablePagination';
import { TableRow } from './TableRow';
import {
  getProgressDisplay,
  getStartDateDisplay,
  getDueDateDisplay,
  getActionButton,
  calculatePagination,
} from './TableUtils';
import { PaginationInfo } from './types';

interface SimpleTableProps {
  items: ContentItem[];
  type: string; // "courses", "policies", "procedures", etc.
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: ContentStatus) => void;
  onStartContent?: (id: string) => void;
}

/**
 * SimpleTable Component
 *
 * Main table component that combines all modular table functionality
 * Maintains backward compatibility with the original monolithic component
 */
export const SimpleTable: React.FC<SimpleTableProps> = ({
  items,
  onDelete,
  onStartContent,
}) => {
  const { updateContentStatus, refetchContent } = useSimplifiedKnowledgeHub();

  // State management
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [startDates] = useState<Record<string, Date>>({});
  const [dueDates] = useState<Record<string, Date>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnWidths] = useState({
    content: 500,
    progress: 150,
    startDate: 140,
    assigned: 120,
    actions: 120,
  });

  // Use items directly since filtering is now handled at the parent level
  const filteredItems = items;

  // Pagination logic
  const pagination: PaginationInfo = useMemo(() => {
    return calculatePagination(filteredItems.length, currentPage, pageSize);
  }, [filteredItems.length, currentPage, pageSize]);

  // Get current page items
  const currentPageItems = useMemo(() => {
    const startIndex = pagination.startIndex;
    const endIndex = pagination.endIndex;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, pagination.startIndex, pagination.endIndex]);

  // Event handlers

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleToggleExpansion = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const _handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateContentStatus(id, newStatus);
      await refetchContent();
    } catch (err) {
      console.error('Failed to update item status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      onDelete(id);
      await refetchContent();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleStartContent = (id: string) => {
    if (onStartContent) {
      onStartContent(id);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPageItems.map((item) => {
              const progressDisplay = getProgressDisplay(item);
              const startDateDisplay = getStartDateDisplay(item.id, startDates);
              const dueDateDisplay = getDueDateDisplay(item.id, dueDates);
              const actionButton = getActionButton(item, handleStartContent);

              return (
                <TableRow
                  key={item.id}
                  item={item}
                  isExpanded={expandedRows.has(item.id)}
                  onToggleExpansion={handleToggleExpansion}
                  onDelete={handleDelete}
                  onStartContent={handleStartContent}
                  progressDisplay={progressDisplay}
                  startDateDisplay={startDateDisplay}
                  dueDateDisplay={dueDateDisplay}
                  actionButton={actionButton}
                  columnWidths={columnWidths}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <TablePagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};
