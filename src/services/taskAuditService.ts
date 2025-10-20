import { supabase } from '../lib/supabase';

export interface TaskAuditLog {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export interface TaskStatusHistory {
  id: string;
  task_id: string;
  status: string;
  changed_by: string;
  changed_at: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export class TaskAuditService {
  /**
   * Log a task action for audit trail
   */
  static async logTaskAction(
    taskId: string,
    userId: string,
    action: string,
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<TaskAuditLog> {
    try {
      const auditLog = {
        task_id: taskId,
        user_id: userId,
        action,
        details,
        timestamp: new Date().toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent
      };

      const { data, error } = await supabase
        .from('task_audit_logs')
        .insert(auditLog)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error logging task action:', error);
      throw error;
    }
  }

  /**
   * Log task status change
   */
  static async logStatusChange(
    taskId: string,
    userId: string,
    status: string,
    reason?: string,
    metadata?: Record<string, any>
  ): Promise<TaskStatusHistory> {
    try {
      const statusHistory = {
        task_id: taskId,
        status,
        changed_by: userId,
        changed_at: new Date().toISOString(),
        reason,
        metadata
      };

      const { data, error } = await supabase
        .from('task_status_history')
        .insert(statusHistory)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error logging status change:', error);
      throw error;
    }
  }

  /**
   * Get audit trail for a specific task
   */
  static async getTaskAuditTrail(taskId: string): Promise<TaskAuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('task_audit_logs')
        .select(`
          *,
          users!user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('task_id', taskId)
        .order('timestamp', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching task audit trail:', error);
      throw error;
    }
  }

  /**
   * Get status history for a specific task
   */
  static async getTaskStatusHistory(taskId: string): Promise<TaskStatusHistory[]> {
    try {
      const { data, error } = await supabase
        .from('task_status_history')
        .select(`
          *,
          users!changed_by (
            first_name,
            last_name,
            email
          )
        `)
        .eq('task_id', taskId)
        .order('changed_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching task status history:', error);
      throw error;
    }
  }

  /**
   * Get audit trail for content approval workflow
   */
  static async getContentApprovalAuditTrail(contentId: string): Promise<TaskAuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('task_audit_logs')
        .select(`
          *,
          users!user_id (
            first_name,
            last_name,
            email
          )
        `)
        .contains('details', { contentId })
        .order('timestamp', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching content approval audit trail:', error);
      throw error;
    }
  }

  /**
   * Get user activity summary
   */
  static async getUserActivitySummary(
    userId: string,
    facilityId: string,
    days: number = 30
  ): Promise<{
    tasksCreated: number;
    tasksCompleted: number;
    tasksCancelled: number;
    approvalsGiven: number;
    rejectionsGiven: number;
    recentActivity: TaskAuditLog[];
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Get recent activity
      const { data: recentActivity, error: activityError } = await supabase
        .from('task_audit_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', cutoffDate.toISOString())
        .order('timestamp', { ascending: false })
        .limit(50);

      if (activityError) {
        throw activityError;
      }

      // Calculate summary statistics
      const tasksCreated = recentActivity?.filter(log => log.action === 'task_created').length || 0;
      const tasksCompleted = recentActivity?.filter(log => log.action === 'task_completed').length || 0;
      const tasksCancelled = recentActivity?.filter(log => log.action === 'task_cancelled').length || 0;
      const approvalsGiven = recentActivity?.filter(log => log.action === 'content_approved').length || 0;
      const rejectionsGiven = recentActivity?.filter(log => log.action === 'content_rejected').length || 0;

      return {
        tasksCreated,
        tasksCompleted,
        tasksCancelled,
        approvalsGiven,
        rejectionsGiven,
        recentActivity: recentActivity || []
      };
    } catch (error) {
      console.error('Error fetching user activity summary:', error);
      throw error;
    }
  }

  /**
   * Get facility-wide approval metrics
   */
  static async getFacilityApprovalMetrics(
    facilityId: string,
    days: number = 30
  ): Promise<{
    totalSubmissions: number;
    totalApprovals: number;
    totalRejections: number;
    averageApprovalTime: number;
    approvalRate: number;
    topReviewers: Array<{ userId: string; userName: string; count: number }>;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Get all approval-related activities
      const { data: activities, error: activityError } = await supabase
        .from('task_audit_logs')
        .select(`
          *,
          users!user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('facility_id', facilityId)
        .in('action', ['content_submitted', 'content_approved', 'content_rejected'])
        .gte('timestamp', cutoffDate.toISOString());

      if (activityError) {
        throw activityError;
      }

      const activitiesList = activities || [];
      
      const totalSubmissions = activitiesList.filter(a => a.action === 'content_submitted').length;
      const totalApprovals = activitiesList.filter(a => a.action === 'content_approved').length;
      const totalRejections = activitiesList.filter(a => a.action === 'content_rejected').length;
      
      const approvalRate = totalSubmissions > 0 ? (totalApprovals / totalSubmissions) * 100 : 0;

      // Calculate average approval time (simplified)
      const averageApprovalTime = this.calculateAverageApprovalTime(activitiesList);

      // Get top reviewers
      const reviewerCounts = new Map<string, { name: string; count: number }>();
      activitiesList
        .filter(a => a.action === 'content_approved' || a.action === 'content_rejected')
        .forEach(activity => {
          const userId = activity.user_id;
          const userName = `${activity.users?.first_name || ''} ${activity.users?.last_name || ''}`.trim() || activity.users?.email || 'Unknown';
          
          if (reviewerCounts.has(userId)) {
            reviewerCounts.get(userId)!.count++;
          } else {
            reviewerCounts.set(userId, { name: userName, count: 1 });
          }
        });

      const topReviewers = Array.from(reviewerCounts.entries())
        .map(([userId, data]) => ({ userId, userName: data.name, count: data.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalSubmissions,
        totalApprovals,
        totalRejections,
        averageApprovalTime,
        approvalRate,
        topReviewers
      };
    } catch (error) {
      console.error('Error fetching facility approval metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate average approval time from activities
   */
  private static calculateAverageApprovalTime(activities: TaskAuditLog[]): number {
    const submissions = activities.filter(a => a.action === 'content_submitted');
    const approvals = activities.filter(a => a.action === 'content_approved');

    if (submissions.length === 0 || approvals.length === 0) {
      return 0;
    }

    let totalTime = 0;
    let processedCount = 0;

    approvals.forEach(approval => {
      const contentId = approval.details?.contentId;
      if (contentId) {
        const submission = submissions.find(s => s.details?.contentId === contentId);
        if (submission) {
          const submissionTime = new Date(submission.timestamp).getTime();
          const approvalTime = new Date(approval.timestamp).getTime();
          totalTime += approvalTime - submissionTime;
          processedCount++;
        }
      }
    });

    return processedCount > 0 ? totalTime / processedCount / (1000 * 60 * 60) : 0; // Return hours
  }

  /**
   * Clean up old audit logs (run periodically)
   */
  static async cleanupOldAuditLogs(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { count, error } = await supabase
        .from('task_audit_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());

      if (error) {
        throw error;
      }

      console.log(`Cleaned up ${count} old audit logs`);
      return count || 0;
    } catch (error) {
      console.error('Error cleaning up old audit logs:', error);
      throw error;
    }
  }
}
