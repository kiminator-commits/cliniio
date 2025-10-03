import { RoomStatusType } from '../models';

export const getStatusColor = (status: RoomStatusType): string => {
  switch (status) {
    case 'clean':
      return 'bg-green-500';
    case 'dirty':
      return 'bg-red-500';
    case 'in_progress':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

export const getStatusIcon = (status: RoomStatusType): string => {
  switch (status) {
    case 'clean':
      return '✓';
    case 'dirty':
      return '⚠';
    case 'in_progress':
      return '⟳';
    default:
      return '?';
  }
};
