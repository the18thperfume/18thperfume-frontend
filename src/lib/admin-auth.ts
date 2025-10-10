'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut, getCurrentUser, fetchAuthSession, confirmSignIn } from 'aws-amplify/auth';
import { configureAmplifyAuth } from '@/lib/admin-auth-config';

export interface AdminUser {
  sub: string;
  email: string;
  groups?: string[];
  role?: string;
  authProvider: 'cognito';
  lastLogin: string;
}

export interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Admin authentication utilities and hooks for Cognito integration
 */

/**
 * Check if current session is valid and user has admin privileges
 */
export const checkAdminSession = async (): Promise<{
  isAuthenticated: boolean;
  isAdmin: boolean;
  user?: AdminUser;
  error?: string;
}> => {
  try {
    // Configure Amplify if not already configured
    configureAmplifyAuth();

    console.log('🔍 Checking admin session...');

    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.log('❌ No current user found');
      return {
        isAuthenticated: false,
        isAdmin: false,
        error: 'No authenticated user found',
      };
    }

    console.log('👤 Current user:', {
      username: currentUser.username,
      userId: currentUser.userId
    });

    // Get session tokens
    const session = await fetchAuthSession();
    if (!session.tokens?.idToken?.payload) {
      console.log('❌ No session tokens found');
      return {
        isAuthenticated: false,
        isAdmin: false,
        error: 'Invalid session tokens',
      };
    }

    const payload = session.tokens.idToken.payload;
    console.log('📜 Token payload:', {
      sub: payload.sub,
      email: payload.email,
      'cognito:groups': payload['cognito:groups'],
      'custom:role': payload['custom:role'],
      allClaims: Object.keys(payload)
    });

    const userGroups = payload['cognito:groups'] as string[] || [];
    const customRole = payload['custom:role'] as string;

    console.log('🔐 Checking privileges:', {
      userGroups,
      customRole,
      hasAdminGroup: userGroups.includes('admin'),
      hasSuperAdminGroup: userGroups.includes('super-admin'),
      hasAdminRole: customRole === 'admin',
      hasSuperAdminRole: customRole === 'super-admin'
    });

    // Check admin privileges
    const isAdmin = userGroups.includes('admin') || 
                   userGroups.includes('super-admin') || 
                   customRole === 'admin' || 
                   customRole === 'super-admin';

    if (!isAdmin) {
      console.log('❌ Insufficient privileges');
      return {
        isAuthenticated: true,
        isAdmin: false,
        error: 'Insufficient privileges - admin access required',
      };
    }

    // Create admin user object
    const adminUser: AdminUser = {
      sub: payload.sub as string,
      email: payload.email as string,
      groups: userGroups,
      role: customRole,
      authProvider: 'cognito',
      lastLogin: new Date().toISOString(),
    };

    console.log('✅ Admin session valid:', adminUser);

    return {
      isAuthenticated: true,
      isAdmin: true,
      user: adminUser,
    };

  } catch (error) {
    console.error('❌ Session check failed:', error);
    return {
      isAuthenticated: false,
      isAdmin: false,
      error: error instanceof Error ? error.message : 'Session validation failed',
    };
  }
};

/**
 * Sign in admin user with Cognito
 */
export const signInAdmin = async (username: string, password: string): Promise<{
  success: boolean;
  user?: AdminUser;
  error?: string;
  challengeName?: string;
}> => {
  try {
    // Configure Amplify
    configureAmplifyAuth();

    console.log('🔐 Starting admin sign in for:', username);

    // Attempt sign in
    const signInResult = await signIn({
      username: username,
      password: password,
    });

    console.log('📋 Sign in result:', {
      isSignedIn: signInResult.isSignedIn,
      nextStep: signInResult.nextStep
    });

    if (signInResult.isSignedIn) {
      // Verify admin privileges
      console.log('✅ Sign in successful, checking admin privileges...');
      const sessionCheck = await checkAdminSession();
      
      console.log('🔍 Session check result:', {
        isAuthenticated: sessionCheck.isAuthenticated,
        isAdmin: sessionCheck.isAdmin,
        error: sessionCheck.error,
        user: sessionCheck.user ? {
          email: sessionCheck.user.email,
          groups: sessionCheck.user.groups,
          role: sessionCheck.user.role
        } : null
      });

      if (!sessionCheck.isAdmin) {
        // Sign out non-admin user
        await signOut();
        return {
          success: false,
          error: sessionCheck.error || 'Admin privileges required',
        };
      }

      return {
        success: true,
        user: sessionCheck.user,
      };
    } else if (signInResult.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      console.log('🔑 New password required for user');
      return {
        success: false,
        error: 'NEW_PASSWORD_REQUIRED',
        challengeName: 'NEW_PASSWORD_REQUIRED'
      };
    } else {
      console.log('❌ Sign in not complete:', signInResult.nextStep);
      return {
        success: false,
        error: 'Sign in incomplete - additional steps may be required',
      };
    }
  } catch (error) {
    console.error('❌ Sign in failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign in failed',
    };
  }
};

/**
 * Confirm new password for admin user
 */
export const confirmNewPassword = async (newPassword: string): Promise<{
  success: boolean;
  user?: AdminUser;
  error?: string;
}> => {
  try {
    console.log('🔑 Confirming new password...');
    
    const confirmResult = await confirmSignIn({
      challengeResponse: newPassword
    });

    console.log('📋 Confirm result:', {
      isSignedIn: confirmResult.isSignedIn,
      nextStep: confirmResult.nextStep
    });

    if (confirmResult.isSignedIn) {
      console.log('✅ Password confirmation successful - user is now signed in');
      
      // After password change, user is automatically signed in
      // We'll defer admin privilege checking to the next session check
      // to avoid timing issues with token propagation
      return {
        success: true,
        // user will be populated by the next checkAdminSession call
      };
    } else {
      console.log('❌ Password confirmation incomplete:', confirmResult.nextStep);
      return {
        success: false,
        error: 'Password confirmation failed - additional steps required',
      };
    }
  } catch (error) {
    console.error('❌ Confirm new password failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Password confirmation failed',
    };
  }
};

/**
 * Sign out admin user
 */
export const signOutAdmin = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    await signOut();
    return { success: true };
  } catch (error) {
    console.error('Sign out failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign out failed',
    };
  }
};

/**
 * Get current admin user from session
 */
export const getCurrentAdminUser = async (): Promise<AdminUser | null> => {
  try {
    const sessionCheck = await checkAdminSession();
    return sessionCheck.isAdmin ? sessionCheck.user || null : null;
  } catch (error) {
    console.error('Error getting current admin user:', error);
    return null;
  }
};

/**
 * Refresh authentication tokens
 */
export const refreshAdminSession = async (): Promise<boolean> => {
  try {
    const session = await fetchAuthSession({ forceRefresh: true });
    return !!session.tokens?.accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

/**
 * Hook for admin authentication state management
 */
export function useAdminAuth(): AuthState & {
  signIn: (username: string, password: string) => Promise<{ success: boolean; challengeName?: string }>;
  signOut: () => Promise<void>;
  confirmNewPassword: (newPassword: string) => Promise<boolean>;
  refreshSession: () => Promise<void>;
  checkSession: () => Promise<void>;
} {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check initial authentication state
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const sessionCheck = await checkAdminSession();
      
      if (isMounted) {
        setAuthState({
          user: sessionCheck.user || null,
          isAuthenticated: sessionCheck.isAuthenticated,
          isLoading: false,
          error: sessionCheck.error || null,
        });
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sign in function
  const handleSignIn = async (username: string, password: string): Promise<{ success: boolean; challengeName?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    const result = await signInAdmin(username, password);
    
    setAuthState({
      user: result.user || null,
      isAuthenticated: result.success,
      isLoading: false,
      error: result.error || null,
    });

    return { 
      success: result.success,
      challengeName: result.challengeName 
    };
  };

  // Confirm new password function
  const handleConfirmNewPassword = async (newPassword: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    const result = await confirmNewPassword(newPassword);
    
    // After successful password confirmation, user is signed in but we don't 
    // immediately check admin privileges to avoid timing issues
    setAuthState({
      user: null, // Will be populated by CognitoProtectedRoute
      isAuthenticated: result.success,
      isLoading: false,
      error: result.error || null,
    });

    return result.success;
  };

  // Sign out function
  const handleSignOut = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    await signOutAdmin();
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  // Refresh session function
  const handleRefreshSession = async (): Promise<void> => {
    const sessionCheck = await checkAdminSession();
    
    setAuthState({
      user: sessionCheck.user || null,
      isAuthenticated: sessionCheck.isAuthenticated,
      isLoading: false,
      error: sessionCheck.error || null,
    });
  };

  // Check session function
  const handleCheckSession = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    await handleRefreshSession();
  };

  return {
    ...authState,
    signIn: handleSignIn,
    signOut: handleSignOut,
    confirmNewPassword: handleConfirmNewPassword,
    refreshSession: handleRefreshSession,
    checkSession: handleCheckSession,
  };
}

/**
 * Hook for checking if user has specific admin privileges
 */
export function useAdminPermissions() {
  const { user } = useAdminAuth();

  const hasGroup = (group: string): boolean => {
    return user?.groups?.includes(group) || false;
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const isSuperAdmin = (): boolean => {
    return hasGroup('super-admin') || hasRole('super-admin');
  };

  const isAdmin = (): boolean => {
    return hasGroup('admin') || hasRole('admin') || isSuperAdmin();
  };

  const isModerator = (): boolean => {
    return hasGroup('moderator') || hasRole('moderator') || isAdmin();
  };

  const canManageProducts = (): boolean => {
    return isAdmin() || isModerator();
  };

  const canManageUsers = (): boolean => {
    return isSuperAdmin();
  };

  return {
    hasGroup,
    hasRole,
    isSuperAdmin,
    isAdmin,
    isModerator,
    canManageProducts,
    canManageUsers,
    user,
  };
}
