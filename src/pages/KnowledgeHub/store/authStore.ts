import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  UserRole,
  Permission,
  getPermissionsForRole,
} from '../utils/permissions';

// Auth State interface
interface AuthState {
  currentUser: { id: string; role: UserRole } | null;
  permissions: Permission;
}

// Auth Actions interface
interface AuthActions {
  setCurrentUser: (user: { id: string; role: UserRole } | null) => void;

  // Permission checks
  canDeleteContent: () => boolean;
  canUpdateStatus: () => boolean;
  canCreateContent: () => boolean;
  canViewAllCategories: () => boolean;
  canManageUsers: () => boolean;
}

// Combined auth store type
type AuthStore = AuthState & AuthActions;

// Create the auth store
export const useAuthStore = create<AuthStore>()(
  devtools((set, get) => ({
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
  }))
);

// Selector hooks for auth state
export const useCurrentUser = () => useAuthStore((state) => state.currentUser);
export const usePermissions = () => useAuthStore((state) => state.permissions);

// Action hooks for auth
export const useSetCurrentUser = () =>
  useAuthStore((state) => state.setCurrentUser);

// Permission selector hooks
export const useCanDeleteContent = () =>
  useAuthStore((state) => state.canDeleteContent());
export const useCanUpdateStatus = () =>
  useAuthStore((state) => state.canUpdateStatus());
export const useCanCreateContent = () =>
  useAuthStore((state) => state.canCreateContent());
export const useCanViewAllCategories = () =>
  useAuthStore((state) => state.canViewAllCategories());
export const useCanManageUsers = () =>
  useAuthStore((state) => state.canManageUsers());
