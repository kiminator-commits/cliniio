import { StateCreator } from 'zustand';
import {
  UserRole,
  Permission,
  getPermissionsForRole,
} from '../../utils/permissions';

// Auth State interface
export interface AuthState {
  currentUser: { id: string; role: UserRole } | null;
  permissions: Permission;
}

// Auth Actions interface
export interface AuthActions {
  setCurrentUser: (user: { id: string; role: UserRole } | null) => void;

  // Permission checks
  canDeleteContent: () => boolean;
  canUpdateStatus: () => boolean;
  canCreateContent: () => boolean;
  canViewAllCategories: () => boolean;
  canManageUsers: () => boolean;
}

// Combined auth slice type
export type AuthSlice = AuthState & AuthActions;

// Auth slice creator
export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  // Initial state
  currentUser: null,
  permissions: getPermissionsForRole('User'),

  // Auth Actions
  setCurrentUser: (user: { id: string; role: UserRole } | null) => {
    if (user) {
      // Validate the role and fallback to 'User' if invalid
      const validRoles: UserRole[] = [
        'Administrator',
        'Physician',
        'Nurse',
        'Technician',
        'Student',
        'User',
      ];
      const validRole = validRoles.includes(user.role) ? user.role : 'User';
      const permissions = getPermissionsForRole(validRole);
      set({ currentUser: { ...user, role: validRole }, permissions });
    } else {
      const permissions = getPermissionsForRole('User');
      set({ currentUser: null, permissions });
    }
  },

  // Permission checks
  canDeleteContent: () => {
    const { permissions } = get();
    return permissions.canDeleteContent;
  },

  canUpdateStatus: () => {
    const { permissions } = get();
    return permissions.canUpdateStatus;
  },

  canCreateContent: () => {
    const { permissions } = get();
    return permissions.canCreateContent;
  },

  canViewAllCategories: () => {
    const { permissions } = get();
    return permissions.canViewAllCategories;
  },

  canManageUsers: () => {
    const { permissions } = get();
    return permissions.canManageUsers;
  },
});
