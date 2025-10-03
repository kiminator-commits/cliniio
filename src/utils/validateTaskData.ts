import { Task } from '@/store/homeStore';

export const validateTaskData = (data: unknown): Task[] => {
  if (!Array.isArray(data)) return [];

  return data.filter(
    (item): item is Task =>
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.completed === 'boolean'
  );
};
