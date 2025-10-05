import { logger } from '../utils/_core/logger';
import { FacilityService } from './facilityService';
import { HomePerformanceMetrics } from './home/homeMetricsService';
import { SterilizationHomeMetrics } from './homeSterilizationIntegration';
import { HomeIntegrationMetrics } from './homeIntegrationService';
import { AIImpactMetrics } from './aiMetricsService';

interface CachedPerformanceMetrics {
  aiMetrics: HomePerformanceMetrics | null;
  sterilizationMetrics: SterilizationHomeMetrics | null;
  integrationMetrics: HomeIntegrationMetrics | null;
  aiImpactMetrics: AIImpactMetrics | null;
  timestamp: number;
  facilityId: string;
}

class PerformanceMetricsCache {
  private cache: CachedPerformanceMetrics | null = null;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours (daily metrics)
  private lastLogTime: number = 0;

  /**
   * Fetch and cache all performance metrics on login
   */
  async fetchAndCacheMetricsOnLogin(): Promise<CachedPerformanceMetrics | null> {
    try {
      logger.debug('PerformanceMetricsCache: Fetching metrics on login...');

      // Import services dynamically to avoid circular dependencies
      const { homeMetricsService } = await import(
        '../services/home/homeMetricsService'
      );
      const { homeSterilizationIntegration } = await import(
        '../services/homeSterilizationIntegration'
      );
      const { homeIntegrationService } = await import(
        '../services/homeIntegrationService'
      );
      const { FacilityService } = await import('../services/facilityService');

      const { facilityId } = await FacilityService.getCurrentUserAndFacility();

      if (!facilityId) {
        logger.debug('PerformanceMetricsCache: No facility ID, skipping cache');
        return null;
      }

      // Fetch all metrics in parallel including AI Process and Efficiency
      const [
        aiMetrics,
        sterilizationMetrics,
        integrationMetrics,
        aiImpactMetrics,
      ] = await Promise.allSettled([
        homeMetricsService.getHomeMetrics(),
        homeSterilizationIntegration.getSterilizationMetrics(),
        homeIntegrationService.getAllMetrics(),
        // Import and fetch AI impact metrics alongside other metrics
        import('../services/aiImpactMeasurementService').then((module) =>
          module.aiImpactMeasurementService.getAIImpactMetrics()
        ),
      ]);

      const cachedMetrics: CachedPerformanceMetrics = {
        aiMetrics: aiMetrics.status === 'fulfilled' ? aiMetrics.value : null,
        sterilizationMetrics:
          sterilizationMetrics.status === 'fulfilled'
            ? sterilizationMetrics.value
            : null,
        integrationMetrics:
          integrationMetrics.status === 'fulfilled'
            ? integrationMetrics.value
            : null,
        aiImpactMetrics:
          aiImpactMetrics.status === 'fulfilled' ? aiImpactMetrics.value : null,
        timestamp: Date.now(),
        facilityId,
      };

      // Cache the results
      this.cache = cachedMetrics;

      // Also store in localStorage for persistence across sessions
      try {
        localStorage.setItem(
          'performanceMetricsCache',
          JSON.stringify(cachedMetrics)
        );
      } catch {
        logger.debug(
          'PerformanceMetricsCache: Could not store in localStorage'
        );
      }

      // Only log once per login to avoid StrictMode duplicate logs
      const now = Date.now();
      if (now - this.lastLogTime > 1000) {
        logger.debug(
          'PerformanceMetricsCache: Metrics cached successfully for facility:',
          facilityId
        );
        this.lastLogTime = now;
      }

      return cachedMetrics;
    } catch (error) {
      console.error(
        'PerformanceMetricsCache: Error fetching metrics on login:',
        error
      );
      return null;
    }
  }

  /**
   * Get cached metrics if available and not expired
   */
  getCachedMetrics(): CachedPerformanceMetrics | null {
    // Check memory cache first
    if (this.cache && this.isCacheValid(this.cache)) {
      return this.cache;
    }

    // Check localStorage cache
    try {
      const stored = localStorage.getItem('performanceMetricsCache');
      if (stored) {
        const cached: CachedPerformanceMetrics = JSON.parse(stored);
        if (this.isCacheValid(cached)) {
          this.cache = cached; // Restore to memory cache
          return cached;
        }
      }
    } catch {
      logger.debug(
        'PerformanceMetricsCache: Could not read from localStorage:',
        err
      );
    }

    return null;
  }

  /**
   * Manual refresh - fetch new metrics and update cache
   */
  async refreshMetrics(): Promise<CachedPerformanceMetrics | null> {
    logger.debug('PerformanceMetricsCache: Manual refresh requested');

    // Clear existing cache
    this.cache = null;
    localStorage.removeItem('performanceMetricsCache');

    // Fetch fresh metrics
    return await this.fetchAndCacheMetricsOnLogin();
  }

  /**
   * Check if cached metrics are still valid
   */
  private isCacheValid(cached: CachedPerformanceMetrics): boolean {
    const now = Date.now();
    const age = now - cached.timestamp;

    // Check if cache is within duration and for same facility
    if (age > this.CACHE_DURATION) {
      logger.debug('PerformanceMetricsCache: Cache expired (age:', age, 'ms)');
      return false;
    }

    // Verify facility ID matches current facility
    try {
      FacilityService.getCurrentUserAndFacility().then(({ facilityId }) => {
        if (facilityId !== cached.facilityId) {
          logger.debug(
            'PerformanceMetricsCache: Facility changed, cache invalid'
          );
          return false;
        }
      });
    } catch {
      // If we can't verify facility, assume valid for now
    }

    return true;
  }

  /**
   * Clear all cached metrics
   */
  clearCache(): void {
    this.cache = null;
    localStorage.removeItem('performanceMetricsCache');
    logger.debug('PerformanceMetricsCache: Cache cleared');
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus(): { hasCache: boolean; age?: number; facilityId?: string } {
    const cached = this.getCachedMetrics();
    if (cached) {
      return {
        hasCache: true,
        age: Date.now() - cached.timestamp,
        facilityId: cached.facilityId,
      };
    }
    return { hasCache: false };
  }
}

// Export singleton instance
export const performanceMetricsCache = new PerformanceMetricsCache();
export default performanceMetricsCache;
