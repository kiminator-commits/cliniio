import {
  mdiVideo,
  mdiFileDocument,
  mdiBookOpen,
  mdiClipboardText,
} from '@mdi/js';

export class ContentBuilderUIProvider {
  /**
   * Get lesson type icon
   */
  getLessonTypeIcon(type: string): string {
    switch (type) {
      case 'video':
        return mdiVideo;
      case 'text':
        return mdiFileDocument;
      case 'interactive':
        return mdiBookOpen;
      case 'assessment':
        return mdiClipboardText;
      case 'resource':
        return mdiFileDocument;
      case 'quiz':
        return mdiClipboardText;
      default:
        return mdiFileDocument;
    }
  }

  /**
   * Get lesson type color classes
   */
  getLessonTypeColor(type: string): string {
    switch (type) {
      case 'video':
        return 'text-blue-600 bg-blue-50';
      case 'text':
        return 'text-green-600 bg-green-50';
      case 'interactive':
        return 'text-purple-600 bg-purple-50';
      case 'assessment':
        return 'text-orange-600 bg-orange-50';
      case 'resource':
        return 'text-gray-600 bg-gray-50';
      case 'quiz':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  /**
   * Get lesson type display name
   */
  getLessonTypeDisplayName(type: string): string {
    switch (type) {
      case 'video':
        return 'Video Lesson';
      case 'text':
        return 'Text Lesson';
      case 'interactive':
        return 'Interactive Lesson';
      case 'assessment':
        return 'Assessment';
      case 'resource':
        return 'Resource';
      case 'quiz':
        return 'Quiz';
      default:
        return 'Lesson';
    }
  }

  /**
   * Get lesson type description
   */
  getLessonTypeDescription(type: string): string {
    switch (type) {
      case 'video':
        return 'Video-based learning content';
      case 'text':
        return 'Text-based learning content';
      case 'interactive':
        return 'Interactive learning activities';
      case 'assessment':
        return 'Knowledge assessment';
      case 'resource':
        return 'Additional learning resources';
      case 'quiz':
        return 'Quick knowledge check';
      default:
        return 'Learning content';
    }
  }

  /**
   * Get progress bar color based on percentage
   */
  getProgressBarColor(percentage: number): string {
    if (percentage >= 90) return 'bg-green-600';
    if (percentage >= 70) return 'bg-blue-600';
    if (percentage >= 50) return 'bg-yellow-600';
    if (percentage >= 30) return 'bg-orange-600';
    return 'bg-red-600';
  }

  /**
   * Get progress text color based on percentage
   */
  getProgressTextColor(percentage: number): string {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    if (percentage >= 30) return 'text-orange-600';
    return 'text-red-600';
  }

  /**
   * Get status badge color based on completion status
   */
  getStatusBadgeColor(
    isComplete: boolean,
    isInProgress: boolean = false
  ): string {
    if (isComplete) return 'bg-green-100 text-green-800';
    if (isInProgress) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  }

  /**
   * Get status badge text
   */
  getStatusBadgeText(
    isComplete: boolean,
    isInProgress: boolean = false
  ): string {
    if (isComplete) return 'Complete';
    if (isInProgress) return 'In Progress';
    return 'Not Started';
  }

  /**
   * Get priority badge color
   */
  getPriorityBadgeColor(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get priority badge text
   */
  getPriorityBadgeText(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return 'Priority';
    }
  }

  /**
   * Get empty state configuration
   */
  getEmptyStateConfig(type: 'modules' | 'lessons' | 'assessments'): {
    icon: string;
    title: string;
    description: string;
    buttonText: string;
    buttonColor: string;
  } {
    switch (type) {
      case 'modules':
        return {
          icon: '📚',
          title: 'No modules yet',
          description: 'Start building your course by adding the first module',
          buttonText: 'Create First Module',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
        };
      case 'lessons':
        return {
          icon: '📖',
          title: 'No lessons yet',
          description: 'Add lessons to your module to create learning content',
          buttonText: 'Add Lesson',
          buttonColor: 'bg-green-600 hover:bg-green-700',
        };
      case 'assessments':
        return {
          icon: '📝',
          title: 'No assessments yet',
          description: 'Add quizzes and assessments to test learner knowledge',
          buttonText: 'Create First Assessment',
          buttonColor: 'bg-purple-600 hover:bg-purple-700',
        };
      default:
        return {
          icon: '📄',
          title: 'No content yet',
          description: 'Start adding content to build your course',
          buttonText: 'Add Content',
          buttonColor: 'bg-gray-600 hover:bg-gray-700',
        };
    }
  }

  /**
   * Get form field validation classes
   */
  getFormFieldClasses(isValid: boolean, hasError: boolean = false): string {
    if (hasError) {
      return 'border-red-300 focus:ring-red-500 focus:border-red-500';
    }
    if (isValid) {
      return 'border-green-300 focus:ring-green-500 focus:border-green-500';
    }
    return 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  }

  /**
   * Get button classes based on variant
   */
  getButtonClasses(
    variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning',
    size: 'sm' | 'md' | 'lg' = 'md'
  ): string {
    const baseClasses =
      'inline-flex items-center gap-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      success:
        'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      warning:
        'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
  }

  /**
   * Get card classes based on state
   */
  getCardClasses(
    state: 'default' | 'hover' | 'selected' | 'disabled' = 'default'
  ): string {
    const baseClasses = 'bg-white border border-gray-200 rounded-lg';

    switch (state) {
      case 'hover':
        return `${baseClasses} hover:border-gray-300 hover:shadow-md transition-all duration-200`;
      case 'selected':
        return `${baseClasses} border-blue-500 bg-blue-50 shadow-md`;
      case 'disabled':
        return `${baseClasses} opacity-50 cursor-not-allowed`;
      default:
        return baseClasses;
    }
  }

  /**
   * Get input classes based on state
   */
  getInputClasses(
    state: 'default' | 'error' | 'success' | 'disabled' = 'default'
  ): string {
    const baseClasses =
      'w-full px-3 py-2 border rounded-md focus:outline-none transition-colors';

    switch (state) {
      case 'error':
        return `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500`;
      case 'success':
        return `${baseClasses} border-green-300 focus:ring-green-500 focus:border-green-500`;
      case 'disabled':
        return `${baseClasses} border-gray-200 bg-gray-50 cursor-not-allowed`;
      default:
        return `${baseClasses} border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
    }
  }

  /**
   * Get textarea classes based on state
   */
  getTextareaClasses(
    state: 'default' | 'error' | 'success' | 'disabled' = 'default'
  ): string {
    const baseClasses =
      'w-full px-3 py-2 border rounded-md focus:outline-none transition-colors resize-none';

    switch (state) {
      case 'error':
        return `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500`;
      case 'success':
        return `${baseClasses} border-green-300 focus:ring-green-500 focus:border-green-500`;
      case 'disabled':
        return `${baseClasses} border-gray-200 bg-gray-50 cursor-not-allowed`;
      default:
        return `${baseClasses} border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
    }
  }

  /**
   * Get loading spinner classes
   */
  getLoadingSpinnerClasses(size: 'sm' | 'md' | 'lg' = 'md'): string {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };

    return `animate-spin ${sizeClasses[size]} text-blue-600`;
  }

  /**
   * Get tooltip classes
   */
  getTooltipClasses(
    position: 'top' | 'bottom' | 'left' | 'right' = 'top'
  ): string {
    const baseClasses =
      'absolute z-10 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg';

    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-1`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-1`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-1`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-1`;
      default:
        return baseClasses;
    }
  }

  /**
   * Get notification classes based on type
   */
  getNotificationClasses(
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ): string {
    const baseClasses = 'p-4 rounded-md border';

    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-200 text-green-800`;
      case 'error':
        return `${baseClasses} bg-red-50 border-red-200 text-red-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case 'info':
        return `${baseClasses} bg-blue-50 border-blue-200 text-blue-800`;
      default:
        return baseClasses;
    }
  }

  /**
   * Get drag handle classes
   */
  getDragHandleClasses(isDragging: boolean = false): string {
    const baseClasses =
      'cursor-move text-gray-400 hover:text-gray-600 transition-colors';
    return isDragging ? `${baseClasses} text-blue-600` : baseClasses;
  }

  /**
   * Get expand/collapse button classes
   */
  getExpandCollapseClasses(_isExpanded: boolean): string {
    const baseClasses =
      'inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-gray-200 hover:border-gray-300';
    return baseClasses;
  }

  /**
   * Get delete button classes
   */
  getDeleteButtonClasses(): string {
    return 'p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors';
  }

  /**
   * Get add button classes
   */
  getAddButtonClasses(color: 'blue' | 'green' | 'purple' = 'blue'): string {
    const colorClasses = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      green: 'bg-green-600 hover:bg-green-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
    };

    return `inline-flex items-center gap-2 px-4 py-2 text-white rounded-md transition-colors ${colorClasses[color]}`;
  }

  /**
   * Get progress bar classes
   */
  getProgressBarClasses(): string {
    return 'w-full bg-gray-200 rounded-full h-2';
  }

  /**
   * Get progress fill classes
   */
  getProgressFillClasses(
    color: 'blue' | 'green' | 'purple' | 'orange' = 'blue'
  ): string {
    const colorClasses = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      purple: 'bg-purple-600',
      orange: 'bg-orange-600',
    };

    return `h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`;
  }

  /**
   * Get summary card classes
   */
  getSummaryCardClasses(
    color: 'blue' | 'green' | 'purple' | 'orange' = 'blue'
  ): string {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600',
    };

    return `text-center p-4 rounded-lg ${colorClasses[color]}`;
  }
}
