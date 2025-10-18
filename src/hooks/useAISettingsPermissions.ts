import { useUser } from '../contexts/UserContext';

/**
 * Hook to check if current user has admin permissions for AI settings
 */
export const useAISettingsPermissions = () => {
  const { currentUser } = useUser();

  const isAdmin = () => {
    if (!currentUser) return false;
    
    // Check for administrator role (case insensitive and various formats)
    const role = currentUser.role?.toLowerCase();
    const adminRoles = [
      'administrator', 
      'admin', 
      '👑 administrator', // Handle emoji prefixes
      'system_admin',
      'super_admin'
    ];
    
    return adminRoles.includes(role);
  };

  const canManageThrottling = () => {
    return isAdmin();
  };

  const canViewUsage = () => {
    // All authenticated users can view usage
    return !!currentUser;
  };

  const canConfigureAI = () => {
    return isAdmin();
  };

  return {
    isAdmin: isAdmin(),
    canManageThrottling: canManageThrottling(),
    canViewUsage: canViewUsage(),
    canConfigureAI: canConfigureAI(),
    userRole: currentUser?.role || 'Unknown',
  };
};
