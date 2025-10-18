"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { VariantFormData } from '@/types';
import { Save, X } from 'lucide-react';

// Variant validation schema - giữ nguyên types để tránh conflict
const variantValidationSchema = z.object({
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
    .optional()
    .refine((val) => !val || val === '' || /^https?:\/\/.+/.test(val), 'URL ảnh không hợp lệ')
});

type VariantFormValidation = z.infer<typeof variantValidationSchema>;

interface VariantFormProps {
  initialData?: VariantFormData;
  onSubmit: (data: VariantFormData) => void;
  onCancel: () => void;
}

export default function VariantForm({ 
  initialData, 
  onSubmit, 
  onCancel 
}: VariantFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<VariantFormValidation>({
    resolver: zodResolver(variantValidationSchema),
    defaultValues: {
      variantName: initialData?.variantName || '',
      size: initialData?.size || '',
      originalPrice: initialData?.originalPrice || 0,
      salePercentage: initialData?.salePercentage || 0,
      stock: initialData?.stock || 0,
      imageUrl: initialData?.imageUrl || ''
    }
  });

  const watchedOriginalPrice = watch('originalPrice', 0);
  const watchedSalePercentage = watch('salePercentage', 0);
  const watchedVariantName = watch('variantName', '');

  // Extract capacity from variant name
  const extractCapacity = (variantName: string): string => {
    const lowerName = variantName.toLowerCase();
    if (lowerName.includes('chiết')) return 'Chiết';
    if (lowerName.includes('fullseal')) return 'Fullseal';
    if (lowerName.includes('travel')) return 'Travel';
    if (lowerName.includes('mini')) return 'Mini';
    return 'Khác';
  };

  // Calculate final price
  const calculateFinalPrice = (originalPrice: number, salePercentage: number): number => {
    return Math.round(originalPrice * (1 - salePercentage / 100));
  };

  // Extract capacity number from size string
  const extractCapacityNumber = (size: string): number => {
    const match = size.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const onFormSubmit = (data: VariantFormValidation) => {
    // Only submit the core fields expected by the interface
    const submissionData: VariantFormData = {
      variantName: data.variantName,
      size: data.size,
      originalPrice: data.originalPrice,
      salePercentage: data.salePercentage,
      stock: data.stock,
      imageUrl: data.imageUrl
    };
    
    // This only saves to local state, NOT to backend
    console.log('📝 Lưu biến thể vào local state (không submit lên server)');
    onSubmit(submissionData);
  };

  // Prevent Enter key from submitting parent form
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="space-y-6" onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tên biến thể */}
        <div>
          <label htmlFor="variantName" className="block text-sm font-medium text-gray-700 mb-1">
            Tên biến thể *
          </label>
          <input
            type="text"
            id="variantName"
            {...register('variantName')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.variantName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ví dụ: Chiết 10ml, Fullseal 50ml"
          />
          {errors.variantName && (
            <p className="text-red-500 text-sm mt-1">{errors.variantName.message}</p>
          )}
          
          {/* Auto-extracted capacity */}
          {watchedVariantName && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
              <span className="text-blue-700">Dung tích tự động:</span>
              <span className="font-medium ml-2 text-blue-800">
                {extractCapacity(watchedVariantName)}
              </span>
            </div>
          )}
        </div>

        {/* Kích thước */}
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
            Kích thước *
          </label>
          <input
            type="text"
            id="size"
            {...register('size')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.size ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ví dụ: 10ml, 50ml, 100ml"
          />
          {errors.size && (
            <p className="text-red-500 text-sm mt-1">{errors.size.message}</p>
          )}
        </div>

        {/* Giá gốc */}
        <div>
          <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Giá gốc (VNĐ) *
          </label>
          <input
            type="number"
            id="originalPrice"
            {...register('originalPrice', { valueAsNumber: true })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.originalPrice ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
            min="1000"
            max="10000000"
            step="1000"
          />
          {errors.originalPrice && (
            <p className="text-red-500 text-sm mt-1">{errors.originalPrice.message}</p>
          )}
        </div>

        {/* Mức sale */}
        <div>
          <label htmlFor="salePercentage" className="block text-sm font-medium text-gray-700 mb-1">
            Mức sale (%)
          </label>
          <input
            type="number"
            id="salePercentage"
            {...register('salePercentage', { valueAsNumber: true })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.salePercentage ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
            min="0"
            max="100"
            step="5"
          />
          {errors.salePercentage && (
            <p className="text-red-500 text-sm mt-1">{errors.salePercentage.message}</p>
          )}
        </div>

        {/* Số lượng kho */}
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
            Số lượng kho *
          </label>
          <input
            type="number"
            id="stock"
            {...register('stock', { valueAsNumber: true })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.stock ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
            min="0"
            max="10000"
          />
          {errors.stock && (
            <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
          )}
        </div>

        {/* URL ảnh */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            URL ảnh
          </label>
          <input
            type="url"
            id="imageUrl"
            {...register('imageUrl')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.imageUrl ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://example.com/image.jpg"
          />
          {errors.imageUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>
          )}
        </div>
      </div>

      {/* Price Preview */}
      {watchedOriginalPrice > 0 && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Xem trước giá</h4>
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-green-700">Giá gốc:</span>
              <span className="font-medium ml-2">
                {watchedOriginalPrice.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
            {watchedSalePercentage > 0 && (
              <>
                <div>
                  <span className="text-green-700">Giảm:</span>
                  <span className="font-medium ml-2">{watchedSalePercentage}%</span>
                </div>
                <div>
                  <span className="text-green-700">Giá cuối:</span>
                  <span className="font-bold ml-2 text-green-800">
                    {calculateFinalPrice(watchedOriginalPrice, watchedSalePercentage).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Hủy
        </Button>
        <Button 
          type="button" 
          disabled={isSubmitting}
          onClick={handleSubmit(onFormSubmit)}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Đang lưu...' : 'Lưu biến thể (tạm thời)'}
        </Button>
      </div>
    </div>
  );
}
