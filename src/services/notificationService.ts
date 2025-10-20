import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  action_url?: string;
  action_data?: Record<string, any>;
  module?: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
  read_at?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  facility_id: string;
}

export class NotificationService {
  /**
   * Create a notification for content approval
   */
  static async notifyContentApproval(
    userId: string,
    facilityId: string,
    contentId: string,
    contentType: 'course' | 'policy' | 'procedure' | 'learning_pathway',
    action: 'approved' | 'rejected',
    comments?: string,
    approverName?: string
  ): Promise<Notification> {
    try {
      const contentTitle = await this.getContentTitle(contentId, contentType);
      
      const notificationData = {
        user_id: userId,
        facility_id: facilityId,
        notification_type: 'content_approval',
        title: action === 'approved' 
          ? 'Content Approved!' 
          : 'Content Needs Revision',
        message: action === 'approved'
          ? `Your ${contentType} "${contentTitle}" has been approved and published to the Library.${comments ? `\n\nReviewer comment: "${comments}"` : ''}`
          : `Your ${contentType} "${contentTitle}" needs revision.${comments ? `\n\nReason: "${comments}"` : ''}`,
        action_url: `/content-builder?tab=drafts&content=${contentId}`,
        action_data: {
          contentId,
          contentType,
          action,
          comments,
          approverName,
          contentTitle
        },
        module: 'content_management',
        severity: action === 'approved' ? 'success' : 'warning',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating content approval notification:', error);
      throw error;
    }
  }

  /**
   * Create a notification for task assignment
   */
  static async notifyTaskAssignment(
    userId: string,
    facilityId: string,
    taskId: string,
    taskTitle: string,
    taskDescription?: string
  ): Promise<Notification> {
    try {
      const notificationData = {
        user_id: userId,
        facility_id: facilityId,
        notification_type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned a new task: "${taskTitle}"${taskDescription ? `\n\n${taskDescription}` : ''}`,
        action_url: `/settings?tab=content&subtab=publishing&review=${taskId}`,
        action_data: {
          taskId,
          taskTitle,
          taskDescription
        },
        module: 'content_management',
        severity: 'info',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating task assignment notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a specific user
   */
  static async getUserNotifications(
    userId: string,
    facilityId: string,
    limit: number = 50,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (unreadOnly) {
        query = query.is('read_at', null);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read_at: new Date().toISOString(),
          is_read: true
        })
        .eq('id', notificationId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string, facilityId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read_at: new Date().toISOString(),
          is_read: true
        })
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .is('read_at', null);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string, facilityId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .is('read_at', null);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      throw error;
    }
  }

  /**
   * Delete expired notifications
   */
  static async deleteExpiredNotifications(): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting expired notifications:', error);
      throw error;
    }
  }

  /**
   * Get content title for notification
   */
  private static async getContentTitle(
    contentId: string, 
    contentType: 'course' | 'policy' | 'procedure' | 'learning_pathway'
  ): Promise<string> {
    try {
      const tableName = contentType === 'learning_pathway' ? 'courses' : contentType;
      
      const { data, error } = await supabase
        .from(tableName)
        .select('title')
        .eq('id', contentId)
        .single();

      if (error) {
        throw error;
      }

      return data?.title || 'Untitled Content';
    } catch (error) {
      console.error('Error fetching content title:', error);
      return 'Untitled Content';
    }
  }

  /**
   * Create a batch of notifications for multiple users
   */
  static async createBatchNotifications(
    notifications: Omit<Notification, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<Notification[]> {
    try {
      const notificationData = notifications.map(notification => ({
        ...notification,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select();

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error creating batch notifications:', error);
      throw error;
    }
  }
}
