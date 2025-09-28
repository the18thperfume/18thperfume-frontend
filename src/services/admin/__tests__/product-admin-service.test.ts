import { ProductAdminService } from '../product-admin-service';
import { ProductFormData, Product } from '@/types';
import apiClient from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock console.error to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('ProductAdminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  const mockProductFormData: ProductFormData = {
    name: 'Test Fragrance',
    description: 'A test fragrance',
    brand: 'Test Brand',
    category: 'Unisex',
    segment: 'Designer',
    origin: 'France',
    fragranceFamily: 'Fresh',
    concentration: 'EDP',
    releaseYear: 2023,
    seasons: ['Xuân', 'Hè'],
    topNotes: 'Bergamot, Lemon',
    middleNotes: 'Rose, Jasmine',
    baseNotes: 'Sandalwood, Musk',
    variants: [
      {
        variantName: 'Chiết 10ml',
        size: '10ml',
        originalPrice: 200000,
        salePercentage: 10,
        stock: 50,
        imageUrl: 'https://example.com/image.jpg'
      }
    ]
  };

  const mockProduct: Product = {
    productId: 'test-id',
    name: 'Test Fragrance',
    description: 'A test fragrance',
    brand: 'Test Brand',
    category: 'Unisex',
    segment: 'Designer',
    origin: 'France',
    fragranceFamily: 'Fresh',
    concentration: 'EDP',
    releaseYear: 2023,
    seasons: ['Xuân', 'Hè'],
    topNotes: ['Bergamot', 'Lemon'],
    middleNotes: ['Rose', 'Jasmine'],
    baseNotes: ['Sandalwood', 'Musk'],
    ingredients: ['Bergamot', 'Lemon', 'Rose', 'Jasmine', 'Sandalwood', 'Musk'],
    variants: [
      {
        variantId: 'variant-1',
        productId: 'test-id',
        variantName: 'Chiết 10ml',
        size: '10ml',
        originalPrice: 200000,
        salePercentage: 10,
        finalPrice: 180000,
        capacity: 'Chiết',
        stock: 50,
        imageUrl: 'https://example.com/image.jpg'
      }
    ],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          statusCode: 201,
          data: mockProduct,
          message: 'Success'
        }
      });

      const result = await ProductAdminService.createProduct(mockProductFormData);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/admin/products',
        expect.objectContaining({
          name: 'Test Fragrance',
          topNotes: ['Bergamot', 'Lemon'],
          middleNotes: ['Rose', 'Jasmine'],
          baseNotes: ['Sandalwood', 'Musk']
        })
      );
      expect(result).toEqual(mockProduct);
    });

    it('should handle API error response', async () => {
      mockedApiClient.post.mockResolvedValue({
        data: {
          statusCode: 400,
          message: 'Validation failed'
        }
      });

      await expect(ProductAdminService.createProduct(mockProductFormData))
        .rejects.toThrow('Validation failed');
    });

    it('should handle network error', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Network error'));

      await expect(ProductAdminService.createProduct(mockProductFormData))
        .rejects.toThrow('Network error');
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      mockedApiClient.put.mockResolvedValue({
        data: {
          statusCode: 200,
          data: mockProduct,
          message: 'Success'
        }
      });

      const result = await ProductAdminService.updateProduct('test-id', mockProductFormData);

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        '/admin/products/test-id',
        expect.objectContaining({
          name: 'Test Fragrance'
        })
      );
      expect(result).toEqual(mockProduct);
    });

    it('should handle update error', async () => {
      mockedApiClient.put.mockResolvedValue({
        data: {
          statusCode: 404,
          message: 'Product not found'
        }
      });

      await expect(ProductAdminService.updateProduct('test-id', mockProductFormData))
        .rejects.toThrow('Product not found');
    });
  });

  describe('getProductForAdmin', () => {
    it('should fetch product successfully', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          statusCode: 200,
          data: mockProduct,
          message: 'Success'
        }
      });

      const result = await ProductAdminService.getProductForAdmin('test-id');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/admin/products/test-id');
      expect(result).toEqual(mockProduct);
    });

    it('should handle product not found', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: {
          statusCode: 404,
          message: 'Product not found'
        }
      });

      await expect(ProductAdminService.getProductForAdmin('test-id'))
        .rejects.toThrow('Product not found');
    });
  });

  describe('getAllProductsForAdmin', () => {
    it('should fetch products list successfully', async () => {
      const mockProductsList = {
        products: [mockProduct],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1
      };

      mockedApiClient.get.mockResolvedValue({
        data: {
          statusCode: 200,
          data: mockProductsList,
          message: 'Success'
        }
      });

      const result = await ProductAdminService.getAllProductsForAdmin({ page: 1, limit: 20 });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/admin/products', {
        params: { page: 1, limit: 20 }
      });
      expect(result).toEqual(mockProductsList);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      mockedApiClient.delete.mockResolvedValue({
        data: {
          statusCode: 200,
          message: 'Success'
        }
      });

      await ProductAdminService.deleteProduct('test-id');

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/admin/products/test-id');
    });

    it('should handle delete error', async () => {
      mockedApiClient.delete.mockResolvedValue({
        data: {
          statusCode: 404,
          message: 'Product not found'
        }
      });

      await expect(ProductAdminService.deleteProduct('test-id'))
        .rejects.toThrow('Product not found');
    });
  });

  describe('transformFormDataToApiData', () => {
    it('should transform form data correctly', () => {
      // Access private method through any cast for testing
      const transformedData = (ProductAdminService as any).transformFormDataToApiData(mockProductFormData);

      expect(transformedData).toEqual({
        name: 'Test Fragrance',
        description: 'A test fragrance',
        brand: 'Test Brand',
        category: 'Unisex',
        segment: 'Designer',
        origin: 'France',
        fragranceFamily: 'Fresh',
        concentration: 'EDP',
        releaseYear: 2023,
        seasons: ['Xuân', 'Hè'],
        topNotes: ['Bergamot', 'Lemon'],
        middleNotes: ['Rose', 'Jasmine'],
        baseNotes: ['Sandalwood', 'Musk'],
        variants: [{
          variantName: 'Chiết 10ml',
          size: '10ml',
          originalPrice: 200000,
          salePercentage: 10,
          stock: 50,
          imageUrl: 'https://example.com/image.jpg'
        }]
      });
    });

    it('should handle empty notes strings', () => {
      const formDataWithEmptyNotes = {
        ...mockProductFormData,
        topNotes: '',
        middleNotes: '  ',
        baseNotes: 'Sandalwood, Musk'
      };

      const transformedData = (ProductAdminService as any).transformFormDataToApiData(formDataWithEmptyNotes);

      expect(transformedData.topNotes).toEqual([]);
      expect(transformedData.middleNotes).toEqual([]);
      expect(transformedData.baseNotes).toEqual(['Sandalwood', 'Musk']);
    });
  });

  describe('transformApiDataToFormData', () => {
    it('should transform API data to form data correctly', () => {
      const formData = ProductAdminService.transformApiDataToFormData(mockProduct);

      expect(formData).toEqual({
        name: 'Test Fragrance',
        description: 'A test fragrance',
        brand: 'Test Brand',
        category: 'Unisex',
        segment: 'Designer',
        origin: 'France',
        fragranceFamily: 'Fresh',
        concentration: 'EDP',
        releaseYear: 2023,
        seasons: ['Xuân', 'Hè'],
        topNotes: 'Bergamot, Lemon',
        middleNotes: 'Rose, Jasmine',
        baseNotes: 'Sandalwood, Musk',
        variants: [{
          variantName: 'Chiết 10ml',
          size: '10ml',
          originalPrice: 200000,
          salePercentage: 10,
          stock: 50,
          imageUrl: 'https://example.com/image.jpg'
        }]
      });
    });
  });

  describe('validateProductData', () => {
    it('should return no errors for valid data', () => {
      const errors = ProductAdminService.validateProductData(mockProductFormData);
      expect(errors).toEqual([]);
    });

    it('should validate required fields', () => {
      const invalidData: ProductFormData = {
        ...mockProductFormData,
        name: '',
        brand: '',
        category: '',
        variants: []
      };

      const errors = ProductAdminService.validateProductData(invalidData);

      expect(errors).toContain('Tên sản phẩm là bắt buộc');
      expect(errors).toContain('Thương hiệu là bắt buộc');
      expect(errors).toContain('Giới tính là bắt buộc');
      expect(errors).toContain('Sản phẩm phải có ít nhất một biến thể');
    });

    it('should validate variant data', () => {
      const invalidData: ProductFormData = {
        ...mockProductFormData,
        variants: [{
          variantName: '',
          size: '',
          originalPrice: -100,
          salePercentage: 150,
          stock: -5,
          imageUrl: ''
        }]
      };

      const errors = ProductAdminService.validateProductData(invalidData);

      expect(errors).toContain('Biến thể 1: Tên biến thể là bắt buộc');
      expect(errors).toContain('Biến thể 1: Kích thước là bắt buộc');
      expect(errors).toContain('Biến thể 1: Giá gốc phải lớn hơn 0');
      expect(errors).toContain('Biến thể 1: Mức sale phải từ 0-100%');
      expect(errors).toContain('Biến thể 1: Số lượng kho không thể âm');
    });
  });
});
