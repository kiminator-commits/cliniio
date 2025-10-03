export type LoadingState = 'idle' | 'loading' | 'success' | 'error' | 'partial';

export type LoadingOperation =
  | 'fetch_data'
  | 'add_item'
  | 'update_item'
  | 'delete_item'
  | 'add_category'
  | 'delete_category'
  | 'sync'
  | 'filter'
  | 'sort'
  | 'export'
  | 'import';

export interface LoadingTask {
  id: string;
  operation: LoadingOperation;
  state: LoadingState;
  startTime: Date;
  endTime?: Date;
  progress?: number;
  message?: string;
  error?: string;
  context?: Record<string, unknown>;
}

export interface LoadingManagerConfig {
  showProgress: boolean;
  timeout: number;
  maxConcurrentTasks: number;
  enableTaskQueue: boolean;
  autoCleanup: boolean;
  cleanupInterval: number;
}

export interface LoadingSummary {
  total: number;
  active: number;
  completed: number;
  failed: number;
  byOperation: Record<LoadingOperation, number>;
  averageDuration: number;
}

export interface InventoryLoadingManager {
  // Core loading management
  startTask(
    operation: LoadingOperation,
    context?: Record<string, unknown>
  ): string;
  updateTask(taskId: string, updates: Partial<LoadingTask>): void;
  completeTask(taskId: string, result?: unknown): void;
  failTask(taskId: string, error: string): void;
  cancelTask(taskId: string): void;

  // Task monitoring
  getTask(taskId: string): LoadingTask | null;
  getActiveTasks(): LoadingTask[];
  getCompletedTasks(): LoadingTask[];
  getFailedTasks(): LoadingTask[];
  getAllTasks(): LoadingTask[];

  // State queries
  isLoading(operation?: LoadingOperation): boolean;
  hasActiveTasks(): boolean;
  getLoadingSummary(): LoadingSummary;

  // Progress tracking
  updateProgress(taskId: string, progress: number, message?: string): void;
  getProgress(taskId: string): number;

  // Task management
  clearCompletedTasks(): void;
  clearAllTasks(): void;
  retryTask(taskId: string): string;

  // Configuration
  updateConfig(config: Partial<LoadingManagerConfig>): void;
  getConfig(): LoadingManagerConfig;
}

export class InventoryLoadingManagerImpl implements InventoryLoadingManager {
  private tasks: Map<string, LoadingTask> = new Map();
  private config: LoadingManagerConfig;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: Partial<LoadingManagerConfig> = {}) {
    this.config = {
      showProgress: true,
      timeout: 30000, // 30 seconds
      maxConcurrentTasks: 5,
      enableTaskQueue: true,
      autoCleanup: true,
      cleanupInterval: 60000, // 1 minute
      ...config,
    };

    if (this.config.autoCleanup) {
      this.startCleanupInterval();
    }
  }

  startTask(
    operation: LoadingOperation,
    context?: Record<string, unknown>
  ): string {
    const taskId = this.generateTaskId();

    const task: LoadingTask = {
      id: taskId,
      operation,
      state: 'loading',
      startTime: new Date(),
      progress: 0,
      context,
    };

    this.tasks.set(taskId, task);

    // Set timeout for the task
    setTimeout(() => {
      const currentTask = this.tasks.get(taskId);
      if (currentTask && currentTask.state === 'loading') {
        this.failTask(taskId, 'Operation timed out');
      }
    }, this.config.timeout);

    return taskId;
  }

  updateTask(taskId: string, updates: Partial<LoadingTask>): void {
    const task = this.tasks.get(taskId);
    if (task) {
      Object.assign(task, updates);
      this.tasks.set(taskId, task);
    }
  }

  completeTask(taskId: string, result?: unknown): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.state = 'success';
      task.endTime = new Date();
      task.progress = 100;
      task.context = { ...task.context, result };
      this.tasks.set(taskId, task);
    }
  }

  failTask(taskId: string, error: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.state = 'error';
      task.endTime = new Date();
      task.error = error;
      this.tasks.set(taskId, task);
    }
  }

  cancelTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && task.state === 'loading') {
      task.state = 'idle';
      task.endTime = new Date();
      task.message = 'Task cancelled';
      this.tasks.set(taskId, task);
    }
  }

  getTask(taskId: string): LoadingTask | null {
    return this.tasks.get(taskId) || null;
  }

  getActiveTasks(): LoadingTask[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.state === 'loading'
    );
  }

  getCompletedTasks(): LoadingTask[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.state === 'success'
    );
  }

  getFailedTasks(): LoadingTask[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.state === 'error'
    );
  }

  getAllTasks(): LoadingTask[] {
    return Array.from(this.tasks.values());
  }

  isLoading(operation?: LoadingOperation): boolean {
    const activeTasks = this.getActiveTasks();
    if (operation) {
      return activeTasks.some((task) => task.operation === operation);
    }
    return activeTasks.length > 0;
  }

  hasActiveTasks(): boolean {
    return this.getActiveTasks().length > 0;
  }

  getLoadingSummary(): LoadingSummary {
    const allTasks = this.getAllTasks();
    const activeTasks = this.getActiveTasks();
    const completedTasks = this.getCompletedTasks();
    const failedTasks = this.getFailedTasks();

    const byOperation: Record<LoadingOperation, number> = {
      fetch_data: 0,
      add_item: 0,
      update_item: 0,
      delete_item: 0,
      add_category: 0,
      delete_category: 0,
      sync: 0,
      filter: 0,
      sort: 0,
      export: 0,
      import: 0,
    };

    allTasks.forEach((task) => {
      byOperation[task.operation]++;
    });

    const completedWithDuration = completedTasks.filter((task) => task.endTime);
    const averageDuration =
      completedWithDuration.length > 0
        ? completedWithDuration.reduce((sum, task) => {
            const duration = task.endTime!.getTime() - task.startTime.getTime();
            return sum + duration;
          }, 0) / completedWithDuration.length
        : 0;

    return {
      total: allTasks.length,
      active: activeTasks.length,
      completed: completedTasks.length,
      failed: failedTasks.length,
      byOperation,
      averageDuration,
    };
  }

  updateProgress(taskId: string, progress: number, message?: string): void {
    const task = this.tasks.get(taskId);
    if (task && task.state === 'loading') {
      task.progress = Math.max(0, Math.min(100, progress));
      if (message) {
        task.message = message;
      }
      this.tasks.set(taskId, task);
    }
  }

  getProgress(taskId: string): number {
    const task = this.tasks.get(taskId);
    return task ? task.progress || 0 : 0;
  }

  clearCompletedTasks(): void {
    const completedTaskIds = this.getCompletedTasks().map((task) => task.id);
    completedTaskIds.forEach((taskId) => {
      this.tasks.delete(taskId);
    });
  }

  clearAllTasks(): void {
    this.tasks.clear();
  }

  retryTask(taskId: string): string {
    const originalTask = this.tasks.get(taskId);
    if (!originalTask) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Create a new task with the same operation and context
    const newTaskId = this.startTask(
      originalTask.operation,
      originalTask.context
    );

    // Copy relevant information from the original task
    const newTask = this.tasks.get(newTaskId);
    if (newTask) {
      newTask.message = `Retry of task ${taskId}`;
      this.tasks.set(newTaskId, newTask);
    }

    return newTaskId;
  }

  updateConfig(config: Partial<LoadingManagerConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart cleanup interval if autoCleanup changed
    if (this.config.autoCleanup && !this.cleanupInterval) {
      this.startCleanupInterval();
    } else if (!this.config.autoCleanup && this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  getConfig(): LoadingManagerConfig {
    return { ...this.config };
  }

  // Utility methods for common operations
  async withLoading<T>(
    operation: LoadingOperation,
    asyncOperation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    const taskId = this.startTask(operation, context);
    try {
      const result = await asyncOperation();
      this.completeTask(taskId, result);
      return result;
    } catch (error) {
      this.failTask(
        taskId,
        error instanceof Error ? error.message : 'Operation failed'
      );
      throw error;
    }
  }

  async withProgress<T>(
    operation: LoadingOperation,
    asyncOperation: (
      updateProgress: (progress: number, message?: string) => void
    ) => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    const taskId = this.startTask(operation, context);

    const updateProgress = (progress: number, message?: string) => {
      this.updateProgress(taskId, progress, message);
    };

    try {
      const result = await asyncOperation(updateProgress);
      this.completeTask(taskId, result);
      return result;
    } catch (error) {
      this.failTask(
        taskId,
        error instanceof Error ? error.message : 'Operation failed'
      );
      throw error;
    }
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldTasks();
    }, this.config.cleanupInterval);
  }

  private cleanupOldTasks(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    const tasksToRemove: string[] = [];

    this.tasks.forEach((task, taskId) => {
      if (task.endTime && now.getTime() - task.endTime.getTime() > maxAge) {
        tasksToRemove.push(taskId);
      }
    });

    tasksToRemove.forEach((taskId) => {
      this.tasks.delete(taskId);
    });
  }
}
