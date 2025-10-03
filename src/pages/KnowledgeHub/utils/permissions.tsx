import React from 'react';
import { useUser } from '../../../contexts/UserContext';

// Define user roles and their permissions
export type UserRole =
  | 'Administrator'
  | 'Physician'
  | 'Nurse'
  | 'Technician'
  | 'Student'
  | 'User';

export interface Permission {
  canDeleteContent: boolean;
  canUpdateStatus: boolean;
  canCreateContent: boolean;
  canViewAllCategories: boolean;
  canManageUsers: boolean;
}

// Permission matrix for different roles
const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  Administrator: {
    canDeleteContent: true,
    canUpdateStatus: true,
    canCreateContent: true,
    canViewAllCategories: true,
    canManageUsers: true,
  },
  Physician: {
    canDeleteContent: false,
    canUpdateStatus: true,
    canCreateContent: false,
    canViewAllCategories: true,
    canManageUsers: false,
  },
  Nurse: {
    canDeleteContent: false,
    canUpdateStatus: true,
    canCreateContent: false,
    canViewAllCategories: true,
    canManageUsers: false,
  },
  Technician: {
    canDeleteContent: false,
    canUpdateStatus: true,
    canCreateContent: false,
    canViewAllCategories: false,
    canManageUsers: false,
  },
  Student: {
    canDeleteContent: false,
    canUpdateStatus: false,
    canCreateContent: false,
    canViewAllCategories: false,
    canManageUsers: false,
  },
  User: {
    canDeleteContent: false,
    canUpdateStatus: false,
    canCreateContent: false,
    canViewAllCategories: false,
    canManageUsers: false,
  },
};

// Helper function to get user role from string
export const getUserRole = (roleString: string): UserRole => {
  const validRoles: UserRole[] = [
    'Administrator',
    'Physician',
    'Nurse',
    'Technician',
    'Student',
    'User',
  ];
  return validRoles.includes(roleString as UserRole)
    ? (roleString as UserRole)
    : 'User';
};

// Get permissions for a specific role
export const getPermissionsForRole = (role: UserRole): Permission => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.User;
};

// Check if user has specific permission
export const hasPermission = (
  userRole: UserRole,
  permission: keyof Permission
): boolean => {
  // Return false for empty role or permission
  if (!userRole || !permission) {
    return false;
  }

  const permissions = getPermissionsForRole(userRole);
  return permissions[permission] || false;
};

// Authentication check hook
export const useAuthCheck = () => {
  const { currentUser } = useUser();

  const isAuthenticated = (): boolean => {
    return !!currentUser && !!currentUser.id;
  };

  const getCurrentUserRole = (): UserRole => {
    if (!currentUser) return 'User';
    return getUserRole(currentUser.role);
  };

  const hasPermissionFor = (permission: keyof Permission): boolean => {
    if (!isAuthenticated()) return false;
    const role = getCurrentUserRole();
    return hasPermission(role, permission);
  };

  const canDeleteContent = (): boolean => {
    return hasPermissionFor('canDeleteContent');
  };

  const canUpdateStatus = (): boolean => {
    return hasPermissionFor('canUpdateStatus');
  };

  const canCreateContent = (): boolean => {
    return hasPermissionFor('canCreateContent');
  };

  const canViewAllCategories = (): boolean => {
    return hasPermissionFor('canViewAllCategories');
  };

  const canManageUsers = (): boolean => {
    return hasPermissionFor('canManageUsers');
  };

  return {
    isAuthenticated,
    getUserRole: getCurrentUserRole,
    hasPermissionFor,
    canDeleteContent,
    canUpdateStatus,
    canCreateContent,
    canViewAllCategories,
    canManageUsers,
    currentUser,
  };
};

// Permission guard component props
export interface PermissionGuardProps {
  permission: keyof Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// Permission guard component
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  fallback = null,
  children,
}) => {
  const { hasPermissionFor } = useAuthCheck();

  if (!hasPermissionFor(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Audit logging for sensitive operations
export const logSensitiveOperation = (
  operation: string,
  userId: string,
  userRole: UserRole,
  details: Record<string, unknown>
) => {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    operation,
    userId,
    userRole,
    details,
    ipAddress: 'client-side', // In a real app, this would come from the server
  };

  // Log to console for development (in production, this would go to a logging service)
  console.log('AUDIT LOG:', auditEntry);

  // In a real application, you would send this to your audit service
  // auditService.log(auditEntry);
};

// Secure operation wrapper
export const secureOperation = <T extends unknown[], R>(
  operation: (...args: T) => R,
  permission: keyof Permission,
  operationName: string
) => {
  return (...args: T): R | null => {
    const { isAuthenticated, hasPermissionFor, currentUser } = useAuthCheck();

    if (!isAuthenticated()) {
      console.warn(`Unauthenticated user attempted ${operationName}`);
      return null;
    }

    if (!hasPermissionFor(permission)) {
      console.warn(
        `User ${currentUser?.id} lacks permission for ${operationName}`
      );
      logSensitiveOperation(
        'PERMISSION_DENIED',
        currentUser?.id || 'unknown',
        getUserRole(currentUser?.role || 'User'),
        { operation: operationName, permission }
      );
      return null;
    }

    // Log the operation
    logSensitiveOperation(
      operationName,
      currentUser?.id || 'unknown',
      getUserRole(currentUser?.role || 'User'),
      {
        args: args.map((arg) =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ),
      }
    );

    return operation(...args);
  };
};
