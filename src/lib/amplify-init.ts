'use client';

import { Amplify } from 'aws-amplify';

// Initialize Amplify configuration as early as possible
let isAmplifyConfigured = false;

export const initializeAmplify = () => {
  if (isAmplifyConfigured) return;

  // Get environment variables with fallbacks
  const userPoolId = process.env.NEXT_PUBLIC_ADMIN_USER_POOL_ID;
  const userPoolClientId = process.env.NEXT_PUBLIC_ADMIN_USER_POOL_CLIENT_ID;
  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-1';

  // Debug logging
  console.log('🔧 Amplify Config Values:', {
    userPoolId: userPoolId || 'MISSING',
    userPoolClientId: userPoolClientId || 'MISSING',
    region,
    nodeEnv: process.env.NODE_ENV,
  });

  // Only configure if we have the required values
  if (!userPoolId || !userPoolClientId) {
    console.error('❌ Missing required Cognito configuration:', {
      userPoolId: !!userPoolId,
      userPoolClientId: !!userPoolClientId,
    });
    return;
  }

  try {
    const authConfig = {
      Auth: {
        Cognito: {
          userPoolId,
          userPoolClientId,
          loginWith: {
            email: true,
            username: false,
          },
        }
      }
    };

    Amplify.configure(authConfig);
    isAmplifyConfigured = true;
    console.log('✅ Amplify configured successfully');
  } catch (error) {
    console.error('❌ Failed to configure Amplify:', error);
  }
};

// Auto-initialize when this module is imported
if (typeof window !== 'undefined') {
  initializeAmplify();
}
