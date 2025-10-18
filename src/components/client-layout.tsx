"use client";

import { usePathname } from 'next/navigation';
import Header from '@/components/common/header';
import Footer from '@/components/common/footer';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // Detect if current route is admin
  const isAdmin = pathname.startsWith('/admin');
  
  // TODO: Replace with actual user data from authentication context
  const adminUserName = "Admin User"; // This should come from your auth context
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        isAdmin={isAdmin}
        userName={isAdmin ? adminUserName : undefined}
      />
      <main className="flex-1">
        {children}
      </main>
      {/* Chỉ hiển thị Footer khi không phải admin */}
      {!isAdmin && <Footer />}
    </div>
  );
}
