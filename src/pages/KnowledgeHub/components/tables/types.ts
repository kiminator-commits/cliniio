import { ContentItem, ContentStatus } from '../../types';

// Table props interface
export interface SimpleTableProps {
  items: ContentItem[];
  type: string; // "courses", "policies", "procedures", etc.
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: ContentStatus) => void;
  onStartContent?: (id: string) => void;
}

// Table state interface
export interface TableState {
  searchQuery: string;
  debouncedSearchQuery: string;
  statusFilter: string;
  hideCompleted: boolean;
  expandedRows: Set<string>;
  startDates: Record<string, Date>;
  contentStatuses: Record<string, string>;
  dueDates: Record<string, Date>;
  currentPage: number;
  pageSize: number;
  columnWidths: {
    content: number;
    progress: number;
    status: number;
    startDate: number;
  };
}

// Pagination interface
export interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  currentPage: number;
  pageSize: number;
}

// Column resize interface
export interface ColumnResizeState {
  isResizing: boolean;
  resizingColumn: string | null;
  startX: number;
  startWidth: number;
}

// Progress display interface
export interface ProgressDisplay {
  percentage: number;
  color: string;
  text: string;
}

// Date display interface
export interface DateDisplay {
  text: string;
  color: string;
  isOverdue: boolean;
}

// Action button interface
export interface ActionButton {
  text: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
  variant: 'primary' | 'secondary' | 'danger';
}
