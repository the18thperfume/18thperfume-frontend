import { z } from 'zod';

export const productValidationSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên sản phẩm là bắt buộc')
    .min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự')
    .max(100, 'Tên sản phẩm không được vượt quá 100 ký tự'),
  
  description: z
    .string()
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự')
    .optional()
    .or(z.literal('')),
  
  brand: z
    .string()
    .min(1, 'Thương hiệu là bắt buộc')
    .min(2, 'Thương hiệu phải có ít nhất 2 ký tự')
    .max(50, 'Thương hiệu không được vượt quá 50 ký tự'),
  
  category: z
    .enum(['Nam', 'Nữ', 'Unisex'], {
      message: 'Vui lòng chọn giới tính hợp lệ'
    }),
  
  segment: z
    .enum(['Designer', 'Niche'], {
      message: 'Vui lòng chọn phân khúc hợp lệ'
    }),
  
  origin: z
    .string()
    .min(1, 'Xuất xứ là bắt buộc')
    .min(2, 'Xuất xứ phải có ít nhất 2 ký tự')
    .max(50, 'Xuất xứ không được vượt quá 50 ký tự'),
  
  fragranceFamily: z
    .string()
    .min(1, 'Nhóm hương là bắt buộc')
    .min(2, 'Nhóm hương phải có ít nhất 2 ký tự')
    .max(50, 'Nhóm hương không được vượt quá 50 ký tự'),
  
  concentration: z
    .string()
    .min(1, 'Nồng độ là bắt buộc')
    .min(2, 'Nồng độ phải có ít nhất 2 ký tự')
    .max(20, 'Nồng độ không được vượt quá 20 ký tự'),
  
  releaseYear: z
    .number()
    .int('Năm ra mắt phải là số nguyên')
    .min(1900, 'Năm ra mắt không được nhỏ hơn 1900')
    .max(new Date().getFullYear() + 1, 'Năm ra mắt không được lớn hơn năm hiện tại'),
  
  seasons: z
    .array(z.enum(['Xuân', 'Hè', 'Thu', 'Đông']))
    .min(0, 'Danh sách mùa không hợp lệ')
    .max(4, 'Không thể chọn quá 4 mùa'),
  
  topNotes: z
    .string()
    .max(200, 'Top Notes không được vượt quá 200 ký tự')
    .optional()
    .or(z.literal('')),
  
  middleNotes: z
    .string()
    .max(200, 'Middle Notes không được vượt quá 200 ký tự')
    .optional()
    .or(z.literal('')),
  
  baseNotes: z
    .string()
    .max(200, 'Base Notes không được vượt quá 200 ký tự')
    .optional()
    .or(z.literal('')),
  
  variants: z.array(z.object({
    variantName: z
      .string()
      .min(1, 'Tên biến thể là bắt buộc')
      .min(2, 'Tên biến thể phải có ít nhất 2 ký tự')
      .max(50, 'Tên biến thể không được vượt quá 50 ký tự'),
    
    size: z
      .string()
      .min(1, 'Kích thước là bắt buộc')
      .max(20, 'Kích thước không được vượt quá 20 ký tự'),
    
    originalPrice: z
      .number()
      .positive('Giá gốc phải là số dương')
      .min(1000, 'Giá gốc tối thiểu là 1,000 VNĐ')
      .max(10000000, 'Giá gốc tối đa là 10,000,000 VNĐ'),
    
    salePercentage: z
      .number()
      .min(0, 'Mức sale không được âm')
      .max(100, 'Mức sale không được vượt quá 100%'),
    
    stock: z
      .number()
      .int('Số lượng kho phải là số nguyên')
      .min(0, 'Số lượng kho không được âm')
      .max(10000, 'Số lượng kho tối đa là 10,000'),
    
    imageUrl: z
      .string()
      .url('URL ảnh không hợp lệ')
      .optional()
      .or(z.literal(''))
  }))
  .min(1, 'Sản phẩm phải có ít nhất 1 biến thể')
  .max(10, 'Sản phẩm không được có quá 10 biến thể')
});

export type ProductFormValidation = z.infer<typeof productValidationSchema>;
