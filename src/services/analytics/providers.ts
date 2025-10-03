import { AnalyticsConfig } from './types';

export class AnalyticsProviderService {
  /**
   * Initialize external analytics providers
   */
  static async initialize(config: AnalyticsConfig): Promise<void> {
    try {
      await this.initializeProviders(config);
      console.log('Analytics providers initialized successfully');
    } catch (error) {
      console.error('Failed to initialize analytics providers:', error);
    }
  }

  /**
   * Track event to all enabled providers
   */
  static async trackEvent(
    name: string,
    properties?: Record<string, unknown>,
    userId?: string,
    facilityId?: string,
    config?: AnalyticsConfig
  ): Promise<void> {
    try {
      if (!config) {
        console.warn('No analytics config provided for event tracking');
        return;
      }

      // Track to Google Analytics
      if (config.providers.googleAnalytics?.enabled) {
        await this.trackToGoogleAnalytics(name, properties, userId, facilityId);
      }

      // Track to Mixpanel
      if (config.providers.mixpanel?.enabled) {
        await this.trackToMixpanel(name, properties, userId, facilityId);
      }

      // Track to Amplitude
      if (config.providers.amplitude?.enabled) {
        await this.trackToAmplitude(name, properties, userId, facilityId);
      }
    } catch (error) {
      console.error('Failed to track event to providers:', error);
    }
  }

  /**
   * Initialize external analytics providers
   */
  static async initializeProviders(config: AnalyticsConfig): Promise<void> {
    // Initialize Google Analytics
    if (
      config.providers.googleAnalytics?.enabled &&
      config.providers.googleAnalytics?.measurementId
    ) {
      await this.initializeGoogleAnalytics(
        config.providers.googleAnalytics.measurementId
      );
    }

    // Initialize Mixpanel
    if (
      config.providers.mixpanel?.enabled &&
      config.providers.mixpanel?.token
    ) {
      await this.initializeMixpanel(config.providers.mixpanel.token);
    }

    // Initialize Amplitude
    if (
      config.providers.amplitude?.enabled &&
      config.providers.amplitude?.apiKey
    ) {
      await this.initializeAmplitude(config.providers.amplitude.apiKey);
    }
  }

  /**
   * Initialize Google Analytics
   */
  private static async initializeGoogleAnalytics(
    measurementId: string
  ): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        // Load Google Analytics script if not already loaded
        if (!window.gtag) {
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
          document.head.appendChild(script);

          // Initialize gtag
          window.dataLayer = window.dataLayer || [];
          window.gtag = function (...args: unknown[]) {
            window.dataLayer?.push(args);
          };
          window.gtag('js', new Date().toISOString());
          window.gtag('config', measurementId);
        }
      }
    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
    }
  }

  /**
   * Initialize Mixpanel
   */
  private static async initializeMixpanel(token: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.mixpanel) {
        (window.mixpanel as { init: (token: string) => void }).init(token);
      }
    } catch (error) {
      console.error('Failed to initialize Mixpanel:', error);
    }
  }

  /**
   * Initialize Amplitude
   */
  private static async initializeAmplitude(apiKey: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.amplitude) {
        (
          window.amplitude as {
            getInstance: () => { init: (apiKey: string) => void };
          }
        )
          .getInstance()
          .init(apiKey);
      }
    } catch (error) {
      console.error('Failed to initialize Amplitude:', error);
    }
  }

  /**
   * Track event to Google Analytics
   */
  private static async trackToGoogleAnalytics(
    name: string,
    properties?: Record<string, unknown>,
    userId?: string,
    facilityId?: string
  ): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', name, {
          ...properties,
          user_id: userId,
          facility_id: facilityId,
        });
      }
    } catch (error) {
      console.error('Error tracking event to Google Analytics:', error);
    }
  }

  /**
   * Track event to Mixpanel
   */
  private static async trackToMixpanel(
    name: string,
    properties?: Record<string, unknown>,
    userId?: string,
    facilityId?: string
  ): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.mixpanel) {
        window.mixpanel.track(name, {
          ...properties,
          user_id: userId,
          facility_id: facilityId,
        });
      }
    } catch (error) {
      console.error('Error tracking event to Mixpanel:', error);
    }
  }

  /**
   * Track event to Amplitude
   */
  private static async trackToAmplitude(
    name: string,
    properties?: Record<string, unknown>,
    userId?: string,
    facilityId?: string
  ): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.amplitude) {
        window.amplitude.getInstance().logEvent(name, {
          ...properties,
          user_id: userId,
          facility_id: facilityId,
        });
      }
    } catch (error) {
      console.error('Error tracking event to Amplitude:', error);
    }
  }
}

// Type declarations are in types.ts
