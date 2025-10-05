import { aiRateLimiter } from '../rateLimiting/AIRateLimiter';
import { logger } from '../../utils/_core/logger';

export interface AIRequest<T = unknown> {
  id: string;
  service: string;
  identifier: string;
  operation: () => Promise<T>;
  priority: number; // Higher number = higher priority
  maxRetries: number;
  timeout: number;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface QueueConfig {
  maxConcurrent: number;
  batchSize: number;
  processingInterval: number;
  retryDelay: number;
}

export class AIRequestQueue {
  private queue: AIRequest[] = [];
  private processing = false;
  private activeRequests = 0;
  private config: QueueConfig;
  private processingInterval: NodeJS.Timeout | null = null;
  private results = new Map<string, unknown>();

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = {
      maxConcurrent: 5,
      batchSize: 3,
      processingInterval: 1000, // 1 second
      retryDelay: 2000, // 2 seconds
      ...config,
    };
  }

  /**
   * Add a request to the queue
   */
  async addRequest<T>(
    service: string,
    identifier: string,
    operation: () => Promise<T>,
    options: {
      priority?: number;
      maxRetries?: number;
      timeout?: number;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<T> {
    const request: AIRequest<T> = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      service,
      identifier,
      operation,
      priority: options.priority || 0,
      maxRetries: options.maxRetries || 3,
      timeout: options.timeout || 30000, // 30 seconds
      createdAt: new Date(),
      metadata: options.metadata,
    };

    // Add to queue and sort by priority
    this.queue.push(request);
    this.queue.sort((a, b) => b.priority - a.priority);

    logger.debug(
      `Added request to queue: ${request.id} (priority: ${request.priority})`
    );

    // Start processing if not already running
    if (!this.processing) {
      this.startProcessing();
    }

    // Wait for completion
    return this.waitForCompletion(request.id);
  }

  /**
   * Start processing the queue
   */
  private startProcessing(): void {
    if (this.processing) return;

    this.processing = true;
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, this.config.processingInterval);

    logger.info('AI request queue processing started');
  }

  /**
   * Stop processing the queue
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.processing = false;
    logger.info('AI request queue processing stopped');
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    if (
      this.activeRequests >= this.config.maxConcurrent ||
      this.queue.length === 0
    ) {
      return;
    }

    // Get batch of requests to process
    const batch = this.queue.splice(0, this.config.batchSize);

    // Process each request in the batch
    for (const request of batch) {
      if (this.activeRequests >= this.config.maxConcurrent) {
        // Put remaining requests back in queue
        this.queue.unshift(...batch.slice(batch.indexOf(request)));
        break;
      }

      this.processRequest(request);
    }
  }

  /**
   * Process a single request
   */
  private async processRequest<T>(request: AIRequest<T>): Promise<void> {
    this.activeRequests++;

    try {
      logger.debug(`Processing request: ${request.id}`);

      // Execute with rate limiting
      const rateLimitResult = await aiRateLimiter.checkRateLimit(
        request.identifier
      );
      if (!rateLimitResult.allowed) {
        throw new Error(
          `Rate limit exceeded. Retry after ${rateLimitResult.retryAfter}ms`
        );
      }

      const result = await request.operation();

      // Record the request after successful execution
      await aiRateLimiter.recordRequest(request.identifier);

      // Store result for waiting clients
      this.storeResult(request.id, { success: true, data: result });
    } catch (error) {
      logger.error(`Request ${request.id} failed:`, error);

      // Retry if we haven't exceeded max retries
      if (request.maxRetries > 0) {
        request.maxRetries--;
        this.queue.push(request); // Add back to queue for retry
        logger.debug(
          `Retrying request ${request.id} (${request.maxRetries} retries left)`
        );
      } else {
        // Store error for waiting clients
        this.storeResult(request.id, {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } finally {
      this.activeRequests--;
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
            resolve(result.data);
          } else {
            reject(new Error(result.error));
          }
        } else {
          // Check again in 100ms
          setTimeout(checkResult, 100);
        }
      };

      checkResult();
    });
  }

  /**
   * Store request result
   */
  private storeResult(requestId: string, result: unknown): void {
    this.results.set(requestId, result);
  }

  /**
   * Get request result
   */
  private getResult(requestId: string): unknown {
    return this.results.get(requestId);
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    queueLength: number;
    activeRequests: number;
    processing: boolean;
    config: QueueConfig;
  } {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      processing: this.processing,
      config: this.config,
    };
  }

  /**
   * Clear the queue
   */
  clearQueue(): void {
    this.queue = [];
    this.results.clear();
    logger.info('AI request queue cleared');
  }

  /**
   * Update queue configuration
   */
  updateConfig(newConfig: Partial<QueueConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('AI request queue configuration updated:', this.config);
  }
}

// Singleton instance
export const aiRequestQueue = new AIRequestQueue();
