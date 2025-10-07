/**
 * Application configuration
 * Centralized access to environment variables
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    timeout: 10000,
  },
  
  // Authentication Configuration  
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    // Cognito Admin Configuration
    userPoolId: process.env.NEXT_PUBLIC_ADMIN_USER_POOL_ID || '',
    userPoolClientId: process.env.NEXT_PUBLIC_ADMIN_USER_POOL_CLIENT_ID || '',
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-1',
  },
  
  // Admin Configuration
  admin: {
    defaultPageSize: 20,
    maxImageFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  
  // Product Configuration
  product: {
    maxVariants: 10,
    maxNotesLength: 200,
    maxDescriptionLength: 1000,
    priceRange: {
      min: 1000,
      max: 10000000
    }
  },
  
  // App Configuration
  app: {
    name: '18th Perfume',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  
  // AWS Configuration (for future use)
  aws: {
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-west-2',
    cognitoUserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    cognitoClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  }
} as const;

export default config;
