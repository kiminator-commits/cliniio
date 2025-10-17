import { logger } from '../../utils/_core/logger';

export interface BatchRequest<T = unknown> {
  id: string;
  operation: () => Promise<T>;
  priority: number;
  metadata?: Record<string, unknown>;
}

export interface BatchResult<T = unknown> {
  id: string;
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
}

export interface BatchConfig {
  maxBatchSize: number;
  maxWaitTime: number; // milliseconds
  maxConcurrentBatches: number;
  priorityThreshold: number; // Only batch requests below this priority
}

export class AIRequestBatcher {
  private pendingRequests: BatchRequest[] = [];
  private activeBatches = 0;
  private config: BatchConfig;
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = {
      maxBatchSize: 10,
      maxWaitTime: 2000, // 2 seconds
      maxConcurrentBatches: 3,
      priorityThreshold: 5, // Only batch low-priority requests
      ...config,
    };
  }

  /**
   * Add a request to the batch queue
   */
  async addRequest<T>(
    operation: () => Promise<T>,
    options: {
      priority?: number;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<T> {
    const request: BatchRequest<T> = {
      id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      operation,
      priority: options.priority || 0,
      metadata: options.metadata,
    };

    // Add to pending requests
    this.pendingRequests.push(request);
    this.pendingRequests.sort((a, b) => b.priority - a.priority);

    logger.debug(
      `Added request to batch queue: ${request.id} (priority: ${request.priority})`
    );

    // Start batch timer if not already running
    if (!this.batchTimer) {
      this.startBatchTimer();
    }

    // Wait for completion
    return this.waitForCompletion(request.id);
  }

  /**
   * Start the batch processing timer
   */
  private startBatchTimer(): void {
    this.batchTimer = setTimeout(() => {
      this.processBatches();
      this.batchTimer = null;
    }, this.config.maxWaitTime);
  }

  /**
   * Process available batches
   */
  private async processBatches(): Promise<void> {
    if (this.activeBatches >= this.config.maxConcurrentBatches) {
      // Restart timer if we can't process now
      this.startBatchTimer();
      return;
    }

    // Get requests that can be batched
    const batchableRequests = this.pendingRequests.filter(
      (req) => req.priority < this.config.priorityThreshold
    );

    if (batchableRequests.length === 0) {
      return;
    }

    // Create batches
    const batches = this.createBatches(batchableRequests);

    // Process each batch
    for (const batch of batches) {
      if (this.activeBatches >= this.config.maxConcurrentBatches) {
        break;
      }

      this.processBatch(batch);
    }

    // Restart timer if there are still pending requests
    if (this.pendingRequests.length > 0) {
      this.startBatchTimer();
    }
  }

  /**
   * Create batches from requests
   */
  private createBatches(requests: BatchRequest[]): BatchRequest[][] {
    const batches: BatchRequest[][] = [];

    for (let i = 0; i < requests.length; i += this.config.maxBatchSize) {
      const batch = requests.slice(i, i + this.config.maxBatchSize);
      batches.push(batch);
    }

    return batches;
  }

  /**
   * Process a single batch
   */
  private async processBatch(batch: BatchRequest[]): Promise<void> {
    this.activeBatches++;

    try {
      logger.debug(`Processing batch of ${batch.length} requests`);

      // Remove requests from pending queue
      batch.forEach((req) => {
        const index = this.pendingRequests.findIndex((r) => r.id === req.id);
        if (index !== -1) {
          this.pendingRequests.splice(index, 1);
        }
      });

      // Execute all operations in parallel
      const startTime = Date.now();
      const promises = batch.map(async (request) => {
        const requestStart = Date.now();
        try {
          const data = await request.operation();
          const duration = Date.now() - requestStart;

          this.storeResult(request.id, {
            id: request.id,
            success: true,
            data,
            duration,
          });
        } catch (error) {
          const duration = Date.now() - requestStart;

          this.storeResult(request.id, {
            id: request.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration,
          });
        }
      });

      await Promise.all(promises);

      const totalDuration = Date.now() - startTime;
      logger.debug(`Batch completed in ${totalDuration}ms`);
    } catch (error) {
      logger.error('Batch processing failed:', error);

      // Store errors for all requests in the batch
      batch.forEach((request) => {
        this.storeResult(request.id, {
          id: request.id,
          success: false,
          error: 'Batch processing failed',
          duration: 0,
        });
      });
    } finally {
      this.activeBatches--;
    }
  }

  /**
   * Wait for a request to complete
   */
  private async waitForCompletion<T>(requestId: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const checkResult = () => {
        const result = this.getResult(requestId);
        if (result) {
          if (result.success) {
            resolve(result.data as T);
          } else {
            reject(new Error(result.error));
          }
        } else {
          // Check again in 50ms
          setTimeout(checkResult, 50);
        }
      };

      checkResult();
    });
  }

  /**
   * Store request result
   */
  private storeResult(requestId: string, result: BatchResult): void {
    (this as unknown as { results: Map<string, BatchResult> }).results =
      (this as unknown as { results: Map<string, BatchResult> }).results ||
      new Map();
    (this as unknown as { results: Map<string, BatchResult> }).results.set(
      requestId,
      result
    );
  }

  /**
   * Get request result
   */
  private getResult(requestId: string): BatchResult | null {
    (this as unknown as { results: Map<string, BatchResult> }).results =
      (this as unknown as { results: Map<string, BatchResult> }).results ||
      new Map();
    return (
      this as unknown as { results: Map<string, BatchResult> }
    ).results.get(requestId);
  }

  /**
   * Get batch statistics
   */
  getStats(): {
    pendingRequests: number;
    activeBatches: number;
    config: BatchConfig;
  } {
    return {
      pendingRequests: this.pendingRequests.length,
      activeBatches: this.activeBatches,
      config: this.config,
    };
  }

  /**
   * Update batch configuration
   */
  updateConfig(newConfig: Partial<BatchConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('AI request batcher configuration updated:', this.config);
  }

  /**
   * Clear all pending requests
   */
  clearPending(): void {
    this.pendingRequests = [];
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    logger.info('AI request batcher cleared');
  }

  /**
   * Force process all pending requests
   */
  async forceProcess(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    await this.processBatches();
  }
}

// Singleton instance
export const aiRequestBatcher = new AIRequestBatcher();
