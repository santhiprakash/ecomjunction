/**
 * Page-Level Permission Utilities
 * Manages permissions for page collaborators (owner, admin, editor, viewer)
 */

import { PageRole, PagePermissions, PageCollaborator } from '@/types';

// ============================================================================
// Permission Definitions by Page Role
// ============================================================================

export const PAGE_ROLE_PERMISSIONS: Record<PageRole, PagePermissions> = {
  owner: {
    canEditPage: true,
    canDeletePage: true,
    canAddProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canViewAnalytics: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: true,
  },
  admin: {
    canEditPage: true,
    canDeletePage: false, // Only owner can delete page
    canAddProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canViewAnalytics: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: true, // Can change other members' roles except owner
  },
  editor: {
    canEditPage: false,
    canDeletePage: false,
    canAddProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canViewAnalytics: true,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
  },
  viewer: {
    canEditPage: false,
    canDeletePage: false,
    canAddProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
    canViewAnalytics: true, // Can view analytics only
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
  },
};

// ============================================================================
// Permission Check Functions
// ============================================================================

/**
 * Get all permissions for a given page role
 */
export function getPageRolePermissions(role: PageRole): PagePermissions {
  return PAGE_ROLE_PERMISSIONS[role];
}

/**
 * Check if a page role has a specific permission
 */
export function hasPagePermission(
  role: PageRole,
  permission: keyof PagePermissions
): boolean {
  return PAGE_ROLE_PERMISSIONS[role][permission];
}

/**
 * Check if user can perform an action on a page
 */
export function canPerformPageAction(
  userRole: PageRole | undefined,
  permission: keyof PagePermissions
): boolean {
  if (!userRole) return false;
  return PAGE_ROLE_PERMISSIONS[userRole][permission];
}

/**
 * Get user's role on a specific page
 */
export function getUserPageRole(
  userId: string,
  pageId: string,
  collaborators: PageCollaborator[]
): PageRole | null {
  const collaborator = collaborators.find(
    c => c.userId === userId && c.pageId === pageId && c.isActive
  );
  return collaborator?.role || null;
}

/**
 * Check if user is page owner
 */
export function isPageOwner(
  userId: string,
  pageId: string,
  collaborators: PageCollaborator[]
): boolean {
  const role = getUserPageRole(userId, pageId, collaborators);
  return role === 'owner';
}

/**
 * Check if user has any access to page
 */
export function hasPageAccess(
  userId: string,
  pageId: string,
  collaborators: PageCollaborator[]
): boolean {
  return getUserPageRole(userId, pageId, collaborators) !== null;
}

/**
 * Format page role for display
 */
export function formatPageRole(role: PageRole): string {
  const roleMap: Record<PageRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    editor: 'Editor',
    viewer: 'Viewer',
  };
  return roleMap[role];
}

/**
 * Get page role description
 */
export function getPageRoleDescription(role: PageRole): string {
  const descriptions: Record<PageRole, string> = {
    owner: 'Full control over the page, including deletion and team management',
    admin: 'Manage page content, products, and team members',
    editor: 'Add, edit, and delete products; view analytics',
    viewer: 'View analytics and page preview only',
  };
  return descriptions[role];
}

/**
 * Get role badge color for UI
 */
export function getPageRoleBadgeColor(role: PageRole): string {
  const colors: Record<PageRole, string> = {
    owner: 'bg-purple-100 text-purple-800 border-purple-300',
    admin: 'bg-blue-100 text-blue-800 border-blue-300',
    editor: 'bg-green-100 text-green-800 border-green-300',
    viewer: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  return colors[role];
}

/**
 * Get available roles for invitation (cannot invite as owner)
 */
export function getInvitableRoles(): PageRole[] {
  return ['admin', 'editor', 'viewer'];
}

/**
 * Check if role can be changed (owner cannot be changed)
 */
export function canChangePageRole(
  currentRole: PageRole,
  newRole: PageRole,
  changerRole: PageRole
): boolean {
  // Cannot change owner role
  if (currentRole === 'owner') return false;

  // Owner can change any role
  if (changerRole === 'owner') return true;

  // Admin can change editor and viewer roles
  if (changerRole === 'admin') {
    return newRole === 'editor' || newRole === 'viewer';
  }

  // Editors and viewers cannot change roles
  return false;
}

/**
 * Check if user can remove a member from page
 */
export function canRemovePageMember(
  removerRole: PageRole,
  targetRole: PageRole
): boolean {
  // Cannot remove owner
  if (targetRole === 'owner') return false;

  // Owner can remove anyone
  if (removerRole === 'owner') return true;

  // Admin can remove editors and viewers
  if (removerRole === 'admin') {
    return targetRole === 'editor' || targetRole === 'viewer';
  }

  // Editors and viewers cannot remove members
  return false;
}

/**
 * Get permission differences between two roles (for upgrade/downgrade messaging)
 */
export function getPermissionDifferences(
  fromRole: PageRole,
  toRole: PageRole
): {
  gained: Array<keyof PagePermissions>;
  lost: Array<keyof PagePermissions>;
} {
  const fromPerms = PAGE_ROLE_PERMISSIONS[fromRole];
  const toPerms = PAGE_ROLE_PERMISSIONS[toRole];

  const gained: Array<keyof PagePermissions> = [];
  const lost: Array<keyof PagePermissions> = [];

  for (const key in fromPerms) {
    const permKey = key as keyof PagePermissions;
    if (toPerms[permKey] && !fromPerms[permKey]) {
      gained.push(permKey);
    } else if (!toPerms[permKey] && fromPerms[permKey]) {
      lost.push(permKey);
    }
  }

  return { gained, lost };
}

/**
 * Validate page collaborator before adding
 */
export function validateCollaborator(
  email: string,
  role: PageRole,
  existingCollaborators: PageCollaborator[],
  currentUserRole: PageRole
): { valid: boolean; error?: string } {
  // Check if inviter has permission
  if (!hasPagePermission(currentUserRole, 'canInviteMembers')) {
    return { valid: false, error: 'You do not have permission to invite members' };
  }

  // Check if email is already a collaborator
  const existing = existingCollaborators.find(
    c => c.user?.email === email && c.isActive
  );
  if (existing) {
    return {
      valid: false,
      error: `${email} is already a ${formatPageRole(existing.role)} on this page`,
    };
  }

  // Cannot invite as owner
  if (role === 'owner') {
    return { valid: false, error: 'Cannot invite someone as owner' };
  }

  return { valid: true };
}

/**
 * Generate permission summary text
 */
export function getPermissionSummary(role: PageRole): string[] {
  const permissions = PAGE_ROLE_PERMISSIONS[role];
  const summary: string[] = [];

  if (permissions.canEditPage) summary.push('Edit page settings');
  if (permissions.canDeletePage) summary.push('Delete page');
  if (permissions.canAddProducts) summary.push('Add products');
  if (permissions.canEditProducts) summary.push('Edit products');
  if (permissions.canDeleteProducts) summary.push('Delete products');
  if (permissions.canViewAnalytics) summary.push('View analytics');
  if (permissions.canInviteMembers) summary.push('Invite team members');
  if (permissions.canRemoveMembers) summary.push('Remove team members');
  if (permissions.canChangeRoles) summary.push('Change member roles');

  return summary;
}
