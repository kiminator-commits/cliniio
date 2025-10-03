export interface BulkProgressCallback {
  (progress: BulkProgress): void;
}

export interface BulkProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  percentage: number;
  currentBatch: number;
  totalBatches: number;
  estimatedTimeRemaining?: number;
  errors: string[];
  memoryUsage?: number;
  processingRate?: number;
  concurrentWorkers?: number;
}

export interface BulkOperationConfig {
  batchSize?: number;
  delayBetweenBatches?: number;
  maxConcurrentWorkers?: number;
  enableCaching?: boolean;
  cacheSize?: number;
  memoryLimit?: number;
  onProgress?: BulkProgressCallback;
  onError?: (error: string, itemId: string) => void;
  onSuccess?: (result: unknown, itemId: string) => void;
  onMemoryWarning?: (usage: number, limit: number) => void;
}

export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  averageProcessingTime: number;
  peakMemoryUsage: number;
  averageMemoryUsage: number;
  processingRate: number;
  cacheHitRate: number;
  concurrentWorkers: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ProgressFormatterResult {
  status: string;
  details: string;
  timeRemaining?: string;
  performance?: string;
}

export interface CacheStats {
  size: number;
  hitRate: number;
}

export interface RetryConfig {
  maxRetries?: number;
  delay?: number;
  enableRetry?: boolean;
}
