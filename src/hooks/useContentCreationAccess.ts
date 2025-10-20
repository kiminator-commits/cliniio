import { useContentBuilderSettings } from './useContentBuilderSettings';
import { useUser } from '../contexts/UserContext';
import { getPermissionsForRole, getUserRole } from '../pages/KnowledgeHub/utils/permissions';

/**
 * Hook that combines role-based permissions with facility-level content creation settings
 * Returns the final access decision for content creation
 */
export const useContentCreationAccess = () => {
  const { settings } = useContentBuilderSettings();
  const { currentUser } = useUser();

  // Get user permissions based on their role
  const getUserPermissions = () => {
    if (!currentUser?.role) {
      return getPermissionsForRole('User'); // Default to User permissions
    }
    
    // Use the improved role mapping that handles "Admin" -> "Administrator"
    const mappedRole = getUserRole(currentUser.role);
    return getPermissionsForRole(mappedRole);
  };

  const userPermissions = getUserPermissions();
  const hasRolePermission = userPermissions.canCreateContent;

  // Content creation is allowed only if BOTH conditions are met:
  // 1. User has role-based permission (canCreateContent)
  // 2. Facility has content creation enabled (enableContentCreation)
  const isContentCreationEnabled = hasRolePermission && settings.enableContentCreation;

  return {
    isContentCreationEnabled,
    hasRolePermission,
    facilitySettingEnabled: settings.enableContentCreation,
    userRole: currentUser?.role || 'User',
    mappedRole: getUserRole(currentUser?.role || 'User'),
    settings,
  };
};
