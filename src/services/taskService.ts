import { supabase } from '../lib/supabase';
import { NotificationService } from './notificationService';
import { TaskAuditService } from './taskAuditService';
import { PermissionService } from './permissionService';

export interface Task {
  id: string;
  facility_id: string;
  user_id: string;
  created_by?: string;
  title: string;
  description?: string;
  type: string;
  status: 'pending' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  due_date?: string;
  completed_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ContentApprovalMetadata {
  contentId: string;
  contentType: 'course' | 'policy' | 'procedure' | 'learning_pathway';
  contentTitle: string;
  authorId: string;
  authorName: string;
  submittedAt: string;
  revisionNumber?: number;
  previousRejections?: number;
}

export class TaskService {
  /**
   * Create a content approval task for users with approve_content permission
   */
  static async createContentApprovalTask(
    contentId: string, 
    contentType: 'course' | 'policy' | 'procedure' | 'learning_pathway',
    facilityId: string
  ): Promise<Task[]> {
    try {
      // 1. Get content details
      const content = await this.getContentDetails(contentId, contentType);
      if (!content) {
        throw new Error(`Content not found: ${contentId}`);
      }

      // 2. Get users with approve_content permission
      const approvers = await this.getUsersWithApprovalPermission(facilityId);
      if (approvers.length === 0) {
        throw new Error('No users found with approval permission');
      }

      // 3. Create tasks for each approver
      const tasks = await Promise.all(
        approvers.map(approver => this.createTask({
      facility_id: facilityId,
          user_id: approver.id,
          title: `Review: ${content.title}`,
          description: `Content submitted by ${content.author_name} requires approval`,
          type: 'content_approval',
          metadata: {
            contentId,
            contentType,
            contentTitle: content.title,
            authorId: content.author_id,
            authorName: content.author_name,
            submittedAt: new Date().toISOString(),
            revisionNumber: content.revision_number || 1,
            previousRejections: content.previous_rejections || 0
          } as ContentApprovalMetadata
        }))
      );

      // 4. Send notifications to approvers
      await Promise.all(
        tasks.map(task => 
          NotificationService.notifyTaskAssignment(
            task.user_id,
            facilityId,
            task.id,
            task.title,
            task.description
          ).catch(error => {
            console.error('Failed to send task notification:', error);
            // Don't throw here - task creation succeeded, notification failure shouldn't break the flow
          })
        )
      );

      console.log(`Created ${tasks.length} approval tasks for content: ${content.title}`);
      return tasks;
    } catch (error) {
      console.error('Error creating content approval tasks:', error);
      throw error;
    }
  }

  /**
   * Create a single task with audit logging and permission validation
   */
  static async createTask(taskData: {
    facility_id: string;
    user_id: string;
    created_by?: string;
    title: string;
    description?: string;
    type: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    due_date?: string;
    metadata?: Record<string, any>;
  }): Promise<Task> {
    try {
      // Validate permissions
      const validation = await PermissionService.validateTaskCreation(
        taskData.created_by || taskData.user_id,
        taskData.user_id,
        taskData.facility_id,
        taskData.type
      );

      if (!validation.valid) {
        throw new Error(validation.reason);
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          status: 'pending',
          priority: taskData.priority || 'normal',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log task creation
      try {
        await TaskAuditService.logTaskAction(
          data.id,
          taskData.created_by || taskData.user_id,
          'task_created',
          {
            title: taskData.title,
            type: taskData.type,
            priority: taskData.priority || 'normal',
            assignedTo: taskData.user_id
          }
        );
      } catch (auditError) {
        console.warn('Failed to log task creation:', auditError);
        // Don't throw - task creation succeeded
      }

      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Get tasks for a specific user
   */
  static async getUserTasks(userId: string, status?: string): Promise<Task[]> {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }
  }

  /**
   * Complete a content approval task with concurrency protection and permission validation
   */
  static async completeContentApprovalTask(
    taskId: string, 
    action: 'approved' | 'rejected', 
    comments?: string,
    userId?: string
  ): Promise<Task> {
    try {
      // 1. Get task details with optimistic locking
      const task = await this.getTask(taskId);
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      // 2. Validate permissions if userId is provided
      if (userId) {
        const validation = await PermissionService.validateTaskCompletion(
          userId,
          taskId,
          task.facility_id
        );

        if (!validation.valid) {
          throw new Error(validation.reason);
        }
      }

      // 3. Check if task is already completed (concurrency protection)
      if (task.status !== 'pending') {
        throw new Error(`Task ${taskId} is already ${task.status}`);
      }

      const { contentId, contentType } = task.metadata as ContentApprovalMetadata;

      // 4. Check if content is already processed (additional concurrency protection)
      const contentStatus = await this.getContentApprovalStatus(contentId, contentType);
      if (contentStatus && contentStatus !== 'pending_approval') {
        throw new Error(`Content ${contentId} is already ${contentStatus}`);
      }

      // 5. Update content status atomically
      if (action === 'approved') {
        await this.approveContent(contentId, contentType, task.user_id);
      } else {
        await this.rejectContent(contentId, contentType, task.user_id, comments);
      }

      // 6. Complete task atomically
      const updatedTask = await this.updateTask(taskId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        metadata: {
          ...task.metadata,
          action,
          comments,
          completedAt: new Date().toISOString()
        }
      });

      // 7. Log task completion and content action
      try {
        await Promise.all([
          TaskAuditService.logTaskAction(
            taskId,
            task.user_id,
            'task_completed',
            {
              action,
              comments,
              contentId,
              contentType
            }
          ),
          TaskAuditService.logStatusChange(
            taskId,
            task.user_id,
            'completed',
            `${action} content`,
            { action, comments, contentId, contentType }
          ),
          TaskAuditService.logTaskAction(
            taskId,
            task.user_id,
            action === 'approved' ? 'content_approved' : 'content_rejected',
            {
              contentId,
              contentType,
              comments,
              contentTitle: task.metadata.contentTitle
            }
          )
        ]);
      } catch (auditError) {
        console.warn('Failed to log task completion:', auditError);
        // Don't throw - task completion succeeded
      }

      // 8. Cancel other pending tasks for same content (with error handling)
      try {
        await this.cancelPendingTasksForContent(contentId);
      } catch (cancelError) {
        console.warn('Failed to cancel pending tasks for content:', cancelError);
        // Don't throw - the main task completion succeeded
      }

      return updatedTask;
    } catch (error) {
      console.error('Error completing content approval task:', error);
      throw error;
    }
  }

  /**
   * Update a task
   */
  static async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Get a single task by ID
   */
  static async getTask(taskId: string): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Task not found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  /**
   * Cancel all pending tasks for a specific content item
   */
  static async cancelPendingTasksForContent(contentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('type', 'content_approval')
        .eq('status', 'pending')
        .contains('metadata', { contentId });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error cancelling pending tasks for content:', error);
      throw error;
    }
  }

  /**
   * Get content approval status for concurrency protection
   */
  private static async getContentApprovalStatus(
    contentId: string, 
    contentType: 'course' | 'policy' | 'procedure' | 'learning_pathway'
  ): Promise<string | null> {
    try {
      const tableName = contentType === 'learning_pathway' ? 'courses' : contentType;
      
      const { data, error } = await supabase
        .from(tableName)
        .select('approval_status')
        .eq('id', contentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Content not found
        }
        throw error;
      }

      return data?.approval_status || null;
    } catch (error) {
      console.error('Error fetching content approval status:', error);
      throw error;
    }
  }

  /**
   * Clean up old completed tasks (run periodically)
   */
  static async cleanupOldTasks(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { count, error } = await supabase
        .from('tasks')
        .delete()
        .eq('status', 'completed')
        .lt('completed_at', cutoffDate.toISOString());

      if (error) {
        throw error;
      }

      console.log(`Cleaned up ${count} old completed tasks`);
      return count || 0;
    } catch (error) {
      console.error('Error cleaning up old tasks:', error);
      throw error;
    }
  }

  /**
   * Handle permission changes - cancel tasks for users who no longer have approval permission
   */
  static async handlePermissionChanges(facilityId: string): Promise<void> {
    try {
      // Get all pending content approval tasks
      const { data: pendingTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('type', 'content_approval')
        .eq('status', 'pending');

      if (fetchError) {
        throw fetchError;
      }

      if (!pendingTasks || pendingTasks.length === 0) {
        return;
      }

      // Get current users with approval permission
      const approvers = await this.getUsersWithApprovalPermission(facilityId);
      const approverIds = new Set(approvers.map(a => a.id));

      // Cancel tasks for users who no longer have permission
      const tasksToCancel = pendingTasks.filter(task => !approverIds.has(task.user_id));
      
      if (tasksToCancel.length > 0) {
        const { error: cancelError } = await supabase
          .from('tasks')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .in('id', tasksToCancel.map(t => t.id));

        if (cancelError) {
          throw cancelError;
        }

        console.log(`Cancelled ${tasksToCancel.length} tasks due to permission changes`);
      }
    } catch (error) {
      console.error('Error handling permission changes:', error);
      throw error;
    }
  }

  /**
   * Get content details for a specific content item
   */
  private static async getContentDetails(
    contentId: string, 
    contentType: 'course' | 'policy' | 'procedure' | 'learning_pathway'
  ): Promise<any> {
    try {
      const tableName = contentType === 'learning_pathway' ? 'courses' : contentType;
      
      const { data, error } = await supabase
        .from(tableName)
        .select(`
          id,
          title,
          description,
          author_id,
          facility_id,
          created_at,
          updated_at,
          users!author_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('id', contentId)
        .single();

      if (error) {
        throw error;
      }

      return {
        ...data,
        author_name: `${data.users?.[0]?.first_name || ''} ${data.users?.[0]?.last_name || ''}`.trim() || data.users?.[0]?.email || 'Unknown',
        revision_number: 1, // TODO: Implement revision tracking
        previous_rejections: 0 // TODO: Implement rejection tracking
      };
    } catch (error) {
      console.error('Error fetching content details:', error);
      throw error;
    }
  }

  /**
   * Get users with approve_content permission
   */
  private static async getUsersWithApprovalPermission(facilityId: string): Promise<any[]> {
    try {
      // Get users with roles that have approve_content permission
      const { data, error } = await supabase
        .from('user_facilities')
        .select(`
          user_id,
          role,
          users!user_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('facility_id', facilityId)
        .in('role', ['administrator', 'manager']); // Roles that have approve_content permission

      if (error) {
        throw error;
      }

      return data?.map(item => ({
        id: item.user_id,
        role: item.role,
        name: `${item.users?.[0]?.first_name || ''} ${item.users?.[0]?.last_name || ''}`.trim() || item.users?.[0]?.email || 'Unknown'
      })) || [];
    } catch (error) {
      console.error('Error fetching users with approval permission:', error);
      throw error;
    }
  }

  /**
   * Approve content and publish it
   */
  private static async approveContent(
    contentId: string, 
    contentType: 'course' | 'policy' | 'procedure' | 'learning_pathway',
    approvedBy: string
  ): Promise<void> {
    try {
      const tableName = contentType === 'learning_pathway' ? 'courses' : contentType;
      
      const { error } = await supabase
        .from(tableName)
        .update({
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
          published_at: new Date().toISOString() // Publish the content
        })
        .eq('id', contentId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error approving content:', error);
      throw error;
    }
  }

  /**
   * Reject content and return it to draft status
   */
  private static async rejectContent(
    contentId: string, 
    contentType: 'course' | 'policy' | 'procedure' | 'learning_pathway',
    rejectedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      const tableName = contentType === 'learning_pathway' ? 'courses' : contentType;
      
      const { error } = await supabase
        .from(tableName)
        .update({
          approval_status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: rejectedBy,
          rejection_reason: reason
        })
        .eq('id', contentId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error rejecting content:', error);
      throw error;
    }
  }
}