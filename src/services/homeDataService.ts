import { HomePageData } from '../types/homeTypes';
import { isDevelopment } from '../lib/getEnv';
import { logger } from '../utils/logger';
import { HomeDataCacheProvider } from './homeData/HomeDataCacheProvider';
import { HomeDataUserProvider } from './homeData/HomeDataUserProvider';
import { HomeDataFetchProvider } from './homeData/HomeDataFetchProvider';
import { HomeDataMetricsProvider } from './homeData/HomeDataMetricsProvider';

class HomeDataService {
  private cacheProvider: HomeDataCacheProvider;
  private userProvider: HomeDataUserProvider;
  private fetchProvider: HomeDataFetchProvider;
  private metricsProvider: HomeDataMetricsProvider;

  constructor() {
    this.cacheProvider = new HomeDataCacheProvider();
    this.userProvider = new HomeDataUserProvider();
    this.fetchProvider = new HomeDataFetchProvider();
    this.metricsProvider = new HomeDataMetricsProvider();
  }

  /**
   * Get cached user or fetch from Supabase
   */
  private async getCachedUser() {
    return this.userProvider.getCachedUser();
  }

  /**
   * Check if data is stale and needs background refresh
   */
  private isDataStale(): boolean {
    return this.cacheProvider.isDataStale();
  }

  /**
   * Check if data is too old and must be refreshed
   */
  private isDataExpired(): boolean {
    return this.cacheProvider.isDataExpired();
  }

  /**
   * Background refresh of cached data
   */
  private async refreshDataInBackground(): Promise<void> {
    if (this.cacheProvider.isCurrentlyRefreshing() || !this.isDataStale()) {
      return;
    }

    this.cacheProvider.setRefreshing(true);
    try {
      const user = await this.getCachedUser();
      if (!user) return;

      // Fetch fresh data in background
      const freshData = await this.fetchFreshData(user);

      // Update cache with fresh data
      this.cacheProvider.setCachedData(freshData);

      if (isDevelopment()) {
        logger.info('[PERF] HomeDataService: Background refresh completed');
      }
    } catch (error) {
      logger.warn('HomeDataService: Background refresh failed:', error);
    } finally {
      this.cacheProvider.setRefreshing(false);
    }
  }

  /**
   * Fetch fresh data from the database
   */
  private async fetchFreshData(user: {
    id: string;
    facility_id?: string;
    lastCheck: number;
  }): Promise<HomePageData> {
    const rawData = await this.fetchProvider.fetchFreshData(user);
    const metrics = this.metricsProvider.calculateMetrics(rawData.tasks);
    
    return {
      tasks: rawData.tasks,
      availablePoints: metrics.availablePoints,
      completedTasksCount: metrics.completedTasksCount,
      totalTasksCount: metrics.totalTasksCount,
    };
  }

  /**
   * Fetch all home page data with improved caching strategy
   */
  async fetchHomePageData(): Promise<HomePageData> {
    const startTime = performance.now();

    // If we have cached data that's not expired, return it immediately
    if (this.cacheProvider.getCachedData() && !this.isDataExpired()) {
      if (isDevelopment()) {
        logger.info(
          `[PERF] HomeDataService: Returning cached data in ${(performance.now() - startTime).toFixed(2)}ms`
        );
      }

      // Trigger background refresh if data is stale but not expired
      if (this.isDataStale()) {
        this.refreshDataInBackground();
      }

      return this.cacheProvider.getCachedData()!;
    }

    // Data is expired or doesn't exist, fetch fresh data
    try {
      const user = await this.getCachedUser();
      if (!user) {
        logger.info('HomeDataService: No user found, returning empty data');
        return {
          tasks: [],
          availablePoints: 0,
          completedTasksCount: 0,
          totalTasksCount: 0,
        };
      }

      const freshData = await this.fetchFreshData(user);

      // Update cache
      this.cacheProvider.setCachedData(freshData);

      if (isDevelopment()) {
        logger.info(
          `[PERF] HomeDataService: Fetched fresh data in ${(performance.now() - startTime).toFixed(2)}ms`
        );
      }

      return freshData;
    } catch (error) {
      logger.error('Error in fetchHomePageData:', error);

      // If we have stale cached data, return it as fallback
      if (this.cacheProvider.getCachedData() && this.isDataStale()) {
        logger.warn(
          'HomeDataService: Returning stale cached data due to fetch error'
        );
        return this.cacheProvider.getCachedData()!;
      }

      throw error;
    }
  }

  /**
   * Alternative optimized method using efficient JOINs and SQL aggregation
   * This method may be faster for larger datasets
   */
  async fetchHomePageDataOptimized(
    page: number = 1,
    pageSize: number = 20
  ): Promise<
    import('../types/homeTypes').HomePageData & {
      pagination: import('../types/homeTypes').PaginationInfo;
    }
  > {
    const startTime = performance.now();

    // Check if we have cached data that's still valid (using stale-while-revalidate)
    if (this.cacheProvider.getCachedData() && !this.isDataExpired() && page === 1) {
      if (isDevelopment()) {
        logger.info(
          `[PERF] HomeDataService: Returning cached data in ${(performance.now() - startTime).toFixed(2)}ms`
        );
      }

      // Trigger background refresh if data is stale but not expired
      if (this.isDataStale()) {
        this.refreshDataInBackground();
      }

      const cachedData = this.cacheProvider.getCachedData()!;
      return {
        ...cachedData,
        pagination: this.metricsProvider.calculatePagination(1, pageSize, cachedData.tasks.length),
      };
    }

    try {
      const user = await this.getCachedUser();
      if (!user) {
        logger.info('HomeDataService: No user found, returning empty data');
        return {
          tasks: [],
          availablePoints: 0,
          completedTasksCount: 0,
          totalTasksCount: 0,
          pagination: this.metricsProvider.calculatePagination(page, pageSize, 0),
        };
      }

      const fetchResult = await this.fetchProvider.fetchOptimizedData(user, page, pageSize);
      const pagination = this.metricsProvider.calculatePagination(page, pageSize, fetchResult.totalCount);

      const result: import('../types/homeTypes').HomePageData & {
        pagination: import('../types/homeTypes').PaginationInfo;
      } = {
        tasks: fetchResult.tasks,
        availablePoints: fetchResult.availablePoints,
        completedTasksCount: fetchResult.completedCount,
        totalTasksCount: fetchResult.totalCount,
        pagination,
      };

      // Cache only first page data
      if (page === 1) {
        this.cacheProvider.setCachedData({
          tasks: result.tasks,
          availablePoints: result.availablePoints,
          completedTasksCount: result.completedTasksCount,
          totalTasksCount: result.totalTasksCount,
        });
      }

      if (isDevelopment()) {
        logger.info(
          `[PERF] HomeDataService: Fetched page ${page} in ${(performance.now() - startTime).toFixed(2)}ms`
        );
      }

      return result;
    } catch (error) {
      logger.error('Error in fetchHomePageDataOptimized:', error);
      throw error;
    }
  }

  /**
   * Performance comparison method to test both query approaches
   * This helps measure the performance improvements
   */
  async compareQueryPerformance(): Promise<{
    original: number;
    optimized: number;
    improvement: number;
  }> {
    const user = await this.getCachedUser();
    if (!user) {
      throw new Error('No user found for performance comparison');
    }

    // Test original method
    const originalStart = performance.now();
    try {
      await this.fetchHomePageData();
    } catch (error) {
      logger.error('Original method failed:', error);
    }
    const originalTime = performance.now() - originalStart;

    // Test optimized method
    const optimizedStart = performance.now();
    try {
      await this.fetchHomePageDataOptimized();
    } catch (error) {
      logger.error('Optimized method failed:', error);
    }
    const optimizedTime = performance.now() - optimizedStart;

    const improvement = this.metricsProvider.calculatePerformanceImprovement(originalTime, optimizedTime);

    if (isDevelopment()) {
      logger.info(`[PERF] Query Performance Comparison:`);
      logger.info(`[PERF] Original method: ${originalTime.toFixed(2)}ms`);
      logger.info(`[PERF] Optimized method: ${optimizedTime.toFixed(2)}ms`);
      logger.info(`[PERF] Improvement: ${improvement.toFixed(1)}%`);
    }

    return {
      original: originalTime,
      optimized: optimizedTime,
      improvement,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cacheProvider.clearCache();
    this.userProvider.clearUserCache();
  }

  /**
   * Get cached data
   */
  getCachedData(): HomePageData | null {
    return this.cacheProvider.getCachedData();
  }
}

export const homeDataService = new HomeDataService();
