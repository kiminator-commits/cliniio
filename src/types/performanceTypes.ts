// Performance monitoring types for window services
// This file provides proper types for all performance-related window services

// ============================================================================
// PERFORMANCE METRIC TYPES
// ============================================================================

export interface PerformanceMetric {
  id: string;
  operationId: string;
  operationType:
    | 'bulk_import'
    | 'bulk_export'
    | 'bulk_update'
    | 'bulk_delete'
    | 'sync'
    | 'other';
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  itemsProcessed: number;
  totalItems: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  missRate: number;
  evictions: number;
}

export interface MemoryStats {
  current: number; // Current memory usage in bytes
  limit: number; // Memory limit in bytes
  peak: number; // Peak memory usage in bytes
  available: number; // Available memory in bytes
}

export interface ExportCacheEntry {
  id: string;
  data: unknown;
  timestamp: number;
  size: number;
  ttl: number; // Time to live in milliseconds
}

export interface BulkOperationProgress {
  operationId: string;
  operationType: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  itemsProcessed: number;
  totalItems: number;
  startTime: number;
  endTime?: number;
  error?: string;
}

// ============================================================================
// WINDOW SERVICE INTERFACES
// ============================================================================

export interface InventoryBulkProgressService {
  getAllPerformanceMetrics(): PerformanceMetric[];
  getPerformanceMetrics(operationId: string): PerformanceMetric | null;
  clearPerformanceMetrics(): void;
  getCacheStats(): CacheStats;
  addPerformanceMetric(metric: Omit<PerformanceMetric, 'id'>): string;
  updatePerformanceMetric(
    operationId: string,
    updates: Partial<PerformanceMetric>
  ): boolean;
  removePerformanceMetric(operationId: string): boolean;
  getActiveOperations(): PerformanceMetric[];
  getCompletedOperations(): PerformanceMetric[];
  getFailedOperations(): PerformanceMetric[];
}

export interface InventoryExportService {
  getCacheStats(): Omit<CacheStats, 'hitRate' | 'missRate' | 'evictions'>;
  getMemoryStats(): MemoryStats;
  getCacheEntries(): ExportCacheEntry[];
  clearCache(): void;
  getCacheEntry(id: string): ExportCacheEntry | null;
  setCacheEntry(id: string, data: unknown, ttl?: number): void;
  removeCacheEntry(id: string): boolean;
}

// ============================================================================
// PERFORMANCE MONITORING TYPES
// ============================================================================

export interface PerformanceMonitorConfig {
  maxMetrics: number;
  retentionPeriod: number; // in milliseconds
  enableMemoryTracking: boolean;
  enableCacheTracking: boolean;
  enableOperationTracking: boolean;
}

export interface PerformanceReport {
  timestamp: number;
  totalOperations: number;
  activeOperations: number;
  completedOperations: number;
  failedOperations: number;
  averageOperationTime: number;
  memoryUsage: MemoryStats;
  cacheStats: CacheStats;
  topOperations: Array<{
    operationType: string;
    count: number;
    averageDuration: number;
  }>;
}

// ============================================================================
// OPERATION TYPES
// ============================================================================

export type OperationType =
  | 'bulk_import'
  | 'bulk_export'
  | 'bulk_update'
  | 'bulk_delete'
  | 'sync'
  | 'validation'
  | 'transformation'
  | 'other';

export type OperationStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused';

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isPerformanceMetric = (obj: unknown): obj is PerformanceMetric => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'operationId' in obj &&
    'operationType' in obj &&
    'status' in obj &&
    'progress' in obj &&
    typeof (obj as Record<string, unknown>).operationId === 'string'
  );
};

export const isCacheStats = (obj: unknown): obj is CacheStats => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'size' in obj &&
    'maxSize' in obj &&
    'hitRate' in obj &&
    typeof (obj as Record<string, unknown>).size === 'number'
  );
};

export const isMemoryStats = (obj: unknown): obj is MemoryStats => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'current' in obj &&
    'limit' in obj &&
    typeof (obj as Record<string, unknown>).current === 'number'
  );
};
