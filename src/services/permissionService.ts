import { supabase } from '../lib/supabase';

export interface UserPermission {
  userId: string;
  facilityId: string;
  role: string;
  permissions: {
    approve_content: boolean;
    create_content: boolean;
    edit_content: boolean;
    delete_content: boolean;
    manage_users: boolean;
    view_analytics: boolean;
  };
}

export class PermissionService {
  /**
   * Check if user has approval permission
   */
  static async hasApprovalPermission(userId: string, facilityId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_facilities')
        .select('role')
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .single();

      if (error) {
        console.error('Error checking approval permission:', error);
        return false;
      }

      // Roles that have approval permission
      const approvalRoles = ['administrator', 'manager'];
      return approvalRoles.includes(data?.role);
    } catch (error) {
      console.error('Error checking approval permission:', error);
      return false;
    }
  }

  /**
   * Check if user can create content
   */
  static async canCreateContent(userId: string, facilityId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_facilities')
        .select('role')
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .single();

      if (error) {
        console.error('Error checking content creation permission:', error);
        return false;
      }

      // Most roles can create content
      const contentCreationRoles = ['administrator', 'manager', 'technician', 'trainer'];
      return contentCreationRoles.includes(data?.role);
    } catch (error) {
      console.error('Error checking content creation permission:', error);
      return false;
    }
  }

  /**
   * Check if user can edit specific content
   */
  static async canEditContent(userId: string, facilityId: string, contentId: string, contentType: string): Promise<boolean> {
    try {
      // First check if user has general edit permission
      const { data: userRole, error: roleError } = await supabase
        .from('user_facilities')
        .select('role')
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .single();

      if (roleError) {
        console.error('Error checking edit permission:', roleError);
        return false;
      }

      // Administrators and managers can edit any content
      if (['administrator', 'manager'].includes(userRole?.role)) {
        return true;
      }

      // Check if user is the author of the content
      const tableName = contentType === 'learning_pathway' ? 'courses' : contentType;
      const { data: content, error: contentError } = await supabase
        .from(tableName)
        .select('author_id')
        .eq('id', contentId)
        .eq('facility_id', facilityId)
        .single();

      if (contentError) {
        console.error('Error checking content ownership:', contentError);
        return false;
      }

      return content?.author_id === userId;
    } catch (error) {
      console.error('Error checking content edit permission:', error);
      return false;
    }
  }

  /**
   * Check if user can manage tasks
   */
  static async canManageTasks(userId: string, facilityId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_facilities')
        .select('role')
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .single();

      if (error) {
        console.error('Error checking task management permission:', error);
        return false;
      }

      // Roles that can manage tasks
      const taskManagementRoles = ['administrator', 'manager'];
      return taskManagementRoles.includes(data?.role);
    } catch (error) {
      console.error('Error checking task management permission:', error);
      return false;
    }
  }

  /**
   * Get user permissions for a facility
   */
  static async getUserPermissions(userId: string, facilityId: string): Promise<UserPermission | null> {
    try {
      const { data, error } = await supabase
        .from('user_facilities')
        .select('role')
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .single();

      if (error) {
        console.error('Error fetching user permissions:', error);
        return null;
      }

      const role = data?.role;
      if (!role) {
        return null;
      }

      // Define permissions based on role
      const permissions = this.getRolePermissions(role);

      return {
        userId,
        facilityId,
        role,
        permissions
      };
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return null;
    }
  }

  /**
   * Get permissions for a specific role
   */
  private static getRolePermissions(role: string) {
    const rolePermissions: Record<string, any> = {
      administrator: {
        approve_content: true,
        create_content: true,
        edit_content: true,
        delete_content: true,
        manage_users: true,
        view_analytics: true
      },
      manager: {
        approve_content: true,
        create_content: true,
        edit_content: true,
        delete_content: false,
        manage_users: false,
        view_analytics: true
      },
      technician: {
        approve_content: false,
        create_content: true,
        edit_content: true,
        delete_content: false,
        manage_users: false,
        view_analytics: false
      },
      trainer: {
        approve_content: false,
        create_content: true,
        edit_content: true,
        delete_content: false,
        manage_users: false,
        view_analytics: false
      },
      viewer: {
        approve_content: false,
        create_content: false,
        edit_content: false,
        delete_content: false,
        manage_users: false,
        view_analytics: false
      }
    };

    return rolePermissions[role] || rolePermissions.viewer;
  }

  /**
   * Validate task creation permissions
   */
  static async validateTaskCreation(
    creatorId: string,
    assigneeId: string,
    facilityId: string,
    taskType: string
  ): Promise<{ valid: boolean; reason?: string }> {
    try {
      // Check if creator can create tasks
      if (!(await this.canManageTasks(creatorId, facilityId))) {
        return {
          valid: false,
          reason: 'You do not have permission to create tasks'
        };
      }

      // For content approval tasks, check if assignee can approve content
      if (taskType === 'content_approval') {
        if (!(await this.hasApprovalPermission(assigneeId, facilityId))) {
          return {
            valid: false,
            reason: 'Assigned user does not have approval permission'
          };
        }
      }

      return { valid: true };
    } catch (error) {
      console.error('Error validating task creation:', error);
      return {
        valid: false,
        reason: 'Error validating permissions'
      };
    }
  }

  /**
   * Validate task completion permissions
   */
  static async validateTaskCompletion(
    userId: string,
    taskId: string,
    facilityId: string
  ): Promise<{ valid: boolean; reason?: string }> {
    try {
      // Get task details
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('user_id, type, metadata')
        .eq('id', taskId)
        .eq('facility_id', facilityId)
        .single();

      if (taskError) {
        return {
          valid: false,
          reason: 'Task not found'
        };
      }

      // Check if user is assigned to the task
      if (task.user_id !== userId) {
        return {
          valid: false,
          reason: 'You are not assigned to this task'
        };
      }

      // For content approval tasks, check approval permission
      if (task.type === 'content_approval') {
        if (!(await this.hasApprovalPermission(userId, facilityId))) {
          return {
            valid: false,
            reason: 'You do not have permission to approve content'
          };
        }
      }

      return { valid: true };
    } catch (error) {
      console.error('Error validating task completion:', error);
      return {
        valid: false,
        reason: 'Error validating permissions'
      };
    }
  }

  /**
   * Validate content submission permissions
   */
  static async validateContentSubmission(
    userId: string,
    facilityId: string,
    contentType: string
  ): Promise<{ valid: boolean; reason?: string }> {
    try {
      if (!(await this.canCreateContent(userId, facilityId))) {
        return {
          valid: false,
          reason: 'You do not have permission to create content'
        };
      }

      return { valid: true };
    } catch (error) {
      console.error('Error validating content submission:', error);
      return {
        valid: false,
        reason: 'Error validating permissions'
      };
    }
  }

  /**
   * Check if user can view audit logs
   */
  static async canViewAuditLogs(userId: string, facilityId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_facilities')
        .select('role')
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .single();

      if (error) {
        console.error('Error checking audit log permission:', error);
        return false;
      }

      // Only administrators and managers can view audit logs
      const auditRoles = ['administrator', 'manager'];
      return auditRoles.includes(data?.role);
    } catch (error) {
      console.error('Error checking audit log permission:', error);
      return false;
    }
  }

  /**
   * Get users with specific permission in a facility
   */
  static async getUsersWithPermission(
    facilityId: string,
    permission: keyof UserPermission['permissions']
  ): Promise<Array<{ id: string; name: string; role: string }>> {
    try {
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
        .eq('facility_id', facilityId);

      if (error) {
        throw error;
      }

      const usersWithPermission = data
        ?.filter(item => {
          const permissions = this.getRolePermissions(item.role);
          return permissions[permission];
        })
        .map(item => ({
          id: item.user_id,
          name: `${item.users?.[0]?.first_name || ''} ${item.users?.[0]?.last_name || ''}`.trim() || item.users?.[0]?.email || 'Unknown',
          role: item.role
        })) || [];

      return usersWithPermission;
    } catch (error) {
      console.error('Error fetching users with permission:', error);
      throw error;
    }
  }
}
