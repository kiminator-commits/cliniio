import { CleaningScheduleCache } from '../types/cleaningScheduleServiceTypes';

export class CleaningScheduleCacheManager {
  private cache: CleaningScheduleCache = {
    data: new Map<string, unknown>(),
    timeout: 5 * 60 * 1000, // 5 minutes
    updated_at: 0,
  };

  isCacheValid(): boolean {
    return Date.now() - this.cache.updated_at < this.cache.timeout;
  }

  getCachedData<T>(key: string): T | null {
    if (!this.isCacheValid()) {
      this.clearCache();
      return null;
    }
    return (this.cache.data.get(key) as T) || null;
  }

  setCachedData<T>(key: string, data: T): void {
    this.cache.data.set(key, data);
    this.cache.updated_at = Date.now();
  }

  clearCache(): void {
    this.cache.data.clear();
    this.cache.updated_at = 0;
  }

  clearCacheKey(key: string): void {
    this.cache.data.delete(key);
  }

  getCacheAge(): number {
    return Date.now() - this.cache.updated_at;
  }

  isExpired(): boolean {
    return Date.now() - this.cache.updated_at >= this.cache.timeout;
  }

  setTTL(timeout: number): void {
    this.cache.timeout = timeout;
  }

  getTTL(): number {
    return this.cache.timeout;
  }

  getCacheSize(): number {
    return this.cache.data.size;
  }

  hasKey(key: string): boolean {
    return this.cache.data.has(key);
  }

  getAllKeys(): string[] {
    return Array.from(this.cache.data.keys());
  }

  // Cache-specific methods for cleaning schedules
  getCachedSchedules<T>(key: string): T[] {
    return this.getCachedData<T[]>(key) || [];
  }

  setCachedSchedules<T>(key: string, schedules: T[]): void {
    this.setCachedData(key, schedules);
  }

  getCachedStats<T>(key: string): T | null {
    return this.getCachedData<T>(key);
  }

  setCachedStats<T>(key: string, stats: T): void {
    this.setCachedData(key, stats);
  }

  invalidateScheduleCache(): void {
    const keysToRemove = this.getAllKeys().filter(
      (key) => key.includes('schedule') || key.includes('cleaning')
    );
    keysToRemove.forEach((key) => this.clearCacheKey(key));
  }

  invalidateStatsCache(): void {
    const keysToRemove = this.getAllKeys().filter(
      (key) => key.includes('stats') || key.includes('analytics')
    );
    keysToRemove.forEach((key) => this.clearCacheKey(key));
  }
}
