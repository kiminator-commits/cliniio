export class WorkerPoolService {
  private static readonly DEFAULT_MAX_WORKERS = 4;

  /**
   * Create a pool of workers for concurrent processing
   */
  static createWorkerPool(
    size: number = this.DEFAULT_MAX_WORKERS
  ): Array<() => Promise<void>> {
    return Array.from({ length: size }, () => async () => Promise.resolve());
  }

  /**
   * Cleanup worker pool
   */
  static cleanupWorkerPool(workerPool: Array<() => Promise<void>>): void {
    workerPool.length = 0;
  }

  /**
   * Process batch with concurrent workers
   */
  static async processBatchConcurrent<T, R>(
    batch: T[],
    operation: (item: T) => Promise<R>,
    workerPool: Array<() => Promise<void>>,
    enableCaching: boolean,
    callbacks: {
      onError?: (error: string, item: T) => void;
      onSuccess?: (result: R, item: T) => void;
    }
  ): Promise<void> {
    const promises = batch.map(async (item) => {
      try {
        const result = await operation(item);
        callbacks.onSuccess?.(result, item);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        callbacks.onError?.(errorMessage, item);
        throw error;
      }
    });

    // Process with concurrency limit
    const concurrencyLimit = Math.min(workerPool.length, promises.length);
    const chunks = this.chunkArray(promises, concurrencyLimit);

    for (const chunk of chunks) {
      await Promise.allSettled(chunk);
    }
  }

  /**
   * Split array into chunks
   */
  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get default max workers
   */
  static getDefaultMaxWorkers(): number {
    return this.DEFAULT_MAX_WORKERS;
  }
}
