import { supabase } from '@/lib/supabaseClient';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface MonitoringEvent {
  category: string;
  action: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  facilityId?: string;
  timestamp?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  category: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorReport {
  error: Error | string;
  context: string;
  userId?: string;
  facilityId?: string;
  userAgent?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Monitoring Service
 * Handles application monitoring, error tracking, and performance metrics
 */
export class MonitoringService {
  private static readonly MAX_BATCH_SIZE = 50;
  private static eventQueue: MonitoringEvent[] = [];
  private static metricQueue: PerformanceMetric[] = [];
  private static errorQueue: ErrorReport[] = [];
  private static flushInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize monitoring service
   */
  static initialize(): void {
    // Set up periodic flushing of queues
    this.flushInterval = setInterval(() => {
      this.flushQueues();
    }, 30000); // Flush every 30 seconds

    // Set up error handlers
    this.setupErrorHandlers();

    console.log('Monitoring service initialized');
  }

  /**
   * Log an event
   */
  static logEvent(
    category: string,
    action: string,
    message: string,
    level: 'info' | 'warn' | 'error' | 'debug' = 'info',
    metadata?: Record<string, unknown>
  ): void {
    const event: MonitoringEvent = {
      category,
      action,
      level,
      message,
      metadata,
      timestamp: new Date().toISOString(),
    };

    this.eventQueue.push(event);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const logMethod =
        level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[logMethod](`[${category}] ${action}: ${message}`, metadata);
    }

    // Flush immediately for errors
    if (level === 'error') {
      this.flushQueues();
    }
  }

  /**
   * Track performance metric
   */
  static trackMetric(
    name: string,
    value: number,
    unit: string,
    category: string,
    metadata?: Record<string, unknown>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      category,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.metricQueue.push(metric);

    // Flush if queue is getting large
    if (this.metricQueue.length >= this.MAX_BATCH_SIZE) {
      this.flushQueues();
    }
  }

  /**
   * Report an error
   */
  static reportError(
    error: Error | string,
    context: string,
    metadata?: Record<string, unknown>
  ): void {
    const errorReport: ErrorReport = {
      error,
      context,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.errorQueue.push(errorReport);

    // Log to console
    console.error(`[ERROR] ${context}:`, error, metadata);

    // Flush immediately for errors
    this.flushQueues();
  }

  /**
   * Track user action
   */
  static trackUserAction(
    action: string,
    category: string,
    metadata?: Record<string, unknown>
  ): void {
    this.logEvent(
      category,
      action,
      `User performed ${action}`,
      'info',
      metadata
    );
  }

  /**
   * Track API call
   */
  static trackApiCall(
    endpoint: string,
    method: string,
    duration: number,
    status: number,
    metadata?: Record<string, unknown>
  ): void {
    this.trackMetric('api_call_duration', duration, 'ms', 'api', {
      endpoint,
      method,
      status,
      ...metadata,
    });

    // Log slow API calls
    if (duration > 1000) {
      this.logEvent(
        'api',
        'slow_request',
        `Slow API call: ${method} ${endpoint} took ${duration}ms`,
        'warn',
        { endpoint, method, duration, status, ...metadata }
      );
    }

    // Log failed API calls
    if (status >= 400) {
      this.logEvent(
        'api',
        'failed_request',
        `Failed API call: ${method} ${endpoint} returned ${status}`,
        'error',
        { endpoint, method, status, ...metadata }
      );
    }
  }

  /**
   * Track page view
   */
  static trackPageView(page: string, metadata?: Record<string, unknown>): void {
    this.logEvent('navigation', 'page_view', `User viewed ${page}`, 'info', {
      page,
      ...metadata,
    });
  }

  /**
   * Track feature usage
   */
  static trackFeatureUsage(
    feature: string,
    action: string,
    metadata?: Record<string, unknown>
  ): void {
    this.logEvent('feature', action, `Feature used: ${feature}`, 'info', {
      feature,
      ...metadata,
    });
  }

  /**
   * Flush all queues to Supabase
   */
  private static async flushQueues(): Promise<void> {
    try {
      // Check if Supabase is configured before flushing
      if (!isSupabaseConfigured()) {
        console.warn(
          '⚠️ Supabase not configured, skipping monitoring queue flush'
        );
        return;
      }

      // Flush events
      if (this.eventQueue.length > 0) {
        await this.flushEvents();
      }

      // Flush metrics
      if (this.metricQueue.length > 0) {
        await this.flushMetrics();
      }

      // Flush errors
      if (this.errorQueue.length > 0) {
        await this.flushErrors();
      }
    } catch (error) {
      console.error('Failed to flush monitoring queues:', error);
    }
  }

  /**
   * Flush events to Supabase
   */
  private static async flushEvents(): Promise<void> {
    const events = this.eventQueue.splice(0, this.MAX_BATCH_SIZE);

    // TEMPORARY: Disable database inserts to prevent created_by field error
    // TODO: Investigate why created_by field is being expected
    console.log(
      '📊 Monitoring: Would flush',
      events.length,
      'events (disabled for debugging)'
    );

    // Get current user and facility info (for logging)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let facilityId: string | null = null;

    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();
      facilityId = (userData?.facility_id as string) || null;
    }

    console.log('📊 Monitoring: User context:', {
      userId: user?.id,
      facilityId,
      eventsQueued: this.eventQueue.length,
    });

    // TEMPORARY: Comment out the problematic insert
    /*
    const { error } = await supabase.from('monitoring_events').insert(
      events.map((event) => ({
        category: event.category,
        action: event.action,
        level: event.level,
        message: event.message,
        metadata: event.metadata as Record<string, unknown>, // Cast to Json type
        user_id: user?.id || null,
        facility_id: facilityId,
        created_at: event.timestamp,
      }))
    );

    if (error) {
      console.error('Failed to flush monitoring events:', error);
      // Put events back in queue for retry
      this.eventQueue.unshift(...events);
    }
    */
  }

  /**
   * Flush metrics to Supabase
   */
  private static async flushMetrics(): Promise<void> {
    const metrics = this.metricQueue.splice(0, this.MAX_BATCH_SIZE);

    // Get current user and facility info
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let facilityId: string | null = null;

    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();
      facilityId = (userData?.facility_id as string) || null;
    }

    const { error } = await supabase
      .from('monitoring_performance_metrics')
      .insert(
        metrics.map((metric) => ({
          metric_name: metric.name,
          metric_value: metric.value,
          facility_id: facilityId || 'default', // Required field
          created_at: metric.timestamp,
        }))
      );

    if (error) {
      console.error('Failed to flush performance metrics:', error);
      // Put metrics back in queue for retry
      this.metricQueue.unshift(...metrics);
    }
  }

  /**
   * Flush errors to Supabase
   */
  private static async flushErrors(): Promise<void> {
    const errors = this.errorQueue.splice(0, this.MAX_BATCH_SIZE);

    // Get current user and facility info
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let facilityId: string | null = null;

    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();
      facilityId = (userData?.facility_id as string) || null;
    }

    const { error } = await supabase.from('error_reports').insert(
      errors.map((errorReport) => ({
        error_message:
          errorReport.error instanceof Error
            ? errorReport.error.message
            : errorReport.error,
        error_stack:
          errorReport.error instanceof Error
            ? errorReport.error.stack
            : undefined,
        context: errorReport.context,
        user_agent: errorReport.userAgent,
        metadata: errorReport.metadata as Record<string, unknown>, // Cast to Json type
        user_id: user?.id || null,
        facility_id: facilityId,
        created_at: errorReport.timestamp,
      }))
    );

    if (error) {
      console.error('Failed to flush error reports:', error);
      // Put errors back in queue for retry
      this.errorQueue.unshift(...errors);
    }
  }

  /**
   * Set up global error handlers
   */
  private static setupErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(
        event.reason as Error | string,
        'unhandled_promise_rejection',
        {
          promise: event.promise,
        }
      );
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError(
        (event.error as Error) || new Error(event.message),
        'javascript_error',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      );
    });
  }

  /**
   * Cleanup monitoring service
   */
  static cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    // Flush remaining data
    this.flushQueues();
  }
}

// Export convenience functions
export const logEvent = MonitoringService.logEvent.bind(MonitoringService);
export const trackMetric =
  MonitoringService.trackMetric.bind(MonitoringService);
export const reportError =
  MonitoringService.reportError.bind(MonitoringService);
export const trackUserAction =
  MonitoringService.trackUserAction.bind(MonitoringService);
export const trackApiCall =
  MonitoringService.trackApiCall.bind(MonitoringService);
export const trackPageView =
  MonitoringService.trackPageView.bind(MonitoringService);
export const trackFeatureUsage =
  MonitoringService.trackFeatureUsage.bind(MonitoringService);

// Initialize monitoring service when module is loaded
if (typeof window !== 'undefined') {
  MonitoringService.initialize();
}
