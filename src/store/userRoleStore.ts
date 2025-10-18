import { create } from "zustand";
import { userRoleService, FacilityRole, UserFacilityRole, User } from "@/services/UserRoleService";

interface UserRoleState {
  users: User[];
  roles: FacilityRole[];
  userRoles: UserFacilityRole[];
  loading: boolean;
  error: string | null;
  fetchUsers: (facilityId: string) => Promise<void>;
  fetchRoles: (facilityId: string) => Promise<void>;
  fetchUserRoles: (facilityId: string) => Promise<void>;
  assignRole: (userId: string, facilityId: string, roleId: string) => Promise<void>;
  removeRole: (userId: string, facilityId: string, roleId: string) => Promise<void>;
  clearRoles: () => void;
}

export const useUserRoleStore = create<UserRoleState>((set) => ({
  users: [],
  roles: [],
  userRoles: [],
  loading: false,
  error: null,

  async fetchUsers(facilityId) {
    set({ loading: true, error: null });
    try {
      const users = await userRoleService.getUsers(facilityId);
      console.log("🔍 Store.fetchUsers - Received users:", users);
      console.log("🔍 Store.fetchUsers - First user:", users[0]);
      set({ users, loading: false });
    } catch (err: unknown) {
      console.error("🔍 Store.fetchUsers - Error:", err);
      set({ error: err instanceof Error ? err.message : String(err), loading: false });
    }
  },

  async fetchRoles(facilityId) {
    set({ loading: true, error: null });
    try {
      const roles = await userRoleService.getRoles(facilityId);
      set({ roles, loading: false });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : String(err), loading: false });
    }
  },

  async fetchUserRoles(facilityId) {
    set({ loading: true, error: null });
    try {
      const userRoles = await userRoleService.getUserRoles(facilityId);
      set({ userRoles, loading: false });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : String(err), loading: false });
    }
  },

  async assignRole(userId, facilityId, roleId) {
    set({ loading: true });
    try {
      await userRoleService.assignUserRole(userId, facilityId, roleId);
      await this.fetchUserRoles(facilityId);
      set({ loading: false });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : String(err), loading: false });
    }
  },

  async removeRole(userId, facilityId, _roleId) {
    set({ loading: true });
    try {
      await userRoleService.softDeleteUser(userId, facilityId);
      await this.fetchUserRoles(facilityId);
      set({ loading: false });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : String(err), loading: false });
    }
  },

  clearRoles() {
    set({ users: [], roles: [], userRoles: [], error: null, loading: false });
  },
}));
