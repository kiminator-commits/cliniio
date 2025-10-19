export interface TrackingAnalyticsEvent {
  id: string;
  eventType:
    | 'track_started'
    | 'track_stopped'
    | 'tool_available'
    | 'tool_claimed'
    | 'queue_position_changed';
  toolId: string;
  toolName: string;
  doctorName: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  metadata?: {
    queuePosition?: number;
    totalInQueue?: number;
    waitTime?: number; // in minutes
    previousPosition?: number;
  };
}

export interface TrackingAnalyticsSummary {
  totalTrackingEvents: number;
  uniqueToolsTracked: number;
  uniqueUsersTracking: number;
  averageQueueWaitTime: number; // in minutes
  mostTrackedTools: Array<{
    toolId: string;
    toolName: string;
    trackingCount: number;
  }>;
  trackingByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  trackingByHour: Array<{
    hour: number;
    count: number;
  }>;
  trackingByDay: Array<{
    date: string;
    count: number;
  }>;
}

class TrackingAnalyticsService {
  private events: TrackingAnalyticsEvent[] = [];
  private readonly MAX_EVENTS = 10000; // Keep last 10k events in memory

  /**
   * Record a tracking analytics event
   */
  recordEvent(event: Omit<TrackingAnalyticsEvent, 'id' | 'timestamp'>): void {
    const analyticsEvent: TrackingAnalyticsEvent = {
      ...event,
      id: `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.events.push(analyticsEvent);

    // Keep only the most recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Send to external analytics service (PostHog, Mixpanel, etc.)
    // This enables external analytics integration for business intelligence
    this.sendToExternalAnalytics(analyticsEvent);
    console.log('📊 Analytics Event:', analyticsEvent);
  }

  /**
   * Send analytics event to external service
   * Currently logs to console, can be extended to send to PostHog, Mixpanel, etc.
   */
  private sendToExternalAnalytics(event: TrackingAnalyticsEvent): void {
    try {
      // For now, just log the event
      // In production, this would send to external analytics service
      console.log('📈 External Analytics:', {
        service: 'tracking_analytics',
        eventType: event.eventType,
        toolId: event.toolId,
        doctorName: event.doctorName,
        timestamp: event.timestamp,
      });
      
      // Future implementation would look like:
      // await posthog.capture(event.doctorName, event.eventType, {
      //   toolId: event.toolId,
      //   toolName: event.toolName,
      //   priority: event.priority,
      //   ...event.metadata
      // });
    } catch (error) {
      console.warn('Failed to send to external analytics:', error);
    }
  }

  /**
   * Record when a user starts tracking a tool
   */
  recordTrackStarted(
    toolId: string,
    toolName: string,
    doctorName: string,
    priority: 'high' | 'medium' | 'low',
    queuePosition?: number,
    totalInQueue?: number
  ): void {
    this.recordEvent({
      eventType: 'track_started',
      toolId,
      toolName,
      doctorName,
      priority,
      metadata: {
        queuePosition,
        totalInQueue,
      },
    });
  }

  /**
   * Record when a user stops tracking a tool
   */
  recordTrackStopped(
    toolId: string,
    toolName: string,
    doctorName: string,
    priority: 'high' | 'medium' | 'low',
    waitTime?: number
  ): void {
    this.recordEvent({
      eventType: 'track_stopped',
      toolId,
      toolName,
      doctorName,
      priority,
      metadata: {
        waitTime,
      },
    });
  }

  /**
   * Record when a tool becomes available
   */
  recordToolAvailable(
    toolId: string,
    toolName: string,
    doctorName: string,
    priority: 'high' | 'medium' | 'low',
    waitTime?: number
  ): void {
    this.recordEvent({
      eventType: 'tool_available',
      toolId,
      toolName,
      doctorName,
      priority,
      metadata: {
        waitTime,
      },
    });
  }

  /**
   * Record when a tool is claimed
   */
  recordToolClaimed(
    toolId: string,
    toolName: string,
    doctorName: string,
    priority: 'high' | 'medium' | 'low',
    waitTime?: number
  ): void {
    this.recordEvent({
      eventType: 'tool_claimed',
      toolId,
      toolName,
      doctorName,
      priority,
      metadata: {
        waitTime,
      },
    });
  }

  /**
   * Record when queue position changes
   */
  recordQueuePositionChanged(
    toolId: string,
    toolName: string,
    doctorName: string,
    priority: 'high' | 'medium' | 'low',
    newPosition: number,
    previousPosition: number,
    totalInQueue: number
  ): void {
    this.recordEvent({
      eventType: 'queue_position_changed',
      toolId,
      toolName,
      doctorName,
      priority,
      metadata: {
        queuePosition: newPosition,
        totalInQueue,
        previousPosition,
      },
    });
  }

  /**
   * Get analytics summary for the intelligence page
   */
  getAnalyticsSummary(timeRange?: {
    start: Date;
    end: Date;
  }): TrackingAnalyticsSummary {
    let filteredEvents = this.events;

    // Filter by time range if provided
    if (timeRange) {
      filteredEvents = this.events.filter((event) => {
        const eventTime = new Date(event.timestamp);
        return eventTime >= timeRange.start && eventTime <= timeRange.end;
      });
    }

    // Calculate metrics
    const totalTrackingEvents = filteredEvents.length;

    const uniqueToolsTracked = new Set(filteredEvents.map((e) => e.toolId))
      .size;
    const uniqueUsersTracking = new Set(filteredEvents.map((e) => e.doctorName))
      .size;

    // Calculate average wait time
    const waitTimeEvents = filteredEvents.filter((e) => e.metadata?.waitTime);
    const averageQueueWaitTime =
      waitTimeEvents.length > 0
        ? waitTimeEvents.reduce(
            (sum, e) => sum + (e.metadata?.waitTime || 0),
            0
          ) / waitTimeEvents.length
        : 0;

    // Most tracked tools
    const toolTrackingCounts = new Map<
      string,
      { toolName: string; count: number }
    >();
    filteredEvents.forEach((event) => {
      if (event.eventType === 'track_started') {
        const existing = toolTrackingCounts.get(event.toolId) || {
          toolName: event.toolName,
          count: 0,
        };
        existing.count++;
        toolTrackingCounts.set(event.toolId, existing);
      }
    });

    const mostTrackedTools = Array.from(toolTrackingCounts.entries())
      .map(([toolId, data]) => ({
        toolId,
        toolName: data.toolName,
        trackingCount: data.count,
      }))
      .sort((a, b) => b.trackingCount - a.trackingCount)
      .slice(0, 10);

    // Tracking by priority
    const trackingByPriority = {
      high: filteredEvents.filter((e) => e.priority === 'high').length,
      medium: filteredEvents.filter((e) => e.priority === 'medium').length,
      low: filteredEvents.filter((e) => e.priority === 'low').length,
    };

    // Tracking by hour (0-23)
    const trackingByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: filteredEvents.filter(
        (e) => new Date(e.timestamp).getHours() === hour
      ).length,
    }));

    // Tracking by day (last 30 days)
    const trackingByDay = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      return {
        date: dateStr,
        count: filteredEvents.filter(
          (e) => e.timestamp.split('T')[0] === dateStr
        ).length,
      };
    }).reverse();

    return {
      totalTrackingEvents,
      uniqueToolsTracked,
      uniqueUsersTracking,
      averageQueueWaitTime,
      mostTrackedTools,
      trackingByPriority,
      trackingByHour,
      trackingByDay,
    };
  }

  /**
   * Get events for a specific tool
   */
  getToolAnalytics(toolId: string): TrackingAnalyticsEvent[] {
    return this.events.filter((event) => event.toolId === toolId);
  }

  /**
   * Get events for a specific user
   */
  getUserAnalytics(doctorName: string): TrackingAnalyticsEvent[] {
    return this.events.filter((event) => event.doctorName === doctorName);
  }

  /**
   * Clear old events (for memory management)
   */
  clearOldEvents(olderThanDays: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    this.events = this.events.filter(
      (event) => new Date(event.timestamp) > cutoffDate
    );
  }
}

export const trackingAnalyticsService = new TrackingAnalyticsService();
