import { useEffect, useCallback } from "react";
import { useUserRoleStore } from "@/store/userRoleStore";

export function useUserRoles(facilityId: string) {
  const {
    users,
    roles,
    userRoles,
    loading,
    error,
    fetchUsers,
    fetchRoles,
    fetchUserRoles,
    assignRole,
    removeRole,
    clearRoles,
  } = useUserRoleStore();

  const loadAll = useCallback(async () => {
    if (!facilityId) return;
    await Promise.all([fetchUsers(facilityId), fetchRoles(facilityId), fetchUserRoles(facilityId)]);
  }, [facilityId, fetchUsers, fetchRoles, fetchUserRoles]);

  useEffect(() => {
    if (facilityId) loadAll();
    return () => clearRoles();
  }, [facilityId, loadAll, clearRoles]);

  return {
    users,
    roles,
    userRoles,
    loading,
    error,
    assignRole,
    removeRole,
    reload: loadAll,
  };
}
