import { AnalyticsEvent, AnalyticsUser } from './types';
import {
  logEvent,
  reportError,
  trackUserAction,
  trackPageView,
  trackFeatureUsage,
} from '@/utils/monitoring';

export class AnalyticsTrackingService {
  /**
   * Track an event
   */
  static async trackEvent(
    name: string,
    properties?: Record<string, unknown>,
    userId?: string,
    facilityId?: string
  ): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        name,
        properties,
        userId,
        facilityId,
        timestamp: new Date().toISOString(),
      };

      // Track to all enabled providers
      await Promise.all([
        this.trackToSupabase(),
        this.trackToGoogleAnalytics(event),
        this.trackToMixpanel(event),
        this.trackToAmplitude(event),
      ]);

      // Also track to monitoring service
      logEvent('analytics', name, `Analytics event: ${name}`, 'info', {
        ...properties,
        userId,
        facilityId,
      });
    } catch (error) {
      reportError(
        error instanceof Error ? error : new Error('Analytics tracking failed'),
        'analytics_track_event'
      );
    }
  }

  /**
   * Track user identification
   */
  static async identifyUser(user: AnalyticsUser): Promise<void> {
    try {
      // Track to all enabled providers
      await Promise.all([
        this.identifyToSupabase(),
        this.identifyToGoogleAnalytics(),
        this.identifyToMixpanel(user),
        this.identifyToAmplitude(user),
      ]);

      logEvent(
        'analytics',
        'user_identified',
        `User identified: ${user.id}`,
        'info',
        {
          userId: user.id,
          facilityId: user.facilityId,
        }
      );
    } catch (error) {
      reportError(
        error instanceof Error
          ? error
          : new Error('User identification failed'),
        'analytics_identify_user'
      );
    }
  }

  /**
   * Track page view
   */
  static async trackPageView(
    page: string,
    properties?: Record<string, unknown>,
    userId?: string
  ): Promise<void> {
    try {
      await this.trackEvent('page_view', { page, ...properties }, userId);
      trackPageView(page, { ...properties, userId });
    } catch (error) {
      reportError(
        error instanceof Error ? error : new Error('Page view tracking failed'),
        'analytics_track_page_view'
      );
    }
  }

  /**
   * Track user action
   */
  static async trackUserAction(
    action: string,
    category: string,
    properties?: Record<string, unknown>,
    userId?: string
  ): Promise<void> {
    try {
      await this.trackEvent(
        'user_action',
        { action, category, ...properties },
        userId
      );
      trackUserAction(action, category, { ...properties, userId });
    } catch (error) {
      reportError(
        error instanceof Error
          ? error
          : new Error('User action tracking failed'),
        'analytics_track_user_action'
      );
    }
  }

  /**
   * Track feature usage
   */
  static async trackFeatureUsage(
    feature: string,
    action: string,
    properties?: Record<string, unknown>,
    userId?: string
  ): Promise<void> {
    try {
      await this.trackEvent(
        'feature_usage',
        { feature, action, ...properties },
        userId
      );
      trackFeatureUsage(feature, action, { ...properties, userId });
    } catch (error) {
      reportError(
        error instanceof Error
          ? error
          : new Error('Feature usage tracking failed'),
        'analytics_track_feature_usage'
      );
    }
  }

  /**
   * Track conversion
   */
  static async trackConversion(
    conversionName: string,
    value?: number,
    properties?: Record<string, unknown>,
    userId?: string
  ): Promise<void> {
    try {
      await this.trackEvent(
        'conversion',
        {
          conversion_name: conversionName,
          value,
          ...properties,
        },
        userId
      );
    } catch (error) {
      reportError(
        error instanceof Error
          ? error
          : new Error('Conversion tracking failed'),
        'analytics_track_conversion'
      );
    }
  }

  /**
   * Track event to Supabase
   */
  private static async trackToSupabase(): Promise<void> {
    // Temporarily disable Supabase tracking to prevent initialization errors
    console.log('Supabase analytics tracking temporarily disabled');
    return;
  }

  /**
   * Track event to Google Analytics
   */
  private static async trackToGoogleAnalytics(
    event: AnalyticsEvent
  ): Promise<void> {
    try {
      // Google Analytics 4 implementation
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event.name, {
          ...event.properties,
          user_id: event.userId,
          facility_id: event.facilityId,
        });
      }
    } catch (error) {
      console.error('Error tracking event to Google Analytics:', error);
    }
  }

  /**
   * Track event to Mixpanel
   */
  private static async trackToMixpanel(event: AnalyticsEvent): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.mixpanel) {
        window.mixpanel.track(event.name, {
          ...event.properties,
          userId: event.userId,
          facilityId: event.facilityId,
        });
      }
    } catch (error) {
      console.error('Error tracking event to Mixpanel:', error);
    }
  }

  /**
   * Track event to Amplitude
   */
  private static async trackToAmplitude(event: AnalyticsEvent): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.amplitude) {
        window.amplitude.getInstance().logEvent(event.name, {
          ...event.properties,
          userId: event.userId,
          facilityId: event.facilityId,
        });
      }
    } catch (error) {
      console.error('Error tracking event to Amplitude:', error);
    }
  }

  /**
   * Identify user to Supabase
   */
  private static async identifyToSupabase(): Promise<void> {
    // Temporarily disable Supabase user identification to prevent initialization errors
    console.log('Supabase user identification temporarily disabled');
    return;
  }

  /**
   * Identify user to Google Analytics
   */
  private static async identifyToGoogleAnalytics(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        // Note: This would need the measurement ID from config
        // For now, we'll skip this until we have proper config integration
        console.log(
          'Google Analytics user identification requires measurement ID from config'
        );
      }
    } catch (error) {
      console.error('Error identifying user to Google Analytics:', error);
    }
  }

  /**
   * Identify user to Mixpanel
   */
  private static async identifyToMixpanel(user: AnalyticsUser): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.mixpanel) {
        window.mixpanel.identify(user.id);
        window.mixpanel.people.set({
          $email: user.email,
          $name: user.full_name,
          facilityId: user.facilityId,
          ...user.properties,
        });
      }
    } catch (error) {
      console.error('Error identifying user to Mixpanel:', error);
    }
  }

  /**
   * Identify user to Amplitude
   */
  private static async identifyToAmplitude(user: AnalyticsUser): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.amplitude) {
        window.amplitude.getInstance().setUserId(user.id);
        window.amplitude.getInstance().setUserProperties({
          email: user.email,
          name: user.full_name,
          facilityId: user.facilityId,
          ...user.properties,
        });
      }
    } catch (error) {
      console.error('Error identifying user to Amplitude:', error);
    }
  }
}
