"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  isAdmin?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export default function Header({ 
  isAdmin = false, 
  userName = "Admin User",
  onLogout
}: HeaderProps) {
  const pathname = usePathname();
  
  // Auto-detect admin mode if not explicitly provided
  const isAdminMode = isAdmin || pathname.startsWith('/admin');

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      console.log('Đăng xuất...');
      // TODO: Implement actual logout logic with Cognito
      window.location.href = '/auth/login';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-4 ml-4">
          <Link href={isAdminMode ? "/admin" : "/"} className="flex items-center space-x-3">
            <Image 
              src="/images/logo.jpg" 
              alt="The 18th Perfume"
              width={32}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Center Section - Admin Dashboard label cho admin mode */}
        {isAdminMode && (
          <div className="hidden md:flex items-center">
            <span className="text-lg font-medium text-gray-600">
              Admin Dashboard
            </span>
          </div>
        )}
        
        {/* Navigation - Chỉ hiển thị khi không phải admin mode */}
        {!isAdminMode && (
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="text-sm font-medium hover:text-primary">
              Sản phẩm
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary">
              Về chúng tôi
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary">
              Liên hệ
            </Link>
          </nav>
        )}

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {isAdminMode ? (
            /* Admin User Dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{userName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Thông tin tài khoản</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* User Mode Buttons */
            <>
              <Button variant="ghost" size="sm">
                Đăng nhập
              </Button>
              <Button size="sm">
                Giỏ hàng
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
