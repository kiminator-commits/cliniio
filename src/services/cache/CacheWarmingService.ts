/**
 * Cache warming service
 * Proactively loads frequently accessed data into cache
 */

import { inventoryServiceFacade } from '../inventory/InventoryServiceFacade';
import { knowledgeHubApiService } from '../../pages/KnowledgeHub/services/knowledgeHubApiService';
import { cleaningScheduleService } from '../cleaningScheduleService';
import { homeDataService } from '../homeDataService';

export interface WarmingConfig {
  enabled: boolean;
  warmOnAppStart: boolean;
  warmOnUserAction: boolean;
  backgroundRefresh: boolean;
  refreshInterval: number; // in milliseconds
}

export class CacheWarmingService {
  private static instance: CacheWarmingService;
  private warmingConfig: WarmingConfig = {
    enabled: true,
    warmOnAppStart: true,
    warmOnUserAction: true,
    backgroundRefresh: true,
    refreshInterval: 10 * 60 * 1000, // 10 minutes
  };
  private backgroundInterval: NodeJS.Timeout | null = null;
  private isWarming = false;

  private constructor() {}

  static getInstance(): CacheWarmingService {
    if (!this.instance) {
      this.instance = new CacheWarmingService();
    }
    return this.instance;
  }

  /**
   * Configure cache warming behavior
   */
  configure(config: Partial<WarmingConfig>): void {
    this.warmingConfig = { ...this.warmingConfig, ...config };

    if (this.warmingConfig.backgroundRefresh) {
      this.startBackgroundRefresh();
    } else {
      this.stopBackgroundRefresh();
    }
  }

  /**
   * Warm all frequently accessed caches
   */
  async warmFrequentlyAccessedData(): Promise<void> {
    if (!this.warmingConfig.enabled || this.isWarming) {
      return;
    }

    this.isWarming = true;
    console.log('🔥 Starting cache warming...');

    try {
      await Promise.allSettled([
        this.warmInventoryCache(),
        this.warmKnowledgeHubCache(),
        this.warmCleaningScheduleCache(),
        this.warmHomePageCache(),
      ]);

      console.log('✅ Cache warming completed');
    } catch (error) {
      console.warn('⚠️ Cache warming failed:', error);
    } finally {
      this.isWarming = false;
    }
  }

  /**
   * Warm inventory cache
   */
  private async warmInventoryCache(): Promise<void> {
    try {
      // Ensure the inventory service facade is initialized first
      await inventoryServiceFacade.initialize();
      await inventoryServiceFacade.fetchInventoryItems();
      console.log('🔥 Warmed inventory cache');
    } catch (error) {
      console.warn('⚠️ Inventory cache warming failed:', error);
    }
  }

  /**
   * Warm knowledge hub cache
   */
  private async warmKnowledgeHubCache(): Promise<void> {
    try {
      // Warm main content cache
      await knowledgeHubApiService.fetchContent();
      console.log('🔥 Warmed knowledge hub content cache');

      // Warm content stats
      await knowledgeHubApiService.getContentStats();
      console.log('🔥 Warmed knowledge hub stats cache');

      // Warm common category caches
      const commonCategories = ['Courses', 'Procedures', 'Policies'];
      for (const category of commonCategories) {
        try {
          await knowledgeHubApiService.fetchContentByCategory(category);
          console.log(
            `🔥 Warmed knowledge hub cache for category: ${category}`
          );
        } catch (error) {
          console.warn(
            `⚠️ Failed to warm knowledge hub cache for category: ${category}`,
            error
          );
        }
      }
    } catch (error) {
      console.warn('⚠️ Knowledge hub cache warming failed:', error);
    }
  }

  /**
   * Warm cleaning schedule cache
   */
  private async warmCleaningScheduleCache(): Promise<void> {
    try {
      // Warm schedule data
      await cleaningScheduleService.getSchedules();
      console.log('🔥 Warmed cleaning schedule cache');

      // Warm statistics
      await cleaningScheduleService.getCleaningStats();
      console.log('🔥 Warmed cleaning schedule stats cache');
    } catch (error) {
      console.warn('⚠️ Cleaning schedule cache warming failed:', error);
    }
  }

  /**
   * Warm home page cache
   */
  private async warmHomePageCache(): Promise<void> {
    try {
      // Warm home page data
      await homeDataService.fetchHomePageData();
      console.log('🔥 Warmed home page cache');
    } catch (error) {
      console.warn('⚠️ Home page cache warming failed:', error);
    }
  }

  /**
   * Warm cache on user action (e.g., navigation)
   */
  async warmOnUserAction(action: string): Promise<void> {
    if (!this.warmingConfig.enabled || !this.warmingConfig.warmOnUserAction) {
      return;
    }

    console.log(`🔥 Warming cache for user action: ${action}`);

    switch (action) {
      case 'navigate:inventory':
        await this.warmInventoryCache();
        break;
      case 'navigate:knowledge':
        await this.warmKnowledgeHubCache();
        break;
      case 'navigate:cleaning':
        await this.warmCleaningScheduleCache();
        break;
      case 'navigate:home':
        await this.warmHomePageCache();
        break;
      default:
        // For unknown actions, warm all caches
        await this.warmFrequentlyAccessedData();
    }
  }

  /**
   * Start background cache refresh
   */
  private startBackgroundRefresh(): void {
    if (this.backgroundInterval) {
      return;
    }

    this.backgroundInterval = setInterval(async () => {
      if (!this.isWarming) {
        await this.warmFrequentlyAccessedData();
      }
    }, this.warmingConfig.refreshInterval);

    console.log(
      `🔄 Started background cache refresh (${this.warmingConfig.refreshInterval / 1000}s interval)`
    );
  }

  /**
   * Stop background cache refresh
   */
  private stopBackgroundRefresh(): void {
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval);
      this.backgroundInterval = null;
      console.log('🛑 Stopped background cache refresh');
    }
  }

  /**
   * Get warming status
   */
  getStatus(): {
    isWarming: boolean;
    config: WarmingConfig;
    backgroundActive: boolean;
  } {
    return {
      isWarming: this.isWarming,
      config: this.warmingConfig,
      backgroundActive: this.backgroundInterval !== null,
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopBackgroundRefresh();
  }
}

// Export singleton instance
export const cacheWarmingService = CacheWarmingService.getInstance();
