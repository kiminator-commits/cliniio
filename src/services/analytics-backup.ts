// Simple analytics service to prevent circular dependency issues
// This replaces the complex analytics system with a minimal implementation

// Simple tracking function
export const trackEvent = async (
  eventName: string,
  properties?: Record<string, string | number | boolean | null>
): Promise<void> => {
  try {
    console.log('Analytics Event:', {
      eventName,
      properties,
      timestamp: new Date(),
    });
  } catch (error) {
    console.warn('Failed to track analytics event:', error);
  }
};

// Convenience functions
export const trackPageView = async (
  page: string,
  properties?: Record<string, string | number | boolean | null>
): Promise<void> => {
  await trackEvent('page_view', { page, ...properties });
};

export const trackUserAction = async (
  action: string,
  properties?: Record<string, string | number | boolean | null>
): Promise<void> => {
  await trackEvent('user_action', { action, ...properties });
};

export const trackError = async (
  error: Error,
  context?: Record<string, string | number | boolean | null>
): Promise<void> => {
  await trackEvent('error', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

export const trackPerformance = async (
  metric: string,
  value: number,
  properties?: Record<string, string | number | boolean | null>
): Promise<void> => {
  await trackEvent('performance', {
    metric,
    value,
    ...properties,
  });
};

// Basic types
export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, string | number | boolean | null>;
  timestamp?: Date;
}

export interface AnalyticsConfig {
  providers: Record<string, string | number | boolean | null>;
  defaultProvider: string;
}
