"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductForm from '@/components/admin/product-form';
import { ProductFormData, Product } from '@/types';
import { ProductAdminService } from '@/services/admin/product-admin-service';
import { showSuccess, showError, showInfo } from '@/lib/notifications';

export default function EditProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<ProductFormData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!productId) {
      showError('ID sản phẩm không hợp lệ');
      router.push('/admin/products');
      return;
    }

    const loadProductData = async () => {
      try {
        setIsLoadingData(true);
        const product = await ProductAdminService.getProductForAdmin(productId);
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
  }, [productId, router]);

  const handleSubmit = async (data: ProductFormData) => {
    if (!productId) return;
    
    setLoading(true);
    try {
      // Validate data before submission
      const validationErrors = ProductAdminService.validateProductData(data);
      if (validationErrors.length > 0) {
        showError(`Dữ liệu không hợp lệ: ${validationErrors.join(', ')}`, { duration: 7000 });
        return;
      }

      const updatedProduct = await ProductAdminService.updateProduct(productId, data);
      showSuccess(`Sản phẩm "${updatedProduct.name}" đã được cập nhật thành công!`);
      
      // Stay on the same page or optionally redirect
      // router.push('/admin/products');
    } catch (error: any) {
      showError(error.message || 'Không thể cập nhật sản phẩm');
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
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Đang tải thông tin sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Không thể tải thông tin sản phẩm.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chỉnh sửa sản phẩm
          </h1>
          <p className="text-gray-600">
            Cập nhật thông tin và biến thể của sản phẩm
          </p>
        </div>

        <ProductForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
}
