import { supabase } from '../../../../lib/supabaseClient';
import { logger } from '../../../../utils/_core/logger';

export interface RealTimeDashboardData {
  facilityId: string;
  activeIncidents: number;
  pendingActions: number;
  lastUpdated: string;
  alerts: Array<{
    id: string;
    type: 'warning' | 'critical' | 'info';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    actionRequired: boolean;
  }>;
  incidentSummary: {
    totalToday: number;
    totalThisWeek: number;
    totalThisMonth: number;
    resolvedToday: number;
    escalatedToday: number;
  };
  performanceMetrics: {
    averageResponseTime: number;
    averageResolutionTime: number;
    complianceScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  recentActivity: Array<{
    id: string;
    action: string;
    description: string;
    timestamp: string;
    user: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

interface BIIncident {
  id?: string | null;
  facility_id?: string | null;
  incident_type?: string | null;
  description?: string | null;
  severity?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  resolved_at?: string | null;
  reported_by?: string | null;
  user_id?: string | null;
  cost_impact?: number | null;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface AuditLog {
  action: string;
  module: string;
  [key: string]: unknown;
}

export class BIFailureRealTimeService {
  /**
   * Get real-time dashboard data for a facility
   */
  static async getRealTimeDashboardData(
    facilityId: string
  ): Promise<RealTimeDashboardData> {
    try {
      const [
        activeIncidents,
        pendingActions,
        alerts,
        incidentSummary,
        performanceMetrics,
        recentActivity,
      ] = await Promise.all([
        this.getActiveIncidents(facilityId),
        this.getPendingActions(facilityId),
        this.generateAlerts(facilityId),
        this.getIncidentSummary(facilityId),
        this.getPerformanceMetrics(facilityId),
        this.getRecentActivity(facilityId),
      ]);

      return {
        facilityId,
        activeIncidents,
        pendingActions,
        lastUpdated: new Date().toISOString(),
        alerts,
        incidentSummary,
        performanceMetrics,
        recentActivity,
      };
    } catch (error) {
      logger.error('Error getting real-time dashboard data:', error);
      throw new Error('Failed to get real-time dashboard data');
    }
  }

  /**
   * Get count of active incidents
   */
  private static async getActiveIncidents(facilityId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('quality_incidents')
        .select('*', { count: 'exact', head: true })
        .eq('facility_id', facilityId)
        .in('status', ['open', 'in_progress', 'escalated']);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      logger.error('Error getting active incidents count:', error);
      return 0;
    }
  }

  /**
   * Get count of pending actions
   */
  private static async getPendingActions(facilityId: string): Promise<number> {
    try {
      // Count incidents that need attention
      const { count: urgentCount, error: urgentError } = await supabase
        .from('quality_incidents')
        .select('*', { count: 'exact', head: true })
        .eq('facility_id', facilityId)
        .eq('status', 'open')
        .gte('severity', 'high');

      if (urgentError) throw urgentError;

      // Count overdue incidents
      const { count: overdueCount, error: overdueError } = await supabase
        .from('quality_incidents')
        .select('*', { count: 'exact', head: true })
        .eq('facility_id', facilityId)
        .eq('status', 'open')
        .lt(
          'created_at',
          new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        ); // > 48 hours

      if (overdueError) throw overdueError;

      return (urgentCount || 0) + (overdueCount || 0);
    } catch (error) {
      logger.error('Error getting pending actions count:', error);
      return 0;
    }
  }

  /**
   * Generate real-time alerts
   */
  private static async generateAlerts(facilityId: string) {
    try {
      const alerts = [];

      // Check for critical incidents
      const { data: criticalIncidents, error: criticalError } = await supabase
        .from('quality_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('severity', 'critical')
        .eq('status', 'open');

      if (criticalError) throw criticalError;

      if (criticalIncidents && criticalIncidents.length > 0) {
        alerts.push({
          id: 'critical-incidents',
          type: 'critical' as const,
          message: `${criticalIncidents.length} critical incident(s) require immediate attention`,
          severity: 'critical' as const,
          timestamp: new Date().toISOString(),
          actionRequired: true,
        });
      }

      // Check for overdue incidents
      const { data: overdueIncidents, error: overdueError } = await supabase
        .from('quality_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('status', 'open')
        .lt(
          'created_at',
          new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
        ); // > 72 hours

      if (overdueError) throw overdueError;

      if (overdueIncidents && overdueIncidents.length > 0) {
        alerts.push({
          id: 'overdue-incidents',
          type: 'warning' as const,
          message: `${overdueIncidents.length} incident(s) are overdue for resolution`,
          severity: 'high' as const,
          timestamp: new Date().toISOString(),
          actionRequired: true,
        });
      }

      // Check for compliance issues
      const complianceScore = await this.getComplianceScore(facilityId);
      if (complianceScore < 70) {
        alerts.push({
          id: 'compliance-warning',
          type: 'warning' as const,
          message: `Compliance score is ${complianceScore}% - below recommended threshold`,
          severity: 'medium' as const,
          timestamp: new Date().toISOString(),
          actionRequired: true,
        });
      }

      // Check for high incident volume
      const { data: recentIncidents, error: recentError } = await supabase
        .from('quality_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        ); // Last 24 hours

      if (recentError) throw recentError;

      if (recentIncidents && recentIncidents.length > 10) {
        alerts.push({
          id: 'high-incident-volume',
          type: 'warning' as const,
          message: `High incident volume: ${recentIncidents.length} incidents in the last 24 hours`,
          severity: 'medium' as const,
          timestamp: new Date().toISOString(),
          actionRequired: false,
        });
      }

      return alerts;
    } catch (error) {
      logger.error('Error generating alerts:', error);
      return [];
    }
  }

  /**
   * Get incident summary statistics
   */
  private static async getIncidentSummary(facilityId: string) {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );

      const [
        totalToday,
        totalThisWeek,
        totalThisMonth,
        resolvedToday,
        escalatedToday,
      ] = await Promise.all([
        this.getIncidentCount(
          facilityId,
          today.toISOString(),
          now.toISOString()
        ),
        this.getIncidentCount(
          facilityId,
          weekAgo.toISOString(),
          now.toISOString()
        ),
        this.getIncidentCount(
          facilityId,
          monthAgo.toISOString(),
          now.toISOString()
        ),
        this.getResolvedCount(
          facilityId,
          today.toISOString(),
          now.toISOString()
        ),
        this.getEscalatedCount(
          facilityId,
          today.toISOString(),
          now.toISOString()
        ),
      ]);

      return {
        totalToday,
        totalThisWeek,
        totalThisMonth,
        resolvedToday,
        escalatedToday,
      };
    } catch (error) {
      logger.error('Error getting incident summary:', error);
      return {
        totalToday: 0,
        totalThisWeek: 0,
        totalThisMonth: 0,
        resolvedToday: 0,
        escalatedToday: 0,
      };
    }
  }

  /**
   * Get performance metrics
   */
  private static async getPerformanceMetrics(facilityId: string) {
    try {
      const { data: incidents, error } = await supabase
        .from('quality_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        ); // Last 30 days

      if (error) throw error;

      if (!incidents || incidents.length === 0) {
        return {
          averageResponseTime: 0,
          averageResolutionTime: 0,
          complianceScore: 100,
          riskLevel: 'low' as const,
        };
      }

      // Calculate average response time (using updated_at as proxy for response time)
      const responseTimes = incidents
        .filter((i) => i.updated_at && i.created_at)
        .map(
          (i) =>
            new Date(i.updated_at as string).getTime() -
            new Date(i.created_at as string).getTime()
        );

      const averageResponseTime =
        responseTimes.length > 0
          ? responseTimes.reduce((sum, time) => sum + time, 0) /
            responseTimes.length /
            (1000 * 60 * 60) // Convert to hours
          : 0;

      // Calculate average resolution time
      const resolutionTimes = incidents
        .filter((i) => i.resolved_at && i.created_at)
        .map(
          (i) =>
            new Date(i.resolved_at as string).getTime() -
            new Date(i.created_at as string).getTime()
        );

      const averageResolutionTime =
        resolutionTimes.length > 0
          ? resolutionTimes.reduce((sum, time) => sum + time, 0) /
            resolutionTimes.length /
            (1000 * 60 * 60) // Convert to hours
          : 0;

      // Calculate compliance score
      const complianceScore = await this.getComplianceScore(facilityId);

      // Determine risk level
      const riskLevel = this.calculateRiskLevel(incidents, complianceScore);

      return {
        averageResponseTime: Math.round(averageResponseTime * 100) / 100,
        averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
        complianceScore,
        riskLevel,
      };
    } catch (error) {
      logger.error('Error getting performance metrics:', error);
      return {
        averageResponseTime: 0,
        averageResolutionTime: 0,
        complianceScore: 0,
        riskLevel: 'high' as const,
      };
    }
  }

  /**
   * Get recent activity
   */
  private static async getRecentActivity(facilityId: string) {
    try {
      const { data: auditLogs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('module', 'bi_failure')
        .gte(
          'created_at',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        ) // Last 24 hours
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (auditLogs || []).map((log) => ({
        id: (log as Record<string, unknown>).id as string,
        action: (log as Record<string, unknown>).action as string,
        description: this.formatAuditDescription(
          log as Record<string, unknown> & { action: string; module: string }
        ),
        timestamp: (log as Record<string, unknown>).created_at as string,
        user: ((log as Record<string, unknown>).user_id as string) || 'System',
        severity: this.determineActivitySeverity(
          log as Record<string, unknown> & { action: string; module: string }
        ),
      }));
    } catch (error) {
      logger.error('Error getting recent activity:', error);
      return [];
    }
  }

  /**
   * Get incident count for a date range
   */
  private static async getIncidentCount(
    facilityId: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('quality_incidents')
        .select('*', { count: 'exact', head: true })
        .eq('facility_id', facilityId)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      logger.error('Error getting incident count:', error);
      return 0;
    }
  }

  /**
   * Get resolved count for a date range
   */
  private static async getResolvedCount(
    facilityId: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('quality_incidents')
        .select('*', { count: 'exact', head: true })
        .eq('facility_id', facilityId)
        .eq('status', 'resolved')
        .gte('resolved_at', startDate)
        .lte('resolved_at', endDate);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      logger.error('Error getting resolved count:', error);
      return 0;
    }
  }

  /**
   * Get escalated count for a date range
   */
  private static async getEscalatedCount(
    facilityId: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('quality_incidents')
        .select('*', { count: 'exact', head: true })
        .eq('facility_id', facilityId)
        .eq('status', 'escalated')
        .gte('updated_at', startDate)
        .lte('updated_at', endDate);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      logger.error('Error getting escalated count:', error);
      return 0;
    }
  }

  /**
   * Get compliance score
   */
  private static async getComplianceScore(facilityId: string): Promise<number> {
    try {
      // This is a simplified calculation - in practice, you'd use the compliance service
      const { data: incidents, error } = await supabase
        .from('quality_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
        );

      if (error) throw error;

      if (!incidents || incidents.length === 0) return 100;

      const resolvedCount = incidents.filter(
        (i) => i.status === 'resolved'
      ).length;
      const totalCount = incidents.length;

      return Math.round((resolvedCount / totalCount) * 100);
    } catch (error) {
      logger.error('Error getting compliance score:', error);
      return 0;
    }
  }

  /**
   * Calculate risk level
   */
  private static calculateRiskLevel(
    incidents: BIIncident[],
    complianceScore: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    const criticalIncidents = incidents.filter(
      (i) => i.severity === 'critical'
    ).length;
    const unresolvedIncidents = incidents.filter(
      (i) => i.status !== 'resolved'
    ).length;

    if (criticalIncidents > 0 || complianceScore < 50) return 'critical';
    if (unresolvedIncidents > 10 || complianceScore < 70) return 'high';
    if (unresolvedIncidents > 5 || complianceScore < 85) return 'medium';
    return 'low';
  }

  /**
   * Format audit description
   */
  private static formatAuditDescription(log: AuditLog): string {
    const action = log.action;
    const module = log.module;

    switch (action) {
      case 'create':
        return `New ${module} incident created`;
      case 'update':
        return `${module} incident updated`;
      case 'resolve':
        return `${module} incident resolved`;
      case 'escalate':
        return `${module} incident escalated`;
      default:
        return `${action} action on ${module}`;
    }
  }

  /**
   * Determine activity severity
   */
  private static determineActivitySeverity(
    log: AuditLog
  ): 'low' | 'medium' | 'high' | 'critical' {
    const action = log.action;

    switch (action) {
      case 'escalate':
        return 'high';
      case 'create':
      case 'update':
        return 'medium';
      default:
        return 'low';
    }
  }
}
