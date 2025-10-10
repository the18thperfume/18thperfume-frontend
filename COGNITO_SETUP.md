# Hướng dẫn Cấu hình AWS Cognito cho Admin Login

## 🔧 Bước 1: Cập nhật Environment Variables

Trong file `.env.local`, thay thế các placeholder bằng giá trị thực từ AWS Cognito:

```env
# AWS Cognito Configuration
NEXT_PUBLIC_ADMIN_USER_POOL_ID=your_actual_user_pool_id
NEXT_PUBLIC_ADMIN_USER_POOL_CLIENT_ID=your_actual_client_id  
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
```

## 📋 Bước 2: Tìm User Pool ID và Client ID

### Tìm User Pool ID:
1. Đăng nhập AWS Console
2. Vào dịch vụ **Cognito**
3. Chọn **User pools**
4. Chọn User Pool bạn đã tạo
5. Copy **User Pool ID** (dạng: `ap-southeast-1_xxxxxxxxx`)

### Tìm Client ID:
1. Trong User Pool, chọn tab **App integration**
2. Scroll xuống phần **App clients and analytics**
3. Chọn app client bạn đã tạo
4. Copy **Client ID** (dạng: `xxxxxxxxxxxxxxxxxxxxxxxxxx`)

## 👤 Bước 3: Cấu hình Admin User

### Nếu user được tạo với username:
- Sử dụng **username** để đăng nhập (VD: `admin`)

### Nếu user được tạo với email:
- Sử dụng **email** để đăng nhập (VD: `admin@example.com`)

### Thêm user vào Admin Group:
1. Trong User Pool, chọn tab **Users**
2. Chọn user admin
3. Chọn tab **Group memberships**
4. Thêm user vào group `admin` hoặc tạo group mới

## 🔐 Bước 4: Kiểm tra Admin Privileges

Đảm bảo user có một trong các điều kiện sau:

### Option 1: Cognito Groups
- User thuộc group: `admin` hoặc `super-admin`

### Option 2: Custom Attributes
- User có custom attribute `role` = `admin` hoặc `super-admin`

## 🧪 Bước 5: Test Login

1. Restart development server
2. Vào `/auth/login`
3. Nhập username/email và password
4. Kiểm tra console logs để debug

## � Xử lý First-Time Login

Khi admin tạo user mới trong Cognito, user sẽ có status **FORCE_CHANGE_PASSWORD**:

### Quy trình đăng nhập lần đầu:
1. Nhập username/email và temporary password
2. Hệ thống sẽ tự động chuyển sang form "Đặt mật khẩu mới"
3. Nhập mật khẩu mới theo yêu cầu:
   - Ít nhất 8 ký tự
   - Ít nhất 1 chữ hoa
   - Ít nhất 1 chữ thường  
   - Ít nhất 1 số
   - Ít nhất 1 ký tự đặc biệt
4. Xác nhận mật khẩu
5. Hệ thống sẽ tự động đăng nhập và chuyển đến admin dashboard

## �🔍 Debug Tips

- Mở **Developer Console** để xem logs
- Tìm các log bắt đầu với 🔧, 🔐, 📋, 🔍, 🔑
- Nếu thấy "MISSING" trong config, kiểm tra lại environment variables
- Nếu thấy "user does not exist", kiểm tra username/email
- Nếu thấy "insufficient privileges", kiểm tra admin groups/roles
- Nếu thấy "NEW_PASSWORD_REQUIRED", đây là flow bình thường cho user mới
