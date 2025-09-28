"use client";

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductFormData } from '@/types';
import { productValidationSchema, ProductFormValidation } from '@/lib/validations/product-validation';
import { Save } from 'lucide-react';
import VariantManager from './variant-manager';

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: 'Nam', label: 'Nam' },
  { value: 'Nữ', label: 'Nữ' },
  { value: 'Unisex', label: 'Unisex' }
] as const;

const SEGMENT_OPTIONS = [
  { value: 'Designer', label: 'Designer' },
  { value: 'Niche', label: 'Niche' }
] as const;

const SEASON_OPTIONS = [
  { value: 'Xuân', label: 'Xuân' },
  { value: 'Hè', label: 'Hè' },
  { value: 'Thu', label: 'Thu' },
  { value: 'Đông', label: 'Đông' }
] as const;

export default function ProductForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  loading = false 
}: ProductFormProps) {
  const form = useForm<ProductFormValidation>({
    resolver: zodResolver(productValidationSchema),
    defaultValues: {
      name: initialData.name || '',
      description: initialData.description || '',
      brand: initialData.brand || '',
      category: (initialData.category as any) || undefined,
      segment: (initialData.segment as any) || undefined,
      origin: initialData.origin || '',
      fragranceFamily: initialData.fragranceFamily || '',
      concentration: initialData.concentration || '',
      releaseYear: initialData.releaseYear || new Date().getFullYear(),
      seasons: (initialData.seasons as any) || [],
      topNotes: initialData.topNotes || '',
      middleNotes: initialData.middleNotes || '',
      baseNotes: initialData.baseNotes || '',
      variants: initialData.variants || [{
        variantName: '',
        size: '',
        originalPrice: 0,
        salePercentage: 0,
        stock: 0,
        imageUrl: ''
      }]
    }
  });

  const { register, handleSubmit, watch, setValue, formState: { errors }, control } = form;
  
  const watchedSeasons = watch('seasons') || [];
  const watchedVariants = watch('variants') || [];

  const handleSeasonChange = (season: string, checked: boolean) => {
    const currentSeasons = watchedSeasons;
    const newSeasons = checked 
      ? [...currentSeasons.filter((s) => s !== season), season]
      : currentSeasons.filter((s) => s !== season);
    setValue('seasons', newSeasons as any);
  };

  const onFormSubmit = async (data: ProductFormValidation) => {
    await onSubmit(data as ProductFormData);
  };

  const handleVariantsChange = (newVariants: any[]) => {
    setValue('variants', newVariants);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên sản phẩm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm *
              </label>
              <input
                type="text"
                {...register('name')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ví dụ: Chanel No.5"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            {/* Thương hiệu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thương hiệu *
              </label>
              <input
                type="text"
                {...register('brand')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.brand ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ví dụ: Chanel"
              />
              {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>}
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính *
              </label>
              <select
                {...register('category')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn giới tính</option>
                {CATEGORY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            </div>

            {/* Phân khúc */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phân khúc *
              </label>
              <select
                {...register('segment')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.segment ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn phân khúc</option>
                {SEGMENT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.segment && <p className="text-red-500 text-sm mt-1">{errors.segment.message}</p>}
            </div>

            {/* Xuất xứ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xuất xứ *
              </label>
              <input
                type="text"
                {...register('origin')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.origin ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ví dụ: Pháp"
              />
              {errors.origin && <p className="text-red-500 text-sm mt-1">{errors.origin.message}</p>}
            </div>

            {/* Nhóm hương */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhóm hương *
              </label>
              <input
                type="text"
                {...register('fragranceFamily')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fragranceFamily ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ví dụ: Floral"
              />
              {errors.fragranceFamily && <p className="text-red-500 text-sm mt-1">{errors.fragranceFamily.message}</p>}
            </div>

            {/* Nồng độ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nồng độ *
              </label>
              <input
                type="text"
                {...register('concentration')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.concentration ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ví dụ: EDP"
              />
              {errors.concentration && <p className="text-red-500 text-sm mt-1">{errors.concentration.message}</p>}
            </div>

            {/* Năm ra mắt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Năm ra mắt *
              </label>
              <input
                type="number"
                {...register('releaseYear', { valueAsNumber: true })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.releaseYear ? 'border-red-500' : 'border-gray-300'
                }`}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
              {errors.releaseYear && <p className="text-red-500 text-sm mt-1">{errors.releaseYear.message}</p>}
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Mô tả chi tiết về sản phẩm..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          {/* Mùa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mùa phù hợp
            </label>
            <div className="flex flex-wrap gap-4">
              {SEASON_OPTIONS.map(season => (
                <label key={season.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={watchedSeasons.includes(season.value)}
                    onChange={(e) => handleSeasonChange(season.value, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{season.label}</span>
                </label>
              ))}
            </div>
            {errors.seasons && <p className="text-red-500 text-sm mt-1">{errors.seasons.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Notes Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thành phần hương</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Top Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Top Notes
              </label>
              <input
                type="text"
                {...register('topNotes')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.topNotes ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Các hương đầu, cách nhau bằng dấu phẩy"
              />
              {errors.topNotes && <p className="text-red-500 text-sm mt-1">{errors.topNotes.message}</p>}
            </div>

            {/* Middle Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle Notes
              </label>
              <input
                type="text"
                {...register('middleNotes')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.middleNotes ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Các hương giữa, cách nhau bằng dấu phẩy"
              />
              {errors.middleNotes && <p className="text-red-500 text-sm mt-1">{errors.middleNotes.message}</p>}
            </div>

            {/* Base Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Notes
              </label>
              <input
                type="text"
                {...register('baseNotes')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.baseNotes ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Các hương cuối, cách nhau bằng dấu phẩy"
              />
              {errors.baseNotes && <p className="text-red-500 text-sm mt-1">{errors.baseNotes.message}</p>}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Lưu ý:</strong> Hệ thống sẽ tự động tạo danh sách "Thành phần" 
              bằng cách tổng hợp tất cả các giá trị từ Top, Middle và Base Notes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Variant Management */}
      <VariantManager
        variants={watchedVariants}
        onVariantsChange={handleVariantsChange}
        errors={{ variants: errors.variants }}
      />

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
        </Button>
      </div>
    </form>
  );
}
