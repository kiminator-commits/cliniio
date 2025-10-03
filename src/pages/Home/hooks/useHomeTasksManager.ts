// Temporary stub for Home tasks manager hook
// This allows integration tests to run until full logic is restored

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function useHomeTasksManager() {
  return {
    tasks: [] as Task[],
    addTask: (_task: Task) => {},
    removeTask: (_id: string) => {},
    markTaskComplete: (_id: string) => {},
  };
}
