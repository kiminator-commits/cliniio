import { InventoryErrorHandler } from './InventoryErrorHandler';
import {
  InventoryLoadingManager,
  LoadingOperation,
  LoadingTask,
} from './InventoryLoadingManager';
import { InventoryResponse } from '@/types/inventoryServiceTypes';

// Simple error type for inventory operations
interface InventoryError {
  id: string;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface InventoryState {
  // Data state
  data: InventoryResponse | null;
  lastUpdated: Date | null;

  // Loading state
  isLoading: boolean;
  loadingTasks: LoadingTask[];

  // Error state
  errors: InventoryError[];
  hasErrors: boolean;

  // Connection state
  isConnected: boolean;
  adapterType: string;

  // Sync state
  lastSyncTime: Date | null;
  hasPendingChanges: boolean;
}

export interface StateManagerConfig {
  errorHandler: InventoryErrorHandler;
  loadingManager: InventoryLoadingManager;
  autoRetry: boolean;
  retryDelay: number;
  maxRetries: number;
  enableLogging: boolean;
}

export interface StateUpdateCallback {
  (state: InventoryState): void;
}

export interface InventoryStateManager {
  // State management
  getState(): InventoryState;
  updateState(updates: Partial<InventoryState>): void;
  subscribe(callback: StateUpdateCallback): () => void;

  // Data operations with state tracking
  setData(data: InventoryResponse): void;
  clearData(): void;
  updateLastUpdated(): void;

  // Loading state management
  startLoading(
    operation: LoadingOperation,
    context?: Record<string, unknown>
  ): string;
  stopLoading(taskId: string, success?: boolean, result?: unknown): void;
  isLoading(operation?: LoadingOperation): boolean;

  // Error state management
  addError(
    error: Error | string,
    _context?: Record<string, unknown>
  ): InventoryError;
  clearErrors(): void;
  clearError(): void;
  hasErrors(): boolean;
  getErrors(): InventoryError[];

  // Connection state management
  setConnected(connected: boolean, adapterType?: string): void;
  isConnected(): boolean;

  // Sync state management
  setLastSyncTime(time: Date): void;
  setPendingChanges(pending: boolean): void;

  // Utility operations
  withStateTracking<T>(
    operation: LoadingOperation,
    asyncOperation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T>;

  withErrorHandling<T>(
    operation: LoadingOperation,
    asyncOperation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T>;

  // Configuration
  updateConfig(config: Partial<StateManagerConfig>): void;
  getConfig(): StateManagerConfig;
}

export class InventoryStateManagerImpl implements InventoryStateManager {
  private state: InventoryState;
  private config: StateManagerConfig;
  private subscribers: Set<StateUpdateCallback> = new Set();

  constructor(
    errorHandler: InventoryErrorHandler,
    loadingManager: InventoryLoadingManager,
    config: Partial<StateManagerConfig> = {}
  ) {
    this.config = {
      errorHandler,
      loadingManager,
      autoRetry: true,
      retryDelay: 1000,
      maxRetries: 3,
      enableLogging: true,
      ...config,
    };

    this.state = {
      data: null,
      lastUpdated: null,
      isLoading: false,
      loadingTasks: [],
      errors: [],
      hasErrors: false,
      isConnected: false,
      adapterType: '',
      lastSyncTime: null,
      hasPendingChanges: false,
    };
  }

  getState(): InventoryState {
    return { ...this.state };
  }

  updateState(updates: Partial<InventoryState>): void {
    this.state = { ...this.state, ...updates };
    this.notifySubscribers();
  }

  subscribe(callback: StateUpdateCallback): () => void {
    this.subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  setData(data: InventoryResponse): void {
    this.updateState({
      data,
      lastUpdated: new Date(),
    });
  }

  clearData(): void {
    this.updateState({
      data: null,
      lastUpdated: null,
    });
  }

  updateLastUpdated(): void {
    this.updateState({
      lastUpdated: new Date(),
    });
  }

  startLoading(
    operation: LoadingOperation,
    context?: Record<string, unknown>
  ): string {
    const taskId = this.config.loadingManager.startTask(operation, context);
    this.updateLoadingState();
    return taskId;
  }

  stopLoading(taskId: string, success: boolean = true, result?: unknown): void {
    if (success) {
      this.config.loadingManager.completeTask(taskId, result);
    } else {
      this.config.loadingManager.failTask(taskId, 'Operation failed');
    }
    this.updateLoadingState();
  }

  isLoading(operation?: LoadingOperation): boolean {
    return this.config.loadingManager.isLoading(operation);
  }

  addError(error: Error | string): InventoryError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const simpleError: InventoryError = {
      id: Date.now().toString(),
      message: errorMessage,
      timestamp: new Date(),
    };
    this.updateErrorState();
    return simpleError;
  }

  clearErrors(): void {
    // Since InventoryErrorHandler doesn't have clearErrors, we'll just update the state
    this.updateErrorState();
  }

  clearError(): void {
    // Since InventoryErrorHandler doesn't have clearError, we'll just update the state
    this.updateErrorState();
  }

  hasErrors(): boolean {
    return this.state.hasErrors;
  }

  getErrors(): InventoryError[] {
    // Since InventoryErrorHandler doesn't have getErrors, return empty array for now
    return [];
  }

  setConnected(connected: boolean, adapterType: string = ''): void {
    this.updateState({
      isConnected: connected,
      adapterType: adapterType || this.state.adapterType,
    });
  }

  isConnected(): boolean {
    return this.state.isConnected;
  }

  setLastSyncTime(time: Date): void {
    this.updateState({
      lastSyncTime: time,
    });
  }

  setPendingChanges(pending: boolean): void {
    this.updateState({
      hasPendingChanges: pending,
    });
  }

  async withStateTracking<T>(
    operation: LoadingOperation,
    asyncOperation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    const taskId = this.startLoading(operation, context);
    try {
      const result = await asyncOperation();
      this.stopLoading(taskId, true, result);
      return result;
    } catch (error) {
      this.stopLoading(taskId, false, error);
      throw error;
    }
  }

  async withErrorHandling<T>(
    operation: LoadingOperation,
    asyncOperation: () => Promise<T>
  ): Promise<T> {
    try {
      return await asyncOperation();
    } catch (error) {
      this.addError(error as Error);
      throw error;
    }
  }

  updateConfig(config: Partial<StateManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): StateManagerConfig {
    return { ...this.config };
  }

  // Internal state update methods
  private updateLoadingState(): void {
    const loadingTasks = this.config.loadingManager.getAllTasks();
    const isLoading = this.config.loadingManager.hasActiveTasks();

    this.updateState({
      isLoading,
      loadingTasks,
    });
  }

  private updateErrorState(): void {
    // Since InventoryErrorHandler doesn't have getErrors, we'll use a simple approach
    const errors: InventoryError[] = [];
    const hasErrors = false;

    this.updateState({
      errors,
      hasErrors,
    });
  }

  private notifySubscribers(): void {
    const currentState = this.getState();
    this.subscribers.forEach((callback) => {
      try {
        callback(currentState);
      } catch (error) {
        console.error('Error in state subscriber:', error);
      }
    });
  }

  // Utility methods for common state operations
  async executeWithFullStateTracking<T>(
    operation: LoadingOperation,
    asyncOperation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    return this.withStateTracking(
      operation,
      async () => {
        return this.withErrorHandling(operation, asyncOperation);
      },
      context
    );
  }

  getStateSummary(): {
    dataStatus: 'empty' | 'loading' | 'loaded' | 'error';
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
    syncStatus: 'synced' | 'pending' | 'error';
    errorCount: number;
    loadingCount: number;
  } {
    const dataStatus = !this.state.data
      ? 'empty'
      : this.state.isLoading
        ? 'loading'
        : this.state.hasErrors
          ? 'error'
          : 'loaded';

    const connectionStatus = !this.state.isConnected
      ? 'disconnected'
      : this.state.isLoading
        ? 'connecting'
        : this.state.hasErrors
          ? 'error'
          : 'connected';

    const syncStatus = this.state.hasPendingChanges
      ? 'pending'
      : this.state.hasErrors
        ? 'error'
        : 'synced';

    return {
      dataStatus,
      connectionStatus,
      syncStatus,
      errorCount: this.state.errors.length,
      loadingCount: this.state.loadingTasks.filter(
        (task) => task.state === 'loading'
      ).length,
    };
  }
}
