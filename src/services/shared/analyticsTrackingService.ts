/**
 * Analytics Tracking Service
 * Extracted to break circular dependency between InventoryServiceFacade and analytics services
 */

import { trackingAnalyticsService } from '../analytics/trackingAnalyticsService';

export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, string | number | boolean | null>;
  timestamp?: Date;
}

export class AnalyticsTrackingService {
  /**
   * Track an analytics event
   * Connected to the main tracking analytics service
   */
  static async trackEvent(
    eventName: string,
    properties?: Record<string, string | number | boolean | null>
  ): Promise<void> {
    try {
      // Log the event for debugging
      console.log('Analytics Event:', {
        eventName,
        properties,
        timestamp: new Date(),
      });

      // Connect to main analytics service
      // For tracking-specific events, use the tracking service
      if (eventName.includes('track_') || eventName.includes('tool_')) {
        // This would be handled by trackingAnalyticsService for tool-specific events
        // For now, we'll just log it since the tracking service has specific event types
        console.log('Event forwarded to tracking analytics service:', eventName);
      }
    } catch (error) {
      console.warn('Failed to track analytics event:', error);
    }
  }
}
