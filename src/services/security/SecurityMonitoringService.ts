// import { logger } from '../../utils/_core/logger';
import { SecurityThreatIndicatorProvider, ThreatIndicator, ThreatCondition, ThreatAction } from './providers/SecurityThreatIndicatorProvider';
import { SecurityIncidentProvider, SecurityIncident } from './providers/SecurityIncidentProvider';
import { SecurityMonitoringProvider } from './providers/SecurityMonitoringProvider';
import { SecurityMetricsProvider, SecurityMetrics } from './providers/SecurityMetricsProvider';
import { SecurityActionProvider } from './providers/SecurityActionProvider';

// Re-export interfaces for backward compatibility
export type { ThreatIndicator, ThreatCondition, ThreatAction, SecurityIncident, SecurityMetrics };

export class SecurityMonitoringService {
  private static instance: SecurityMonitoringService;
  
  // Provider instances
  private threatIndicatorProvider: SecurityThreatIndicatorProvider;
  private incidentProvider: SecurityIncidentProvider;
  private monitoringProvider: SecurityMonitoringProvider;
  private metricsProvider: SecurityMetricsProvider;
  private actionProvider: SecurityActionProvider;

  private constructor() {
    // Initialize providers
    this.threatIndicatorProvider = new SecurityThreatIndicatorProvider();
    this.incidentProvider = new SecurityIncidentProvider();
    this.monitoringProvider = new SecurityMonitoringProvider();
    this.metricsProvider = new SecurityMetricsProvider();
    this.actionProvider = new SecurityActionProvider();
    
    // Start monitoring
    this.monitoringProvider.startMonitoring();
  }

  static getInstance(): SecurityMonitoringService {
    if (!SecurityMonitoringService.instance) {
      SecurityMonitoringService.instance = new SecurityMonitoringService();
    }
    return SecurityMonitoringService.instance;
  }

  /**
   * Add threat indicator
   */
  addThreatIndicator(
    indicator: Omit<ThreatIndicator, 'id' | 'triggerCount'>
  ): ThreatIndicator {
    return this.threatIndicatorProvider.addThreatIndicator(indicator);
  }

  /**
   * Update threat indicator
   */
  updateThreatIndicator(
    indicatorId: string,
    updates: Partial<ThreatIndicator>
  ): void {
    this.threatIndicatorProvider.updateThreatIndicator(indicatorId, updates);
  }

  /**
   * Remove threat indicator
   */
  removeThreatIndicator(indicatorId: string): void {
    this.threatIndicatorProvider.removeThreatIndicator(indicatorId);
  }

  /**
   * Get all threat indicators
   */
  getAllThreatIndicators(): ThreatIndicator[] {
    return this.threatIndicatorProvider.getAllThreatIndicators();
  }

  /**
   * Get active incidents
   */
  getActiveIncidents(): SecurityIncident[] {
    return this.incidentProvider.getActiveIncidents();
  }

  /**
   * Get all incidents
   */
  getAllIncidents(): SecurityIncident[] {
    return this.incidentProvider.getAllIncidents();
  }

  /**
   * Create security incident
   */
  createIncident(
    title: string,
    description: string,
    severity: SecurityIncident['severity'],
    threatIndicatorId: string,
    evidence: Record<string, unknown>,
    userId?: string,
    facilityId?: string,
    ipAddress?: string
  ): SecurityIncident {
    return this.incidentProvider.createIncident(
      title,
      description,
      severity,
      threatIndicatorId,
      evidence,
      userId,
      facilityId,
      ipAddress
    );
  }

  /**
   * Update incident status
   */
  updateIncidentStatus(
    incidentId: string,
    status: SecurityIncident['status'],
    updatedBy: string,
    resolution?: string
  ): void {
    this.incidentProvider.updateIncidentStatus(incidentId, status, updatedBy, resolution);
  }

  /**
   * Assign incident
   */
  assignIncident(incidentId: string, assignedTo: string): void {
    this.incidentProvider.assignIncident(incidentId, assignedTo);
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics(timeRange?: { start: Date; end: Date }): SecurityMetrics {
    const incidents = this.incidentProvider.getAllIncidents();
    const threatIndicators = this.threatIndicatorProvider.getAllThreatIndicators();
    return this.metricsProvider.getSecurityMetrics(incidents, threatIndicators, timeRange);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.monitoringProvider.stopMonitoring();
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus(): {
    isActive: boolean;
    interval: number;
    nextCheck?: Date;
  } {
    return this.monitoringProvider.getMonitoringStatus();
  }

  /**
   * Get security dashboard
   */
  getSecurityDashboard(): {
    overview: SecurityMetrics;
    trends: Record<string, unknown>;
    alerts: unknown[];
    recommendations: unknown[];
  } {
    const incidents = this.incidentProvider.getAllIncidents();
    const threatIndicators = this.threatIndicatorProvider.getAllThreatIndicators();
    return this.metricsProvider.getSecurityDashboard(incidents, threatIndicators);
  }

  /**
   * Get threat indicator statistics
   */
  getThreatIndicatorStats(): {
    total: number;
    enabled: number;
    disabled: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    topTriggered: Array<{
      id: string;
      name: string;
      triggerCount: number;
    }>;
  } {
    return this.threatIndicatorProvider.getThreatIndicatorStats();
  }

  /**
   * Get incident statistics
   */
  getIncidentStats(timeRange?: { start: Date; end: Date }): {
    total: number;
    open: number;
    investigating: number;
    contained: number;
    resolved: number;
    falsePositive: number;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    averageResolutionTime: number;
    topThreatIndicators: Array<{
      threatIndicatorId: string;
      count: number;
    }>;
  } {
    return this.incidentProvider.getIncidentStats(timeRange);
  }

  /**
   * Test threat indicator
   */
  testThreatIndicator(
    indicator: ThreatIndicator,
    testEvents: unknown[]
  ): {
    matches: number;
    wouldTrigger: boolean;
    matchingEvents: unknown[];
    evaluationDetails: Array<{
      condition: ThreatCondition;
      passed: boolean;
      eventValue: unknown;
    }>;
  } {
    return this.monitoringProvider.testThreatIndicator(indicator, testEvents);
  }

  /**
   * Execute threat action
   */
  async executeThreatAction(
    action: ThreatAction,
    incident: SecurityIncident
  ): Promise<{
    success: boolean;
    message: string;
    details?: Record<string, unknown>;
    error?: string;
  }> {
    return await this.actionProvider.executeThreatAction(action, incident);
  }
}

// Singleton instance
export const securityMonitoringService =
  SecurityMonitoringService.getInstance();
