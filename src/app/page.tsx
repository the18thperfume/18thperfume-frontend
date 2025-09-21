import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
      <Card className="max-w-2xl w-full text-center">
        <CardContent className="p-12">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
                18th Perfume
              </h1>
              <p className="text-xl text-muted-foreground">
                Nước hoa cao cấp
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-semibold">
                Sắp ra mắt
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Chúng tôi đang chuẩn bị một trải nghiệm mua sắm tuyệt vời 
                với những sản phẩm nước hoa cao cấp và chất lượng nhất.
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Hãy để lại thông tin để nhận thông báo khi chúng tôi chính thức ra mắt
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button>
                  Đăng ký
                </Button>
              </div>
            </div>
            
            <div className="pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                Theo dõi chúng tôi để cập nhật thông tin mới nhất
              </p>
              <div className="flex justify-center space-x-4 mt-4">
                <Button variant="outline" size="sm">
                  Facebook
                </Button>
                <Button variant="outline" size="sm">
                  Instagram
                </Button>
                <Button variant="outline" size="sm">
                  TikTok
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
