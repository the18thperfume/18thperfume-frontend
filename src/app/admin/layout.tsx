import AdminLayout from '@/components/admin/admin-layout';
import { CognitoProtectedRoute } from '@/components/admin/cognito-protected-route';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CognitoProtectedRoute 
      requiredGroups={['admin', 'super-admin']}
      fallbackRoute="/auth/login"
    >
      <AdminLayout>{children}</AdminLayout>
    </CognitoProtectedRoute>
  );
}
