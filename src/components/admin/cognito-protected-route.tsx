'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';
import { configureAmplifyAuth } from '@/lib/admin-auth-config';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface AdminUser {
  sub: string;
  email: string;
  groups?: string[];
  role?: string;
  authProvider: 'cognito';
  lastLogin: string;
}

interface CognitoProtectedRouteProps {
  children: React.ReactNode;
  requiredGroups?: string[];
  fallbackRoute?: string;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

/**
 * Protected route wrapper for admin authentication with Cognito
 * Ensures only authenticated admin users can access protected routes
 */
export function CognitoProtectedRoute({ 
  children, 
  requiredGroups = ['admin'],
  fallbackRoute = '/auth/login',
  loadingComponent,
  unauthorizedComponent 
}: CognitoProtectedRouteProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthorized' | 'unauthenticated' | 'error' | 'redirect'>('loading');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Configure Amplify on mount
  useEffect(() => {
    try {
      configureAmplifyAuth();
    } catch (error) {
      console.error('Failed to configure Amplify:', error);
      setError('Authentication configuration error');
      setAuthState('error');
    }
  }, []);

  // Check authentication status
  useEffect(() => {
    let isMounted = true;

    const checkAuthStatus = async () => {
      if (!isMounted) return;
      
      try {
        setError(null);

        // Get current authenticated user
        const currentUser = await getCurrentUser();
        
        if (!currentUser || !isMounted) {
          if (isMounted) {
            setAuthState('unauthenticated');
          }
          return;
        }

        // Get user session with tokens
        const session = await fetchAuthSession();
        
        if (!session?.tokens || !isMounted) {
          if (isMounted) {
            setAuthState('unauthenticated');
          }
          return;
        }

        // Extract user information from tokens
        const idToken = session.tokens.idToken;
        if (!idToken?.payload) {
          throw new Error('Invalid ID token');
        }

        const userGroups = idToken.payload['cognito:groups'] as string[] || [];
        const customRole = idToken.payload['custom:role'] as string;
        const email = idToken.payload.email as string;
        const sub = idToken.payload.sub as string;

        // Check if user has required admin privileges
        const hasRequiredGroup = requiredGroups.some(group => userGroups.includes(group));
        const hasAdminRole = customRole === 'admin' || customRole === 'super-admin';
        const userAuthorized = hasRequiredGroup || hasAdminRole;

        console.log('🔍 CognitoProtectedRoute - Admin privilege check:', {
          email,
          userGroups,
          customRole,
          requiredGroups,
          hasRequiredGroup,
          hasAdminRole,
          userAuthorized
        });

        if (!userAuthorized) {
          console.log('❌ User not authorized for admin access');
          if (isMounted && authState !== 'unauthorized') {
            setAuthState('unauthorized');
            setError('Insufficient privileges - admin access required');
          }
          return;
        }

        console.log('✅ User authorized for admin access');

        // Only create new admin user object if user data has actually changed
        const newAdminUser: AdminUser = {
          sub,
          email,
          groups: userGroups,
          role: customRole,
          authProvider: 'cognito',
          lastLogin: new Date().toISOString(),
        };

        // Check if user data has actually changed (ignoring lastLogin)
        const userDataChanged = !user || 
          user.sub !== sub || 
          user.email !== email ||
          JSON.stringify(user.groups) !== JSON.stringify(userGroups) ||
          user.role !== customRole;

        if (isMounted) {
          if (userDataChanged) {
            setUser(newAdminUser);
          }
          if (authState !== 'authenticated') {
            setAuthState('authenticated');
          }
        }

      } catch (error) {

        if (isMounted) {
          setUser(null);
          setError(error instanceof Error ? error.message : 'Authentication failed');
          
          // Distinguish between 'not authenticated' and genuine errors
          if (error instanceof Error && error.message === 'not authenticated') {
            setAuthState('unauthenticated'); // Redirect to login
          } else {
            setAuthState('error'); // Show error message
          }
        }
      }
    };

    checkAuthStatus();

    // Setup token refresh interval (15 minutes instead of 50) - skip in test environment
    const refreshInterval = process.env.NODE_ENV === 'test' ? null : setInterval(() => {
      if (isMounted) {
        checkAuthStatus();
      }
    }, 15 * 60 * 1000);

    return () => {
      isMounted = false;
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount - intentionally no dependencies to avoid infinite loops

  // Handle unauthenticated state - redirect to login
  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.replace(fallbackRoute);
    }
  }, [authState, fallbackRoute, router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setAuthState('redirect');
      router.replace('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even if sign out fails
      setUser(null);
      setAuthState('redirect');
      router.replace('/auth/login');
    }
  };

  // Loading state
  if (authState === 'loading') {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">
            Đang xác thực...
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Vui lòng chờ trong giây lát
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (authState === 'error' && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-600" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">
            Lỗi xác thực
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-md">
            {error}
          </p>
          <button
            onClick={() => router.replace(fallbackRoute)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  // Unauthorized state
  if (authState === 'unauthorized') {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="mx-auto h-8 w-8 text-amber-600" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">
            Không có quyền truy cập
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-md">
            Bạn cần quyền quản trị viên để truy cập khu vực này.
          </p>
          <div className="mt-6 space-x-4">
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Đăng xuất
            </button>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated and authorized - render protected content
  if (authState === 'authenticated' && user) {
    return <>{children}</>;
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
        <h2 className="mt-4 text-lg font-medium text-gray-900">
          Đang tải...
        </h2>
      </div>
    </div>
  );
}

/**
 * Hook to get current admin user
 */
export function useAdminUser() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        
        if (currentUser && session.tokens?.idToken?.payload) {
          const payload = session.tokens.idToken.payload;
          const adminUser: AdminUser = {
            sub: payload.sub as string,
            email: payload.email as string,
            groups: payload['cognito:groups'] as string[] || [],
            role: payload['custom:role'] as string,
            authProvider: 'cognito',
            lastLogin: new Date().toISOString(),
          };
          setUser(adminUser);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();
  }, []);

  return { user, isLoading };
}
