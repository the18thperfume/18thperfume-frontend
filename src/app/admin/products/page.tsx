import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
          <p className="text-gray-600">Quản lý tất cả sản phẩm trong hệ thống</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm sản phẩm mới
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm và Lọc</CardTitle>
          <CardDescription>
            Tìm kiếm sản phẩm theo tên, thương hiệu hoặc danh mục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Tìm kiếm
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Sản phẩm</CardTitle>
          <CardDescription>
            Tất cả sản phẩm hiện có trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Chưa có sản phẩm nào được tạo.</p>
            <Link href="/admin/products/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tạo sản phẩm đầu tiên
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
