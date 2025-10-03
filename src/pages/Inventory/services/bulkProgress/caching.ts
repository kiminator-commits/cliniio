import { CacheStats } from './types';

export class OperationCacheService {
  private static operationCache: Map<string, unknown> = new Map();
  private static readonly DEFAULT_CACHE_SIZE = 1000;

  /**
   * Initialize cache with size limit
   */
  static initializeCache(size: number = this.DEFAULT_CACHE_SIZE): void {
    this.operationCache.clear();
    // Set up cache size monitoring
    const originalSet = this.operationCache.set.bind(this.operationCache);
    this.operationCache.set = (key: string, value: unknown) => {
      if (this.operationCache.size >= size) {
        // Remove oldest entries when cache is full
        const firstKey = this.operationCache.keys().next().value;
        if (firstKey) {
          this.operationCache.delete(firstKey);
        }
      }
      return originalSet(key, value);
    };
  }

  /**
   * Get cached result
   */
  static getCachedResult(key: string): unknown | undefined {
    return this.operationCache.get(key);
  }

  /**
   * Check if result is cached
   */
  static hasCachedResult(key: string): boolean {
    return this.operationCache.has(key);
  }

  /**
   * Cache operation result
   */
  static cacheResult(key: string, value: unknown): void {
    this.operationCache.set(key, value);
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): CacheStats {
    return {
      size: this.operationCache.size,
      hitRate: this.calculateCacheHitRate(),
    };
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.operationCache.clear();
  }

  /**
   * Calculate cache hit rate
   */
  private static calculateCacheHitRate(): number {
    // This would need to be implemented with cache hit tracking
    // For now, return a placeholder
    return 0;
  }
}
