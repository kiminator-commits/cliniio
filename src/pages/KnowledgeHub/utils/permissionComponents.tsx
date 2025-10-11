import React from 'react';
import { useUser } from '../../../contexts/UserContext';
import {
  Permission,
  UserRole,
  getPermissionsForRole,
  getUserRole,
} from './permissions';

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
    const permissions = getPermissionsForRole(role);
    return permissions[permission] || false;
  };

  if (!hasPermissionFor(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
