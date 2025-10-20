// Define user roles and their permissions
export type UserRole =
  | 'Administrator'
  | 'Physician'
  | 'Nurse'
  | 'Technician'
  | 'Student'
  | 'User';

export interface Permission {
  canDeleteContent: boolean;
  canUpdateStatus: boolean;
  canCreateContent: boolean;
  canViewAllCategories: boolean;
  canManageUsers: boolean;
}

// Permission matrix for different roles
const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  Administrator: {
    canDeleteContent: true,
    canUpdateStatus: true,
    canCreateContent: true,
    canViewAllCategories: true,
    canManageUsers: true,
  },
  Physician: {
    canDeleteContent: false,
    canUpdateStatus: true,
    canCreateContent: false,
    canViewAllCategories: true,
    canManageUsers: false,
  },
  Nurse: {
    canDeleteContent: false,
    canUpdateStatus: true,
    canCreateContent: false,
    canViewAllCategories: true,
    canManageUsers: false,
  },
  Technician: {
    canDeleteContent: false,
    canUpdateStatus: true,
    canCreateContent: false,
    canViewAllCategories: false,
    canManageUsers: false,
  },
  Student: {
    canDeleteContent: false,
    canUpdateStatus: false,
    canCreateContent: false,
    canViewAllCategories: false,
    canManageUsers: false,
  },
  User: {
    canDeleteContent: false,
    canUpdateStatus: false,
    canCreateContent: false,
    canViewAllCategories: false,
    canManageUsers: false,
  },
};

// Helper function to get user role from string
export const getUserRole = (roleString: string): UserRole => {
  // Normalize the role string to handle common variations
  const normalizedRole = roleString?.toLowerCase().trim();
  
  // Map common role variations to the standard roles
  const roleMapping: Record<string, UserRole> = {
    'admin': 'Administrator',
    'administrator': 'Administrator',
    'physician': 'Physician',
    'doctor': 'Physician',
    'nurse': 'Nurse',
    'technician': 'Technician',
    'tech': 'Technician',
    'student': 'Student',
    'user': 'User',
    'default': 'User',
  };
  
  const mappedRole = roleMapping[normalizedRole];
  if (mappedRole) {
    return mappedRole;
  }
  
  // Fallback: check if it's already a valid role
  const validRoles: UserRole[] = [
    'Administrator',
    'Physician',
    'Nurse',
    'Technician',
    'Student',
    'User',
  ];
  
  return validRoles.includes(roleString as UserRole)
    ? (roleString as UserRole)
    : 'User';
};

// Get permissions for a specific role
export const getPermissionsForRole = (role: UserRole): Permission => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.User;
};

// Check if user has specific permission
export const hasPermission = (
  userRole: UserRole,
  permission: keyof Permission
): boolean => {
  // Return false for empty role or permission
  if (!userRole || !permission) {
    return false;
  }

  const permissions = getPermissionsForRole(userRole);
  return permissions[permission] || false;
};

// Audit logging for sensitive operations
export const logSensitiveOperation = (
  operation: string,
  userId: string,
  userRole: UserRole,
  details: Record<string, unknown>
) => {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    operation,
    userId,
    userRole,
    details,
    ipAddress: 'client-side', // In a real app, this would come from the server
  };

  // Log to console for development (in production, this would go to a logging service)
  console.log('AUDIT LOG:', auditEntry);

  // In a real application, you would send this to your audit service
  // auditService.log(auditEntry);
};
