"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VariantFormData } from '@/types';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import VariantForm from './variant-form';

interface VariantManagerProps {
  variants: VariantFormData[];
  onVariantsChange: (variants: VariantFormData[]) => void;
  errors?: { [key: string]: any };
}

export default function VariantManager({ 
  variants, 
  onVariantsChange, 
  errors = {} 
}: VariantManagerProps) {
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [showForm, setShowForm] = React.useState(false);

  const addVariant = () => {
    setEditingIndex(null);
    setShowForm(true);
  };

  const editVariant = (index: number) => {
    setEditingIndex(index);
    setShowForm(true);
  };

  const deleteVariant = (index: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa biến thể này?')) {
      const newVariants = variants.filter((_, i) => i !== index);
      onVariantsChange(newVariants);
    }
  };

  const saveVariant = (variantData: VariantFormData) => {
    if (editingIndex !== null) {
      // Edit existing variant
      const newVariants = [...variants];
      newVariants[editingIndex] = variantData;
      onVariantsChange(newVariants);
    } else {
      // Add new variant
      onVariantsChange([...variants, variantData]);
    }
    setShowForm(false);
    setEditingIndex(null);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingIndex(null);
  };

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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Quản lý Biến thể</CardTitle>
            <p className="text-sm text-gray-600">
              Thêm, sửa, xóa các biến thể của sản phẩm
            </p>
          </div>
          <Button onClick={addVariant} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm biến thể
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Variants List */}
        {variants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Chưa có biến thể nào được tạo.</p>
            <Button onClick={addVariant} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Thêm biến thể đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tên biến thể</label>
                      <p className="font-medium">{variant.variantName || 'Chưa đặt tên'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Kích thước</label>
                      <p>{variant.size || 'Chưa xác định'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Dung tích</label>
                      <p className="text-blue-600 font-medium">
                        {extractCapacity(variant.variantName)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Giá</label>
                      <div>
                        <p className="font-medium">
                          {calculateFinalPrice(variant.originalPrice, variant.salePercentage).toLocaleString('vi-VN')} VNĐ
                        </p>
                        {variant.salePercentage > 0 && (
                          <p className="text-sm text-gray-500">
                            <span className="line-through">{variant.originalPrice.toLocaleString('vi-VN')} VNĐ</span>
                            <span className="text-red-500 ml-2">(-{variant.salePercentage}%)</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Kho</label>
                      <p className={variant.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                        {variant.stock} sản phẩm
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      onClick={() => editVariant(index)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => deleteVariant(index)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Validation errors for this variant */}
                {errors.variants && errors.variants[index] && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                    <strong>Lỗi:</strong>
                    <ul className="list-disc list-inside">
                      {Object.entries(errors.variants[index]).map(([field, error]: [string, any]) => (
                        <li key={field}>{error?.message || error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Global variant errors */}
        {errors.variants && typeof errors.variants === 'object' && !Array.isArray(errors.variants) && (
          <div className="mt-4 p-3 bg-red-50 rounded">
            <p className="text-red-600 text-sm">{errors.variants.message}</p>
          </div>
        )}

        {/* Variant Form Modal/Inline */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingIndex !== null ? 'Chỉnh sửa biến thể' : 'Thêm biến thể mới'}
                </h3>
                <VariantForm
                  initialData={editingIndex !== null ? variants[editingIndex] : undefined}
                  onSubmit={saveVariant}
                  onCancel={cancelForm}
                />
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {variants.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Tóm tắt biến thể</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Tổng số biến thể:</span>
                <span className="font-medium ml-2">{variants.length}</span>
              </div>
              <div>
                <span className="text-blue-700">Tổng kho:</span>
                <span className="font-medium ml-2">
                  {variants.reduce((sum, v) => sum + v.stock, 0)} sản phẩm
                </span>
              </div>
              <div>
                <span className="text-blue-700">Giá từ:</span>
                <span className="font-medium ml-2">
                  {Math.min(...variants.map(v => calculateFinalPrice(v.originalPrice, v.salePercentage))).toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
