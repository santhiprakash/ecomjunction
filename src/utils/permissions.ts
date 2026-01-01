/**
 * Role-Based Access Control (RBAC) Utilities
 * Defines permissions for different user roles
 */

import { UserRole, RolePermissions, PermissionCheck } from '@/types';

// ============================================================================
// Permission Definitions by Role
// ============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canManageUsers: true,
    canViewAllPages: true,
    canViewAllAnalytics: true,
    canManageSystem: true,
    canCreatePages: true,
    canCreateProducts: true,
    canEditOwnPages: true,
    canEditOwnProducts: true,
    canViewOwnAnalytics: true,
    canDeleteOwnPages: true,
    canDeleteOwnProducts: true,
  },
  affiliate_marketer: {
    canManageUsers: false,
    canViewAllPages: false,
    canViewAllAnalytics: false,
    canManageSystem: false,
    canCreatePages: true, // Limited by plan
    canCreateProducts: true,
    canEditOwnPages: true,
    canEditOwnProducts: true,
    canViewOwnAnalytics: true,
    canDeleteOwnPages: true,
    canDeleteOwnProducts: true,
  },
  end_user: {
    canManageUsers: false,
    canViewAllPages: false,
    canViewAllAnalytics: false,
    canManageSystem: false,
    canCreatePages: false,
    canCreateProducts: false,
    canEditOwnPages: false,
    canEditOwnProducts: false,
    canViewOwnAnalytics: false,
    canDeleteOwnPages: false,
    canDeleteOwnProducts: false,
  },
};

// ============================================================================
// Permission Check Functions
// ============================================================================

/**
 * Get all permissions for a given role
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: UserRole,
  permission: keyof RolePermissions
): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

/**
 * Check if user can perform an action with detailed feedback
 */
export function checkPermission(
  role: UserRole | undefined,
  permission: keyof RolePermissions,
  customMessage?: string
): PermissionCheck {
  if (!role) {
    return {
      hasPermission: false,
      reason: 'User is not authenticated',
    };
  }

  const hasAccess = ROLE_PERMISSIONS[role][permission];

  if (!hasAccess) {
    return {
      hasPermission: false,
      reason: customMessage || `Your role (${formatRole(role)}) does not have permission to ${permission}`,
    };
  }

  return { hasPermission: true };
}

/**
 * Check if user is admin
 */
export function isAdmin(role: UserRole | undefined): boolean {
  return role === 'admin';
}

/**
 * Check if user is affiliate marketer
 */
export function isAffiliateMarketer(role: UserRole | undefined): boolean {
  return role === 'affiliate_marketer';
}

/**
 * Check if user is end user
 */
export function isEndUser(role: UserRole | undefined): boolean {
  return role === 'end_user';
}

/**
 * Check if user can manage pages (admin or affiliate marketer)
 */
export function canManagePages(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'affiliate_marketer';
}

/**
 * Check if user can view analytics
 */
export function canViewAnalytics(role: UserRole | undefined): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].canViewOwnAnalytics || ROLE_PERMISSIONS[role].canViewAllAnalytics;
}

/**
 * Format role name for display
 */
export function formatRole(role: UserRole): string {
  const roleMap: Record<UserRole, string> = {
    admin: 'Admin',
    affiliate_marketer: 'Affiliate Marketer',
    end_user: 'End User',
  };
  return roleMap[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    admin: 'Full platform access with user management and system configuration',
    affiliate_marketer: 'Create and manage pages, products, and view analytics',
    end_user: 'Browse and interact with public pages',
  };
  return descriptions[role];
}

/**
 * Get role badge color for UI
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    admin: 'bg-red-100 text-red-800 border-red-300',
    affiliate_marketer: 'bg-blue-100 text-blue-800 border-blue-300',
    end_user: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  return colors[role];
}

// ============================================================================
// Resource Ownership Checks
// ============================================================================

/**
 * Check if user can edit a resource (owns it or is admin)
 */
export function canEditResource(
  userRole: UserRole | undefined,
  userId: string | undefined,
  resourceOwnerId: string
): PermissionCheck {
  if (!userRole || !userId) {
    return {
      hasPermission: false,
      reason: 'User is not authenticated',
    };
  }

  // Admins can edit any resource
  if (isAdmin(userRole)) {
    return { hasPermission: true };
  }

  // Users can edit their own resources if they have permission
  if (userId === resourceOwnerId) {
    return { hasPermission: true };
  }

  return {
    hasPermission: false,
    reason: 'You can only edit your own resources',
  };
}

/**
 * Check if user can delete a resource (owns it or is admin)
 */
export function canDeleteResource(
  userRole: UserRole | undefined,
  userId: string | undefined,
  resourceOwnerId: string
): PermissionCheck {
  if (!userRole || !userId) {
    return {
      hasPermission: false,
      reason: 'User is not authenticated',
    };
  }

  // Admins can delete any resource
  if (isAdmin(userRole)) {
    return { hasPermission: true };
  }

  // Users can delete their own resources if they have permission
  if (userId === resourceOwnerId) {
    return { hasPermission: true };
  }

  return {
    hasPermission: false,
    reason: 'You can only delete your own resources',
  };
}

/**
 * Check if user can view a resource
 */
export function canViewResource(
  userRole: UserRole | undefined,
  userId: string | undefined,
  resourceOwnerId: string,
  isPublic: boolean = true
): PermissionCheck {
  // Public resources can be viewed by anyone
  if (isPublic) {
    return { hasPermission: true };
  }

  if (!userRole || !userId) {
    return {
      hasPermission: false,
      reason: 'This resource is private',
    };
  }

  // Admins can view any resource
  if (isAdmin(userRole)) {
    return { hasPermission: true };
  }

  // Users can view their own resources
  if (userId === resourceOwnerId) {
    return { hasPermission: true };
  }

  return {
    hasPermission: false,
    reason: 'This resource is private and you do not have access',
  };
}

// ============================================================================
// Permission Guard HOC Helper
// ============================================================================

/**
 * Throws error if permission check fails (useful for API calls)
 */
export function requirePermission(permissionCheck: PermissionCheck): void {
  if (!permissionCheck.hasPermission) {
    throw new Error(permissionCheck.reason || 'Permission denied');
  }
}

/**
 * Check multiple permissions (all must pass)
 */
export function checkMultiplePermissions(
  role: UserRole | undefined,
  permissions: Array<keyof RolePermissions>
): PermissionCheck {
  if (!role) {
    return {
      hasPermission: false,
      reason: 'User is not authenticated',
    };
  }

  for (const permission of permissions) {
    const check = checkPermission(role, permission);
    if (!check.hasPermission) {
      return check;
    }
  }

  return { hasPermission: true };
}

/**
 * Check if any of the permissions pass
 */
export function checkAnyPermission(
  role: UserRole | undefined,
  permissions: Array<keyof RolePermissions>
): PermissionCheck {
  if (!role) {
    return {
      hasPermission: false,
      reason: 'User is not authenticated',
    };
  }

  for (const permission of permissions) {
    const check = checkPermission(role, permission);
    if (check.hasPermission) {
      return { hasPermission: true };
    }
  }

  return {
    hasPermission: false,
    reason: 'You do not have any of the required permissions',
  };
}
