'use client';

import { useEffect, useState } from 'react';
import { config } from '@/lib/config';

export default function AdminDebugPage() {
  const [configValues, setConfigValues] = useState<any>(null);

  useEffect(() => {
    setConfigValues({
      userPoolId: config.auth.userPoolId,
      userPoolClientId: config.auth.userPoolClientId,
      region: config.auth.region,
      environment: config.app.environment,
      nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL,
      nextPublicUserPoolId: process.env.NEXT_PUBLIC_ADMIN_USER_POOL_ID,
      nextPublicUserPoolClientId: process.env.NEXT_PUBLIC_ADMIN_USER_POOL_CLIENT_ID,
      nextPublicAwsRegion: process.env.NEXT_PUBLIC_AWS_REGION,
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Debug Configuration</h1>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(configValues, null, 2)}
      </pre>
    </div>
  );
}
