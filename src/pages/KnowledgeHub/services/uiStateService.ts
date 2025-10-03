import { ContentItem } from '../types';

export interface UIState {
  isLoading: boolean;
  error: Error | null;
  validationError: string | null;
}

export interface RenderState {
  shouldShowLoading: boolean;
  shouldShowError: boolean;
  shouldShowEmpty: boolean;
  shouldShowContent: boolean;
}

export class UIStateService {
  static determineRenderState(
    uiState: UIState,
    selectedCategory: string | null,
    categoryItems: ContentItem[]
  ): RenderState {
    const { isLoading, error } = uiState;

    return {
      shouldShowLoading: isLoading,
      shouldShowError: !!error,
      shouldShowEmpty:
        !isLoading &&
        !error &&
        (!selectedCategory || categoryItems.length === 0),
      shouldShowContent:
        !isLoading &&
        !error &&
        Boolean(selectedCategory) &&
        categoryItems.length > 0,
    };
  }

  static getTagColor(tag: string): string {
    switch (tag) {
      case 'Required':
        return 'bg-red-100 text-red-800';
      case 'Optional':
        return 'bg-blue-100 text-blue-800';
      case 'New':
        return 'bg-green-100 text-green-800';
      case 'Updated':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  static getStatusColor(status: string): string {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-100 text-gray-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  static formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} months ago`;
  }
}
