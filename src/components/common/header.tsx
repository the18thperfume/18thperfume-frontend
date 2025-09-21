import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">18th Perfume</span>
          </Link>
        </div>
        
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

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            Đăng nhập
          </Button>
          <Button size="sm">
            Giỏ hàng
          </Button>
        </div>
      </div>
    </header>
  );
}
