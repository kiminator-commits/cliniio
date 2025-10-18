"use client";
import { useEffect } from "react";
import { useUserRoles } from "@/hooks/useUserRoles";

export default function UserRoleTestHarness() {
  const facilityId = "550e8400-e29b-41d4-a716-446655440000";
  const { users, roles, userRoles, loading, error, reload: _reload } = useUserRoles(facilityId);

  useEffect(() => {
    if (loading) console.log("Loading user/role data...");
    if (error) console.error("Role error:", error);

    if (!loading && !error) {
      console.group("👥 User Role Data");
      console.log("Facility Users:", users);
      console.log("Facility Roles:", roles);
      console.log("User Assignments:", userRoles);
      console.groupEnd();
    }
  }, [users, roles, userRoles, loading, error]);

  return null;
}
