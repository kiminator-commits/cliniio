import { AnalyticsConfig } from './types';

export class AnalyticsConfigService {
  private static config: AnalyticsConfig = {
    providers: {
      supabase: { enabled: true },
    },
    defaultProvider: 'supabase',
  };

  /**
   * Load configuration from Supabase
   */
  static async loadConfig(): Promise<void> {
    try {
      // Temporarily disable Supabase config loading to prevent initialization errors
      console.log('Analytics config loading temporarily disabled');
      return;

      // const { data, error } = await supabase.from('facility_analytics_config').select('*').single();

      // if (error && error.code !== 'PGRST116') {
      //   console.error('Failed to load analytics config:', error);
      //   return;
      // }

      // if (data) {
      //   this.config = {
      //     ...this.config,
      //     providers: {
      //       ...this.config.providers,
      //       ...data.providers,
      //     },
      //     defaultProvider: data.default_provider || this.config.defaultProvider,
      //   };
      // }
    } catch (error) {
      console.error('Error loading analytics config:', error);
    }
  }

  /**
   * Get analytics configuration
   */
  static getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  /**
   * Update analytics configuration
   */
  static async updateConfig(config: Partial<AnalyticsConfig>): Promise<void> {
    this.config = { ...this.config, ...config };

    // Temporarily disable Supabase config saving
    console.log('Analytics config update temporarily disabled');
    return;

    // // Save to Supabase
    // try {
    //   const { error } = await supabase.from('facility_analytics_config').upsert({
    //     providers: this.config.providers,
    //     default_provider: this.config.defaultProvider,
    //     updated_at: new Date().toISOString(),
    //   } as unknown as Record<string, unknown>);

    //   if (error) {
    //     console.error('Failed to update analytics config:', error);
    //   }
    // } catch (error) {
    //   console.error('Error updating analytics config:', error);
    // }
  }

  /**
   * Merge configuration with provided config
   */
  static mergeConfig(config?: Partial<AnalyticsConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }
}
