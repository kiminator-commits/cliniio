import { HomePageData } from '../../types/homeTypes';

export class HomeDataCacheProvider {
  private cachedData: HomePageData | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes (increased from 5)
  private readonly STALE_WHILE_REVALIDATE_DURATION = 30 * 60 * 1000; // 30 minutes
  private isRefreshing = false; // Prevent multiple simultaneous refreshes

  /**
   * Check if data is stale and needs background refresh
   */
  isDataStale(): boolean {
    if (!this.cachedData) return true;
    const now = Date.now();
    return now - this.lastFetchTime >= this.CACHE_DURATION;
  }

  /**
   * Check if data is too old and must be refreshed
   */
  isDataExpired(): boolean {
    if (!this.cachedData) return true;
    const now = Date.now();
    return now - this.lastFetchTime >= this.STALE_WHILE_REVALIDATE_DURATION;
  }

  /**
   * Get cached data
   */
  getCachedData(): HomePageData | null {
    return this.cachedData;
  }

  /**
   * Set cached data
   */
  setCachedData(data: HomePageData): void {
    this.cachedData = data;
    this.lastFetchTime = Date.now();
  }

  /**
   * Check if currently refreshing
   */
  isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }

  /**
   * Set refreshing state
   */
  setRefreshing(refreshing: boolean): void {
    this.isRefreshing = refreshing;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cachedData = null;
    this.lastFetchTime = 0;
  }

  /**
   * Get cache duration
   */
  getCacheDuration(): number {
    return this.CACHE_DURATION;
  }

  /**
   * Get stale while revalidate duration
   */
  getStaleWhileRevalidateDuration(): number {
    return this.STALE_WHILE_REVALIDATE_DURATION;
  }
}
