import { supabase } from '@/lib/supabaseClient';

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, boolean>;
  facility_id: string;
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRoleData {
  name: string;
  description: string;
  permissions: Record<string, boolean>;
  facility_id: string;
  created_by: string;
}

class RoleService {
  /**
   * Get all roles for a facility (including default and custom)
   */
  async getRoles(facilityId: string): Promise<CustomRole[]> {
    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .select('*')
        .eq('facility_id', facilityId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to get roles: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting roles:', error);
      throw error;
    }
  }

  /**
   * Create a new custom role
   */
  async createRole(roleData: CreateRoleData): Promise<CustomRole> {
    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .insert({
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
          facility_id: roleData.facility_id,
          created_by: roleData.created_by,
          is_default: false
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create role: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Update an existing role
   */
  async updateRole(roleId: string, updates: Partial<CreateRoleData>): Promise<CustomRole> {
    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .update({
          name: updates.name,
          description: updates.description,
          permissions: updates.permissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', roleId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update role: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  /**
   * Delete a custom role (cannot delete default roles)
   */
  async deleteRole(roleId: string): Promise<void> {
    try {
      // First check if it's a default role
      const { data: role, error: checkError } = await supabase
        .from('custom_roles')
        .select('is_default')
        .eq('id', roleId)
        .single();

      if (checkError) {
        throw new Error(`Failed to check role: ${checkError.message}`);
      }

      if (role.is_default) {
        throw new Error('Cannot delete default roles');
      }

      // Check if any users are using this role
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('role', roleId)
        .limit(1);

      if (usersError) {
        throw new Error(`Failed to check role usage: ${usersError.message}`);
      }

      if (users && users.length > 0) {
        throw new Error('Cannot delete role that is currently assigned to users');
      }

      // Delete the role
      const { error } = await supabase
        .from('custom_roles')
        .delete()
        .eq('id', roleId);

      if (error) {
        throw new Error(`Failed to delete role: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  /**
   * Get default roles (these are predefined and cannot be deleted)
   */
  getDefaultRoles(): CustomRole[] {
    return [
      {
        id: 'administrator',
        name: '👑 Administrator',
        description: 'Full system access',
        permissions: {
          view_dashboard: true,
          view_analytics: true,
          export_data: true,
          manage_users: true,
          assign_roles: true,
          view_user_activity: true,
          system_settings: true,
          facility_settings: true,
          security_settings: true,
          create_tasks: true,
          edit_tasks: true,
          delete_tasks: true,
          assign_tasks: true
        },
        facility_id: '',
        is_default: true,
        created_by: '',
        created_at: '',
        updated_at: ''
      },
      {
        id: 'manager',
        name: '👨‍💼 Manager',
        description: 'Department management',
        permissions: {
          view_dashboard: true,
          view_analytics: true,
          export_data: true,
          manage_users: false,
          assign_roles: true,
          view_user_activity: true,
          system_settings: false,
          facility_settings: true,
          security_settings: false,
          create_tasks: true,
          edit_tasks: true,
          delete_tasks: true,
          assign_tasks: true
        },
        facility_id: '',
        is_default: true,
        created_by: '',
        created_at: '',
        updated_at: ''
      },
      {
        id: 'technician',
        name: '🔧 Technician',
        description: 'Task execution',
        permissions: {
          view_dashboard: true,
          view_analytics: false,
          export_data: false,
          manage_users: false,
          assign_roles: false,
          view_user_activity: false,
          system_settings: false,
          facility_settings: false,
          security_settings: false,
          create_tasks: true,
          edit_tasks: true,
          delete_tasks: false,
          assign_tasks: false
        },
        facility_id: '',
        is_default: true,
        created_by: '',
        created_at: '',
        updated_at: ''
      },
      {
        id: 'viewer',
        name: '👀 Viewer',
        description: 'Read-only access',
        permissions: {
          view_dashboard: true,
          view_analytics: true,
          export_data: false,
          manage_users: false,
          assign_roles: false,
          view_user_activity: false,
          system_settings: false,
          facility_settings: false,
          security_settings: false,
          create_tasks: false,
          edit_tasks: false,
          delete_tasks: false,
          assign_tasks: false
        },
        facility_id: '',
        is_default: true,
        created_by: '',
        created_at: '',
        updated_at: ''
      },
      {
        id: 'trainer',
        name: '📚 Trainer',
        description: 'Content management',
        permissions: {
          view_dashboard: true,
          view_analytics: true,
          export_data: true,
          manage_users: false,
          assign_roles: false,
          view_user_activity: false,
          system_settings: false,
          facility_settings: true,
          security_settings: false,
          create_tasks: true,
          edit_tasks: true,
          delete_tasks: false,
          assign_tasks: true
        },
        facility_id: '',
        is_default: true,
        created_by: '',
        created_at: '',
        updated_at: ''
      }
    ];
  }

  /**
   * Get all roles (default + custom) for a facility
   */
  async getAllRoles(facilityId: string): Promise<CustomRole[]> {
    try {
      const defaultRoles = this.getDefaultRoles();
      const customRoles = await this.getRoles(facilityId);
      
      return [...defaultRoles, ...customRoles];
    } catch (error) {
      console.error('Error getting all roles:', error);
      throw error;
    }
  }

  /**
   * Check if a role name is unique within a facility
   */
  async isRoleNameUnique(facilityId: string, name: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('custom_roles')
        .select('id')
        .eq('facility_id', facilityId)
        .eq('name', name);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to check role name: ${error.message}`);
      }

      return !data || data.length === 0;
    } catch (error) {
      console.error('Error checking role name uniqueness:', error);
      throw error;
    }
  }
}

export const roleService = new RoleService();
