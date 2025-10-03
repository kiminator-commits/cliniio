import React from 'react';
import Icon from '@mdi/react';

type SortField = 'title' | 'status' | 'dueDate' | 'progress';

interface TableHeaderProps {
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  getSortIcon: (field: SortField) => string | null;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
  getSortIcon,
}) => {
  const createSortableHeader = (field: SortField, label: string) => (
    <div
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 flex-1"
      onClick={() => onSort(field)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSort(field);
        }
      }}
      role="columnheader"
      tabIndex={0}
      aria-sort={
        sortField === field
          ? sortDirection === 'asc'
            ? 'ascending'
            : 'descending'
          : undefined
      }
    >
      <div className="flex items-center gap-2">
        {label}
        {getSortIcon(field) && <Icon path={getSortIcon(field)!} size={0.6} />}
      </div>
    </div>
  );

  return (
    <div className="flex bg-gray-50 border-b border-gray-200">
      {createSortableHeader('title', 'Course Name')}
      {createSortableHeader('status', 'Status')}
      {createSortableHeader('dueDate', 'Due Date')}
      {createSortableHeader('progress', 'Progress')}
      <div className="w-10 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Actions
      </div>
    </div>
  );
};
