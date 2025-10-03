import { ExportResult, ExportOptions } from './types';
import { InventoryItem } from '@/types/inventoryTypes';

export interface CacheStats {
  size: number;
  maxSize: number;
}

export class ExportCacheService {
  private static readonly EXPORT_CACHE = new Map<string, ExportResult>();
  private static readonly CACHE_MAX_SIZE = 100;

  /**
   * Generate cache key for export results
   */
  static generateCacheKey(
    items: InventoryItem[],
    options: ExportOptions
  ): string {
    const itemsHash =
      items.length + '_' + items[0]?.id + '_' + items[items.length - 1]?.id;
    const optionsHash = JSON.stringify(options);
    return `${itemsHash}_${optionsHash}`;
  }

  /**
   * Get cached export result
   */
  static getCachedResult(key: string): ExportResult | undefined {
    return this.EXPORT_CACHE.get(key);
  }

  /**
   * Check if result is cached
   */
  static hasCachedResult(key: string): boolean {
    return this.EXPORT_CACHE.has(key);
  }

  /**
   * Cache export result with size limit
   */
  static cacheExportResult(key: string, result: ExportResult): void {
    // Remove oldest entries if cache is full
    if (this.EXPORT_CACHE.size >= this.CACHE_MAX_SIZE) {
      const firstKey = this.EXPORT_CACHE.keys().next().value;
      if (firstKey) {
        this.EXPORT_CACHE.delete(firstKey);
      }
    }

    this.EXPORT_CACHE.set(key, result);
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): CacheStats {
    return {
      size: this.EXPORT_CACHE.size,
      maxSize: this.CACHE_MAX_SIZE,
    };
  }

  /**
   * Clear export cache
   */
  static clearCache(): void {
    this.EXPORT_CACHE.clear();
  }

  /**
   * Remove specific cached result
   */
  static removeCachedResult(key: string): boolean {
    return this.EXPORT_CACHE.delete(key);
  }
}
