import apiClient from '@/lib/api-client';
import { Product, ProductFormData, APIResponse } from '@/types';

export class ProductAdminService {
  private static readonly BASE_PATH = '/admin/products';

  /**
   * Tạo sản phẩm mới
   */
  static async createProduct(productData: ProductFormData): Promise<Product> {
    try {
      const response = await apiClient.post<APIResponse<Product>>(
        ProductAdminService.BASE_PATH,
        ProductAdminService.transformFormDataToApiData(productData)
      );

      if (response.data.statusCode !== 201) {
        throw new Error(response.data.message || 'Lỗi tạo sản phẩm');
      }

      return response.data.data!;
    } catch (error: any) {
      console.error('Error creating product:', error);
      throw new Error(
        error?.response?.data?.message || 
        error?.message || 
        'Không thể tạo sản phẩm. Vui lòng thử lại.'
      );
    }
  }

  /**
   * Cập nhật sản phẩm
   */
  static async updateProduct(productId: string, productData: ProductFormData): Promise<Product> {
    try {
      const response = await apiClient.put<APIResponse<Product>>(
        `${ProductAdminService.BASE_PATH}/${productId}`,
        ProductAdminService.transformFormDataToApiData(productData)
      );

      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message || 'Lỗi cập nhật sản phẩm');
      }

      return response.data.data!;
    } catch (error: any) {
      console.error('Error updating product:', error);
      throw new Error(
        error?.response?.data?.message || 
        error?.message || 
        'Không thể cập nhật sản phẩm. Vui lòng thử lại.'
      );
    }
  }

  /**
   * Lấy thông tin sản phẩm cho chỉnh sửa
   */
  static async getProductForAdmin(productId: string): Promise<Product> {
    try {
      const response = await apiClient.get<APIResponse<Product>>(
        `${ProductAdminService.BASE_PATH}/${productId}`
      );

      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message || 'Lỗi lấy thông tin sản phẩm');
      }

      return response.data.data!;
    } catch (error: any) {
      console.error('Error fetching product:', error);
      throw new Error(
        error?.response?.data?.message || 
        error?.message || 
        'Không thể lấy thông tin sản phẩm. Vui lòng thử lại.'
      );
    }
  }

  /**
   * Lấy danh sách tất cả sản phẩm cho admin
   */
  static async getAllProductsForAdmin(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    segment?: string;
  }): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const response = await apiClient.get<APIResponse<any>>(
        ProductAdminService.BASE_PATH,
        { params }
      );

      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message || 'Lỗi lấy danh sách sản phẩm');
      }

      return response.data.data!;
    } catch (error: any) {
      console.error('Error fetching products:', error);
      throw new Error(
        error?.response?.data?.message || 
        error?.message || 
        'Không thể lấy danh sách sản phẩm. Vui lòng thử lại.'
      );
    }
  }

  /**
   * Xóa sản phẩm
   */
  static async deleteProduct(productId: string): Promise<void> {
    try {
      const response = await apiClient.delete<APIResponse<void>>(
        `${ProductAdminService.BASE_PATH}/${productId}`
      );

      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message || 'Lỗi xóa sản phẩm');
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      throw new Error(
        error?.response?.data?.message || 
        error?.message || 
        'Không thể xóa sản phẩm. Vui lòng thử lại.'
      );
    }
  }

  /**
   * Transform form data to API data format
   */
  private static transformFormDataToApiData(formData: ProductFormData): any {
    // Convert form data to match backend API expectations
    return {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      brand: formData.brand.trim(),
      category: formData.category,
      segment: formData.segment,
      origin: formData.origin.trim(),
      fragranceFamily: formData.fragranceFamily.trim(),
      concentration: formData.concentration.trim(),
      releaseYear: formData.releaseYear,
      seasons: formData.seasons,
      // Parse notes from comma-separated strings to arrays
      topNotes: ProductAdminService.parseNotesToArray(formData.topNotes),
      middleNotes: ProductAdminService.parseNotesToArray(formData.middleNotes),
      baseNotes: ProductAdminService.parseNotesToArray(formData.baseNotes),
      variants: formData.variants.map(variant => ({
        variantName: variant.variantName.trim(),
        size: variant.size.trim(),
        originalPrice: variant.originalPrice,
        salePercentage: variant.salePercentage,
        stock: variant.stock,
        imageUrl: variant.imageUrl?.trim() || ''
      }))
    };
  }

  /**
   * Transform API data to form data format
   */
  static transformApiDataToFormData(apiData: Product): ProductFormData {
    return {
      name: apiData.name,
      description: apiData.description,
      brand: apiData.brand,
      category: apiData.category,
      segment: apiData.segment,
      origin: apiData.origin,
      fragranceFamily: apiData.fragranceFamily,
      concentration: apiData.concentration,
      releaseYear: apiData.releaseYear,
      seasons: apiData.seasons,
      // Convert notes arrays back to comma-separated strings
      topNotes: apiData.topNotes.join(', '),
      middleNotes: apiData.middleNotes.join(', '),
      baseNotes: apiData.baseNotes.join(', '),
      variants: apiData.variants.map(variant => ({
        variantName: variant.variantName,
        size: variant.size,
        originalPrice: variant.originalPrice,
        salePercentage: variant.salePercentage,
        stock: variant.stock,
        imageUrl: variant.imageUrl
      }))
    };
  }

  /**
   * Parse comma-separated notes string to array
   */
  private static parseNotesToArray(notesString: string): string[] {
    if (!notesString || notesString.trim() === '') return [];
    
    return notesString
      .split(',')
      .map(note => note.trim())
      .filter(note => note.length > 0);
  }

  /**
   * Validate product data before submission
   */
  static validateProductData(data: ProductFormData): string[] {
    const errors: string[] = [];

    if (!data.name?.trim()) errors.push('Tên sản phẩm là bắt buộc');
    if (!data.brand?.trim()) errors.push('Thương hiệu là bắt buộc');
    if (!data.category) errors.push('Giới tính là bắt buộc');
    if (!data.segment) errors.push('Phân khúc là bắt buộc');
    if (!data.origin?.trim()) errors.push('Xuất xứ là bắt buộc');
    if (!data.fragranceFamily?.trim()) errors.push('Nhóm hương là bắt buộc');
    if (!data.concentration?.trim()) errors.push('Nồng độ là bắt buộc');
    
    if (!data.variants || data.variants.length === 0) {
      errors.push('Sản phẩm phải có ít nhất một biến thể');
    } else {
      data.variants.forEach((variant, index) => {
        if (!variant.variantName?.trim()) {
          errors.push(`Biến thể ${index + 1}: Tên biến thể là bắt buộc`);
        }
        if (!variant.size?.trim()) {
          errors.push(`Biến thể ${index + 1}: Kích thước là bắt buộc`);
        }
        if (variant.originalPrice <= 0) {
          errors.push(`Biến thể ${index + 1}: Giá gốc phải lớn hơn 0`);
        }
        if (variant.stock < 0) {
          errors.push(`Biến thể ${index + 1}: Số lượng kho không thể âm`);
        }
        if (variant.salePercentage < 0 || variant.salePercentage > 100) {
          errors.push(`Biến thể ${index + 1}: Mức sale phải từ 0-100%`);
        }
      });
    }

    return errors;
  }
}
