import { Task } from '../store/homeStore';

/**
 * Filters tasks by category and type
 */
export const filterTasksByCategoryAndType = (
  tasks: Task[],
  selectedCategory: string,
  selectedType: string
): Task[] => {
  if (!tasks || tasks.length === 0) return [];

  let filtered = tasks;

  // Filter by category
  if (selectedCategory) {
    filtered = filtered.filter((task) => task.category === selectedCategory);
  }

  // Filter by type
  if (selectedType) {
    filtered = filtered.filter((task) => task.type === selectedType);
  }

  return filtered;
};

/**
 * Checks if a user can complete a specific task
 * Placeholder for future role-based permission implementation
 */
export const canCompleteTask = (task: Task): boolean => {
  // Currently allowing all tasks to be completed
  // Example: return hasPermissionForTask(userRole, task) && !task.completed;
  return !task.completed;
};

/**
 * Validates if available points should be initialized with default value
 * Returns true if points are 0, undefined, or invalid
 */
export const shouldInitializeAvailablePoints = (
  storeAvailablePoints: number
): boolean => {
  return (
    storeAvailablePoints === 0 ||
    storeAvailablePoints === undefined ||
    storeAvailablePoints === null ||
    isNaN(storeAvailablePoints) ||
    typeof storeAvailablePoints !== 'number'
  );
};

/**
 * Checks if tasks array is empty or undefined
 */
export const isTasksEmpty = (tasks: Task[] | undefined | null): boolean => {
  return !tasks || tasks.length === 0;
};
