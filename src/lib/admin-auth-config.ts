import { initializeAmplify } from './amplify-init';

/**
 * Amplify Auth Configuration for Admin Panel
 */
export const configureAmplifyAuth = () => {
  initializeAmplify();
};

/**
 * Default Cognito configuration for admin authentication
 */
export const defaultCognitoConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-1',
  userPoolId: process.env.NEXT_PUBLIC_ADMIN_USER_POOL_ID || '',
  userPoolClientId: process.env.NEXT_PUBLIC_ADMIN_USER_POOL_CLIENT_ID || '',
  domain: process.env.NEXT_PUBLIC_ADMIN_AUTH_DOMAIN || '',
};

/**
 * Admin role configuration
 */
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
} as const;

export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES];

/**
 * Admin group configuration for Cognito
 */
export const ADMIN_GROUPS = ['admin', 'super-admin', 'moderator'];

/**
 * Get admin configuration from environment variables
 */
export const getAdminAuthConfig = () => ({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-1',
  userPoolId: process.env.NEXT_PUBLIC_ADMIN_USER_POOL_ID || '',
  userPoolClientId: process.env.NEXT_PUBLIC_ADMIN_USER_POOL_CLIENT_ID || '',
  identityPoolId: process.env.NEXT_PUBLIC_ADMIN_IDENTITY_POOL_ID || '',
  domain: process.env.NEXT_PUBLIC_ADMIN_AUTH_DOMAIN || '',
  requiredGroups: ADMIN_GROUPS,
  tokenRefreshInterval: 50 * 60 * 1000, // 50 minutes
  sessionTimeout: 60 * 60 * 1000, // 1 hour
});
