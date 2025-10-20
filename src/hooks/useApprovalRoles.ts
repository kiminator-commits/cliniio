import React from 'react';
import { useFacility } from '../contexts/FacilityContext';

// Define the role permissions structure
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
      assign_tasks: true,
      approve_content: true
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
      assign_tasks: true,
      approve_content: true
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
      assign_tasks: false,
      approve_content: false
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
      assign_tasks: false,
      approve_content: false
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
      assign_tasks: true,
      approve_content: false
    },
    custom: {}
  };
  
  return permissionSets[roleId as keyof typeof permissionSets] || {};
};

// Get roles that have the approve_content permission
export const getApprovalRoles = (): Array<{id: string, name: string, displayName: string}> => {
  const allRoles = [
    { id: 'administrator', name: 'Administrator', displayName: '👑 Administrator' },
    { id: 'manager', name: 'Manager', displayName: '👨‍💼 Manager' },
    { id: 'technician', name: 'Technician', displayName: '🔧 Technician' },
    { id: 'viewer', name: 'Viewer', displayName: '👀 Viewer' },
    { id: 'trainer', name: 'Trainer', displayName: '📚 Trainer' },
  ];

  return allRoles.filter(role => {
    const permissions = getRolePermissions(role.id);
    return permissions.approve_content === true;
  });
};

// Hook to get approval roles
export const useApprovalRoles = () => {
  const { isLoading: facilityLoading } = useFacility();
  
  const approvalRoles = React.useMemo(() => {
    return getApprovalRoles();
  }, []);

  return {
    approvalRoles,
    facilityLoading,
  };
};
