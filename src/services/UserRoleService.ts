import { supabase } from "@/lib/supabaseClient";

export interface FacilityRole {
  id: string;
  facility_id: string;
  role_name: string;
  description?: string;
  is_default?: boolean;
  created_at?: string;
}

export interface UserFacilityRole {
  id: string;
  user_id: string;
  facility_id: string;
  role_id: string;
  assigned_at?: string;
}

export interface User {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  role: string;
  facility_id: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string | null;
}

class UserRoleService {
  // 🔹 Fetch all users in a facility (excluding soft-deleted users)
  async getUsers(facilityId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("facility_id", facilityId)
      .is('deleted_at', null) // Only get non-deleted users
      .or("is_active.is.null,is_active.eq.true"); // Include users where is_active is null or true
    
    if (error) {
      console.error("UserRoleService.getUsers error:", error);
      throw new Error(error.message);
    }
    
    console.log("🔍 UserRoleService.getUsers - Raw data:", data);
    console.log("🔍 UserRoleService.getUsers - First user data:", data?.[0]);
    
    // Debug: Check for duplicate IDs
    if (data && data.length > 0) {
      const ids = data.map(user => user.id);
      const uniqueIds = [...new Set(ids)];
      console.log("🔍 UserRoleService.getUsers - Total users:", data.length);
      console.log("🔍 UserRoleService.getUsers - Unique IDs:", uniqueIds.length);
      console.log("🔍 UserRoleService.getUsers - All IDs:", ids);
      
      if (ids.length !== uniqueIds.length) {
        console.warn("⚠️ DUPLICATE USER IDs DETECTED!");
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        console.warn("⚠️ Duplicate IDs:", [...new Set(duplicates)]);
      }
    }
    
    return data ?? [];
  }

  // 🔹 Fetch all roles in a facility (using the role field from users table)
  async getRoles(facilityId: string): Promise<FacilityRole[]> {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("facility_id", facilityId)
      .or("is_active.is.null,is_active.eq.true"); // Include users where is_active is null or true
    if (error) throw new Error(error.message);
    
    // Get unique roles and create FacilityRole objects
    const uniqueRoles = [...new Set(data?.map(user => user.role) || [])];
    return uniqueRoles.map((role, index) => ({
      id: `role-${index}`,
      facility_id: facilityId,
      role_name: role,
      description: `${role} role`,
      is_default: role === 'user',
      created_at: new Date().toISOString()
    }));
  }

  // 🔹 Fetch all users + roles in a facility
  async getUserRoles(facilityId: string): Promise<UserFacilityRole[]> {
    const { data, error } = await supabase
      .from("users")
      .select("id, facility_id, role, created_at")
      .eq("facility_id", facilityId)
      .or("is_active.is.null,is_active.eq.true"); // Include users where is_active is null or true
    if (error) throw new Error(error.message);
    
    return (data ?? []).map(user => ({
      id: user.id,
      user_id: user.id,
      facility_id: user.facility_id,
      role_id: user.role,
      assigned_at: user.created_at
    }));
  }

  // 🔹 Assign or update a user's role
  async assignUserRole(userId: string, facilityId: string, roleId: string): Promise<void> {
    const { error } = await supabase
      .from("users")
      .update({ role: roleId })
      .eq("id", userId)
      .eq("facility_id", facilityId);
    if (error) throw new Error(error.message);
  }

  // 🔹 Soft delete a user (set deleted_at timestamp and is_active to false)
  async softDeleteUser(userId: string, facilityId: string): Promise<void> {
    const { error } = await supabase
      .from("users")
      .update({ 
        is_active: false,
        deleted_at: new Date().toISOString()
      })
      .eq("id", userId)
      .eq("facility_id", facilityId);
    if (error) throw new Error(error.message);
  }

  // 🔹 Restore a soft-deleted user
  async restoreUser(userId: string, facilityId: string): Promise<void> {
    const { error } = await supabase
      .from("users")
      .update({ 
        is_active: true,
        deleted_at: null
      })
      .eq("id", userId)
      .eq("facility_id", facilityId);
    if (error) throw new Error(error.message);
  }

  // 🔹 Update user name (for testing)
  async updateUserName(userId: string, firstName: string, lastName: string): Promise<void> {
    const { error } = await supabase
      .from("users")
      .update({ 
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);
    
    if (error) {
      console.error("UserRoleService.updateUserName error:", error);
      throw new Error(error.message);
    }
    
    console.log(`✅ Updated user ${userId} name to: ${firstName} ${lastName}`);
  }

  // 🔹 Clean up duplicate users (keep the most recent one)
  async cleanupDuplicateUsers(facilityId: string): Promise<void> {
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("facility_id", facilityId)
      .is('deleted_at', null)
      .or("is_active.is.null,is_active.eq.true");
    
    if (error) {
      console.error("UserRoleService.cleanupDuplicateUsers error:", error);
      throw new Error(error.message);
    }
    
    if (!users || users.length === 0) return;
    
    // Group users by ID
    const userGroups = users.reduce((groups, user) => {
      if (!groups[user.id]) {
        groups[user.id] = [];
      }
      groups[user.id].push(user);
      return groups;
    }, {} as Record<string, any[]>);
    
    // Find duplicates
    const duplicates = Object.entries(userGroups).filter(([id, users]) => (users as any[]).length > 1);
    
    if (duplicates.length === 0) {
      console.log("✅ No duplicate users found");
      return;
    }
    
    console.log(`🔍 Found ${duplicates.length} duplicate user IDs`);
    
    // For each duplicate group, keep the most recent and soft-delete the rest
    for (const [id, duplicateUsers] of duplicates) {
      // Sort by created_at (most recent first)
      (duplicateUsers as any[]).sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
      
      const keepUser = (duplicateUsers as any[])[0];
      const deleteUsers = (duplicateUsers as any[]).slice(1);
      
      console.log(`🔍 Keeping user ${id} (created: ${keepUser.created_at})`);
      
      // Soft delete the duplicates
      for (const userToDelete of deleteUsers) {
        await this.softDeleteUser(userToDelete.id, facilityId);
        console.log(`🗑️ Soft-deleted duplicate user ${userToDelete.id}`);
      }
    }
    
    console.log("✅ Duplicate cleanup completed");
  }
}

export const userRoleService = new UserRoleService();
