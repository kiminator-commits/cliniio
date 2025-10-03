import { Task } from '../store/homeStore';

/**
 * Type guard to check if an object is a valid Task
 */
export function isTask(obj: unknown): obj is Task {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === 'object' &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    typeof (obj as Record<string, unknown>).title === 'string' &&
    typeof (obj as Record<string, unknown>).completed === 'boolean' &&
    typeof (obj as Record<string, unknown>).type === 'string' &&
    typeof (obj as Record<string, unknown>).category === 'string' &&
    typeof (obj as Record<string, unknown>).dueDate === 'string' &&
    typeof (obj as Record<string, unknown>).status === 'string' &&
    ((obj as Record<string, unknown>).status === 'pending' ||
      (obj as Record<string, unknown>).status === 'completed')
  );
}

/**
 * Type guard to check if an array contains only valid Task objects
 */
export function isTaskArray(arr: unknown): arr is Task[] {
  return Array.isArray(arr) && arr.every(isTask);
}

/**
 * Type guard to check if an object is a valid GamificationData
 */
export function isGamificationData(obj: unknown): obj is {
  totalScore: number;
  level: number;
  totalPoints: number;
  availablePoints?: number;
  streak?: number;
  rank?: number;
  stats?: {
    toolsSterilized: number;
    inventoryChecks: number;
    perfectDays: number;
    totalTasks: number;
    completedTasks: number;
    currentStreak: number;
    bestStreak: number;
  };
} {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === 'object' &&
    typeof (obj as Record<string, unknown>).totalScore === 'number' &&
    typeof (obj as Record<string, unknown>).level === 'number' &&
    typeof (obj as Record<string, unknown>).totalPoints === 'number' &&
    ((obj as Record<string, unknown>).availablePoints === undefined ||
      typeof (obj as Record<string, unknown>).availablePoints === 'number') &&
    ((obj as Record<string, unknown>).streak === undefined ||
      typeof (obj as Record<string, unknown>).streak === 'number') &&
    ((obj as Record<string, unknown>).rank === undefined ||
      typeof (obj as Record<string, unknown>).rank === 'number')
  );
}
