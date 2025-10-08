import { render, screen, waitFor } from '@testing-library/react';
import { useSearchParams, useRouter } from 'next/navigation';
import EditProductPage from '../edit/page';

// Mock the hooks and services
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/services/admin/product-admin-service', () => ({
  ProductAdminService: {
    getProductForAdmin: jest.fn(),
    updateProduct: jest.fn(),
    validateProductData: jest.fn(() => []),
    transformApiDataToFormData: jest.fn(),
  },
}));

jest.mock('@/components/admin/product-form', () => {
  return function MockProductForm({ onSubmit, onCancel }: any) {
    return (
      <div data-testid="product-form">
        <button onClick={() => onSubmit({})} data-testid="submit-btn">
          Submit
        </button>
        <button onClick={onCancel} data-testid="cancel-btn">
          Cancel
        </button>
      </div>
    );
  };
});

jest.mock('@/lib/notifications', () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
  showInfo: jest.fn(),
}));

const mockSearchParams = useSearchParams as jest.Mock;
const mockRouter = useRouter as jest.Mock;
const mockPush = jest.fn();

describe('EditProductPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.mockReturnValue({ push: mockPush });
  });

  it('redirects to products list when no product ID is provided', async () => {
    // Mock empty search params (no id parameter)
    mockSearchParams.mockReturnValue({
      get: jest.fn(() => null),
    });

    render(<EditProductPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/products');
    });
  });

  it('loads product data when valid ID is provided', async () => {
    const mockProductId = 'test-product-123';
    
    // Mock search params with valid ID
    mockSearchParams.mockReturnValue({
      get: jest.fn((param) => param === 'id' ? mockProductId : null),
    });

    // Mock service calls
    const { ProductAdminService } = require('@/services/admin/product-admin-service');
    ProductAdminService.getProductForAdmin.mockResolvedValue({
      productId: mockProductId,
      name: 'Test Product',
    });
    ProductAdminService.transformApiDataToFormData.mockReturnValue({
      name: 'Test Product',
      variants: [],
    });

    render(<EditProductPage />);

    await waitFor(() => {
      expect(ProductAdminService.getProductForAdmin).toHaveBeenCalledWith(mockProductId);
    });

    expect(screen.getByTestId('product-form')).toBeInTheDocument();
  });

  it('redirects on error when loading product fails', async () => {
    const mockProductId = 'invalid-product-id';
    
    mockSearchParams.mockReturnValue({
      get: jest.fn(() => mockProductId),
    });

    // Mock service to throw error
    const { ProductAdminService } = require('@/services/admin/product-admin-service');
    ProductAdminService.getProductForAdmin.mockRejectedValue(new Error('Product not found'));

    render(<EditProductPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/products');
    });
  });

  it('shows loading state while fetching product data', () => {
    const mockProductId = 'test-product-123';
    
    mockSearchParams.mockReturnValue({
      get: jest.fn(() => mockProductId),
    });

    // Mock service to never resolve (simulate loading)
    const { ProductAdminService } = require('@/services/admin/product-admin-service');
    ProductAdminService.getProductForAdmin.mockImplementation(() => new Promise(() => {}));

    render(<EditProductPage />);

    expect(screen.getByText('Đang tải thông tin sản phẩm...')).toBeInTheDocument();
  });

  it('calls cancel navigation when cancel button is clicked', async () => {
    const mockProductId = 'test-product-123';
    
    mockSearchParams.mockReturnValue({
      get: jest.fn(() => mockProductId),
    });

    const { ProductAdminService } = require('@/services/admin/product-admin-service');
    ProductAdminService.getProductForAdmin.mockResolvedValue({ productId: mockProductId });
    ProductAdminService.transformApiDataToFormData.mockReturnValue({ name: 'Test', variants: [] });

    render(<EditProductPage />);

    await waitFor(() => {
      expect(screen.getByTestId('product-form')).toBeInTheDocument();
    });

    const cancelBtn = screen.getByTestId('cancel-btn');
    cancelBtn.click();

    expect(mockPush).toHaveBeenCalledWith('/admin/products');
  });
});
