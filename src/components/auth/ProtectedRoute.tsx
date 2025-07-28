import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, Sparkles } from 'lucide-react';
import AuthModal from './AuthModal';
import { useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowDemo?: boolean;
  fallbackComponent?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  allowDemo = true,
  fallbackComponent 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isDemo, loginDemo } = useAuth();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is not required, always show children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If user is authenticated (including demo), show children
  if (isAuthenticated && (allowDemo || !isDemo)) {
    return <>{children}</>;
  }

  // If user is in demo mode but demo is not allowed for this route
  if (isDemo && !allowDemo) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              This feature requires a full account. Demo mode has limited access.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Please create an account or sign in to access this feature.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setShowAuthModal(true)}>
                Sign In / Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>

        <AuthModal 
          open={showAuthModal} 
          onOpenChange={setShowAuthModal}
          defaultTab="register"
        />
      </div>
    );
  }

  // If custom fallback component is provided, use it
  if (fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  // Default unauthenticated state - show auth options
  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-primary" />
          <CardTitle>Welcome to Shopmatic</CardTitle>
          <CardDescription>
            Sign in to access your dashboard and manage your products
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demo option */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Try Demo Mode</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Explore all features instantly without creating an account
                </p>
                <Button 
                  onClick={loginDemo}
                  variant="outline"
                  className="bg-white/80 hover:bg-white"
                >
                  Start Demo
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with account
              </span>
            </div>
          </div>

          {/* Auth options */}
          <div className="space-y-4 text-center">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowAuthModal(true)}
              >
                Sign In
              </Button>
              <Button 
                onClick={() => setShowAuthModal(true)}
              >
                Sign Up
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
}

// Higher-order component for easy route protection
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}