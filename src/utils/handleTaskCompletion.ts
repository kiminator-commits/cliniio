import { useRef, useEffect } from 'react';

// Custom hook to manage in-progress tasks with useRef to avoid memory leaks
export const useTaskCompletion = () => {
  const inProgressTasksRef = useRef<Set<string>>(new Set());

  // Cleanup inProgressTasksRef when component unmounts to prevent memory leaks
  useEffect(() => {
    const currentRef = inProgressTasksRef.current;
    return () => {
      currentRef.clear();
    };
  }, []);

  const handleTaskCompletion = (
    taskId: string,
    options?: { silent?: boolean }
  ) => {
    // Check if task is already in progress
    if (inProgressTasksRef.current.has(taskId)) {
      console.warn('Task already in progress:', taskId);
      return;
    }

    // Add task to in-progress set
    inProgressTasksRef.current.add(taskId);

    try {
      // Task ID validation (must be non-empty string and match safe alphanumeric pattern)
      if (!taskId || !/^[a-zA-Z0-9_-]+$/.test(taskId)) {
        console.warn('Invalid task ID:', taskId);
        return;
      }

      // Logging via console.info
      console.info(`Task completed: ${taskId}`);

      // Conditional toast or alert if silent is false or undefined
      if (options?.silent !== true) {
        // Placeholder for toast/alert implementation
        // This could be replaced with actual toast library or alert
        console.log(`Task ${taskId} completed successfully!`);
      }

      // Log success confirmation
      console.info(`Task ${taskId} completed successfully`);
    } catch (error) {
      // Log the error
      console.error('Error completing task:', error);

      // Show fallback UI alert
      alert('Failed to complete task. Please try again.');
    } finally {
      // Remove task from in-progress set
      inProgressTasksRef.current.delete(taskId);
    }
  };

  return { handleTaskCompletion };
};

// Legacy export for backward compatibility (deprecated - use useTaskCompletion hook instead)
const inProgressTasks = new Set<string>();

export const handleTaskCompletion = (
  taskId: string,
  options?: { silent?: boolean }
) => {
  // Check if task is already in progress
  if (inProgressTasks.has(taskId)) {
    console.warn('Task already in progress:', taskId);
    return;
  }

  // Add task to in-progress set
  inProgressTasks.add(taskId);

  try {
    // Task ID validation (must be non-empty string and match safe alphanumeric pattern)
    if (!taskId || !/^[a-zA-Z0-9_-]+$/.test(taskId)) {
      console.warn('Invalid task ID:', taskId);
      return;
    }

    // Logging via console.info
    console.info(`Task completed: ${taskId}`);

    // Conditional toast or alert if silent is false or undefined
    if (options?.silent !== true) {
      // Placeholder for toast/alert implementation
      // This could be replaced with actual toast library or alert
      console.log(`Task ${taskId} completed successfully!`);
    }

    // Log success confirmation
    console.info(`Task ${taskId} completed successfully`);
  } catch (error) {
    // Log the error
    console.error('Error completing task:', error);

    // Show fallback UI alert
    alert('Failed to complete task. Please try again.');
  } finally {
    // Remove task from in-progress set
    inProgressTasks.delete(taskId);
  }
};
