"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/admin/product-form';
import { ProductFormData } from '@/types';
import { ProductAdminService } from '@/services/admin/product-admin-service';
import { showSuccess, showError } from '@/lib/notifications';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      // Validate data before submission
      const validationErrors = ProductAdminService.validateProductData(data);
      if (validationErrors.length > 0) {
        showError(`Dữ liệu không hợp lệ: ${validationErrors.join(', ')}`, { duration: 7000 });
        return;
      }

      const newProduct = await ProductAdminService.createProduct(data);
      showSuccess(`Sản phẩm "${newProduct.name}" đã được tạo thành công!`);
      
      // Redirect to products list or edit page
      router.push(`/admin/products/edit?id=${newProduct.productId}`);
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra khi tạo sản phẩm');
      console.error('Create product error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Thêm Sản phẩm Mới</h1>
        <p className="text-gray-600">Tạo một sản phẩm mới với đầy đủ thông tin và biến thể</p>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}
