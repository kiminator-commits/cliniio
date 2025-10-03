import { ContentItem } from '../../types';
import { ProgressDisplay, DateDisplay, ActionButton } from './types';
import { mdiPlay, mdiPause } from '@mdi/js';

/**
 * Table Utilities
 *
 * Contains helper functions for table operations including:
 * - Progress calculations
 * - Date formatting
 * - Action button generation
 * - Filtering logic
 */

/**
 * Get progress display information
 */
export const getProgressDisplay = (item: ContentItem): ProgressDisplay => {
  const percentage = getProgressPercentage(item);
  const color = getProgressColor(percentage);
  const text = `${percentage}%`;

  return {
    percentage,
    color,
    text,
  };
};

/**
 * Calculate progress percentage for an item
 */
export const getProgressPercentage = (item: ContentItem): number => {
  if (item.progress !== undefined) {
    return Math.round(item.progress);
  }

  // Fallback to status-based progress
  switch (item.status) {
    case 'draft':
      return 0;
    case 'published':
      return 25;
    case 'review':
      return 75;
    case 'archived':
      return 100;
    default:
      return 0;
  }
};

/**
 * Get progress color based on percentage
 */
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 100) {
    return 'bg-green-500';
  } else if (percentage >= 75) {
    return 'bg-blue-500';
  } else if (percentage >= 50) {
    return 'bg-yellow-500';
  } else if (percentage >= 25) {
    return 'bg-orange-500';
  } else {
    return 'bg-red-500';
  }
};

/**
 * Get start date display information
 */
export const getStartDateDisplay = (
  id: string,
  startDates: Record<string, Date>
): DateDisplay => {
  const startDate = startDates[id];

  if (!startDate) {
    return {
      text: 'Not started',
      color: 'text-gray-500',
      isOverdue: false,
    };
  }

  const now = new Date();
  const isOverdue = startDate < now;

  return {
    text: formatDate(startDate),
    color: isOverdue ? 'text-red-600' : 'text-gray-700',
    isOverdue,
  };
};

/**
 * Get due date display information
 */
export const getDueDateDisplay = (
  id: string,
  dueDates: Record<string, Date>
): DateDisplay => {
  const dueDate = dueDates[id];

  if (!dueDate) {
    return {
      text: 'No due date',
      color: 'text-gray-500',
      isOverdue: false,
    };
  }

  const now = new Date();
  const isOverdue = dueDate < now;

  return {
    text: formatDate(dueDate),
    color: isOverdue ? 'text-red-600' : 'text-gray-700',
    isOverdue,
  };
};

/**
 * Get action button configuration
 */
export const getActionButton = (
  item: ContentItem,
  onStartContent?: (id: string) => void
): ActionButton => {
  const progress = getProgressPercentage(item);

  if (progress === 100) {
    return {
      text: 'Completed',
      icon: mdiPause,
      onClick: () => {},
      disabled: true,
      variant: 'secondary',
    };
  } else if (progress > 0) {
    return {
      text: 'Resume',
      icon: mdiPlay,
      onClick: () => onStartContent?.(item.id),
      disabled: false,
      variant: 'primary',
    };
  } else {
    return {
      text: 'Start',
      icon: mdiPlay,
      onClick: () => onStartContent?.(item.id),
      disabled: false,
      variant: 'primary',
    };
  }
};

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return date < now ? 'Yesterday' : 'Tomorrow';
  } else if (diffDays < 7) {
    return `${diffDays} days ${date < now ? 'ago' : 'from now'}`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Calculate pagination information
 */
export const calculatePagination = (
  totalItems: number,
  currentPage: number,
  pageSize: number
) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    currentPage,
    pageSize,
  };
};
