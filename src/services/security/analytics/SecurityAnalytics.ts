import {
  SecurityEvent,
  SecurityViolation,
  ComplianceReport,
  SecurityEventFilter,
} from '../types/securityTypes';

export class SecurityAnalytics {
  /**
   * Generate compliance report
   */
  generateComplianceReport(
    events: SecurityEvent[],
    violations: SecurityViolation[],
    startDate: Date,
    endDate: Date
  ): ComplianceReport {
    // Calculate statistics
    const eventsByType = events.reduce(
      (acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const eventsBySeverity = events.reduce(
      (acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const violationsByType = violations.reduce(
      (acc, violation) => {
        acc[violation.violationType] = (acc[violation.violationType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Top users by event count
    const userEventCounts = events.reduce(
      (acc, event) => {
        if (event.userId) {
          acc[event.userId] = (acc[event.userId] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const topUsers = Object.entries(userEventCounts)
      .map(([userId, eventCount]) => ({
        userId,
        eventCount,
        violationCount: violations.filter((v) => v.userId === userId).length,
      }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    // Top resources by access count
    const resourceAccessCounts = events.reduce(
      (acc, event) => {
        if (event.resource) {
          acc[event.resource] = (acc[event.resource] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const topResources = Object.entries(resourceAccessCounts)
      .map(([resource, accessCount]) => ({
        resource,
        accessCount,
      }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);

    return {
      period: { start: startDate, end: endDate },
      totalEvents: events.length,
      securityViolations: violations.length,
      dataAccessEvents: eventsByType.data_access || 0,
      authenticationEvents: eventsByType.authentication || 0,
      authorizationEvents: eventsByType.authorization || 0,
      systemAccessEvents: eventsByType.system_access || 0,
      dataModificationEvents: eventsByType.data_modification || 0,
      violationsByType,
      eventsBySeverity,
      topUsers,
      topResources,
    };
  }

  /**
   * Filter security events
   */
  filterSecurityEvents(
    events: SecurityEvent[],
    filter: SecurityEventFilter
  ): SecurityEvent[] {
    let filteredEvents = [...events];

    if (filter.eventType && filter.eventType.length > 0) {
      filteredEvents = filteredEvents.filter((e) =>
        filter.eventType!.includes(e.eventType)
      );
    }

    if (filter.severity && filter.severity.length > 0) {
      filteredEvents = filteredEvents.filter((e) =>
        filter.severity!.includes(e.severity)
      );
    }

    if (filter.userId) {
      filteredEvents = filteredEvents.filter((e) => e.userId === filter.userId);
    }

    if (filter.facilityId) {
      filteredEvents = filteredEvents.filter(
        (e) => e.facilityId === filter.facilityId
      );
    }

    if (filter.startDate) {
      filteredEvents = filteredEvents.filter(
        (e) => e.timestamp >= filter.startDate!
      );
    }

    if (filter.endDate) {
      filteredEvents = filteredEvents.filter(
        (e) => e.timestamp <= filter.endDate!
      );
    }

    if (filter.limit) {
      filteredEvents = filteredEvents.slice(-filter.limit);
    }

    return filteredEvents.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get event statistics
   */
  getEventStatistics(events: SecurityEvent[]): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    eventsByResult: Record<string, number>;
  } {
    const eventsByType = events.reduce(
      (acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const eventsBySeverity = events.reduce(
      (acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const eventsByResult = events.reduce(
      (acc, event) => {
        acc[event.result] = (acc[event.result] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalEvents: events.length,
      eventsByType,
      eventsBySeverity,
      eventsByResult,
    };
  }
}
