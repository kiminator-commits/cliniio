import { securityAuditService } from '../SecurityAuditService';
import { logger } from '../../../utils/_core/logger';

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status:
    | 'open'
    | 'investigating'
    | 'contained'
    | 'resolved'
    | 'false_positive';
  threatIndicatorId: string;
  userId?: string;
  facilityId?: string;
  ipAddress?: string;
  evidence: Record<string, unknown>;
  detectedAt: Date;
  assignedTo?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
}

export interface IncidentFilters {
  status?: SecurityIncident['status'];
  severity?: SecurityIncident['severity'];
  assignedTo?: string;
  threatIndicatorId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export class SecurityIncidentProvider {
  private incidents: Map<string, SecurityIncident> = new Map();

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
    const incident: SecurityIncident = {
      id: `inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      severity,
      status: 'open',
      threatIndicatorId,
      userId,
      facilityId,
      ipAddress,
      evidence,
      detectedAt: new Date(),
    };

    this.incidents.set(incident.id, incident);

    // Log security violation (map 'low' to 'medium' since logSecurityViolation doesn't accept 'low')
    const mappedSeverity = severity === 'low' ? 'medium' : severity;
    securityAuditService.logSecurityViolation(
      'suspicious_activity',
      mappedSeverity,
      userId,
      facilityId,
      description,
      evidence
    );

    logger.warn(`Security incident created: ${incident.title}`, incident);

    return incident;
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
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    incident.status = status;
    incident.resolvedBy = updatedBy;
    incident.resolution = resolution;

    if (status === 'resolved' || status === 'false_positive') {
      incident.resolvedAt = new Date();
    }

    logger.info(`Incident status updated: ${incidentId} - ${status}`, {
      updatedBy,
      resolution,
    });
  }

  /**
   * Assign incident
   */
  assignIncident(incidentId: string, assignedTo: string): void {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    incident.assignedTo = assignedTo;
    incident.status = 'investigating';

    logger.info(`Incident assigned: ${incidentId} to ${assignedTo}`);
  }

  /**
   * Get incident by ID
   */
  getIncident(incidentId: string): SecurityIncident | undefined {
    return this.incidents.get(incidentId);
  }

  /**
   * Get all incidents
   */
  getAllIncidents(): SecurityIncident[] {
    return Array.from(this.incidents.values()).sort(
      (a, b) => b.detectedAt.getTime() - a.detectedAt.getTime()
    );
  }

  /**
   * Get active incidents
   */
  getActiveIncidents(): SecurityIncident[] {
    return Array.from(this.incidents.values())
      .filter(
        (incident) =>
          incident.status !== 'resolved' && incident.status !== 'false_positive'
      )
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  /**
   * Get incidents by status
   */
  getIncidentsByStatus(status: SecurityIncident['status']): SecurityIncident[] {
    return Array.from(this.incidents.values())
      .filter((incident) => incident.status === status)
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  /**
   * Get incidents by severity
   */
  getIncidentsBySeverity(
    severity: SecurityIncident['severity']
  ): SecurityIncident[] {
    return Array.from(this.incidents.values())
      .filter((incident) => incident.severity === severity)
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  /**
   * Get incidents by threat indicator
   */
  getIncidentsByThreatIndicator(threatIndicatorId: string): SecurityIncident[] {
    return Array.from(this.incidents.values())
      .filter((incident) => incident.threatIndicatorId === threatIndicatorId)
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  /**
   * Get incidents by user
   */
  getIncidentsByUser(userId: string): SecurityIncident[] {
    return Array.from(this.incidents.values())
      .filter((incident) => incident.userId === userId)
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  /**
   * Get incidents by facility
   */
  getIncidentsByFacility(facilityId: string): SecurityIncident[] {
    return Array.from(this.incidents.values())
      .filter((incident) => incident.facilityId === facilityId)
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  /**
   * Get filtered incidents
   */
  getFilteredIncidents(filters: IncidentFilters): SecurityIncident[] {
    let incidents = Array.from(this.incidents.values());

    if (filters.status) {
      incidents = incidents.filter(
        (incident) => incident.status === filters.status
      );
    }

    if (filters.severity) {
      incidents = incidents.filter(
        (incident) => incident.severity === filters.severity
      );
    }

    if (filters.assignedTo) {
      incidents = incidents.filter(
        (incident) => incident.assignedTo === filters.assignedTo
      );
    }

    if (filters.threatIndicatorId) {
      incidents = incidents.filter(
        (incident) => incident.threatIndicatorId === filters.threatIndicatorId
      );
    }

    if (filters.dateRange) {
      incidents = incidents.filter(
        (incident) =>
          incident.detectedAt >= filters.dateRange!.start &&
          incident.detectedAt <= filters.dateRange!.end
      );
    }

    return incidents.sort(
      (a, b) => b.detectedAt.getTime() - a.detectedAt.getTime()
    );
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
    averageResolutionTime: number; // hours
    topThreatIndicators: Array<{
      threatIndicatorId: string;
      count: number;
    }>;
  } {
    let incidents = Array.from(this.incidents.values());

    if (timeRange) {
      incidents = incidents.filter(
        (incident) =>
          incident.detectedAt >= timeRange.start &&
          incident.detectedAt <= timeRange.end
      );
    }

    const total = incidents.length;
    const open = incidents.filter((i) => i.status === 'open').length;
    const investigating = incidents.filter(
      (i) => i.status === 'investigating'
    ).length;
    const contained = incidents.filter((i) => i.status === 'contained').length;
    const resolved = incidents.filter((i) => i.status === 'resolved').length;
    const falsePositive = incidents.filter(
      (i) => i.status === 'false_positive'
    ).length;

    const bySeverity = incidents.reduce(
      (acc, incident) => {
        acc[incident.severity] = (acc[incident.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byStatus = incidents.reduce(
      (acc, incident) => {
        acc[incident.status] = (acc[incident.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Average resolution time
    const resolvedIncidentsWithTime = incidents.filter(
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

    // Top threat indicators
    const indicatorCounts = new Map<string, number>();
    incidents.forEach((incident) => {
      const count = indicatorCounts.get(incident.threatIndicatorId) || 0;
      indicatorCounts.set(incident.threatIndicatorId, count + 1);
    });

    const topThreatIndicators = Array.from(indicatorCounts.entries())
      .map(([threatIndicatorId, count]) => ({
        threatIndicatorId,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total,
      open,
      investigating,
      contained,
      resolved,
      falsePositive,
      bySeverity,
      byStatus,
      averageResolutionTime,
      topThreatIndicators,
    };
  }

  /**
   * Update incident evidence
   */
  updateIncidentEvidence(
    incidentId: string,
    evidence: Record<string, unknown>
  ): void {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    incident.evidence = { ...incident.evidence, ...evidence };
    logger.info(`Incident evidence updated: ${incidentId}`, evidence);
  }

  /**
   * Add incident comment
   */
  addIncidentComment(
    incidentId: string,
    comment: string,
    author: string
  ): void {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    const comments =
      (incident.evidence.comments as Array<{
        text: string;
        author: string;
        timestamp: Date;
      }>) || [];

    comments.push({
      text: comment,
      author,
      timestamp: new Date(),
    });

    incident.evidence.comments = comments;
    logger.info(`Incident comment added: ${incidentId}`, { author, comment });
  }

  /**
   * Get incident timeline
   */
  getIncidentTimeline(incidentId: string): Array<{
    timestamp: Date;
    event: string;
    details: Record<string, unknown>;
  }> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    const timeline = [
      {
        timestamp: incident.detectedAt,
        event: 'Incident Created',
        details: {
          title: incident.title,
          severity: incident.severity,
          threatIndicatorId: incident.threatIndicatorId,
        },
      },
    ];

    if (incident.assignedTo) {
      timeline.push({
        timestamp: incident.detectedAt, // Would need to track actual assignment time
        event: 'Incident Assigned',
        details: {
          title: incident.title,
          severity: incident.severity,
          threatIndicatorId: incident.threatIndicatorId,
          assignedTo: incident.assignedTo,
        },
      });
    }

    if (incident.resolvedAt && incident.resolvedBy) {
      timeline.push({
        timestamp: incident.resolvedAt,
        event: 'Incident Resolved',
        details: {
          title: incident.title,
          severity: incident.severity,
          threatIndicatorId: incident.threatIndicatorId,
          resolvedBy: incident.resolvedBy,
          resolution: incident.resolution,
        },
      });
    }

    return timeline.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  /**
   * Export incidents
   */
  exportIncidents(filters?: IncidentFilters): string {
    const incidents = filters
      ? this.getFilteredIncidents(filters)
      : this.getAllIncidents();
    return JSON.stringify(incidents, null, 2);
  }

  /**
   * Delete incident
   */
  deleteIncident(incidentId: string): void {
    const incident = this.incidents.get(incidentId);
    if (incident) {
      this.incidents.delete(incidentId);
      logger.info(`Incident deleted: ${incidentId}`);
    }
  }

  /**
   * Bulk update incidents
   */
  bulkUpdateIncidents(
    incidentIds: string[],
    updates: Partial<SecurityIncident>
  ): {
    success: boolean;
    updated: number;
    errors: string[];
  } {
    const errors: string[] = [];
    let updated = 0;

    incidentIds.forEach((incidentId) => {
      try {
        const incident = this.incidents.get(incidentId);
        if (incident) {
          Object.assign(incident, updates);
          updated++;
        } else {
          errors.push(`Incident not found: ${incidentId}`);
        }
      } catch (error) {
        errors.push(
          `Error updating incident ${incidentId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });

    logger.info(`Bulk updated ${updated} incidents`, { errors: errors.length });

    return {
      success: errors.length === 0,
      updated,
      errors,
    };
  }
}
