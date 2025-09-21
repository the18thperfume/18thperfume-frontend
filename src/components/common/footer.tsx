import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">18th Perfume</h3>
            <p className="text-sm text-muted-foreground">
              Thương hiệu nước hoa cao cấp với chất lượng tuyệt vời và mùi hương độc đáo.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Sản phẩm</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary">
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/products/new" className="text-muted-foreground hover:text-primary">
                  Sản phẩm mới
                </Link>
              </li>
              <li>
                <Link href="/products/bestseller" className="text-muted-foreground hover:text-primary">
                  Bán chạy nhất
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-primary">
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link href="/return" className="text-muted-foreground hover:text-primary">
                  Chính sách đổi trả
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: info@18thperfume.com</li>
              <li>Hotline: 1900 8888</li>
              <li>Địa chỉ: TP. Hồ Chí Minh</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 18th Perfume. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
