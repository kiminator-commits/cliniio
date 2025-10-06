import { InventoryResponse } from './InventoryServiceFacade';

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'item' | 'category';
  _data: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: number | null;
  pendingOperations: number;
  syncInProgress: boolean;
  error: string | null;
}

export interface InventorySyncService {
  // Core sync operations
  sync(): Promise<void>;
  queueOperation(
    operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>
  ): void;
  processPendingOperations(): Promise<void>;

  // Status and monitoring
  getSyncStatus(): SyncStatus;
  isOnline(): boolean;
  setOnlineStatus(isOnline: boolean): void;

  // Data synchronization
  syncInventoryData(data: InventoryResponse): Promise<void>;
  syncInventoryItem(item: unknown): Promise<void>;
  syncCategory(category: string): Promise<void>;

  // Conflict resolution
  resolveConflicts(localData: unknown, remoteData: unknown): unknown;
  mergeData(localData: unknown[], remoteData: unknown[]): unknown[];

  // Cleanup
  clearPendingOperations(): void;
  getPendingOperations(): SyncOperation[];
}

export class InventorySyncServiceImpl implements InventorySyncService {
  private pendingOperations: SyncOperation[] = [];
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    lastSyncTime: null,
    pendingOperations: 0,
    syncInProgress: false,
    error: null,
  };

  constructor() {
    this.setupOnlineStatusListeners();
  }

  async sync(): Promise<void> {
    if (!this.isOnline() || this.syncStatus.syncInProgress) {
      return;
    }

    this.syncStatus.syncInProgress = true;

    try {
      await this.processPendingOperations();
      this.syncStatus.lastSyncTime = Date.now();
    } catch (err) {
      console.error(err);
      this.syncStatus.error = 'Sync failed';
      throw new Error('Sync failed');
    } finally {
      this.syncStatus.syncInProgress = false;
    }
  }

  queueOperation(
    operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>
  ): void {
    const syncOperation: SyncOperation = {
      ...operation,
      id: this.generateOperationId(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.pendingOperations.push(syncOperation);
    this.updatePendingOperationsCount();
  }

  async processPendingOperations(): Promise<void> {
    const operationsToProcess = [...this.pendingOperations];

    // Process operations concurrently for better performance
    const operationPromises = operationsToProcess.map(async (operation) => {
      try {
        await this.processOperation(operation);
        this.removeOperation(operation.id);
        return { success: true, operationId: operation.id };
      } catch (error) {
        operation.retryCount++;
        if (operation.retryCount >= operation.maxRetries) {
          this.removeOperation(operation.id);
          console.error(
            `Operation failed after ${operation.maxRetries} retries:`,
            operation
          );
        }
        return { success: false, operationId: operation.id, error };
      }
    });

    const results = await Promise.allSettled(operationPromises);

    // Log any failures for debugging
    const failures = results
      .map((result, index) =>
        result.status === 'rejected' ? operationsToProcess[index]?.id : null
      )
      .filter(Boolean);

    if (failures.length > 0) {
      console.warn(
        `Sync: ${failures.length} operations failed to process:`,
        failures
      );
    }
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  isOnline(): boolean {
    return this.syncStatus.isOnline;
  }

  setOnlineStatus(isOnline: boolean): void {
    this.syncStatus.isOnline = isOnline;
    if (isOnline && this.pendingOperations.length > 0) {
      this.sync().catch(console.error);
    }
  }

  async syncInventoryData(_data: InventoryResponse): Promise<void> {
    // Implementation would depend on the backend API
    // For now, just simulate sync
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  async syncInventoryItem(_item: unknown): Promise<void> {
    // Implementation would depend on the backend API
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  async syncCategory(_category: string): Promise<void> {
    // Implementation would depend on the backend API
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  resolveConflicts(localData: unknown, remoteData: unknown): unknown {
    // Simple conflict resolution: prefer remote data if it's newer
    const local = localData as { updatedAt?: number };
    const remote = remoteData as { updatedAt?: number };

    if (remote.updatedAt && local.updatedAt) {
      return remote.updatedAt > local.updatedAt ? remoteData : localData;
    }
    return remoteData;
  }

  mergeData(localData: unknown[], remoteData: unknown[]): unknown[] {
    const merged = new Map();

    // Add local data
    localData.forEach((item) => {
      const itemWithId = item as { id: string };
      merged.set(itemWithId.id, item);
    });

    // Merge with remote data, resolving conflicts
    remoteData.forEach((item) => {
      const itemWithId = item as { id: string };
      const existing = merged.get(itemWithId.id);
      if (existing) {
        merged.set(itemWithId.id, this.resolveConflicts(existing, item));
      } else {
        merged.set(itemWithId.id, item);
      }
    });

    return Array.from(merged.values());
  }

  clearPendingOperations(): void {
    this.pendingOperations = [];
    this.updatePendingOperationsCount();
  }

  getPendingOperations(): SyncOperation[] {
    return [...this.pendingOperations];
  }

  private async processOperation(operation: SyncOperation): Promise<void> {
    switch (operation.type) {
      case 'create':
        if (operation.entity === 'item') {
          await this.syncInventoryItem(operation._data);
        } else if (operation.entity === 'category') {
          await this.syncCategory(operation._data as string);
        }
        break;
      case 'update':
        if (operation.entity === 'item') {
          await this.syncInventoryItem(operation._data);
        }
        break;
      case 'delete':
        // Handle delete operations
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  private removeOperation(operationId: string): void {
    this.pendingOperations = this.pendingOperations.filter(
      (op) => op.id !== operationId
    );
    this.updatePendingOperationsCount();
  }

  private updatePendingOperationsCount(): void {
    this.syncStatus.pendingOperations = this.pendingOperations.length;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupOnlineStatusListeners(): void {
    window.addEventListener('online', () => this.setOnlineStatus(true));
    window.addEventListener('offline', () => this.setOnlineStatus(false));
  }
}
