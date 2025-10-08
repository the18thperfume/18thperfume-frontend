"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/admin/product-form';
import { ProductFormData, Product } from '@/types';
import { ProductAdminService } from '@/services/admin/product-admin-service';
import { showSuccess, showError, showInfo } from '@/lib/notifications';

export default function EditProductClient({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<ProductFormData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setIsLoadingData(true);
        const product = await ProductAdminService.getProductForAdmin(params.id);
        const formData = ProductAdminService.transformApiDataToFormData(product);
        setInitialData(formData);
      } catch (error: any) {
        showError(error.message || 'Không thể tải thông tin sản phẩm');
        console.error('Load product error:', error);
        // Redirect back to products list on error
        router.push('/admin/products');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadProductData();
  }, [params.id, router]);

  const handleSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      // Validate data before submission
      const validationErrors = ProductAdminService.validateProductData(data);
      if (validationErrors.length > 0) {
        showError(`Dữ liệu không hợp lệ: ${validationErrors.join(', ')}`, { duration: 7000 });
        return;
      }

      const updatedProduct = await ProductAdminService.updateProduct(params.id, data);
      showSuccess(`Sản phẩm "${updatedProduct.name}" đã được cập nhật thành công!`);
      
      // Stay on the same page or optionally redirect
      // router.push('/admin/products');
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra khi cập nhật sản phẩm');
      console.error('Update product error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa Sản phẩm</h1>
          <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lỗi</h1>
          <p className="text-gray-600">Không thể tải thông tin sản phẩm</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa Sản phẩm</h1>
        <p className="text-gray-600">Cập nhật thông tin sản phẩm ID: {params.id}</p>
      </div>

      <ProductForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}
