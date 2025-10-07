"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Package, 
  Users, 
  ShoppingBag, 
  BarChart3, 
  Settings,
  LogOut,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
  },
  {
    name: 'Quản lý Sản phẩm',
    href: '/admin/products',
    icon: Package,
  },
  {
    name: 'Đơn hàng',
    href: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    name: 'Khách hàng',
    href: '/admin/customers',
    icon: Users,
  },
  {
    name: 'Cài đặt',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b px-6">
            <h1 className="text-xl font-bold text-gray-900">18th Perfume Admin</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="border-t px-4 py-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:ml-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 flex-shrink-0 items-center bg-white shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            className="px-4 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 justify-between px-4 lg:px-6">
            <div className="flex flex-1">
              <h2 className="text-2xl font-semibold text-gray-900">
                {navigation.find(item => 
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                )?.name || 'Dashboard'}
              </h2>
            </div>
            <div className="ml-4 flex items-center space-x-4">
              <span className="text-sm text-gray-500">Admin User</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 lg:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
