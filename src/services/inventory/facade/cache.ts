import { InventoryDataResponse } from './types';

export interface InventoryCache {
  data: InventoryDataResponse | null;
  timestamp: number;
  ttl: number;
  hits: number;
  misses: number;
  evictions: number;
}

export class InventoryCacheManager {
  private cache: InventoryCache = {
    data: null,
    timestamp: 0,
    ttl: 5 * 60 * 1000, // 5 minutes
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  /**
   * Get cached data if valid
   */
  get(): InventoryDataResponse | null {
    if (this.cache.data && Date.now() - this.cache.timestamp < this.cache.ttl) {
      this.cache.hits++;
      return this.cache.data;
    }

    this.cache.misses++;
    return null;
  }

  /**
   * Set cache data with timestamp
   */
  set(data: InventoryDataResponse): void {
    this.cache.data = data;
    this.cache.timestamp = Date.now();
  }

  /**
   * Clear cache and increment eviction counter
   */
  clear(): void {
    if (this.cache.data) {
      this.cache.evictions++;
    }
    this.cache.data = null;
    this.cache.timestamp = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      hits: this.cache.hits,
      misses: this.cache.misses,
      size: this.cache.data ? JSON.stringify(this.cache.data).length : 0,
      lastUpdated: new Date(this.cache.timestamp).toISOString(),
      updated_at: new Date(this.cache.timestamp).toISOString(),
    };
  }

  /**
   * Check if cache is valid
   */
  isValid(): boolean {
    return !!(
      this.cache.data && Date.now() - this.cache.timestamp < this.cache.ttl
    );
  }
}
