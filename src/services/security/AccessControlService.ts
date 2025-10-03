// import { supabase } from '../../lib/supabaseClient';
import { securityAuditService } from './SecurityAuditService';
import { logger } from '../../utils/_core/logger';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[]; // Permission IDs
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  userId: string;
  roleId: string;
  facilityId?: string;
  assignedAt: Date;
  assignedBy: string;
  expiresAt?: Date;
}

export interface ResourcePolicy {
  id: string;
  resource: string;
  conditions: PolicyCondition[];
}

export interface PolicyCondition {
  operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  value?: unknown;
  values?: unknown[];
}

export interface AccessDecision {
  allowed: boolean;
  reason?: string;
  requiredPermissions?: string[];
  missingPermissions?: string[];
  conditions?: Record<string, unknown>;
}

export interface ResourceContext {
  resource: string;
  action: string;
  facilityId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export class AccessControlService {
  private static instance: AccessControlService;
  private permissions: Map<string, Permission> = new Map();
  private roles: Map<string, Role> = new Map();
  private userRoles: Map<string, UserRole[]> = new Map();
  private resourcePolicies: Map<string, ResourcePolicy[]> = new Map();

  private constructor() {
    this.initializeDefaultPermissions();
    this.initializeDefaultRoles();
  }

  static getInstance(): AccessControlService {
    if (!AccessControlService.instance) {
      AccessControlService.instance = new AccessControlService();
    }
    return AccessControlService.instance;
  }

  /**
   * Check if user has permission to access resource
   */
  async checkAccess(
    userId: string,
    context: ResourceContext
  ): Promise<AccessDecision> {
    try {
      // Get user roles
      // const userRoleList = this.getUserRoles(userId);

      // Get all permissions for user roles
      const userPermissions = this.getUserPermissions(
        userId,
        context.facilityId
      );

      // Check if user has required permission
      const requiredPermission = this.findRequiredPermission(context);
      if (!requiredPermission) {
        return {
          allowed: false,
          reason: 'No permission defined for this resource/action',
        };
      }

      const hasPermission = userPermissions.some(
        (permission) =>
          permission.id === requiredPermission.id &&
          this.evaluateConditions(permission, context)
      );

      if (hasPermission) {
        // Log successful access
        securityAuditService.logAuthorization(
          'access_granted',
          'success',
          userId,
          context.facilityId,
          context.resource,
          context.metadata
        );

        return {
          allowed: true,
          requiredPermissions: [requiredPermission.id],
        };
      } else {
        // Log failed access
        securityAuditService.logAuthorization(
          'access_denied',
          'failure',
          userId,
          context.facilityId,
          context.resource,
          context.metadata
        );

        return {
          allowed: false,
          reason: 'Insufficient permissions',
          requiredPermissions: [requiredPermission.id],
          missingPermissions: [requiredPermission.id],
        };
      }
    } catch (error) {
      logger.error('Error checking access:', error);
      return {
        allowed: false,
        reason: 'Error checking permissions',
      };
    }
  }

  /**
   * Check if user can perform action on specific record
   */
  async checkRecordAccess(
    userId: string,
    resource: string,
    action: string,
    recordId: string,
    facilityId?: string
  ): Promise<AccessDecision> {
    const context: ResourceContext = {
      resource,
      action,
      facilityId,
      userId,
      metadata: { recordId },
    };

    return this.checkAccess(userId, context);
  }

  /**
   * Get user roles
   */
  getUserRoles(userId: string, facilityId?: string): UserRole[] {
    const allRoles = this.userRoles.get(userId) || [];

    if (facilityId) {
      return allRoles.filter(
        (role) => !role.facilityId || role.facilityId === facilityId
      );
    }

    return allRoles;
  }

  /**
   * Get user permissions
   */
  getUserPermissions(userId: string, facilityId?: string): Permission[] {
    const userRoles = this.getUserRoles(userId, facilityId);
    const permissions: Permission[] = [];

    for (const userRole of userRoles) {
      const role = this.roles.get(userRole.roleId);
      if (role) {
        for (const permissionId of role.permissions) {
          const permission = this.permissions.get(permissionId);
          if (permission) {
            permissions.push(permission);
          }
        }
      }
    }

    return permissions;
  }

  /**
   * Assign role to user
   */
  async assignRole(
    userId: string,
    roleId: string,
    assignedBy: string,
    facilityId?: string,
    expiresAt?: Date
  ): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role not found: ${roleId}`);
    }

    const userRole: UserRole = {
      userId,
      roleId,
      facilityId,
      assignedAt: new Date(),
      assignedBy,
      expiresAt,
    };

    if (!this.userRoles.has(userId)) {
      this.userRoles.set(userId, []);
    }

    this.userRoles.get(userId)!.push(userRole);

    // Log role assignment
    securityAuditService.logAuthorization(
      'role_assigned',
      'success',
      userId,
      facilityId,
      'user_roles',
      { roleId, assignedBy, expiresAt }
    );

    logger.info(`Role ${roleId} assigned to user ${userId}`, userRole);
  }

  /**
   * Remove role from user
   */
  async removeRole(
    userId: string,
    roleId: string,
    facilityId?: string
  ): Promise<void> {
    const userRoleList = this.userRoles.get(userId) || [];
    const filteredRoles = userRoleList.filter(
      (role) =>
        role.roleId !== roleId || (facilityId && role.facilityId !== facilityId)
    );

    this.userRoles.set(userId, filteredRoles);

    // Log role removal
    securityAuditService.logAuthorization(
      'role_removed',
      'success',
      userId,
      facilityId,
      'user_roles',
      { roleId }
    );

    logger.info(`Role ${roleId} removed from user ${userId}`);
  }

  /**
   * Create new permission
   */
  createPermission(permission: Omit<Permission, 'id'>): Permission {
    const newPermission: Permission = {
      ...permission,
      id: `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.permissions.set(newPermission.id, newPermission);
    logger.info(`Permission created: ${newPermission.name}`, newPermission);

    return newPermission;
  }

  /**
   * Create new role
   */
  createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Role {
    const newRole: Role = {
      ...role,
      id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.roles.set(newRole.id, newRole);
    logger.info(`Role created: ${newRole.name}`, newRole);

    return newRole;
  }

  /**
   * Update role permissions
   */
  updateRolePermissions(roleId: string, permissionIds: string[]): void {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role not found: ${roleId}`);
    }

    role.permissions = permissionIds;
    role.updatedAt = new Date();

    logger.info(`Role permissions updated: ${role.name}`, { permissionIds });
  }

  /**
   * Get all permissions
   */
  getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  /**
   * Get all roles
   */
  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * Find required permission for context
   */
  private findRequiredPermission(context: ResourceContext): Permission | null {
    const resource = context.resource;
    const action = context.action;

    // Look for exact match first
    for (const permission of this.permissions.values()) {
      if (permission.resource === resource && permission.action === action) {
        return permission;
      }
    }

    // Look for wildcard matches
    for (const permission of this.permissions.values()) {
      if (permission.resource === '*' && permission.action === action) {
        return permission;
      }
      if (permission.resource === resource && permission.action === '*') {
        return permission;
      }
    }

    return null;
  }

  /**
   * Evaluate permission conditions
   */
  private evaluateConditions(
    permission: Permission,
    context: ResourceContext
  ): boolean {
    if (!permission.conditions) {
      return true;
    }

    for (const [key, value] of Object.entries(permission.conditions)) {
      const contextValue = context.metadata?.[key];

      if (typeof value === 'string') {
        if (contextValue !== value) {
          return false;
        }
      } else if (typeof value === 'object' && value !== null) {
        // Handle complex conditions
        const condition = value as PolicyCondition;
        if (
          condition.operator === 'equals' &&
          contextValue !== condition.value
        ) {
          return false;
        }
        if (
          condition.operator === 'not_equals' &&
          contextValue === condition.value
        ) {
          return false;
        }
        if (
          condition.operator === 'in' &&
          condition.values &&
          !condition.values.includes(contextValue)
        ) {
          return false;
        }
        if (
          condition.operator === 'not_in' &&
          condition.values &&
          condition.values.includes(contextValue)
        ) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Initialize default permissions
   */
  private initializeDefaultPermissions(): void {
    const defaultPermissions: Omit<Permission, 'id'>[] = [
      // User management
      { name: 'Create User', resource: 'users', action: 'create' },
      { name: 'Read User', resource: 'users', action: 'read' },
      { name: 'Update User', resource: 'users', action: 'update' },
      { name: 'Delete User', resource: 'users', action: 'delete' },

      // Facility management
      { name: 'Create Facility', resource: 'facilities', action: 'create' },
      { name: 'Read Facility', resource: 'facilities', action: 'read' },
      { name: 'Update Facility', resource: 'facilities', action: 'update' },
      { name: 'Delete Facility', resource: 'facilities', action: 'delete' },

      // Inventory management
      {
        name: 'Create Inventory Item',
        resource: 'inventory',
        action: 'create',
      },
      { name: 'Read Inventory Item', resource: 'inventory', action: 'read' },
      {
        name: 'Update Inventory Item',
        resource: 'inventory',
        action: 'update',
      },
      {
        name: 'Delete Inventory Item',
        resource: 'inventory',
        action: 'delete',
      },

      // Sterilization management
      {
        name: 'Create Sterilization Cycle',
        resource: 'sterilization',
        action: 'create',
      },
      {
        name: 'Read Sterilization Cycle',
        resource: 'sterilization',
        action: 'read',
      },
      {
        name: 'Update Sterilization Cycle',
        resource: 'sterilization',
        action: 'update',
      },
      {
        name: 'Delete Sterilization Cycle',
        resource: 'sterilization',
        action: 'delete',
      },

      // Reports and analytics
      { name: 'View Reports', resource: 'reports', action: 'read' },
      { name: 'Export Data', resource: 'data', action: 'export' },

      // System administration
      { name: 'Manage System Settings', resource: 'system', action: 'manage' },
      { name: 'View Audit Logs', resource: 'audit', action: 'read' },
      { name: 'Manage Users', resource: 'users', action: 'manage' },
    ];

    defaultPermissions.forEach((permission) => {
      this.createPermission(permission);
    });
  }

  /**
   * Initialize default roles
   */
  private initializeDefaultRoles(): void {
    // Initialize default roles - implementation commented out for now
    /*
    const adminRole = this.createRole({
      name: 'Administrator',
      description: 'Full system access',
      permissions: this.getAllPermissions().map(p => p.id),
      isSystemRole: true,
    });

    const managerRole = this.createRole({
      name: 'Manager',
      description: 'Facility management access',
      permissions: this.getAllPermissions()
        .filter(
          p =>
            p.resource === 'facilities' ||
            p.resource === 'inventory' ||
            p.resource === 'sterilization' ||
            p.resource === 'reports'
        )
        .map(p => p.id),
      isSystemRole: true,
    });

    const userRole = this.createRole({
      name: 'User',
      description: 'Basic user access',
      permissions: this.getAllPermissions()
        .filter(
          p =>
            p.action === 'read' &&
            (p.resource === 'inventory' ||
              p.resource === 'sterilization' ||
              p.resource === 'reports')
        )
        .map(p => p.id),
      isSystemRole: true,
    });
    */

    logger.info('Default roles and permissions initialized');
  }
}

// Singleton instance
export const accessControlService = AccessControlService.getInstance();
