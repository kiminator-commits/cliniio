import { supabase } from '../../../lib/supabaseClient';
import { BITestResult } from '../../../store/slices/types/biWorkflowTypes';
import { ToolStatus } from '@/types/toolTypes';

export interface FilterOptions {
  status: 'all' | ToolStatus;
  date: string;
}

export interface CycleStats {
  totalCycles: number;
  completed: number;
  failed: number;
  totalTools: number;
}

export interface StatusColorInfo {
  color: string;
}

export interface CleaningLog {
  id: string;
  room_id: string;
  room_name: string;
  status: ToolStatus;
  cleaning_type: string;
  scheduled_time: string;
  started_time?: string;
  completed_time?: string;
  quality_score?: number;
  compliance_score?: number;
  checklist_items: Record<string, unknown>[];
  completed_items: Record<string, unknown>[];
  failed_items: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
}

export class CleaningLogService {
  /**
   * Fetch cleaning logs from the environmental_cleans_enhanced table
   */
  static async fetchCleaningLogs(): Promise<CleaningLog[]> {
    try {
      const { data, error } = await supabase
        .from('environmental_cleans_enhanced')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cleaning logs:', error);
        throw error;
      }

      return (data as unknown as CleaningLog[]) || [];
    } catch (error) {
      console.error('Failed to fetch cleaning logs:', error);
      return [];
    }
  }

  /**
   * Filter cleaning logs based on options
   */
  static filterCleaningLogs(
    logs: CleaningLog[],
    options: FilterOptions
  ): CleaningLog[] {
    return logs.filter((log) => {
      // Status filter
      const statusMatch =
        options.status === 'all' || log.status === options.status;

      // Date filter
      const dateMatch =
        !options.date ||
        new Date(log.created_at).toDateString() ===
          new Date(options.date).toDateString();

      return statusMatch && dateMatch;
    });
  }

  /**
   * Calculate statistics from cleaning logs
   */
  static calculateStats(logs: CleaningLog[]): CycleStats {
    return {
      totalCycles: logs.length,
      completed: logs.filter((log) => log.status === 'clean').length,
      failed: logs.filter((log) => log.status === 'problem').length,
      totalTools: logs.length, // Each log represents one cleaning cycle
    };
  }

  /**
   * Get status color for cleaning log status
   */
  static getStatusColor(status: string): StatusColorInfo {
    switch (status) {
      case 'completed':
        return { color: 'text-green-600 bg-green-100' };
      case 'verified':
        return { color: 'text-blue-600 bg-blue-100' };
      case 'failed':
        return { color: 'text-red-600 bg-red-100' };
      case 'in_progress':
        return { color: 'text-yellow-600 bg-yellow-100' };
      case 'pending':
        return { color: 'text-gray-600 bg-gray-100' };
      case 'cancelled':
        return { color: 'text-orange-600 bg-orange-100' };
      default:
        return { color: 'text-gray-600 bg-gray-100' };
    }
  }

  /**
   * Format duration between start and end times
   */
  static formatDuration(startTime: string, endTime?: string): string {
    if (!endTime) return 'In Progress';

    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = end.getTime() - start.getTime();
    const minutes = Math.floor(duration / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Get BI test results for a specific date (placeholder for future integration)
   */
  static getBITestResultsForCycle(
    biTestResults: BITestResult[],
    cycleStartTime: string
  ): BITestResult[] {
    return biTestResults.filter((result) => {
      const cycleDate = new Date(cycleStartTime);
      const testDate = new Date(result.date);
      return testDate.toDateString() === cycleDate.toDateString();
    });
  }

  /**
   * Get BI test result color
   */
  static getBITestResultColor(result: 'pass' | 'fail'): string {
    return result === 'pass'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  }

  /**
   * Format test time
   */
  static formatTestTime(date: Date): string {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Get cleaning type display name
   */
  static getCleaningTypeDisplayName(cleaningType: string): string {
    switch (cleaningType) {
      case 'routine':
        return 'Routine';
      case 'deep_clean':
        return 'Deep Clean';
      case 'emergency':
        return 'Emergency';
      case 'post_procedure':
        return 'Post Procedure';
      default:
        return cleaningType;
    }
  }

  /**
   * Get quality score display
   */
  static getQualityScoreDisplay(score?: number): string {
    if (!score) return 'N/A';
    return `${Math.round(score * 100)}%`;
  }

  /**
   * Get compliance score display
   */
  static getComplianceScoreDisplay(score?: number): string {
    if (!score) return 'N/A';
    return `${Math.round(score * 100)}%`;
  }
}
