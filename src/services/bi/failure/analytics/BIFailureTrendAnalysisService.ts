import { supabase } from '../../../../lib/supabaseClient';
import { BIFailureErrorHandler } from '../BIFailureErrorHandler';
import { BIFailureValidationService } from '../BIFailureValidationService';
import { BIFailureTrendAnalysis } from './types';

/**
 * BI Failure Trend Analysis Service
 *
 * Handles trend analysis operations including:
 * - Monthly, weekly, and daily trend calculations
 * - Incident count trends over time
 * - Resolution time trends
 * - Affected tools count trends
 */
export class BIFailureTrendAnalysisService {
  /**
   * Get trend analysis for a facility within a date range
   */
  static async getTrendAnalysis(
    facilityId: string,
    startDate: string,
    endDate: string
  ): Promise<BIFailureTrendAnalysis> {
    try {
      // Validate inputs
      BIFailureValidationService.validateFacilityId(facilityId);
      BIFailureValidationService.validateDateRange(startDate, endDate);

      // Get incident data for trend analysis
      const { data: incidents, error: incidentsError } = await supabase
        .from('bi_failure_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (incidentsError) {
        throw BIFailureErrorHandler.handleDatabaseError(
          incidentsError,
          'get trend analysis'
        );
      }

      // Calculate trends based on granularity
      const monthlyTrends = this.calculateMonthlyTrends(incidents || []);
      const weeklyTrends = this.calculateWeeklyTrends(incidents || []);
      const dailyTrends = this.calculateDailyTrends(incidents || []);

      return {
        facilityId,
        period: { startDate, endDate },
        monthlyTrends,
        weeklyTrends,
        dailyTrends,
      };
    } catch (error) {
      throw BIFailureErrorHandler.handleDatabaseError(
        error as Error,
        'get trend analysis'
      );
    }
  }

  /**
   * Calculate monthly trends from incident data
   */
  private static calculateMonthlyTrends(
    incidents: Array<{
      id: string;
      detected_at: string | null;
      resolved_at: string | null;
      severity: string;
      incident_type: string;
      [key: string]: unknown;
    }>
  ): Array<{
    month: string;
    incidentCount: number;
    averageResolutionTimeHours: number;
    affectedToolsCount: number;
  }> {
    const monthlyData = new Map<
      string,
      {
        incidents: Array<{
          id: string;
          detected_at: string | null;
          resolved_at: string | null;
          severity: string;
          incident_type: string;
          [key: string]: unknown;
        }>;
        totalResolutionTime: number;
        totalTools: number;
      }
    >();

    incidents.forEach((incident) => {
      const month = new Date(incident.created_at as string)
        .toISOString()
        .substring(0, 7); // YYYY-MM format

      if (!monthlyData.has(month)) {
        monthlyData.set(month, {
          incidents: [],
          totalResolutionTime: 0,
          totalTools: 0,
        });
      }

      const monthData = monthlyData.get(month)!;
      monthData.incidents.push(incident);
      monthData.totalTools += (incident.affected_tools_count as number) || 0;

      // Calculate resolution time if incident is resolved
      if (
        incident.status === 'resolved' &&
        incident.resolved_at &&
        incident.created_at
      ) {
        const created = new Date(incident.created_at as string).getTime();
        const resolved = new Date(incident.resolved_at as string).getTime();
        monthData.totalResolutionTime += resolved - created;
      }
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => {
        const resolvedIncidents = data.incidents.filter(
          (i) => i.status === 'resolved'
        );
        const averageResolutionTimeHours =
          resolvedIncidents.length > 0
            ? data.totalResolutionTime / (resolvedIncidents.length * 3600000) // Convert ms to hours
            : 0;

        return {
          month,
          incidentCount: data.incidents.length,
          averageResolutionTimeHours,
          affectedToolsCount: data.totalTools,
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Calculate weekly trends from incident data
   */
  private static calculateWeeklyTrends(
    incidents: Array<{
      id: string;
      detected_at: string | null;
      resolved_at: string | null;
      severity: string;
      incident_type: string;
      [key: string]: unknown;
    }>
  ): Array<{
    week: string;
    incidentCount: number;
    averageResolutionTimeHours: number;
    affectedToolsCount: number;
  }> {
    const weeklyData = new Map<
      string,
      {
        incidents: Array<{
          id: string;
          detected_at: string | null;
          resolved_at: string | null;
          severity: string;
          incident_type: string;
          [key: string]: unknown;
        }>;
        totalResolutionTime: number;
        totalTools: number;
      }
    >();

    incidents.forEach((incident) => {
      const date = new Date(incident.created_at as string);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const week = weekStart.toISOString().substring(0, 10); // YYYY-MM-DD format

      if (!weeklyData.has(week)) {
        weeklyData.set(week, {
          incidents: [],
          totalResolutionTime: 0,
          totalTools: 0,
        });
      }

      const weekData = weeklyData.get(week)!;
      weekData.incidents.push(incident);
      weekData.totalTools += (incident.affected_tools_count as number) || 0;

      // Calculate resolution time if incident is resolved
      if (
        incident.status === 'resolved' &&
        incident.resolved_at &&
        incident.created_at
      ) {
        const created = new Date(incident.created_at as string).getTime();
        const resolved = new Date(incident.resolved_at as string).getTime();
        weekData.totalResolutionTime += resolved - created;
      }
    });

    return Array.from(weeklyData.entries())
      .map(([week, data]) => {
        const resolvedIncidents = data.incidents.filter(
          (i) => i.status === 'resolved'
        );
        const averageResolutionTimeHours =
          resolvedIncidents.length > 0
            ? data.totalResolutionTime / (resolvedIncidents.length * 3600000) // Convert ms to hours
            : 0;

        return {
          week,
          incidentCount: data.incidents.length,
          averageResolutionTimeHours,
          affectedToolsCount: data.totalTools,
        };
      })
      .sort((a, b) => a.week.localeCompare(b.week));
  }

  /**
   * Calculate daily trends from incident data
   */
  private static calculateDailyTrends(
    incidents: Array<{
      id: string;
      detected_at: string | null;
      resolved_at: string | null;
      severity: string;
      incident_type: string;
      [key: string]: unknown;
    }>
  ): Array<{
    date: string;
    incidentCount: number;
    averageResolutionTimeHours: number;
    affectedToolsCount: number;
  }> {
    const dailyData = new Map<
      string,
      {
        incidents: Array<{
          id: string;
          detected_at: string | null;
          resolved_at: string | null;
          severity: string;
          incident_type: string;
          [key: string]: unknown;
        }>;
        totalResolutionTime: number;
        totalTools: number;
      }
    >();

    incidents.forEach((incident) => {
      const date = new Date(incident.created_at as string)
        .toISOString()
        .substring(0, 10); // YYYY-MM-DD format

      if (!dailyData.has(date)) {
        dailyData.set(date, {
          incidents: [],
          totalResolutionTime: 0,
          totalTools: 0,
        });
      }

      const dayData = dailyData.get(date)!;
      dayData.incidents.push(incident);
      dayData.totalTools += (incident.affected_tools_count as number) || 0;

      // Calculate resolution time if incident is resolved
      if (
        incident.status === 'resolved' &&
        incident.resolved_at &&
        incident.created_at
      ) {
        const created = new Date(incident.created_at as string).getTime();
        const resolved = new Date(incident.resolved_at as string).getTime();
        dayData.totalResolutionTime += resolved - created;
      }
    });

    return Array.from(dailyData.entries())
      .map(([date, data]) => {
        const resolvedIncidents = data.incidents.filter(
          (i) => i.status === 'resolved'
        );
        const averageResolutionTimeHours =
          resolvedIncidents.length > 0
            ? data.totalResolutionTime / (resolvedIncidents.length * 3600000) // Convert ms to hours
            : 0;

        return {
          date,
          incidentCount: data.incidents.length,
          averageResolutionTimeHours,
          affectedToolsCount: data.totalTools,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Analyze trends for a facility within a date range
   * This is the main method expected by tests
   */
  static async analyzeTrends(
    facilityId: string,
    startDate: string,
    endDate: string
  ): Promise<BIFailureTrendAnalysis> {
    return this.getTrendAnalysis(facilityId, startDate, endDate);
  }

  /**
   * Generate a comprehensive trend report
   */
  static async generateTrendReport(
    facilityId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    facilityId: string;
    period: { startDate: string; endDate: string };
    summary: {
      totalIncidents: number;
      averageResolutionTimeHours: number;
      totalAffectedTools: number;
      trendDirection: 'increasing' | 'decreasing' | 'stable';
    };
    monthlyTrends: Array<{
      month: string;
      incidentCount: number;
      averageResolutionTimeHours: number;
      affectedToolsCount: number;
    }>;
    weeklyTrends: Array<{
      week: string;
      incidentCount: number;
      averageResolutionTimeHours: number;
      affectedToolsCount: number;
    }>;
    dailyTrends: Array<{
      date: string;
      incidentCount: number;
      averageResolutionTimeHours: number;
      affectedToolsCount: number;
    }>;
  }> {
    try {
      const trendAnalysis = await this.getTrendAnalysis(
        facilityId,
        startDate,
        endDate
      );

      // Calculate summary statistics
      const totalIncidents = trendAnalysis.monthlyTrends.reduce(
        (sum, month) => sum + month.incidentCount,
        0
      );
      const totalAffectedTools = trendAnalysis.monthlyTrends.reduce(
        (sum, month) => sum + month.affectedToolsCount,
        0
      );
      const averageResolutionTimeHours =
        trendAnalysis.monthlyTrends.reduce(
          (sum, month) => sum + month.averageResolutionTimeHours,
          0
        ) / Math.max(trendAnalysis.monthlyTrends.length, 1);

      // Determine trend direction based on recent vs earlier incidents
      const recentMonths = trendAnalysis.monthlyTrends.slice(-3);
      const earlierMonths = trendAnalysis.monthlyTrends.slice(0, -3);

      const recentAverage =
        recentMonths.reduce((sum, month) => sum + month.incidentCount, 0) /
        Math.max(recentMonths.length, 1);
      const earlierAverage =
        earlierMonths.reduce((sum, month) => sum + month.incidentCount, 0) /
        Math.max(earlierMonths.length, 1);

      let trendDirection: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (recentAverage > earlierAverage * 1.1) {
        trendDirection = 'increasing';
      } else if (recentAverage < earlierAverage * 0.9) {
        trendDirection = 'decreasing';
      }

      return {
        facilityId: trendAnalysis.facilityId,
        period: trendAnalysis.period,
        summary: {
          totalIncidents,
          averageResolutionTimeHours,
          totalAffectedTools,
          trendDirection,
        },
        monthlyTrends: trendAnalysis.monthlyTrends,
        weeklyTrends: trendAnalysis.weeklyTrends,
        dailyTrends: trendAnalysis.dailyTrends,
      };
    } catch (error) {
      throw BIFailureErrorHandler.handleDatabaseError(
        error as Error,
        'generate trend report'
      );
    }
  }

  /**
   * Get trend analysis with custom date grouping
   */
  static async getCustomTrendAnalysis(
    facilityId: string,
    startDate: string,
    endDate: string,
    groupBy: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
  ): Promise<
    Array<{
      period: string;
      incidentCount: number;
      averageResolutionTimeHours: number;
      affectedToolsCount: number;
    }>
  > {
    try {
      // Validate inputs
      BIFailureValidationService.validateFacilityId(facilityId);
      BIFailureValidationService.validateDateRange(startDate, endDate);

      // Get incident data
      const { data: incidents, error: incidentsError } = await supabase
        .from('bi_failure_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (incidentsError) {
        throw BIFailureErrorHandler.handleDatabaseError(
          incidentsError,
          'get custom trend analysis'
        );
      }

      // Group data based on specified grouping
      const groupedData = this.groupIncidentsByPeriod(incidents || [], groupBy);

      return groupedData;
    } catch (error) {
      throw BIFailureErrorHandler.handleDatabaseError(
        error as Error,
        'get custom trend analysis'
      );
    }
  }

  /**
   * Group incidents by specified time period
   */
  private static groupIncidentsByPeriod(
    incidents: Array<{
      id: string;
      detected_at: string | null;
      resolved_at: string | null;
      severity: string;
      incident_type: string;
      [key: string]: unknown;
    }>,
    groupBy: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
  ): Array<{
    period: string;
    incidentCount: number;
    averageResolutionTimeHours: number;
    affectedToolsCount: number;
  }> {
    const groupedData = new Map<
      string,
      {
        incidents: Array<{
          id: string;
          detected_at: string | null;
          resolved_at: string | null;
          severity: string;
          incident_type: string;
          [key: string]: unknown;
        }>;
        totalResolutionTime: number;
        totalTools: number;
      }
    >();

    incidents.forEach((incident) => {
      const date = new Date(incident.created_at as string);
      let period: string;

      switch (groupBy) {
        case 'hour':
          period = date.toISOString().substring(0, 13); // YYYY-MM-DDTHH
          break;
        case 'day':
          period = date.toISOString().substring(0, 10); // YYYY-MM-DD
          break;
        case 'week': {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          period = weekStart.toISOString().substring(0, 10); // YYYY-MM-DD
          break;
        }
        case 'month':
          period = date.toISOString().substring(0, 7); // YYYY-MM
          break;
        case 'quarter': {
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          period = `${date.getFullYear()}-Q${quarter}`;
          break;
        }
        case 'year':
          period = date.getFullYear().toString();
          break;
        default:
          period = date.toISOString().substring(0, 10);
      }

      if (!groupedData.has(period)) {
        groupedData.set(period, {
          incidents: [],
          totalResolutionTime: 0,
          totalTools: 0,
        });
      }

      const periodData = groupedData.get(period)!;
      periodData.incidents.push(incident);
      periodData.totalTools += (incident.affected_tools_count as number) || 0;

      // Calculate resolution time if incident is resolved
      if (
        incident.status === 'resolved' &&
        incident.resolved_at &&
        incident.created_at
      ) {
        const created = new Date(incident.created_at as string).getTime();
        const resolved = new Date(incident.resolved_at as string).getTime();
        periodData.totalResolutionTime += resolved - created;
      }
    });

    return Array.from(groupedData.entries())
      .map(([period, data]) => {
        const resolvedIncidents = data.incidents.filter(
          (i) => i.status === 'resolved'
        );
        const averageResolutionTimeHours =
          resolvedIncidents.length > 0
            ? data.totalResolutionTime / (resolvedIncidents.length * 3600000) // Convert ms to hours
            : 0;

        return {
          period,
          incidentCount: data.incidents.length,
          averageResolutionTimeHours,
          affectedToolsCount: data.totalTools,
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));
  }
}
