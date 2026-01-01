import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { hasPermission, formatRole, checkPermission, RolePermissions } from '@/utils/permissions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: keyof RolePermissions;
  fallback?: ReactNode;
  redirectTo?: string;
  showMessage?: boolean;
}

/**
 * RoleGuard Component
 * Protects routes and components based on user roles and permissions
 *
 * Usage:
 * <RoleGuard allowedRoles={['admin', 'affiliate_marketer']}>
 *   <AdminDashboard />
 * </RoleGuard>
 *
 * Or with specific permission:
 * <RoleGuard requiredPermission="canManageUsers">
 *   <UserManagement />
 * </RoleGuard>
 */
export default function RoleGuard({
  children,
  allowedRoles,
  requiredPermission,
  fallback,
  redirectTo = '/',
  showMessage = true,
}: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return fallback || <UnauthorizedMessage message="You must be logged in to access this page" />;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.includes(user.role);

    if (!hasAllowedRole) {
      if (redirectTo && !showMessage) {
        return <Navigate to={redirectTo} replace />;
      }

      const allowedRoleNames = allowedRoles.map(formatRole).join(', ');
      return fallback || (
        <UnauthorizedMessage
          message={`This page requires one of the following roles: ${allowedRoleNames}`}
          userRole={formatRole(user.role)}
        />
      );
    }
  }

  // Check permission-based access
  if (requiredPermission) {
    const permissionCheck = checkPermission(user.role, requiredPermission);

    if (!permissionCheck.hasPermission) {
      if (redirectTo && !showMessage) {
        return <Navigate to={redirectTo} replace />;
      }

      return fallback || (
        <UnauthorizedMessage
          message={permissionCheck.reason || 'You do not have permission to access this page'}
          userRole={formatRole(user.role)}
        />
      );
    }
  }

  // User has access
  return <>{children}</>;
}

/**
 * Unauthorized Message Component
 */
function UnauthorizedMessage({ message, userRole }: { message: string; userRole?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">{message}</p>
            {userRole && (
              <p className="text-sm text-muted-foreground">
                Your current role: <strong>{userRole}</strong>
              </p>
            )}
          </AlertDescription>
        </Alert>

        <div className="mt-4 text-center">
          <a
            href="/"
            className="text-sm text-primary hover:underline"
          >
            Return to homepage
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for programmatic role checks
 */
export function useRoleGuard() {
  const { user } = useAuth();

  return {
    hasRole: (role: UserRole) => user?.role === role,
    hasAnyRole: (roles: UserRole[]) => roles.includes(user?.role as UserRole),
    hasPermission: (permission: keyof RolePermissions) =>
      user?.role ? hasPermission(user.role, permission) : false,
    isAdmin: user?.role === 'admin',
    isAffiliateMarketer: user?.role === 'affiliate_marketer',
    isEndUser: user?.role === 'end_user',
  };
}
