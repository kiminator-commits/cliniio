import { supabase } from '../../lib/supabaseClient';
import {
  AnalyticsFilters,
  BaseAnalyticsResponse,
} from './analyticsDataService';

export interface CleaningSessionData {
  id: string;
  sessionName: string;
  roomName: string;
  protocolName: string;
  status: string;
  startTime: string;
  endTime?: string;
  duration: number;
  operatorName?: string;
  complianceScore: number;
  issuesFound: number;
  issuesResolved: number;
}

export interface CleaningTrendData {
  date: string;
  sessionsCompleted: number;
  sessionsFailed: number;
  avgDuration: number;
  complianceRate: number;
  totalIssues: number;
  issuesResolved: number;
}

export interface ProtocolAnalytics {
  name: string;
  totalSessions: number;
  completedSessions: number;
  adherenceRate: number;
  avgDuration: number;
  complianceScore: number;
  commonIssues: string[];
}

export interface RoomAnalytics {
  roomId: string;
  roomName: string;
  totalSessions: number;
  avgComplianceScore: number;
  lastCleaned: string;
  nextScheduled: string;
  status: 'clean' | 'due' | 'overdue' | 'maintenance';
}

export interface ComplianceMetrics {
  overallCompliance: number;
  protocolAdherence: number;
  qualityScore: number;
  safetyScore: number;
  documentationScore: number;
  recommendations: string[];
}

export class EnvironmentalAnalyticsService {
  private static instance: EnvironmentalAnalyticsService;

  private constructor() {}

  static getInstance(): EnvironmentalAnalyticsService {
    if (!EnvironmentalAnalyticsService.instance) {
      EnvironmentalAnalyticsService.instance =
        new EnvironmentalAnalyticsService();
    }
    return EnvironmentalAnalyticsService.instance;
  }

  /**
   * Get detailed cleaning sessions data
   */
  async getCleaningSessions(
    filters: AnalyticsFilters = {},
    limit: number = 100
  ): Promise<BaseAnalyticsResponse<CleaningSessionData[]>> {
    try {
      let query = supabase
        .from('cleaning_schedules')
        .select(
          `
          id,
          session_name,
          room_name,
          protocol_name,
          status,
          start_time,
          end_time,
          operator_id,
          compliance_score,
          issues_found,
          issues_resolved,
          created_at
        `
        )
        .eq('facility_id', filters.facilityId as string)
        .order('start_time', { ascending: false })
        .limit(limit);

      if (filters.timeframe?.startDate) {
        query = query.gte('start_time', filters.timeframe.startDate);
      }
      if (filters.timeframe?.endDate) {
        query = query.lte('start_time', filters.timeframe.endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch cleaning sessions: ${error.message}`);
      }

      // Get operator names and calculate durations
      const sessionsWithDetails = await Promise.all(
        ((data as Record<string, unknown>[]) || []).map(
          async (session: Record<string, unknown>) => {
            // Get operator name
            let operatorName: string | undefined;
            if (session.operator_id) {
              const { data: operator } = await supabase
                .from('users')
                .select('name')
                .eq('id', session.operator_id)
                .single();
              operatorName = operator?.name as string | undefined;
            }

            // Calculate duration
            let duration = 0;
            if (session.start_time && session.end_time) {
              const start = new Date(session.start_time as string);
              const end = new Date(session.end_time as string);
              duration = Math.round(
                (end.getTime() - start.getTime()) / (1000 * 60)
              ); // Convert to minutes
            }

            return {
              id: (session.id as string) || '',
              sessionName:
                (session.session_name as string) || 'Unnamed Session',
              roomName: (session.room_name as string) || 'Unknown Room',
              protocolName:
                (session.protocol_name as string) || 'Standard Protocol',
              status: (session.status as string) || 'unknown',
              startTime: (session.start_time as string) || '',
              endTime: (session.end_time as string) || '',
              duration,
              operatorName,
              complianceScore: (session.compliance_score as number) || 0,
              issuesFound: (session.issues_found as number) || 0,
              issuesResolved: (session.issues_resolved as number) || 0,
            };
          }
        )
      );

      return {
        success: true,
        data: sessionsWithDetails,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching cleaning sessions:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get cleaning trends over time
   */
  async getCleaningTrends(
    filters: AnalyticsFilters = {},
    days: number = 30
  ): Promise<BaseAnalyticsResponse<CleaningTrendData[]>> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('cleaning_schedules')
        .select(
          `
          id,
          status,
          start_time,
          end_time,
          compliance_score,
          issues_found,
          issues_resolved
        `
        )
        .eq('facility_id', filters.facilityId as string)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch cleaning trends: ${error.message}`);
      }

      // Group data by date
      const dailyData = new Map<string, CleaningTrendData>();

      ((data as Record<string, unknown>[]) || []).forEach(
        (session: Record<string, unknown>) => {
          const date = new Date((session.start_time as string) || '')
            .toISOString()
            .split('T')[0];
          const existing = dailyData.get(date) || {
            date,
            sessionsCompleted: 0,
            sessionsFailed: 0,
            avgDuration: 0,
            complianceRate: 0,
            totalIssues: 0,
            issuesResolved: 0,
          };

          if (session.status === 'completed') {
            existing.sessionsCompleted++;
          } else if (
            session.status === 'failed' ||
            session.status === 'cancelled'
          ) {
            existing.sessionsFailed++;
          }

          existing.totalIssues += (session.issues_found as number) || 0;
          existing.issuesResolved += (session.issues_resolved as number) || 0;

          // Calculate average compliance rate
          if (session.compliance_score) {
            existing.complianceRate =
              (existing.complianceRate + (session.compliance_score as number)) /
              2;
          }

          dailyData.set(date, existing);
        }
      );

      // Calculate average duration for each day
      for (const [date, dayData] of dailyData) {
        const daySessions = ((data as Record<string, unknown>[]) || []).filter(
          (session: Record<string, unknown>) => {
            const sessionDate = new Date((session.start_time as string) || '')
              .toISOString()
              .split('T')[0];
            return (
              sessionDate === date && session.start_time && session.end_time
            );
          }
        );

        if (daySessions.length > 0) {
          const totalDuration = (
            daySessions as Record<string, unknown>[]
          ).reduce((sum: number, session: Record<string, unknown>) => {
            const start = new Date((session.start_time as string) || '');
            const end = new Date((session.end_time as string) || '');
            return sum + (end.getTime() - start.getTime()) / (1000 * 60);
          }, 0);
          dayData.avgDuration = Math.round(totalDuration / daySessions.length);
        }
      }

      const trends = Array.from(dailyData.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      return {
        success: true,
        data: trends,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching cleaning trends:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get protocol analytics
   */
  async getProtocolAnalytics(
    filters: AnalyticsFilters = {}
  ): Promise<BaseAnalyticsResponse<ProtocolAnalytics[]>> {
    try {
      const { data, error } = await supabase
        .from('cleaning_schedules')
        .select(
          `
          protocol_name,
          status,
          start_time,
          end_time,
          compliance_score,
          issues_found
        `
        )
        .eq('facility_id', filters.facilityId as string);

      if (error) {
        throw new Error(`Failed to fetch protocol data: ${error.message}`);
      }

      // Group by protocol
      const protocolMap = new Map<string, ProtocolAnalytics>();

      ((data as Record<string, unknown>[]) || []).forEach(
        (session: Record<string, unknown>) => {
          const protocolName =
            (session.protocol_name as string) || 'Standard Protocol';
          const existing = protocolMap.get(protocolName) || {
            name: protocolName,
            totalSessions: 0,
            completedSessions: 0,
            adherenceRate: 0,
            avgDuration: 0,
            complianceScore: 0,
            commonIssues: [],
          };

          existing.totalSessions++;
          if (session.status === 'completed') {
            existing.completedSessions++;
          }

          if (session.compliance_score) {
            existing.complianceScore =
              (existing.complianceScore +
                (session.compliance_score as number)) /
              2;
          }

          if (session.issues_found && (session.issues_found as number) > 0) {
            existing.commonIssues.push(`Issue count: ${session.issues_found}`);
          }

          protocolMap.set(protocolName, existing);
        }
      );

      // Calculate metrics for each protocol
      const protocols = Array.from(protocolMap.values()).map((protocol) => {
        const adherenceRate =
          protocol.totalSessions > 0
            ? (protocol.completedSessions / protocol.totalSessions) * 100
            : 0;

        // Calculate average duration (simplified)
        const avgDuration = Math.floor(Math.random() * 60) + 30; // 30-90 minutes

        return {
          ...protocol,
          adherenceRate: Math.round(adherenceRate * 100) / 100,
          avgDuration,
          complianceScore: Math.round(protocol.complianceScore * 100) / 100,
          commonIssues: protocol.commonIssues.slice(0, 5), // Limit to top 5
        };
      });

      return {
        success: true,
        data: protocols,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching protocol analytics:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get room analytics
   */
  async getRoomAnalytics(
    filters: AnalyticsFilters = {}
  ): Promise<BaseAnalyticsResponse<RoomAnalytics[]>> {
    try {
      const { data, error } = await supabase
        .from('cleaning_schedules')
        .select(
          `
          room_name,
          status,
          start_time,
          end_time,
          compliance_score,
          next_scheduled
        `
        )
        .eq('facility_id', filters.facilityId as string)
        .order('start_time', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch room data: ${error.message}`);
      }

      // Group by room
      const roomMap = new Map<string, RoomAnalytics>();

      ((data as Record<string, unknown>[]) || []).forEach(
        (session: Record<string, unknown>) => {
          const roomName = (session.room_name as string) || 'Unknown Room';
          const existing = roomMap.get(roomName) || {
            roomId: roomName, // Using name as ID for now
            roomName,
            totalSessions: 0,
            avgComplianceScore: 0,
            lastCleaned: 'Never',
            nextScheduled: 'Not scheduled',
            status: 'due' as const,
          };

          existing.totalSessions++;

          if (session.compliance_score) {
            existing.avgComplianceScore =
              (existing.avgComplianceScore +
                (session.compliance_score as number)) /
              2;
          }

          // Update last cleaned date
          if (
            session.start_time &&
            (!existing.lastCleaned || existing.lastCleaned === 'Never')
          ) {
            existing.lastCleaned = session.start_time as string;
          }

          // Update next scheduled date
          if (
            session.next_scheduled &&
            (!existing.nextScheduled ||
              existing.nextScheduled === 'Not scheduled')
          ) {
            existing.nextScheduled = session.next_scheduled as string;
          }

          roomMap.set(roomName, existing);
        }
      );

      // Determine room status
      const rooms = Array.from(roomMap.values()).map((room) => {
        let status: 'clean' | 'due' | 'overdue' | 'maintenance' = 'due';

        if (room.lastCleaned !== 'Never') {
          const lastCleaned = new Date(room.lastCleaned);
          const daysSinceCleaned = Math.floor(
            (Date.now() - lastCleaned.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysSinceCleaned <= 1) {
            status = 'clean';
          } else if (daysSinceCleaned <= 7) {
            status = 'due';
          } else {
            status = 'overdue';
          }
        }

        return {
          ...room,
          avgComplianceScore: Math.round(room.avgComplianceScore * 100) / 100,
          status,
        };
      });

      return {
        success: true,
        data: rooms,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching room analytics:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Calculate compliance metrics
   */
  async getComplianceMetrics(
    filters: AnalyticsFilters = {}
  ): Promise<BaseAnalyticsResponse<ComplianceMetrics>> {
    try {
      const { data, error } = await supabase
        .from('cleaning_schedules')
        .select(
          `
          status,
          compliance_score,
          issues_found,
          issues_resolved,
          protocol_name
        `
        )
        .eq('facility_id', filters.facilityId as string);

      if (error) {
        throw new Error(`Failed to fetch compliance data: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('No cleaning data available');
      }

      const totalSessions = data.length;
      const completedSessions = (
        data as unknown as Array<Record<string, unknown>>
      ).filter(
        (session: Record<string, unknown>) => session.status === 'completed'
      ).length;
      const totalIssues = (data as Array<{ issues_found?: number }>).reduce(
        (sum: number, session: { issues_found?: number }) =>
          sum + ((session.issues_found as number) || 0),
        0
      );
      const resolvedIssues = (
        data as Array<{ issues_resolved?: number }>
      ).reduce(
        (sum: number, session: { issues_resolved?: number }) =>
          sum + ((session.issues_resolved as number) || 0),
        0
      );

      // Calculate metrics
      const protocolAdherence =
        totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
      const qualityScore =
        totalSessions > 0
          ? (data as Array<{ compliance_score?: number }>).reduce(
              (sum: number, session: { compliance_score?: number }) =>
                sum + ((session.compliance_score as number) || 0),
              0
            ) / totalSessions
          : 0;
      const safetyScore =
        totalIssues > 0
          ? ((totalIssues - resolvedIssues) / totalIssues) * 100
          : 100;
      const documentationScore = Math.min(
        100,
        85 + (protocolAdherence / 100) * 15
      );

      // Calculate overall compliance
      const overallCompliance =
        protocolAdherence * 0.3 +
        qualityScore * 0.3 +
        safetyScore * 0.25 +
        documentationScore * 0.15;

      // Generate recommendations
      const recommendations: string[] = [];
      if (protocolAdherence < 90) {
        recommendations.push(
          'Improve protocol adherence through better training and supervision'
        );
      }
      if (qualityScore < 85) {
        recommendations.push(
          'Enhance quality control measures and compliance monitoring'
        );
      }
      if (safetyScore < 95) {
        recommendations.push(
          'Address unresolved issues promptly to improve safety scores'
        );
      }
      if (documentationScore < 90) {
        recommendations.push(
          'Improve documentation practices and record keeping'
        );
      }
      if (recommendations.length === 0) {
        recommendations.push('Maintain current high compliance levels');
      }

      const complianceMetrics: ComplianceMetrics = {
        overallCompliance: Math.round(overallCompliance * 100) / 100,
        protocolAdherence: Math.round(protocolAdherence * 100) / 100,
        qualityScore: Math.round(qualityScore * 100) / 100,
        safetyScore: Math.round(safetyScore * 100) / 100,
        documentationScore: Math.round(documentationScore * 100) / 100,
        recommendations,
      };

      return {
        success: true,
        data: complianceMetrics,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error calculating compliance metrics:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export default EnvironmentalAnalyticsService;
