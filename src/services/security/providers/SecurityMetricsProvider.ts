import { ThreatIndicator } from './SecurityThreatIndicatorProvider';
import { SecurityIncident } from './SecurityIncidentProvider';

export interface SecurityMetrics {
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  incidentsBySeverity: Record<string, number>;
  incidentsByStatus: Record<string, number>;
  topThreatIndicators: Array<{
    indicatorId: string;
    name: string;
    triggerCount: number;
  }>;
  averageResolutionTime: number; // hours
  threatDetectionRate: number; // incidents per day
}

export interface SecurityTrends {
  incidentTrend: Array<{
    date: string;
    count: number;
  }>;
  severityTrend: Array<{
    date: string;
    low: number;
    medium: number;
    high: number;
    critical: number;
  }>;
  resolutionTrend: Array<{
    date: string;
    resolved: number;
    open: number;
  }>;
}

export interface SecurityDashboard {
  overview: SecurityMetrics;
  trends: SecurityTrends;
  alerts: Array<{
    type: 'high_severity' | 'unresolved' | 'escalation_needed';
    message: string;
    count: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  recommendations: Array<{
    type: 'threat_indicator' | 'incident_response' | 'monitoring';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

export class SecurityMetricsProvider {
  /**
   * Get security metrics
   */
  getSecurityMetrics(
    incidents: SecurityIncident[],
    threatIndicators: ThreatIndicator[],
    timeRange?: { start: Date; end: Date }
  ): SecurityMetrics {
    let filteredIncidents = incidents;

    if (timeRange) {
      filteredIncidents = incidents.filter(
        (incident) =>
          incident.detectedAt >= timeRange.start &&
          incident.detectedAt <= timeRange.end
      );
    }

    const totalIncidents = filteredIncidents.length;
    const openIncidents = filteredIncidents.filter(
      (i) => i.status === 'open' || i.status === 'investigating'
    ).length;
    const resolvedIncidents = filteredIncidents.filter(
      (i) => i.status === 'resolved'
    ).length;

    const incidentsBySeverity = filteredIncidents.reduce(
      (acc, incident) => {
        acc[incident.severity] = (acc[incident.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const incidentsByStatus = filteredIncidents.reduce(
      (acc, incident) => {
        acc[incident.status] = (acc[incident.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Top threat indicators
    const indicatorCounts = new Map<string, number>();
    filteredIncidents.forEach((incident) => {
      const count = indicatorCounts.get(incident.threatIndicatorId) || 0;
      indicatorCounts.set(incident.threatIndicatorId, count + 1);
    });

    const topThreatIndicators = Array.from(indicatorCounts.entries())
      .map(([indicatorId, count]) => {
        const indicator = threatIndicators.find((ti) => ti.id === indicatorId);
        return {
          indicatorId,
          name: indicator?.name || 'Unknown',
          triggerCount: count,
        };
      })
      .sort((a, b) => b.triggerCount - a.triggerCount)
      .slice(0, 5);

    // Average resolution time
    const resolvedIncidentsWithTime = filteredIncidents.filter(
      (i) => i.status === 'resolved' && i.resolvedAt
    );

    const averageResolutionTime =
      resolvedIncidentsWithTime.length > 0
        ? resolvedIncidentsWithTime.reduce((sum, incident) => {
            const resolutionTime =
              incident.resolvedAt!.getTime() - incident.detectedAt.getTime();
            return sum + resolutionTime / (1000 * 60 * 60); // Convert to hours
          }, 0) / resolvedIncidentsWithTime.length
        : 0;

    // Threat detection rate (incidents per day)
    const days = timeRange
      ? (timeRange.end.getTime() - timeRange.start.getTime()) /
        (1000 * 60 * 60 * 24)
      : 1;
    const threatDetectionRate = totalIncidents / days;

    return {
      totalIncidents,
      openIncidents,
      resolvedIncidents,
      incidentsBySeverity,
      incidentsByStatus,
      topThreatIndicators,
      averageResolutionTime,
      threatDetectionRate,
    };
  }

  /**
   * Get security trends
   */
  getSecurityTrends(
    incidents: SecurityIncident[],
    days: number = 30
  ): SecurityTrends {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const incidentTrend: Array<{ date: string; count: number }> = [];
    const severityTrend: Array<{
      date: string;
      low: number;
      medium: number;
      high: number;
      critical: number;
    }> = [];
    const resolutionTrend: Array<{
      date: string;
      resolved: number;
      open: number;
    }> = [];

    // Generate daily data points
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      // Count incidents for this day
      const dayIncidents = incidents.filter(
        (incident) =>
          incident.detectedAt >= date &&
          incident.detectedAt < new Date(date.getTime() + 24 * 60 * 60 * 1000)
      );

      incidentTrend.push({
        date: dateStr,
        count: dayIncidents.length,
      });

      // Count by severity
      const severityCounts = dayIncidents.reduce(
        (acc, incident) => {
          acc[incident.severity] = (acc[incident.severity] || 0) + 1;
          return acc;
        },
        { low: 0, medium: 0, high: 0, critical: 0 }
      );

      severityTrend.push({
        date: dateStr,
        low: severityCounts.low || 0,
        medium: severityCounts.medium || 0,
        high: severityCounts.high || 0,
        critical: severityCounts.critical || 0,
      });

      // Count by resolution status
      const resolvedCount = dayIncidents.filter(
        (incident) => incident.status === 'resolved'
      ).length;
      const openCount = dayIncidents.filter(
        (incident) => incident.status !== 'resolved' && incident.status !== 'false_positive'
      ).length;

      resolutionTrend.push({
        date: dateStr,
        resolved: resolvedCount,
        open: openCount,
      });
    }

    return {
      incidentTrend,
      severityTrend,
      resolutionTrend,
    };
  }

  /**
   * Get security dashboard data
   */
  getSecurityDashboard(
    incidents: SecurityIncident[],
    threatIndicators: ThreatIndicator[]
  ): SecurityDashboard {
    const overview = this.getSecurityMetrics(incidents, threatIndicators);
    const trends = this.getSecurityTrends(incidents);

    // Generate alerts
    const alerts = this.generateSecurityAlerts(incidents, threatIndicators);

    // Generate recommendations
    const recommendations = this.generateSecurityRecommendations(
      incidents,
      threatIndicators,
      overview
    );

    return {
      overview,
      trends,
      alerts,
      recommendations,
    };
  }

  /**
   * Generate security alerts
   */
  private generateSecurityAlerts(
    incidents: SecurityIncident[],
    _threatIndicators: ThreatIndicator[]
  ): Array<{
    type: 'high_severity' | 'unresolved' | 'escalation_needed';
    message: string;
    count: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const alerts: Array<{
      type: 'high_severity' | 'unresolved' | 'escalation_needed';
      message: string;
      count: number;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }> = [];

    // High severity incidents
    const highSeverityIncidents = incidents.filter(
      (incident) => incident.severity === 'critical' || incident.severity === 'high'
    );
    if (highSeverityIncidents.length > 0) {
      alerts.push({
        type: 'high_severity',
        message: `${highSeverityIncidents.length} high/critical severity incidents`,
        count: highSeverityIncidents.length,
        severity: 'high',
      });
    }

    // Unresolved incidents
    const unresolvedIncidents = incidents.filter(
      (incident) => incident.status !== 'resolved' && incident.status !== 'false_positive'
    );
    if (unresolvedIncidents.length > 5) {
      alerts.push({
        type: 'unresolved',
        message: `${unresolvedIncidents.length} unresolved incidents`,
        count: unresolvedIncidents.length,
        severity: 'medium',
      });
    }

    // Escalation needed
    const oldIncidents = incidents.filter(
      (incident) =>
        incident.status === 'open' &&
        Date.now() - incident.detectedAt.getTime() > 24 * 60 * 60 * 1000 // 24 hours
    );
    if (oldIncidents.length > 0) {
      alerts.push({
        type: 'escalation_needed',
        message: `${oldIncidents.length} incidents need escalation`,
        count: oldIncidents.length,
        severity: 'high',
      });
    }

    return alerts;
  }

  /**
   * Generate security recommendations
   */
  private generateSecurityRecommendations(
    incidents: SecurityIncident[],
    threatIndicators: ThreatIndicator[],
    metrics: SecurityMetrics
  ): Array<{
    type: 'threat_indicator' | 'incident_response' | 'monitoring';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }> {
    const recommendations: Array<{
      type: 'threat_indicator' | 'incident_response' | 'monitoring';
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
    }> = [];

    // High resolution time recommendation
    if (metrics.averageResolutionTime > 24) {
      recommendations.push({
        type: 'incident_response',
        title: 'Improve Incident Response Time',
        description: `Average resolution time is ${metrics.averageResolutionTime.toFixed(1)} hours. Consider improving response procedures.`,
        priority: 'high',
      });
    }

    // High detection rate recommendation
    if (metrics.threatDetectionRate > 10) {
      recommendations.push({
        type: 'monitoring',
        title: 'High Threat Detection Rate',
        description: `Detection rate is ${metrics.threatDetectionRate.toFixed(1)} incidents per day. Review threat indicators for false positives.`,
        priority: 'medium',
      });
    }

    // Disabled threat indicators
    const disabledIndicators = threatIndicators.filter((ti) => !ti.enabled);
    if (disabledIndicators.length > 0) {
      recommendations.push({
        type: 'threat_indicator',
        title: 'Review Disabled Threat Indicators',
        description: `${disabledIndicators.length} threat indicators are disabled. Review if they should be re-enabled.`,
        priority: 'low',
      });
    }

    // Unused threat indicators
    const unusedIndicators = threatIndicators.filter((ti) => ti.triggerCount === 0);
    if (unusedIndicators.length > 5) {
      recommendations.push({
        type: 'threat_indicator',
        title: 'Review Unused Threat Indicators',
        description: `${unusedIndicators.length} threat indicators have never triggered. Consider updating or removing them.`,
        priority: 'low',
      });
    }

    return recommendations;
  }

  /**
   * Get threat indicator performance metrics
   */
  getThreatIndicatorMetrics(threatIndicators: ThreatIndicator[]): {
    total: number;
    enabled: number;
    disabled: number;
    triggered: number;
    neverTriggered: number;
    averageTriggers: number;
    topPerformers: Array<{
      id: string;
      name: string;
      triggerCount: number;
      type: string;
    }>;
  } {
    const total = threatIndicators.length;
    const enabled = threatIndicators.filter((ti) => ti.enabled).length;
    const disabled = total - enabled;
    const triggered = threatIndicators.filter((ti) => ti.triggerCount > 0).length;
    const neverTriggered = total - triggered;

    const totalTriggers = threatIndicators.reduce(
      (sum, ti) => sum + ti.triggerCount,
      0
    );
    const averageTriggers = total > 0 ? totalTriggers / total : 0;

    const topPerformers = threatIndicators
      .sort((a, b) => b.triggerCount - a.triggerCount)
      .slice(0, 5)
      .map((ti) => ({
        id: ti.id,
        name: ti.name,
        triggerCount: ti.triggerCount,
        type: ti.type,
      }));

    return {
      total,
      enabled,
      disabled,
      triggered,
      neverTriggered,
      averageTriggers,
      topPerformers,
    };
  }

  /**
   * Get incident response metrics
   */
  getIncidentResponseMetrics(incidents: SecurityIncident[]): {
    totalIncidents: number;
    averageResolutionTime: number; // hours
    resolutionRate: number; // percentage
    escalationRate: number; // percentage
    falsePositiveRate: number; // percentage
    responseTimeBySeverity: Record<string, number>; // hours
  } {
    const totalIncidents = incidents.length;
    const resolvedIncidents = incidents.filter((i) => i.status === 'resolved');
    const falsePositiveIncidents = incidents.filter((i) => i.status === 'false_positive');

    // Average resolution time
    const resolvedWithTime = resolvedIncidents.filter((i) => i.resolvedAt);
    const averageResolutionTime =
      resolvedWithTime.length > 0
        ? resolvedWithTime.reduce((sum, incident) => {
            const resolutionTime =
              incident.resolvedAt!.getTime() - incident.detectedAt.getTime();
            return sum + resolutionTime / (1000 * 60 * 60); // Convert to hours
          }, 0) / resolvedWithTime.length
        : 0;

    // Resolution rate
    const resolutionRate = totalIncidents > 0 ? (resolvedIncidents.length / totalIncidents) * 100 : 0;

    // Escalation rate (incidents that took more than 24 hours to resolve)
    const escalatedIncidents = resolvedWithTime.filter(
      (i) => i.resolvedAt!.getTime() - i.detectedAt.getTime() > 24 * 60 * 60 * 1000
    );
    const escalationRate = resolvedWithTime.length > 0 ? (escalatedIncidents.length / resolvedWithTime.length) * 100 : 0;

    // False positive rate
    const falsePositiveRate = totalIncidents > 0 ? (falsePositiveIncidents.length / totalIncidents) * 100 : 0;

    // Response time by severity
    const responseTimeBySeverity: Record<string, number> = {};
    ['low', 'medium', 'high', 'critical'].forEach((severity) => {
      const severityIncidents = resolvedWithTime.filter((i) => i.severity === severity);
      if (severityIncidents.length > 0) {
        responseTimeBySeverity[severity] = severityIncidents.reduce((sum, incident) => {
          const resolutionTime =
            incident.resolvedAt!.getTime() - incident.detectedAt.getTime();
          return sum + resolutionTime / (1000 * 60 * 60); // Convert to hours
        }, 0) / severityIncidents.length;
      } else {
        responseTimeBySeverity[severity] = 0;
      }
    });

    return {
      totalIncidents,
      averageResolutionTime,
      resolutionRate,
      escalationRate,
      falsePositiveRate,
      responseTimeBySeverity,
    };
  }

  /**
   * Export security metrics
   */
  exportSecurityMetrics(
    incidents: SecurityIncident[],
    threatIndicators: ThreatIndicator[],
    format: 'json' | 'csv' = 'json'
  ): string {
    const metrics = this.getSecurityMetrics(incidents, threatIndicators);
    const trends = this.getSecurityTrends(incidents);
    const threatMetrics = this.getThreatIndicatorMetrics(threatIndicators);
    const responseMetrics = this.getIncidentResponseMetrics(incidents);

    const data = {
      metrics,
      trends,
      threatMetrics,
      responseMetrics,
      exportedAt: new Date().toISOString(),
    };

    if (format === 'csv') {
      // Convert to CSV format (simplified)
      return `Metric,Value\nTotal Incidents,${metrics.totalIncidents}\nOpen Incidents,${metrics.openIncidents}\nResolved Incidents,${metrics.resolvedIncidents}\nAverage Resolution Time,${metrics.averageResolutionTime}\nThreat Detection Rate,${metrics.threatDetectionRate}`;
    }

    return JSON.stringify(data, null, 2);
  }
}
