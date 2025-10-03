/**
 * Simplified cache warming service
 * Removes unnecessary overhead while maintaining interface compatibility
 */

export interface WarmingConfig {
  enabled: boolean;
  warmOnAppStart: boolean;
  warmOnUserAction: boolean;
  backgroundRefresh: boolean;
  refreshInterval: number;
}

export class SimpleCacheWarmingService {
  private static instance: SimpleCacheWarmingService;
  private warmingConfig: WarmingConfig = {
    enabled: false, // Disabled by default to reduce overhead
    warmOnAppStart: false,
    warmOnUserAction: false,
    backgroundRefresh: false,
    refreshInterval: 10 * 60 * 1000,
  };

  private constructor() {}

  static getInstance(): SimpleCacheWarmingService {
    if (!this.instance) {
      this.instance = new SimpleCacheWarmingService();
    }
    return this.instance;
  }

  /**
   * Configure cache warming behavior (simplified)
   */
  configure(config: Partial<WarmingConfig>): void {
    this.warmingConfig = { ...this.warmingConfig, ...config };
    console.log('⚙️ Cache warming configured (simplified mode)');
  }

  /**
   * Warm all frequently accessed caches (no-op for compatibility)
   */
  async warmFrequentlyAccessedData(): Promise<void> {
    if (!this.warmingConfig.enabled) {
      return;
    }
    console.log(
      '🔥 Cache warming requested (simplified - no background operations)'
    );
  }

  /**
   * Warm cache on user action (no-op for compatibility)
   */
  async warmOnUserAction(action: string): Promise<void> {
    if (!this.warmingConfig.enabled || !this.warmingConfig.warmOnUserAction) {
      return;
    }
    console.log(`🔥 Cache warming for action: ${action} (simplified)`);
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
      isWarming: false,
      config: this.warmingConfig,
      backgroundActive: false,
    };
  }

  /**
   * Cleanup resources (no-op for compatibility)
   */
  cleanup(): void {
    // No background operations to clean up
  }
}

// Export singleton instance
export const simpleCacheWarmingService =
  SimpleCacheWarmingService.getInstance();
