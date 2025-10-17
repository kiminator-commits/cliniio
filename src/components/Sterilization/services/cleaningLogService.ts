import { supabase } from '../../../lib/supabaseClient';
import { BITestResult } from '../../../store/slices/types/biWorkflowTypes';
import { ToolStatus as _ToolStatus } from '@/types/toolTypes';
import { SterilizationCycle } from '../../../types/supabase/sterilization';

export interface FilterOptions {
  status: 'all' | 'in_progress' | 'completed' | 'failed';
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
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  cleaning_type: string;
  scheduled_time: string;
  started_time?: string;
  completed_time?: string;
  operator_id?: string;
  notes?: string;
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
   * Fetch sterilization cleaning logs from sterilization_cycles table
   */
  static async fetchCleaningLogs(): Promise<CleaningLog[]> {
    try {
      const { data, error } = await supabase
        .from('sterilization_cycles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sterilization cycles:', error);
        throw error;
      }

      // Transform sterilization cycles to cleaning log format
      const cleaningLogs: CleaningLog[] = (data || []).map(
        (cycle: SterilizationCycle) => {
          return {
            id: cycle.id,
            room_id: cycle.id, // Use cycle ID as room_id for compatibility
            room_name: `Cycle ${cycle.id.slice(0, 8)}`, // Generate cycle name
            status: cycle.status || 'in_progress', // Use actual sterilization cycle status
            cleaning_type: 'sterilization',
            scheduled_time: cycle.start_time,
            started_time: cycle.start_time,
            completed_time: cycle.end_time,
            operator_id: cycle.operator_id,
            notes: '', // Notes not available in cycle object
            checklist_items: [],
            completed_items: [],
            failed_items: [],
            created_at: cycle.created_at,
            updated_at: cycle.updated_at,
          };
        }
      );

      return cleaningLogs;
    } catch (error) {
      console.error('Failed to fetch sterilization cycles:', error);
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
      let statusMatch = false;
      if (options.status === 'all') {
        statusMatch = true;
      } else if (options.status === 'in_progress') {
        // Include both 'pending' and 'in_progress' for "In Progress" filter
        statusMatch = log.status === 'pending' || log.status === 'in_progress';
      } else {
        statusMatch = log.status === options.status;
      }

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
      completed: logs.filter((log) => log.status === 'completed').length,
      failed: logs.filter((log) => log.status === 'failed').length,
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

  /**
   * Export cleaning logs to CSV
   */
  static exportToCSV(logs: CleaningLog[]): void {
    if (!logs || logs.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      // Define CSV headers
      const headers = [
        'Cycle ID',
        'Room Name',
        'Status',
        'Cleaning Type',
        'Scheduled Time',
        'Started Time',
        'Completed Time',
        'Operator ID',
        'Notes',
        'Created At',
        'Updated At',
      ];

      // Convert logs to CSV rows
      const csvRows = logs.map((log) => [
        log.id,
        log.room_name,
        log.status,
        log.cleaning_type,
        log.scheduled_time || '',
        log.started_time || '',
        log.completed_time || '',
        log.operator_id || '',
        log.notes || '',
        log.created_at,
        log.updated_at,
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...csvRows.map((row) => row.map((field) => `"${field}"`).join(',')),
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cleaning_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export cleaning logs:', error);
      alert('Failed to export data. Please try again.');
    }
  }
}
