"use client";
import React, { useEffect, useState } from "react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useUser } from "@/contexts/UserContext";
import { invitationService } from '@/services/InvitationService';
import { roleService } from '@/services/RoleService';
import { User, FacilityRole } from '@/services/UserRoleService';
import Icon from '@mdi/react';
import { mdiAccount, mdiPencil, mdiTrashCan, mdiPlus, mdiRefresh, mdiCog } from '@mdi/js';

export default function UserManagementTab() {
  const { currentUser } = useUser();
  const facilityId = currentUser?.facility_id || "550e8400-e29b-41d4-a716-446655440000";
  const { users, roles: _roles, userRoles: _userRoles, loading, error, assignRole, removeRole, reload } = useUserRoles(facilityId);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<FacilityRole | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: {} as Record<string, boolean>
  });
  const [tierInfo, setTierInfo] = useState<{
    canAdd: boolean;
    currentCount: number;
    limit: number;
    tier: string;
  } | null>(null);
  const [addUserForm, setAddUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    permissions: {} as Record<string, boolean>
  });
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    permissions: {} as Record<string, boolean>
  });

  const filteredUsers = users.filter(user => {
    // If no search term, show all users
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const firstName = user.first_name?.toLowerCase() || '';
    const lastName = user.last_name?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    
    const matchesSearch = 
      firstName.includes(searchLower) ||
      lastName.includes(searchLower) ||
      email.includes(searchLower);
    
    return matchesSearch;
  });

  useEffect(() => {
    if (error) console.error("User Management error:", error);
    console.log("🔍 Debug - All users:", users);
    console.log("🔍 Debug - Filtered users:", filteredUsers);
    console.log("🔍 Debug - Search term:", searchTerm);
    
    // Debug name fields for first user
    if (users.length > 0) {
      const firstUser = users[0];
      console.log("🔍 Debug - First user name fields:", {
        id: firstUser.id,
        first_name: firstUser.first_name,
        last_name: firstUser.last_name,
        email: firstUser.email,
        full_name: firstUser.full_name
      });
    }
  }, [error, users, filteredUsers, searchTerm]);

  // Fetch tier information
  useEffect(() => {
    const fetchTierInfo = async () => {
      try {
        const tierData = await invitationService.checkTierLimits(facilityId);
        setTierInfo(tierData);
      } catch (error) {
        console.error("Error fetching tier info:", error);
      }
    };

    if (facilityId) {
      fetchTierInfo();
    }
  }, [facilityId, users.length]); // Re-fetch when users change

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading user management data...</span>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <p className="text-red-600">Error loading user data: {error}</p>
    </div>
  );

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      role: user.role || '',
      permissions: (user as User & { permissions?: Record<string, boolean> }).permissions || {}
    });
  };

  const handleRoleSelect = (roleId: string) => {
    const rolePermissions = getRolePermissions(roleId);
    setEditForm({
      ...editForm,
      role: roleId,
      permissions: rolePermissions
    });
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    const newPermissions = {
      ...editForm.permissions,
      [permissionId]: checked
    };
    
    // Check if this matches any predefined role
    const matchingRole = findMatchingRole(newPermissions);
    
    setEditForm({
      ...editForm,
      role: matchingRole || 'custom',
      permissions: newPermissions
    });
  };

  const getRolePermissions = (roleId: string): Record<string, boolean> => {
    const permissionSets = {
      administrator: {
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
      manager: {
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
      technician: {
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
      viewer: {
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
      trainer: {
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
      custom: {}
    };
    
    return permissionSets[roleId as keyof typeof permissionSets] || {};
  };

  const findMatchingRole = (permissions: Record<string, boolean>): string | null => {
    const roles = ['administrator', 'manager', 'technician', 'viewer', 'trainer'];
    
    for (const role of roles) {
      const rolePermissions = getRolePermissions(role);
      const matches = Object.keys(rolePermissions).every(
        key => permissions[key] === rolePermissions[key]
      );
      if (matches) return role;
    }
    
    return null;
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      // Soft delete the user
      await removeRole(userToDelete.id, facilityId, userToDelete.role);
      
      // Clean up any pending invitations from this user
      await invitationService.cleanupUserInvitations(userToDelete.id, facilityId);
      
      alert(`User ${userToDelete.first_name} ${userToDelete.last_name} has been removed from the facility.`);
      
      // Close modal and refresh
      setShowDeleteModal(false);
      setUserToDelete(null);
      await reload();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(`Failed to remove user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    try {
      await assignRole(editingUser.id, facilityId, editForm.role);
      // TODO: Update other fields like name, email
      setEditingUser(null);
      await reload();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ first_name: '', last_name: '', email: '', role: '', permissions: {} });
  };

  const handleAddUser = () => {
    setShowAddUser(true);
    setAddUserForm({
      first_name: '',
      last_name: '',
      email: '',
      role: '',
      permissions: {}
    });
  };

  const handleCancelAddUser = () => {
    setShowAddUser(false);
    setAddUserForm({ first_name: '', last_name: '', email: '', role: '', permissions: {} });
  };

  const handleSaveAddUser = async () => {
    if (!addUserForm.first_name || !addUserForm.last_name || !addUserForm.email || !addUserForm.role) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Check tier limits using the invitation service
      const tierCheck = await invitationService.checkTierLimits(facilityId);
      
      if (!tierCheck.canAdd) {
        alert(`You've reached the user limit for your ${tierCheck.tier} tier (${tierCheck.currentCount}/${tierCheck.limit}). Please upgrade your plan to add more users.`);
        return;
      }

      // Prepare user data for invitation
      const userData = {
        first_name: addUserForm.first_name,
        last_name: addUserForm.last_name,
        facility_id: facilityId,
        role: addUserForm.role,
        permissions: addUserForm.permissions
      };

      // Send invitation via Supabase Auth
      const { data: _inviteData, error: inviteError } = await invitationService.sendInvitation(
        addUserForm.email, 
        userData
      );

      if (inviteError) {
        console.error('Invitation error:', inviteError);
        alert(`Failed to send invitation: ${inviteError instanceof Error ? inviteError.message : String(inviteError)}`);
        return;
      }

      // Create invitation record in database
      const _invitation = await invitationService.createInvitation({
        email: addUserForm.email,
        facility_id: facilityId,
        invited_by: currentUser?.id || '',
        role: addUserForm.role,
        permissions: addUserForm.permissions
      });

      alert(`Invitation sent successfully to ${addUserForm.email}! They will receive an email to complete their registration.`);
      
      // Close modal and refresh
      setShowAddUser(false);
      await reload();
    } catch (error) {
      console.error("Error adding user:", error);
      alert('An error occurred while sending the invitation. Please try again.');
    }
  };

  const handleAddUserRoleSelect = (roleId: string) => {
    const rolePermissions = getRolePermissions(roleId);
    setAddUserForm({
      ...addUserForm,
      role: roleId,
      permissions: rolePermissions
    });
  };

  const handleAddUserPermissionChange = (permissionId: string, checked: boolean) => {
    const newPermissions = {
      ...addUserForm.permissions,
      [permissionId]: checked
    };
    
    const matchingRole = findMatchingRole(newPermissions);
    
    setAddUserForm({
      ...addUserForm,
      role: matchingRole || 'custom',
      permissions: newPermissions
    });
  };

  const handleRoleManager = () => {
    setShowRoleManager(true);
    setEditingRole(null);
    setRoleForm({
      name: '',
      description: '',
      permissions: {}
    });
  };

  const handleEditRole = (role: FacilityRole) => {
    setEditingRole(role);
    setRoleForm({
      name: role.role_name || '',
      description: role.description || '',
      permissions: (role as FacilityRole & { permissions?: Record<string, boolean> }).permissions || {}
    });
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleForm({
      name: '',
      description: '',
      permissions: {}
    });
  };

  const handleSaveRole = async () => {
    if (!roleForm.name.trim()) {
      alert('Please enter a role name');
      return;
    }

    try {
      if (editingRole && editingRole.id) {
        // Update existing role
        await roleService.updateRole(editingRole.id, {
          name: roleForm.name,
          description: roleForm.description,
          permissions: roleForm.permissions,
          facility_id: facilityId,
          created_by: currentUser?.id || ''
        });
      } else {
        // Create new role
        await roleService.createRole({
          name: roleForm.name,
          description: roleForm.description,
          permissions: roleForm.permissions,
          facility_id: facilityId,
          created_by: currentUser?.id || ''
        });
      }

      alert(`Role ${editingRole ? 'updated' : 'created'} successfully!`);
      setShowRoleManager(false);
      await reload();
    } catch (error) {
      console.error("Error saving role:", error);
      alert(`Failed to ${editingRole ? 'update' : 'create'} role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteRole = async (role: FacilityRole) => {
    if (window.confirm(`Are you sure you want to delete the role "${role.role_name}"? This action cannot be undone.`)) {
      try {
        await roleService.deleteRole(role.id);
        alert('Role deleted successfully!');
        await reload();
      } catch (error) {
        console.error("Error deleting role:", error);
        alert(`Failed to delete role: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleCancelRole = () => {
    setShowRoleManager(false);
    setEditingRole(null);
    setRoleForm({
      name: '',
      description: '',
      permissions: {}
    });
  };

  const handleRolePermissionChange = (permissionId: string, checked: boolean) => {
    setRoleForm({
      ...roleForm,
      permissions: {
        ...roleForm.permissions,
        [permissionId]: checked
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          onClick={reload}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Icon path={mdiRefresh} size={0.8} className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon path={mdiAccount} size={1} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Icon path={mdiAccount} size={1} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.is_active !== false).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-[#4ECDC4] bg-opacity-20 rounded-lg">
              <Icon path={mdiCog} size={1} className="text-[#4ECDC4]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Plan Tier</p>
              <p className="text-lg font-bold text-gray-900 capitalize">
                {tierInfo ? tierInfo.tier : 'Loading...'}
              </p>
              <p className="text-xs text-gray-500">
                {tierInfo ? `${tierInfo.currentCount}/${tierInfo.limit === 999999 ? '∞' : tierInfo.limit} users` : 'Loading...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Warning Banner */}
      {tierInfo && (() => {
        const percentage = (tierInfo.currentCount / tierInfo.limit) * 100;
        
        if (percentage >= 80 && percentage < 100) {
          return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon path={mdiCog} size={1} className="text-yellow-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Approaching Tier Limit
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    You're using {tierInfo.currentCount} users on your {tierInfo.tier} tier. 
                    Consider upgrading to add more team members.
                  </p>
                </div>
              </div>
            </div>
          );
        } else if (percentage >= 100) {
          return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon path={mdiCog} size={1} className="text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Tier Limit Reached
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    You've reached the maximum number of users ({tierInfo.limit}) for your {tierInfo.tier} tier. 
                    Upgrade your plan to add more team members.
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Team Directory</h3>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleAddUser}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Icon path={mdiPlus} size={0.8} className="mr-2" />
                Add User
              </button>
              <button 
                onClick={handleRoleManager}
                className="flex items-center px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3BB5B0] transition-colors"
              >
                <Icon path={mdiCog} size={0.8} className="mr-2" />
                Manage Roles
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center">
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={`${user.first_name} ${user.last_name}`}
                            className="h-10 w-10 object-cover rounded-full"
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const firstName = user.first_name?.[0] || '';
                                const lastName = user.last_name?.[0] || '';
                                const initials = firstName + lastName || '?';
                                parent.innerHTML = `
                                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span class="text-sm font-medium text-blue-600">
                                      ${initials}
                                    </span>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {(user.first_name?.[0] || '') + (user.last_name?.[0] || '') || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name || user.last_name 
                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                            : user.email || 'Unknown User'
                          }
                        </div>
                        <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.is_active === false ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Edit user"
                      >
                        <Icon path={mdiPencil} size={0.8} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete user"
                      >
                        <Icon path={mdiTrashCan} size={0.8} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No users found matching your search.</p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] flex flex-col">
            <div className="p-6 overflow-y-auto scrollbar-hide flex-1">
              <h3 className="text-lg font-semibold mb-6">Edit User: {editingUser.first_name} {editingUser.last_name}</h3>
            
            {/* Basic Info Section */}
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="mb-8">
              <h4 className="text-md font-semibold mb-4">👤 User Role</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'administrator', name: '👑 Administrator', desc: 'Full system access' },
                  { id: 'manager', name: '👨‍💼 Manager', desc: 'Department management' },
                  { id: 'technician', name: '🔧 Technician', desc: 'Task execution' },
                  { id: 'viewer', name: '👀 Viewer', desc: 'Read-only access' },
                  { id: 'trainer', name: '📚 Trainer', desc: 'Content management' },
                  { id: 'custom', name: '➕ Custom', desc: 'Manual permissions' }
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      editForm.role === role.id 
                        ? 'border-teal-500 bg-teal-50 text-teal-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{role.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{role.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions Section */}
            <div className="mb-8">
              <h4 className="text-md font-semibold mb-4">🔐 Permissions</h4>
              <div className="space-y-6">
                {/* Dashboard Access */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">📊 Dashboard Access</h5>
                  <div className="space-y-2">
                    {[
                      { id: 'view_dashboard', label: 'View Dashboard', desc: 'Access main dashboard' },
                      { id: 'view_analytics', label: 'View Analytics', desc: 'Access reports and analytics' },
                      { id: 'export_data', label: 'Export Data', desc: 'Download reports and data' }
                    ].map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-sm font-medium">{permission.label}</div>
                          <div className="text-xs text-gray-500">{permission.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.permissions?.[permission.id] || false}
                            onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                            editForm.permissions?.[permission.id] ? 'bg-[#4ECDC4] after:translate-x-full' : 'bg-gray-200'
                          }`}></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Management */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">👥 User Management</h5>
                  <div className="space-y-2">
                    {[
                      { id: 'manage_users', label: 'Manage Users', desc: 'Add, edit, remove users' },
                      { id: 'assign_roles', label: 'Assign Roles', desc: 'Change user roles and permissions' },
                      { id: 'view_user_activity', label: 'View User Activity', desc: 'Monitor user actions' }
                    ].map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-sm font-medium">{permission.label}</div>
                          <div className="text-xs text-gray-500">{permission.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.permissions?.[permission.id] || false}
                            onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                            editForm.permissions?.[permission.id] ? 'bg-[#4ECDC4] after:translate-x-full' : 'bg-gray-200'
                          }`}></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Settings */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">⚙️ System Settings</h5>
                  <div className="space-y-2">
                    {[
                      { id: 'system_settings', label: 'System Settings', desc: 'Modify system configuration' },
                      { id: 'facility_settings', label: 'Facility Settings', desc: 'Manage facility preferences' },
                      { id: 'security_settings', label: 'Security Settings', desc: 'Configure security policies' }
                    ].map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-sm font-medium">{permission.label}</div>
                          <div className="text-xs text-gray-500">{permission.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.permissions?.[permission.id] || false}
                            onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                            editForm.permissions?.[permission.id] ? 'bg-[#4ECDC4] after:translate-x-full' : 'bg-gray-200'
                          }`}></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Management */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">📋 Task Management</h5>
                  <div className="space-y-2">
                    {[
                      { id: 'create_tasks', label: 'Create Tasks', desc: 'Create new tasks and assignments' },
                      { id: 'edit_tasks', label: 'Edit Tasks', desc: 'Modify existing tasks' },
                      { id: 'delete_tasks', label: 'Delete Tasks', desc: 'Remove tasks and assignments' },
                      { id: 'assign_tasks', label: 'Assign Tasks', desc: 'Assign tasks to team members' }
                    ].map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-sm font-medium">{permission.label}</div>
                          <div className="text-xs text-gray-500">{permission.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.permissions?.[permission.id] || false}
                            onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                            editForm.permissions?.[permission.id] ? 'bg-[#4ECDC4] after:translate-x-full' : 'bg-gray-200'
                          }`}></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 pt-4 border-t bg-white sticky bottom-0 z-10">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3BB5B0] border border-[#4ECDC4]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] flex flex-col">
            <div className="p-6 overflow-y-auto scrollbar-hide flex-1">
              <h3 className="text-lg font-semibold mb-6">Add New User</h3>
            
            {/* Basic Info Section */}
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={addUserForm.first_name}
                    onChange={(e) => setAddUserForm({...addUserForm, first_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={addUserForm.last_name}
                    onChange={(e) => setAddUserForm({...addUserForm, last_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={addUserForm.email}
                  onChange={(e) => setAddUserForm({...addUserForm, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="mb-8">
              <h4 className="text-md font-semibold mb-4">👤 User Role</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'administrator', name: '👑 Administrator', desc: 'Full system access' },
                  { id: 'manager', name: '👨‍💼 Manager', desc: 'Department management' },
                  { id: 'technician', name: '🔧 Technician', desc: 'Task execution' },
                  { id: 'viewer', name: '👀 Viewer', desc: 'Read-only access' },
                  { id: 'trainer', name: '📚 Trainer', desc: 'Content management' },
                  { id: 'custom', name: '➕ Custom', desc: 'Manual permissions' }
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleAddUserRoleSelect(role.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      addUserForm.role === role.id 
                        ? 'border-teal-500 bg-teal-50 text-teal-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{role.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{role.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions Section */}
            <div className="mb-8">
              <h4 className="text-md font-semibold mb-4">🔐 Permissions</h4>
              <div className="space-y-6">
                {/* Dashboard Access */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">📊 Dashboard Access</h5>
                  <div className="space-y-2">
                    {[
                      { id: 'view_dashboard', label: 'View Dashboard', desc: 'Access main dashboard' },
                      { id: 'view_analytics', label: 'View Analytics', desc: 'Access reports and analytics' },
                      { id: 'export_data', label: 'Export Data', desc: 'Download reports and data' }
                    ].map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-sm font-medium">{permission.label}</div>
                          <div className="text-xs text-gray-500">{permission.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addUserForm.permissions?.[permission.id] || false}
                            onChange={(e) => handleAddUserPermissionChange(permission.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                            addUserForm.permissions?.[permission.id] ? 'bg-[#4ECDC4] after:translate-x-full' : 'bg-gray-200'
                          }`}></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Management */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">👥 User Management</h5>
                  <div className="space-y-2">
                    {[
                      { id: 'manage_users', label: 'Manage Users', desc: 'Add, edit, remove users' },
                      { id: 'assign_roles', label: 'Assign Roles', desc: 'Change user roles and permissions' },
                      { id: 'view_user_activity', label: 'View User Activity', desc: 'Monitor user actions' }
                    ].map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-sm font-medium">{permission.label}</div>
                          <div className="text-xs text-gray-500">{permission.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addUserForm.permissions?.[permission.id] || false}
                            onChange={(e) => handleAddUserPermissionChange(permission.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                            addUserForm.permissions?.[permission.id] ? 'bg-[#4ECDC4] after:translate-x-full' : 'bg-gray-200'
                          }`}></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Settings */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">⚙️ System Settings</h5>
                  <div className="space-y-2">
                    {[
                      { id: 'system_settings', label: 'System Settings', desc: 'Modify system configuration' },
                      { id: 'facility_settings', label: 'Facility Settings', desc: 'Manage facility preferences' },
                      { id: 'security_settings', label: 'Security Settings', desc: 'Configure security policies' }
                    ].map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-sm font-medium">{permission.label}</div>
                          <div className="text-xs text-gray-500">{permission.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addUserForm.permissions?.[permission.id] || false}
                            onChange={(e) => handleAddUserPermissionChange(permission.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                            addUserForm.permissions?.[permission.id] ? 'bg-[#4ECDC4] after:translate-x-full' : 'bg-gray-200'
                          }`}></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Management */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">📋 Task Management</h5>
                  <div className="space-y-2">
                    {[
                      { id: 'create_tasks', label: 'Create Tasks', desc: 'Create new tasks and assignments' },
                      { id: 'edit_tasks', label: 'Edit Tasks', desc: 'Modify existing tasks' },
                      { id: 'delete_tasks', label: 'Delete Tasks', desc: 'Remove tasks and assignments' },
                      { id: 'assign_tasks', label: 'Assign Tasks', desc: 'Assign tasks to team members' }
                    ].map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-sm font-medium">{permission.label}</div>
                          <div className="text-xs text-gray-500">{permission.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addUserForm.permissions?.[permission.id] || false}
                            onChange={(e) => handleAddUserPermissionChange(permission.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                            addUserForm.permissions?.[permission.id] ? 'bg-[#4ECDC4] after:translate-x-full' : 'bg-gray-200'
                          }`}></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 pt-4 border-t bg-white sticky bottom-0 z-10">
              <button
                onClick={handleCancelAddUser}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddUser}
                className="px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3BB5B0] border border-[#4ECDC4]"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Manager Modal */}
      {showRoleManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] flex flex-col">
            <div className="p-6 overflow-y-auto scrollbar-hide flex-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {editingRole ? `Edit Role: ${editingRole.role_name}` : 'Role Management'}
                </h3>
                <button
                  onClick={handleCreateRole}
                  className="px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3BB5B0] flex items-center gap-2"
                >
                  <Icon path={mdiPlus} size={0.8} />
                  Create New Role
                </button>
              </div>

              {/* Role List */}
              {!editingRole && (
                <div className="mb-8">
                  <h4 className="text-md font-semibold mb-4">📋 Current Roles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { id: 'administrator', role_name: '👑 Administrator', description: 'Full system access', isDefault: true, facility_id: facilityId },
                      { id: 'manager', role_name: '👨‍💼 Manager', description: 'Department management', isDefault: true, facility_id: facilityId },
                      { id: 'technician', role_name: '🔧 Technician', description: 'Task execution', isDefault: true, facility_id: facilityId },
                      { id: 'viewer', role_name: '👀 Viewer', description: 'Read-only access', isDefault: true, facility_id: facilityId },
                      { id: 'trainer', role_name: '📚 Trainer', description: 'Content management', isDefault: true, facility_id: facilityId },
                      { id: 'custom', role_name: '➕ Custom', description: 'Manual permissions', isDefault: false, facility_id: facilityId }
                    ].map((role) => (
                      <div key={role.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{role.role_name}</h5>
                            <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                            {role.isDefault && (
                              <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleEditRole(role)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                              title="Edit Role"
                            >
                              <Icon path={mdiPencil} size={0.8} />
                            </button>
                            {!role.isDefault && (
                              <button
                                onClick={() => handleDeleteRole(role)}
                                className="p-1 text-red-500 hover:text-red-700"
                                title="Delete Role"
                              >
                                <Icon path={mdiTrashCan} size={0.8} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Role Editor */}
              {editingRole && (
                <div className="space-y-6">
                  {/* Role Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                      <input
                        type="text"
                        value={roleForm.name}
                        onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter role name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={roleForm.description}
                        onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Enter role description"
                      />
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <h4 className="text-md font-semibold mb-4">🔐 Role Permissions</h4>
                    <div className="space-y-6">
                      {/* Dashboard Access */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-3">📊 Dashboard Access</h5>
                        <div className="space-y-2">
                          {[
                            { id: 'view_dashboard', label: 'View Dashboard', desc: 'Access main dashboard' },
                            { id: 'view_analytics', label: 'View Analytics', desc: 'Access reports and analytics' },
                            { id: 'export_data', label: 'Export Data', desc: 'Download reports and data' }
                          ].map((permission) => (
                            <div key={permission.id} className="flex items-center justify-between py-2">
                              <div>
                                <div className="text-sm font-medium">{permission.label}</div>
                                <div className="text-xs text-gray-500">{permission.desc}</div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={roleForm.permissions?.[permission.id] || false}
                                  onChange={(e) => handleRolePermissionChange(permission.id, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                                  roleForm.permissions?.[permission.id] ? 'bg-[#4ECDC4] after:translate-x-full' : 'bg-gray-200'
                                }`}></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* User Management */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-3">👥 User Management</h5>
                        <div className="space-y-2">
                          {[
                            { id: 'manage_users', label: 'Manage Users', desc: 'Add, edit, remove users' },
                            { id: 'assign_roles', label: 'Assign Roles', desc: 'Change user roles and permissions' },
                            { id: 'view_user_activity', label: 'View User Activity', desc: 'Monitor user actions' }
                          ].map((permission) => (
                            <div key={permission.id} className="flex items-center justify-between py-2">
                              <div>
                                <div className="text-sm font-medium">{permission.label}</div>
                                <div className="text-xs text-gray-500">{permission.desc}</div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={roleForm.permissions?.[permission.id] || false}
                                  onChange={(e) => handleRolePermissionChange(permission.id, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                                  roleForm.permissions?.[permission.id] ? 'bg-[#4ECDC4] after:translate-x-full' : 'bg-gray-200'
                                }`}></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* System Settings */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-3">⚙️ System Settings</h5>
                        <div className="space-y-2">
                          {[
                            { id: 'system_settings', label: 'System Settings', desc: 'Modify system configuration' },
                            { id: 'facility_settings', label: 'Facility Settings', desc: 'Manage facility preferences' },
                            { id: 'security_settings', label: 'Security Settings', desc: 'Configure security policies' }
                          ].map((permission) => (
                            <div key={permission.id} className="flex items-center justify-between py-2">
                              <div>
                                <div className="text-sm font-medium">{permission.label}</div>
                                <div className="text-xs text-gray-500">{permission.desc}</div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={roleForm.permissions?.[permission.id] || false}
                                  onChange={(e) => handleRolePermissionChange(permission.id, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                                  roleForm.permissions?.[permission.id] ? 'bg-[#4ECDC4] after:translate-x-full' : 'bg-gray-200'
                                }`}></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Task Management */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-3">📋 Task Management</h5>
                        <div className="space-y-2">
                          {[
                            { id: 'create_tasks', label: 'Create Tasks', desc: 'Create new tasks and assignments' },
                            { id: 'edit_tasks', label: 'Edit Tasks', desc: 'Modify existing tasks' },
                            { id: 'delete_tasks', label: 'Delete Tasks', desc: 'Remove tasks and assignments' },
                            { id: 'assign_tasks', label: 'Assign Tasks', desc: 'Assign tasks to team members' }
                          ].map((permission) => (
                            <div key={permission.id} className="flex items-center justify-between py-2">
                              <div>
                                <div className="text-sm font-medium">{permission.label}</div>
                                <div className="text-xs text-gray-500">{permission.desc}</div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={roleForm.permissions?.[permission.id] || false}
                                  onChange={(e) => handleRolePermissionChange(permission.id, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                                  roleForm.permissions?.[permission.id] ? 'bg-[#4ECDC4] after:translate-x-full' : 'bg-gray-200'
                                }`}></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 p-6 pt-4 border-t bg-white sticky bottom-0 z-10">
              <button
                onClick={handleCancelRole}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white"
              >
                {editingRole ? 'Back to Roles' : 'Close'}
              </button>
              {editingRole && (
                <button
                  onClick={handleSaveRole}
                  className="px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3BB5B0] border border-[#4ECDC4]"
                >
                  {editingRole.id ? 'Update Role' : 'Create Role'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Remove Team Member</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-700">
                Are you sure you want to remove <strong>{userToDelete.first_name} {userToDelete.last_name}</strong> from your facility? 
                They will lose access to all facility data and will need to be re-invited to regain access.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Remove User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
