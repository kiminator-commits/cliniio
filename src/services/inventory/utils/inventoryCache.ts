import {
  InventoryCache,
  InventoryDataResponse,
} from '../types/inventoryServiceTypes';

export class InventoryCacheManager {
  private cache: InventoryCache = {
    data: null,
    timestamp: 0,
    ttl: 5 * 60 * 1000, // 5 minutes
  };

  isCacheValid(): boolean {
    return (
      this.cache.data !== null &&
      Date.now() - this.cache.timestamp < this.cache.ttl
    );
  }

  getCachedData(): InventoryDataResponse | null {
    if (this.isCacheValid()) {
      return this.cache.data;
    }
    return null;
  }

  setCachedData(data: InventoryDataResponse): void {
    this.cache.data = data;
    this.cache.timestamp = Date.now();
  }

  clearCache(): void {
    this.cache.data = null;
    this.cache.timestamp = 0;
  }

  getCacheAge(): number {
    return Date.now() - this.cache.timestamp;
  }

  isExpired(): boolean {
    return Date.now() - this.cache.timestamp >= this.cache.ttl;
  }

  setTTL(ttl: number): void {
    this.cache.ttl = ttl;
  }

  getTTL(): number {
    return this.cache.ttl;
  }
}
