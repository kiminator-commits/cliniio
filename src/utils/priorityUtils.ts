import { mdiAlert, mdiInformation, mdiClock } from '@mdi/js';

/**
 * Shared utility function to get priority icon based on priority level
 * @param priority - The priority level ('high', 'medium', 'low')
 * @returns The corresponding Material Design Icon path
 */
export const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high':
      return mdiAlert;
    case 'medium':
      return mdiInformation;
    case 'low':
      return mdiClock;
    default:
      return mdiInformation;
  }
};

/**
 * Shared utility function to get priority color classes
 * @param priority - The priority level ('high', 'medium', 'low')
 * @returns The corresponding CSS color classes
 */
export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

/**
 * Shared utility function to get priority background color classes
 * @param priority - The priority level ('high', 'medium', 'low')
 * @returns The corresponding CSS background color classes
 */
export const getPriorityBadgeColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
